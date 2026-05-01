-- =====================================================
-- EVENTRADIUS DYNAMIC PRICING MVP - PART 2: FUNCTIONS & TRIGGERS
-- =====================================================
-- This file contains:
--   1. Helper functions
--   2. Triggers for updated_at and auto-recommendations
--
-- Run order: 01_tables.sql → 02_functions.sql → 03_indexes_rls.sql
--
-- Safe to run multiple times (uses IF EXISTS/IF NOT EXISTS)
-- =====================================================

-- =====================================================
-- 1. TIMESTAMP TRIGGERS
-- =====================================================

-- Timestamp update triggers for all pricing tables
DROP TRIGGER IF EXISTS update_pricing_rules_updated_at ON public.dynamic_pricing_rules;
CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON public.dynamic_pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_recommendations_updated_at ON public.discount_recommendations;
CREATE TRIGGER update_recommendations_updated_at
  BEFORE UPDATE ON public.discount_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_promo_codes_updated_at ON public.promo_codes;
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 2. HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Check user metadata in auth.users
  SELECT raw_user_meta_data->>'role' INTO v_role
  FROM auth.users
  WHERE id = user_id;
  
  RETURN v_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to increment promo code claim count
CREATE OR REPLACE FUNCTION public.increment_promo_code_claims(promo_code_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.promo_codes
  SET times_claimed = times_claimed + 1
  WHERE id = promo_code_id;
END;
$$;

-- Function to check and create recommendation when inventory is updated
CREATE OR REPLACE FUNCTION public.check_and_create_recommendation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rule RECORD;
  v_hours_remaining DECIMAL(6,1);
  v_occupancy_percent DECIMAL(5,2);
  v_discount INTEGER;
  v_recommended_price DECIMAL(10,2);
BEGIN
  -- Get pricing rule for this event
  SELECT * INTO v_rule FROM public.dynamic_pricing_rules
  WHERE event_id = NEW.event_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Calculate hours remaining (assume event start time is needed - using 24h as default)
  -- This is simplified - in production, you'd calculate from event.start_time
  v_hours_remaining := 24.0;
  
  v_occupancy_percent := NEW.occupancy_percent;
  
  -- MVP Decision Matrix
  IF v_occupancy_percent > 80 OR v_hours_remaining > 24 THEN
    v_discount := 0; -- No discount needed
  ELSIF v_occupancy_percent >= 60 THEN
    v_discount := 0; -- Monitor only
  ELSIF v_occupancy_percent >= 40 AND v_hours_remaining <= 24 THEN
    v_discount := 15;
  ELSIF v_occupancy_percent >= 20 AND v_hours_remaining <= 12 THEN
    v_discount := 25;
  ELSIF v_occupancy_percent >= 10 AND v_hours_remaining <= 6 THEN
    v_discount := 35;
  ELSIF v_occupancy_percent < 10 AND v_hours_remaining <= 2 THEN
    v_discount := 50;
  ELSE
    v_discount := 0;
  END IF;
  
  -- Create recommendation if discount > 0 and no pending recommendation exists
  IF v_discount > 0 THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.discount_recommendations
      WHERE event_id = NEW.event_id AND status = 'pending'
    ) THEN
      v_recommended_price := v_rule.base_price * (1 - v_discount / 100.0);
      
      -- Ensure we don't go below min_price
      IF v_recommended_price < v_rule.min_price THEN
        v_recommended_price := v_rule.min_price;
        v_discount := ROUND((1 - v_recommended_price / v_rule.base_price) * 100);
      END IF;
      
      INSERT INTO public.discount_recommendations (
        event_id,
        occupancy_percent,
        hours_remaining,
        recommended_discount_percent,
        recommended_price
      ) VALUES (
        NEW.event_id,
        v_occupancy_percent,
        v_hours_remaining,
        v_discount,
        v_recommended_price
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create recommendation on inventory update
DROP TRIGGER IF EXISTS check_inventory_recommendation ON public.inventory_snapshots;
CREATE TRIGGER check_inventory_recommendation
  AFTER INSERT ON public.inventory_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_create_recommendation();

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Dynamic Pricing functions and triggers created successfully!';
END $$;
