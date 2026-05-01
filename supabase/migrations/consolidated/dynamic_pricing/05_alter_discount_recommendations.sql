-- =====================================================
-- ALTER DISCOUNT RECOMMENDATIONS TABLE
-- Add missing columns for rule-based recommendations
-- =====================================================
-- This migration adds:
--   1. updated_at column (required for trigger)
--   2. recommendation_type column (ai vs rule_based)
--   3. rule_id column (foreign key to discount_rules_config)
--   4. rule_name column (for display)
--
-- Safe to run multiple times (uses IF NOT EXISTS)
-- =====================================================

-- Add updated_at column if not exists (required for the trigger)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'discount_recommendations' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.discount_recommendations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- Add recommendation_type column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'discount_recommendations' 
        AND column_name = 'recommendation_type'
    ) THEN
        ALTER TABLE public.discount_recommendations ADD COLUMN recommendation_type TEXT DEFAULT 'ai';
        -- Add check constraint
        ALTER TABLE public.discount_recommendations 
        ADD CONSTRAINT check_recommendation_type 
        CHECK (recommendation_type IN ('ai', 'rule_based'));
    END IF;
END $$;

-- Add rule_id column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'discount_recommendations' 
        AND column_name = 'rule_id'
    ) THEN
        ALTER TABLE public.discount_recommendations ADD COLUMN rule_id UUID;
        -- Add foreign key constraint
        ALTER TABLE public.discount_recommendations 
        ADD CONSTRAINT fk_discount_recommendation_rule 
        FOREIGN KEY (rule_id) REFERENCES public.discount_rules_config(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add rule_name column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'discount_recommendations' 
        AND column_name = 'rule_name'
    ) THEN
        ALTER TABLE public.discount_recommendations ADD COLUMN rule_name TEXT;
    END IF;
END $$;

-- Add organizer_id column if not exists (needed for rule-based recommendations)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'discount_recommendations' 
        AND column_name = 'organizer_id'
    ) THEN
        ALTER TABLE public.discount_recommendations ADD COLUMN organizer_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Discount recommendations table altered successfully! Added updated_at, recommendation_type, rule_id, rule_name, organizer_id columns.';
END $$;
