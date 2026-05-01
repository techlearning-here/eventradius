-- ============================================================================
-- Clear Discount Rules Data
-- Truncates discount_rules_config table and resets recommendation_type
-- ============================================================================

-- Only run if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discount_rules_config') THEN
        -- Disable trigger to avoid issues during truncation
        ALTER TABLE discount_rules_config DISABLE TRIGGER trigger_update_discount_rules_timestamp;
        
        -- Truncate the discount rules config table
        TRUNCATE TABLE discount_rules_config;
        
        -- Re-enable trigger
        ALTER TABLE discount_rules_config ENABLE TRIGGER trigger_update_discount_rules_timestamp;
        
        RAISE NOTICE 'discount_rules_config truncated successfully';
    ELSE
        RAISE NOTICE 'discount_rules_config table does not exist, skipping';
    END IF;
END $$;

-- Reset recommendation_type in discount_recommendations (optional)
-- Uncomment if you want to reset all recommendations to 'ai' type
-- UPDATE discount_recommendations SET recommendation_type = 'ai';

-- Verify (safe even if table doesn't exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discount_rules_config') THEN
        RAISE NOTICE 'Table discount_rules_config exists with % rows', 
            (SELECT COUNT(*) FROM discount_rules_config);
    ELSE
        RAISE NOTICE 'Table discount_rules_config does not exist';
    END IF;
END $$;
