-- Migration: Add Quick Create event fields
-- Created: 2024-01-17
-- Description: Add ticket_price, require_approval, and enable_waitlist columns to events table

-- Add new columns for Quick Create event fields
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS ticket_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS require_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_waitlist BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN events.ticket_price IS 'Event ticket price in USD, 0 for free events';
COMMENT ON COLUMN events.require_approval IS 'Whether organizer approval is required for participants';
COMMENT ON COLUMN events.enable_waitlist IS 'Whether waitlist is enabled when event reaches capacity';
