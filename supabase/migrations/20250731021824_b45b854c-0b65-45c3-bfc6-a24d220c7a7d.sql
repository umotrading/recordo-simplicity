-- Update all top_ups records with NULL user_id to current user
UPDATE public.top_ups 
SET user_id = '485302c1-7195-4975-8698-028b8ce96f25'
WHERE user_id IS NULL;