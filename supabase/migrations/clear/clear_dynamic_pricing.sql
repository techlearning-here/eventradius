-- =====================================================
-- CLEAR DYNAMIC PRICING TABLES
-- =====================================================
-- This script truncates all dynamic pricing tables
-- Use with caution - this will delete all pricing data!
--
-- Tables cleared (in order to respect FK constraints):
--   1. promo_code_claims (child of promo_codes)
--   2. promo_codes (child of discount_recommendations)
--   3. discount_recommendations (child of events)
--   4. inventory_snapshots (child of events)
--   5. dynamic_pricing_rules (child of events)
-- =====================================================

-- Disable triggers temporarily to avoid firing on delete
ALTER TABLE public.promo_code_claims DISABLE TRIGGER ALL;
ALTER TABLE public.promo_codes DISABLE TRIGGER ALL;
ALTER TABLE public.discount_recommendations DISABLE TRIGGER ALL;
ALTER TABLE public.inventory_snapshots DISABLE TRIGGER ALL;
ALTER TABLE public.dynamic_pricing_rules DISABLE TRIGGER ALL;

-- Clear tables in dependency order (child tables first)
TRUNCATE TABLE public.promo_code_claims CASCADE;
TRUNCATE TABLE public.promo_codes CASCADE;
TRUNCATE TABLE public.discount_recommendations CASCADE;
TRUNCATE TABLE public.inventory_snapshots CASCADE;
TRUNCATE TABLE public.dynamic_pricing_rules CASCADE;

-- Re-enable triggers
ALTER TABLE public.promo_code_claims ENABLE TRIGGER ALL;
ALTER TABLE public.promo_codes ENABLE TRIGGER ALL;
ALTER TABLE public.discount_recommendations ENABLE TRIGGER ALL;
ALTER TABLE public.inventory_snapshots ENABLE TRIGGER ALL;
ALTER TABLE public.dynamic_pricing_rules ENABLE TRIGGER ALL;

-- Verify truncation
SELECT 'promo_code_claims' as table_name, COUNT(*) as row_count FROM public.promo_code_claims
UNION ALL
SELECT 'promo_codes', COUNT(*) FROM public.promo_codes
UNION ALL
SELECT 'discount_recommendations', COUNT(*) FROM public.discount_recommendations
UNION ALL
SELECT 'inventory_snapshots', COUNT(*) FROM public.inventory_snapshots
UNION ALL
SELECT 'dynamic_pricing_rules', COUNT(*) FROM public.dynamic_pricing_rules;
