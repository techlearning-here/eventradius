-- =====================================================
-- 08 - ADD CANCELLATION REQUEST FEATURE
-- =====================================================
-- This migration adds fields to support cancellation requests
-- from approved users. Organizers can approve (cancel) or 
-- reject (keep approved) the request.
-- =====================================================

-- Start transaction
BEGIN;

-- 1. Add cancellation_requested_at column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'cancellation_requested_at'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN cancellation_requested_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Add cancellation_reason column (user provides reason)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'cancellation_reason'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN cancellation_reason TEXT;
    END IF;
END $$;

-- 3. Add cancellation_processed_at column (when organizer acted)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'cancellation_processed_at'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN cancellation_processed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 4. Add cancellation_processed_by column (organizer who acted)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'cancellation_processed_by'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN cancellation_processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Update check constraint to include 'cancellation_requested' status
-- First drop existing constraint
ALTER TABLE public.event_participants 
DROP CONSTRAINT IF EXISTS event_participants_approval_status_check;

-- Add updated constraint with new status
ALTER TABLE public.event_participants 
ADD CONSTRAINT event_participants_approval_status_check 
CHECK (approval_status IN ('pending', 'approved', 'rejected', 'waitlisted', 'cancellation_requested'));

-- 6. Create index for cancellation queries
CREATE INDEX IF NOT EXISTS idx_event_participants_cancellation 
ON public.event_participants(event_id, cancellation_requested_at) 
WHERE cancellation_requested_at IS NOT NULL;

-- Commit transaction
COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify columns were added
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'event_participants' 
-- AND column_name IN ('cancellation_requested_at', 'cancellation_reason', 
--     'cancellation_processed_at', 'cancellation_processed_by')
-- ORDER BY ordinal_position;

-- Check updated constraint
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'event_participants'::regclass
-- AND conname = 'event_participants_approval_status_check';

-- Create atomic stored procedure for processing cancellation actions
CREATE OR REPLACE FUNCTION process_cancellation_action(
    p_participant_id UUID,
    p_event_id UUID,
    p_action VARCHAR(10),  -- 'approve' or 'reject'
    p_processed_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_participant RECORD;
    v_original_status VARCHAR(50);
    v_promoted_id UUID := NULL;
    v_result JSONB;
    v_event_capacity INTEGER;
    v_approved_count INTEGER;
BEGIN
    -- Lock the participant row and get current state
    SELECT * INTO v_participant
    FROM event_participants
    WHERE id = p_participant_id AND event_id = p_event_id
    FOR UPDATE;

    IF v_participant IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error_code', 'PARTICIPANT_NOT_FOUND',
            'message', 'Participant not found'
        );
    END IF;

    IF v_participant.approval_status != 'cancellation_requested' THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error_code', 'INVALID_STATUS',
            'message', 'Participant does not have a pending cancellation request'
        );
    END IF;

    -- Store original status (should be 'approved' before cancellation was requested)
    v_original_status := 'approved';

    IF p_action = 'approve' THEN
        -- Get event capacity
        SELECT max_participants INTO v_event_capacity
        FROM events WHERE id = p_event_id;

        -- Delete the participant (they cancelled)
        DELETE FROM event_participants
        WHERE id = p_participant_id;

        -- Check if we need to promote from waitlist
        IF v_event_capacity IS NOT NULL THEN
            -- Count current approved participants
            SELECT COUNT(*) INTO v_approved_count
            FROM event_participants
            WHERE event_id = p_event_id
            AND approval_status = 'approved';

            -- If there's room, promote the first waitlisted person
            IF v_approved_count < v_event_capacity THEN
                SELECT id INTO v_promoted_id
                FROM event_participants
                WHERE event_id = p_event_id
                AND approval_status = 'waitlisted'
                ORDER BY waitlist_position ASC
                LIMIT 1;

                IF v_promoted_id IS NOT NULL THEN
                    UPDATE event_participants
                    SET
                        approval_status = 'approved',
                        is_waitlisted = FALSE,
                        waitlist_position = NULL,
                        approved_at = NOW(),
                        approved_by = p_processed_by
                    WHERE id = v_promoted_id;
                END IF;
            END IF;
        END IF;

        v_result := jsonb_build_object(
            'success', TRUE,
            'action', 'approve',
            'participant_id', p_participant_id,
            'removed', TRUE,
            'promoted_from_waitlist', v_promoted_id IS NOT NULL,
            'promoted_participant_id', v_promoted_id
        );

    ELSIF p_action = 'reject' THEN
        -- Reject cancellation - restore to approved status
        UPDATE event_participants
        SET
            approval_status = v_original_status,
            cancellation_requested_at = NULL,
            cancellation_reason = NULL,
            cancellation_processed_at = NOW(),
            cancellation_processed_by = p_processed_by
        WHERE id = p_participant_id;

        v_result := jsonb_build_object(
            'success', TRUE,
            'action', 'reject',
            'participant_id', p_participant_id,
            'restored_status', v_original_status
        );

    ELSE
        RETURN jsonb_build_object(
            'success', FALSE,
            'error_code', 'INVALID_ACTION',
            'message', 'Action must be approve or reject'
        );
    END IF;

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', FALSE,
        'error_code', 'DB_ERROR',
        'message', SQLERRM
    );
END;
$$;

-- Atomic stored procedure for immediate cancellation of approved participation
-- Removes participant and auto-promotes from waitlist in a single transaction
CREATE OR REPLACE FUNCTION cancel_approved_participation(
    p_participant_id UUID,
    p_event_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_participant RECORD;
    v_event_capacity INTEGER;
    v_approved_count INTEGER;
    v_promoted_id UUID := NULL;
    v_result JSONB;
BEGIN
    -- Lock the participant row and verify it exists and is approved
    SELECT * INTO v_participant
    FROM event_participants
    WHERE id = p_participant_id
    AND event_id = p_event_id
    AND approval_status = 'approved'
    FOR UPDATE;

    IF v_participant IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error_code', 'PARTICIPANT_NOT_FOUND',
            'message', 'Participant not found or not in approved status'
        );
    END IF;

    -- Get event capacity
    SELECT max_participants INTO v_event_capacity
    FROM events WHERE id = p_event_id;

    -- Delete the participant (they cancelled)
    DELETE FROM event_participants
    WHERE id = p_participant_id;

    -- Check if we need to promote from waitlist
    IF v_event_capacity IS NOT NULL THEN
        -- Count current approved participants
        SELECT COUNT(*) INTO v_approved_count
        FROM event_participants
        WHERE event_id = p_event_id
        AND approval_status = 'approved';

        -- If there's room, promote the first waitlisted person
        IF v_approved_count < v_event_capacity THEN
            SELECT id INTO v_promoted_id
            FROM event_participants
            WHERE event_id = p_event_id
            AND approval_status = 'waitlisted'
            ORDER BY waitlist_position ASC
            LIMIT 1;

            IF v_promoted_id IS NOT NULL THEN
                UPDATE event_participants
                SET
                    approval_status = 'approved',
                    is_waitlisted = FALSE,
                    waitlist_position = NULL,
                    approved_at = NOW()
                WHERE id = v_promoted_id;
            END IF;
        END IF;
    END IF;

    -- Return success with promotion info
    v_result := jsonb_build_object(
        'success', TRUE,
        'participant_id', p_participant_id,
        'removed', TRUE,
        'promoted_from_waitlist', v_promoted_id IS NOT NULL,
        'promoted_participant_id', v_promoted_id,
        'cancellation_reason', p_reason
    );

    RETURN v_result;

    -- Return at end of main function body
    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', FALSE,
        'error_code', 'DB_ERROR',
        'message', SQLERRM
    );
END;
$$;
