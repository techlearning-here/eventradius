-- Add categories to existing events
UPDATE events 
SET category = CASE 
  WHEN id = '7ba9389a-84bc-42a7-8d4c-5f7222eeb778' THEN 'arts-culture'
  WHEN id = 'a8bd78c1-9506-4906-8ee2-77790c675cbb' THEN 'kids-family'
  ELSE 'other'
END
WHERE category IS NULL OR category = '';

-- Add start times to events (set to tomorrow)
UPDATE events 
SET 
  start_time = created_at + INTERVAL '1 day',
  end_time = created_at + INTERVAL '2 days'
WHERE start_time IS NULL;
