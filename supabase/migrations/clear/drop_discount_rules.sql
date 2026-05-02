-- ============================================================================
-- Drop Discount Rules Configuration
-- Completely removes discount_rules_config table and related objects
-- ============================================================================

-- Only proceed if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discount_rules_config') THEN
        -- Drop trigger first
        DROP TRIGGER IF EXISTS trigger_update_discount_rules_timestamp ON discount_rules_config;
        
        -- Drop table (this also drops associated policies and indexes)
        DROP TABLE discount_rules_config;
        
        RAISE NOTICE 'discount_rules_config table dropped successfully';
    ELSE
        RAISE NOTICE 'discount_rules_config table does not exist, nothing to drop';
    END IF;
END $$;

-- Drop functions (safe to drop even if table doesn't exist)
DROP FUNCTION IF EXISTS update_discount_rules_updated_at();
DROP FUNCTION IF EXISTS evaluate_discount_rules(UUID, UUID, INTEGER, INTEGER);

-- Remove recommendation_type column from discount_recommendations (optional)
-- Uncomment if you want to completely revert the AI/Rule-based feature
-- ALTER TABLE discount_recommendations DROP COLUMN IF EXISTS recommendation_type;

-- Verify
SELECT 'discount_rules_config exists:' as check_name, 
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discount_rules_config') as exists;
