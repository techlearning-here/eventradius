-- ============================================================================
-- Dynamic Pricing: Discount Rules Configuration Table
-- For both AI-Based and Rule-Based recommendations
-- ============================================================================

-- Add recommendation_type to existing discount_recommendations table
ALTER TABLE discount_recommendations 
ADD COLUMN IF NOT EXISTS recommendation_type VARCHAR(20) DEFAULT 'ai' 
CHECK (recommendation_type IN ('ai', 'rule_based'));

COMMENT ON COLUMN discount_recommendations.recommendation_type IS 
'Type of recommendation: ai (ML-based) or rule_based (user-defined rules)';

-- ============================================================================
-- Discount Rules Configuration Table
-- Organizers define custom rules for automatic discount recommendations
-- ============================================================================

CREATE TABLE IF NOT EXISTS discount_rules_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    
    -- Rule identification
    rule_name VARCHAR(100) NOT NULL,
    rule_description TEXT,
    
    -- Trigger conditions
    occupancy_threshold INTEGER NOT NULL CHECK (occupancy_threshold > 0 AND occupancy_threshold <= 100),
    time_threshold INTEGER NOT NULL CHECK (time_threshold > 0),
    time_unit VARCHAR(10) NOT NULL CHECK (time_unit IN ('hours', 'days')) DEFAULT 'days',
    
    -- Action (discount to apply)
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100, -- Lower number = higher priority when multiple rules match
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT unique_rule_name_per_organizer UNIQUE (organizer_id, rule_name)
);

COMMENT ON TABLE discount_rules_config IS 
'Stores user-defined discount rules for rule-based dynamic pricing recommendations';

COMMENT ON COLUMN discount_rules_config.occupancy_threshold IS 
'Occupancy percentage below which this rule triggers (e.g., 30 for 30%)';

COMMENT ON COLUMN discount_rules_config.time_threshold IS 
'Time before event when this rule applies (in hours or days based on time_unit)';

COMMENT ON COLUMN discount_rules_config.time_unit IS 
'Unit for time_threshold: hours or days';

COMMENT ON COLUMN discount_rules_config.discount_percent IS 
'Percentage discount to recommend when rule conditions are met';

COMMENT ON COLUMN discount_rules_config.priority IS 
'Rule priority for ordering when multiple rules match. Lower = higher priority';

-- ============================================================================
-- Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_discount_rules_organizer 
ON discount_rules_config(organizer_id);

CREATE INDEX IF NOT EXISTS idx_discount_rules_event 
ON discount_rules_config(event_id);

CREATE INDEX IF NOT EXISTS idx_discount_rules_active 
ON discount_rules_config(is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_discount_rules_priority 
ON discount_rules_config(priority, created_at);

-- Index for finding applicable rules quickly
CREATE INDEX IF NOT EXISTS idx_discount_rules_applicable 
ON discount_rules_config(organizer_id, event_id, is_active, priority);

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

ALTER TABLE discount_rules_config ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own rules
CREATE POLICY "Users can view own discount rules"
ON discount_rules_config
FOR SELECT
TO authenticated
USING (organizer_id = auth.uid());

-- Policy: Users can create their own rules
CREATE POLICY "Users can create own discount rules"
ON discount_rules_config
FOR INSERT
TO authenticated
WITH CHECK (organizer_id = auth.uid());

-- Policy: Users can update their own rules
CREATE POLICY "Users can update own discount rules"
ON discount_rules_config
FOR UPDATE
TO authenticated
USING (organizer_id = auth.uid())
WITH CHECK (organizer_id = auth.uid());

-- Policy: Users can delete their own rules
CREATE POLICY "Users can delete own discount rules"
ON discount_rules_config
FOR DELETE
TO authenticated
USING (organizer_id = auth.uid());

-- Policy: Admins can manage all rules
CREATE POLICY "Admins can manage all discount rules"
ON discount_rules_config
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- ============================================================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_discount_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_discount_rules_timestamp ON discount_rules_config;

CREATE TRIGGER trigger_update_discount_rules_timestamp
    BEFORE UPDATE ON discount_rules_config
    FOR EACH ROW
    EXECUTE FUNCTION update_discount_rules_updated_at();

-- ============================================================================
-- Function: Evaluate discount rules for an event
-- Returns the highest priority matching rule or null if none match
-- ============================================================================

CREATE OR REPLACE FUNCTION evaluate_discount_rules(
    p_event_id UUID,
    p_organizer_id UUID,
    p_occupancy_percent INTEGER,
    p_hours_before_event INTEGER
)
RETURNS TABLE (
    rule_id UUID,
    rule_name VARCHAR(100),
    discount_percent INTEGER,
    priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dr.id,
        dr.rule_name,
        dr.discount_percent,
        dr.priority
    FROM discount_rules_config dr
    WHERE dr.organizer_id = p_organizer_id
        AND (dr.event_id IS NULL OR dr.event_id = p_event_id)
        AND dr.is_active = true
        AND dr.occupancy_threshold > p_occupancy_percent  -- Current occupancy is BELOW threshold
        AND (
            -- Convert time threshold to hours for comparison
            CASE 
                WHEN dr.time_unit = 'days' THEN dr.time_threshold * 24
                ELSE dr.time_threshold
            END
        ) >= p_hours_before_event  -- Event is within the time window
    ORDER BY dr.priority ASC, dr.created_at ASC
    LIMIT 1;  -- Return highest priority matching rule
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION evaluate_discount_rules IS 
'Evaluates all active discount rules for an event and returns the highest priority matching rule';

-- ============================================================================
-- Sample Data (Optional - for testing)
-- ============================================================================

-- Uncomment to add sample rules for testing
/*
INSERT INTO discount_rules_config (organizer_id, rule_name, rule_description, occupancy_threshold, time_threshold, time_unit, discount_percent, priority)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Early Bird Low Sales', 'When occupancy is below 30% with 2 weeks to go', 30, 14, 'days', 25, 1),
    ('00000000-0000-0000-0000-000000000000', 'Last Minute Push', 'When occupancy is below 50% with 24 hours left', 50, 24, 'hours', 20, 2),
    ('00000000-0000-0000-0000-000000000000', 'Final Hours Flash', 'When occupancy is below 70% with 4 hours left', 70, 4, 'hours', 15, 3)
ON CONFLICT (organizer_id, rule_name) DO NOTHING;
*/
