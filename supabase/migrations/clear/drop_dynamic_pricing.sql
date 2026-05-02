-- =====================================================
-- DROP DYNAMIC PRICING SCHEMA
-- =====================================================
-- This script completely removes all dynamic pricing objects
-- WARNING: This will permanently delete all pricing data!
--
-- Objects dropped (in dependency order):
--   1. Triggers (depend on tables/functions)
--   2. Policies (depend on tables)
--   3. Functions (may depend on tables)
--   4. Indexes (depend on tables)
--   5. Tables with CASCADE (drops constraints, FKs)
-- =====================================================

-- =====================================================
-- 1. DROP TRIGGERS
-- =====================================================

-- Timestamp update triggers
DROP TRIGGER IF EXISTS update_pricing_rules_updated_at ON public.dynamic_pricing_rules;
DROP TRIGGER IF EXISTS update_recommendations_updated_at ON public.discount_recommendations;
DROP TRIGGER IF EXISTS update_promo_codes_updated_at ON public.promo_codes;

-- Auto-recommendation trigger
DROP TRIGGER IF EXISTS check_inventory_recommendation ON public.inventory_snapshots;

-- =====================================================
-- 2. DROP POLICIES (explicit cleanup)
-- =====================================================

-- Pricing Rules Policies
DROP POLICY IF EXISTS "Organizers can manage their own pricing rules" ON public.dynamic_pricing_rules;
DROP POLICY IF EXISTS "Admins can manage all pricing rules" ON public.dynamic_pricing_rules;

-- Inventory Snapshots Policies
DROP POLICY IF EXISTS "Organizers can manage inventory for their events" ON public.inventory_snapshots;
DROP POLICY IF EXISTS "Admins can manage all inventory" ON public.inventory_snapshots;
DROP POLICY IF EXISTS "Public can view inventory snapshots" ON public.inventory_snapshots;

-- Discount Recommendations Policies
DROP POLICY IF EXISTS "Organizers can view recommendations for their events" ON public.discount_recommendations;
DROP POLICY IF EXISTS "Organizers can update recommendation status" ON public.discount_recommendations;
DROP POLICY IF EXISTS "Admins can manage all recommendations" ON public.discount_recommendations;

-- Promo Codes Policies
DROP POLICY IF EXISTS "Organizers can view promo codes for their events" ON public.promo_codes;
DROP POLICY IF EXISTS "Organizers can manage their promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admins can manage all promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Public can view active promo codes" ON public.promo_codes;

-- Promo Code Claims Policies
DROP POLICY IF EXISTS "Users can view their own claims" ON public.promo_code_claims;
DROP POLICY IF EXISTS "Users can create claims" ON public.promo_code_claims;
DROP POLICY IF EXISTS "Organizers can view claims for their promo codes" ON public.promo_code_claims;
DROP POLICY IF EXISTS "Admins can manage all claims" ON public.promo_code_claims;

-- =====================================================
-- 3. DROP FUNCTIONS
-- =====================================================

-- Helper functions
DROP FUNCTION IF EXISTS public.increment_promo_code_claims(UUID);
DROP FUNCTION IF EXISTS public.check_and_create_recommendation();
DROP FUNCTION IF EXISTS public.is_admin(UUID);

-- =====================================================
-- 4. DROP INDEXES (explicit cleanup)
-- =====================================================

-- Pricing Rules indexes
DROP INDEX IF EXISTS idx_pricing_rules_event_id;
DROP INDEX IF EXISTS idx_pricing_rules_organizer_id;
DROP INDEX IF EXISTS idx_pricing_rules_active;

-- Inventory Snapshots indexes
DROP INDEX IF EXISTS idx_inventory_event_id;
DROP INDEX IF EXISTS idx_inventory_reported_at;

-- Discount Recommendations indexes
DROP INDEX IF EXISTS idx_recommendations_event_id;
DROP INDEX IF EXISTS idx_recommendations_status;
DROP INDEX IF EXISTS idx_recommendations_pending;

-- Promo Codes indexes
DROP INDEX IF EXISTS idx_promo_codes_event_id;
DROP INDEX IF EXISTS idx_promo_codes_code;
DROP INDEX IF EXISTS idx_promo_codes_active;
DROP INDEX IF EXISTS idx_promo_codes_valid;

-- Promo Code Claims indexes
DROP INDEX IF EXISTS idx_claims_promo_code_id;
DROP INDEX IF EXISTS idx_claims_user_id;
DROP INDEX IF EXISTS idx_claims_claimed_at;

-- =====================================================
-- 5. DROP TABLES (with CASCADE for FK constraints)
-- =====================================================

-- Drop in dependency order (child tables first)
DROP TABLE IF EXISTS public.promo_code_claims CASCADE;
DROP TABLE IF EXISTS public.promo_codes CASCADE;
DROP TABLE IF EXISTS public.discount_recommendations CASCADE;
DROP TABLE IF EXISTS public.inventory_snapshots CASCADE;
DROP TABLE IF EXISTS public.dynamic_pricing_rules CASCADE;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Dynamic Pricing schema dropped successfully!';
  RAISE NOTICE 'All tables, functions, indexes, triggers, and policies have been removed.';
END $$;

-- Optional: Verify no objects remain
SELECT 
  'Tables' as object_type,
  COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('dynamic_pricing_rules', 'inventory_snapshots', 'discount_recommendations', 'promo_codes', 'promo_code_claims')
UNION ALL
SELECT 
  'Functions',
  COUNT(*) 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('increment_promo_code_claims', 'check_and_create_recommendation', 'is_admin')
UNION ALL
SELECT 
  'Triggers on pricing tables',
  COUNT(*) 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND event_object_table IN ('dynamic_pricing_rules', 'inventory_snapshots', 'discount_recommendations', 'promo_codes');
