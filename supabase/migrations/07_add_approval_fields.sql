-- =====================================================
-- 07 - ADD APPROVAL FLOW FIELDS TO EVENT_PARTICIPANTS
-- =====================================================
-- This migration adds approval-related fields to support
-- the "Request Approval to Join" feature for events that
-- require organizer approval before participation.
-- =====================================================

-- Start transaction
BEGIN;

-- 1. Add approval_status column to event_participants table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'approval_status'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'approved';
    END IF;
END $$;

-- 2. Add requester details columns for non-registered users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'requester_name'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN requester_name TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'requester_email'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN requester_email TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'requester_phone'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN requester_phone TEXT;
    END IF;
END $$;

-- 3. Add optional fields for additional requester info (Luma-style)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'requester_bio'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN requester_bio TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'requester_social_links'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN requester_social_links JSONB DEFAULT '{}';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'requester_reason'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN requester_reason TEXT;
    END IF;
END $$;

-- 4. Add approval metadata
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'approved_by'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'rejection_reason'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;

-- 5. Add check constraint for approval_status values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints cc
        JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = 'event_participants' 
        AND ccu.column_name = 'approval_status'
        AND cc.constraint_name = 'event_participants_approval_status_check'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD CONSTRAINT event_participants_approval_status_check 
        CHECK (approval_status IN ('pending', 'approved', 'rejected', 'waitlisted'));
    END IF;
END $$;

-- 6. Add is_waitlisted column for capacity management
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'is_waitlisted'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN is_waitlisted BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

-- 7. Add waitlist_position for ordered waitlist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'waitlist_position'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN waitlist_position INTEGER;
    END IF;
END $$;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_participants_approval_status 
ON public.event_participants(approval_status);

CREATE INDEX IF NOT EXISTS idx_event_participants_is_waitlisted 
ON public.event_participants(is_waitlisted);

CREATE INDEX IF NOT EXISTS idx_event_participants_waitlist_position 
ON public.event_participants(waitlist_position) 
WHERE is_waitlisted = TRUE;

-- 9. Create composite index for event + approval status queries
CREATE INDEX IF NOT EXISTS idx_event_participants_event_approval 
ON public.event_participants(event_id, approval_status);

-- 10. Add approval_request_fields JSON column to events for customizable fields
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'approval_request_fields'
    ) THEN
        ALTER TABLE public.events 
        ADD COLUMN approval_request_fields JSONB DEFAULT '{
            "name": {"required": true, "label": "Full Name"},
            "email": {"required": true, "label": "Email Address"},
            "phone": {"required": false, "label": "Phone Number"},
            "bio": {"required": false, "label": "Short Bio"},
            "reason": {"required": false, "label": "Why do you want to attend?"},
            "social_links": {"required": false, "label": "Social/Website Links"}
        }';
    END IF;
END $$;

-- 11. Add require_approval boolean to events table (if not exists from quick create)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'require_approval'
    ) THEN
        ALTER TABLE public.events 
        ADD COLUMN require_approval BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

-- 12. Add enable_waitlist to events table (if not exists from quick create)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'enable_waitlist'
    ) THEN
        ALTER TABLE public.events 
        ADD COLUMN enable_waitlist BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

-- 13. Add approval_instructions text to events table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'approval_instructions'
    ) THEN
        ALTER TABLE public.events 
        ADD COLUMN approval_instructions TEXT;
    END IF;
END $$;

-- 14. Update existing records to have 'approved' as default approval_status
UPDATE public.event_participants 
SET approval_status = 'approved' 
WHERE approval_status IS NULL;

-- Commit transaction
COMMIT;

-- =====================================================
-- VERIFICATION QUERIES (for manual checking)
-- =====================================================

-- Verify all columns were added
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'event_participants' 
-- AND column_name IN ('approval_status', 'requester_name', 'requester_email', 
--     'requester_phone', 'requester_bio', 'requester_social_links', 
--     'requester_reason', 'approved_at', 'approved_by', 'rejection_reason',
--     'is_waitlisted', 'waitlist_position')
-- ORDER BY ordinal_position;

-- Verify events table columns
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'events' 
-- AND column_name IN ('require_approval', 'enable_waitlist', 
--     'approval_request_fields', 'approval_instructions');

-- Check approval_status distribution
-- SELECT approval_status, COUNT(*) as count
-- FROM public.event_participants 
-- GROUP BY approval_status;

-- =====================================================
-- STORED PROCEDURE: Atomic Approval Request Submission
-- =====================================================

CREATE OR REPLACE FUNCTION submit_approval_request(
    p_event_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_requester_name TEXT DEFAULT NULL,
    p_requester_email TEXT DEFAULT NULL,
    p_requester_phone TEXT DEFAULT NULL,
    p_requester_bio TEXT DEFAULT NULL,
    p_requester_reason TEXT DEFAULT NULL,
    p_requester_social_links JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_event_record RECORD;
    v_existing_record RECORD;
    v_max_participants INTEGER;
    v_current_count INTEGER;
    v_waitlist_position INTEGER;
    v_is_waitlisted BOOLEAN := FALSE;
    v_result JSONB;
    v_participant_id UUID;
BEGIN
    -- Check if event exists and requires approval
    SELECT id, require_approval, max_participants, enable_waitlist
    INTO v_event_record
    FROM events
    WHERE id = p_event_id;
    
    IF v_event_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error_code', 'EVENT_NOT_FOUND',
            'message', 'Event not found'
        );
    END IF;
    
    IF NOT v_event_record.require_approval THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error_code', 'NO_APPROVAL_REQUIRED',
            'message', 'This event does not require approval to join'
        );
    END IF;
    
    -- Check for existing request (atomic check)
    SELECT approval_status INTO v_existing_record
    FROM event_participants
    WHERE event_id = p_event_id
    AND (
        (p_user_id IS NOT NULL AND user_id = p_user_id)
        OR (p_requester_email IS NOT NULL AND requester_email = p_requester_email)
    );
    
    IF v_existing_record.approval_status = 'approved' THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error_code', 'ALREADY_APPROVED',
            'message', 'You are already approved for this event'
        );
    ELSIF v_existing_record.approval_status = 'pending' THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error_code', 'PENDING_EXISTS',
            'message', 'You already have a pending request for this event'
        );
    END IF;
    
    -- Check capacity and waitlist status (atomic count)
    v_max_participants := v_event_record.max_participants;
    
    IF v_max_participants IS NOT NULL THEN
        SELECT COUNT(*) INTO v_current_count
        FROM event_participants
        WHERE event_id = p_event_id
        AND approval_status = 'approved';
        
        IF v_current_count >= v_max_participants THEN
            IF v_event_record.enable_waitlist THEN
                v_is_waitlisted := TRUE;
                -- Atomic waitlist position calculation
                SELECT COALESCE(MAX(waitlist_position), 0) + 1
                INTO v_waitlist_position
                FROM event_participants
                WHERE event_id = p_event_id
                AND is_waitlisted = TRUE;
            ELSE
                RETURN jsonb_build_object(
                    'success', FALSE,
                    'error_code', 'EVENT_FULL',
                    'message', 'Event is at capacity and waitlist is not enabled'
                );
            END IF;
        END IF;
    END IF;
    
    -- Atomic insert
    INSERT INTO event_participants (
        event_id,
        user_id,
        approval_status,
        requester_name,
        requester_email,
        requester_phone,
        requester_bio,
        requester_reason,
        requester_social_links,
        is_waitlisted,
        waitlist_position,
        status
    ) VALUES (
        p_event_id,
        p_user_id,
        'pending',
        p_requester_name,
        p_requester_email,
        p_requester_phone,
        p_requester_bio,
        p_requester_reason,
        COALESCE(p_requester_social_links, '{}'),
        v_is_waitlisted,
        v_waitlist_position,
        'interested'
    )
    RETURNING id INTO v_participant_id;
    
    -- Build success response
    SELECT jsonb_build_object(
        'success', TRUE,
        'participant_id', v_participant_id,
        'event_id', p_event_id,
        'user_id', p_user_id,
        'approval_status', 'pending',
        'requester_name', p_requester_name,
        'requester_email', p_requester_email,
        'requester_phone', p_requester_phone,
        'requester_bio', p_requester_bio,
        'requester_reason', p_requester_reason,
        'requester_social_links', COALESCE(p_requester_social_links, '{}'),
        'is_waitlisted', v_is_waitlisted,
        'waitlist_position', v_waitlist_position,
        'registered_at', NOW()
    ) INTO v_result;
    
    RETURN v_result;
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', FALSE,
        'error_code', 'DB_ERROR',
        'message', SQLERRM
    );
END;
$$;
