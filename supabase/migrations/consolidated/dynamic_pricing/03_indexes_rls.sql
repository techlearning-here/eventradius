-- =====================================================
-- EVENTRADIUS DYNAMIC PRICING MVP - PART 3: INDEXES & RLS
-- =====================================================
-- This file contains:
--   1. Performance indexes
--   2. Row Level Security (RLS) policies
--   3. RLS enablement
--
-- Run order: 01_tables.sql → 02_functions.sql → 03_indexes_rls.sql
--
-- Safe to run multiple times (uses IF EXISTS/IF NOT EXISTS)
-- =====================================================

-- =====================================================
-- 1. INDEXES FOR PERFORMANCE
-- =====================================================

-- Pricing Rules indexes
CREATE INDEX IF NOT EXISTS idx_pricing_rules_event_id ON public.dynamic_pricing_rules(event_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_organizer_id ON public.dynamic_pricing_rules(organizer_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON public.dynamic_pricing_rules(is_active) WHERE is_active = true;

-- Inventory Snapshots indexes
CREATE INDEX IF NOT EXISTS idx_inventory_event_id ON public.inventory_snapshots(event_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reported_at ON public.inventory_snapshots(reported_at);

-- Discount Recommendations indexes
CREATE INDEX IF NOT EXISTS idx_recommendations_event_id ON public.discount_recommendations(event_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON public.discount_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_pending ON public.discount_recommendations(status) WHERE status = 'pending';

-- Promo Codes indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_event_id ON public.promo_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid ON public.promo_codes(valid_until) WHERE is_active = true;

-- Promo Code Claims indexes
CREATE INDEX IF NOT EXISTS idx_claims_promo_code_id ON public.promo_code_claims(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.promo_code_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimed_at ON public.promo_code_claims(claimed_at);

-- =====================================================
-- 2. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all pricing tables
ALTER TABLE public.dynamic_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_claims ENABLE ROW LEVEL SECURITY;

-- Dynamic Pricing Rules Policies
CREATE POLICY "Organizers can manage their own pricing rules"
  ON public.dynamic_pricing_rules
  FOR ALL
  TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Admins can manage all pricing rules"
  ON public.dynamic_pricing_rules
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Inventory Snapshots Policies
CREATE POLICY "Organizers can manage inventory for their events"
  ON public.inventory_snapshots
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dynamic_pricing_rules r
      WHERE r.event_id = inventory_snapshots.event_id
      AND r.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dynamic_pricing_rules r
      WHERE r.event_id = inventory_snapshots.event_id
      AND r.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all inventory"
  ON public.inventory_snapshots
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Public can view inventory snapshots"
  ON public.inventory_snapshots
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Discount Recommendations Policies
CREATE POLICY "Organizers can view recommendations for their events"
  ON public.discount_recommendations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dynamic_pricing_rules r
      WHERE r.event_id = discount_recommendations.event_id
      AND r.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update recommendation status"
  ON public.discount_recommendations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dynamic_pricing_rules r
      WHERE r.event_id = discount_recommendations.event_id
      AND r.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dynamic_pricing_rules r
      WHERE r.event_id = discount_recommendations.event_id
      AND r.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all recommendations"
  ON public.discount_recommendations
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Promo Codes Policies
CREATE POLICY "Organizers can view promo codes for their events"
  ON public.promo_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dynamic_pricing_rules r
      WHERE r.event_id = promo_codes.event_id
      AND r.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can manage their promo codes"
  ON public.promo_codes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dynamic_pricing_rules r
      WHERE r.event_id = promo_codes.event_id
      AND r.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dynamic_pricing_rules r
      WHERE r.event_id = promo_codes.event_id
      AND r.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all promo codes"
  ON public.promo_codes
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Public can view active promo codes"
  ON public.promo_codes
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND valid_until > now());

-- Promo Code Claims Policies
CREATE POLICY "Users can view their own claims"
  ON public.promo_code_claims
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create claims"
  ON public.promo_code_claims
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organizers can view claims for their promo codes"
  ON public.promo_code_claims
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.promo_codes pc
      JOIN public.dynamic_pricing_rules r ON r.event_id = pc.event_id
      WHERE pc.id = promo_code_claims.promo_code_id
      AND r.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all claims"
  ON public.promo_code_claims
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Dynamic Pricing indexes and RLS policies created successfully!';
END $$;
