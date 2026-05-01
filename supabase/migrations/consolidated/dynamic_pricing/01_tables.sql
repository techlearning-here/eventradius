-- =====================================================
-- EVENTRADIUS DYNAMIC PRICING MVP - PART 1: TABLES
-- =====================================================
-- This file contains:
--   1. Dynamic pricing tables (5 tables)
--   2. Table comments
--
-- Run order: 01_tables.sql → 02_functions.sql → 03_indexes_rls.sql
--
-- Safe to run multiple times (uses IF EXISTS/IF NOT EXISTS)
-- =====================================================

-- =====================================================
-- 1. DYNAMIC PRICING TABLES
-- =====================================================

-- 1.1 Pricing Rules - Per-event pricing configuration
CREATE TABLE IF NOT EXISTS public.dynamic_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Capacity & Pricing
  max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
  min_price DECIMAL(10,2) NOT NULL CHECK (min_price > 0),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(event_id),
  CHECK (min_price <= base_price)
);

COMMENT ON TABLE public.dynamic_pricing_rules IS 'Stores pricing configuration for events with dynamic pricing enabled';
COMMENT ON COLUMN public.dynamic_pricing_rules.min_price IS 'Minimum price guardrail - AI will not recommend below this';

-- 1.2 Inventory Snapshots - Occupancy tracking history
CREATE TABLE IF NOT EXISTS public.inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tickets_sold INTEGER NOT NULL CHECK (tickets_sold >= 0),
  tickets_remaining INTEGER NOT NULL CHECK (tickets_remaining >= 0),
  occupancy_percent DECIMAL(5,2) NOT NULL CHECK (occupancy_percent >= 0 AND occupancy_percent <= 100),
  reported_by UUID REFERENCES auth.users(id),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.inventory_snapshots IS 'Tracks ticket sales over time for occupancy-based pricing decisions';

-- 1.3 Discount Recommendations - AI suggestions
CREATE TABLE IF NOT EXISTS public.discount_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  
  -- Trigger conditions
  occupancy_percent DECIMAL(5,2) NOT NULL,
  hours_remaining DECIMAL(6,1) NOT NULL,
  
  -- Recommendation
  recommended_discount_percent INTEGER NOT NULL CHECK (recommended_discount_percent > 0 AND recommended_discount_percent <= 100),
  recommended_price DECIMAL(10,2) NOT NULL,
  
  -- Decision
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  decided_at TIMESTAMP WITH TIME ZONE,
  decided_by UUID REFERENCES auth.users(id),
  
  -- New fields for rule-based recommendations
  recommendation_type TEXT DEFAULT 'ai' CHECK (recommendation_type IN ('ai', 'rule_based')),
  rule_id UUID REFERENCES public.discount_rules_config(id) ON DELETE SET NULL,
  rule_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.discount_recommendations IS 'AI-generated discount recommendations awaiting organizer approval';

-- 1.4 Promo Codes - Generated discount codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES public.discount_recommendations(id),
  
  -- Code details
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  discount_amount DECIMAL(10,2),
  
  -- Usage limits
  max_uses INTEGER NOT NULL CHECK (max_uses > 0),
  times_claimed INTEGER DEFAULT 0 CHECK (times_claimed >= 0),
  times_used INTEGER DEFAULT 0 CHECK (times_used >= 0),
  
  -- Validity
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Commission tracking (simulated in MVP)
  commission_percent DECIMAL(4,2) DEFAULT 5.00 CHECK (commission_percent >= 0),
  estimated_commission DECIMAL(10,2) GENERATED ALWAYS AS 
    (COALESCE(discount_amount, 0) * max_uses * commission_percent / 100) STORED
);

COMMENT ON TABLE public.promo_codes IS 'Multi-use discount codes generated when organizers approve recommendations';

-- 1.5 Promo Code Claims - User attribution tracking
CREATE TABLE IF NOT EXISTS public.promo_code_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  
  marked_as_used BOOLEAN DEFAULT false,
  marked_used_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(promo_code_id, user_id)
);

COMMENT ON TABLE public.promo_code_claims IS 'Tracks which users claimed which promo codes for attribution';

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Dynamic Pricing tables created successfully!';
END $$;
