-- Update all records with NULL user_id to current user
UPDATE public.expenses 
SET user_id = '485302c1-7195-4975-8698-028b8ce96f25'
WHERE user_id IS NULL;