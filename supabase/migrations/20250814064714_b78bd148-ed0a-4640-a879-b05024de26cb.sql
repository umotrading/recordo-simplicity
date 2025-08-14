-- Update RLS policies to allow all authenticated users to view all records

-- Drop existing SELECT policies for expenses
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;

-- Create new SELECT policy for expenses - all authenticated users can view all records
CREATE POLICY "All authenticated users can view all expenses" 
ON public.expenses 
FOR SELECT 
TO authenticated
USING (true);

-- Drop existing SELECT policies for top_ups
DROP POLICY IF EXISTS "Users can view their own top_ups" ON public.top_ups;

-- Create new SELECT policy for top_ups - all authenticated users can view all records
CREATE POLICY "All authenticated users can view all top_ups" 
ON public.top_ups 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the existing INSERT/UPDATE/DELETE policies to maintain data integrity
-- (users can still only modify their own records)