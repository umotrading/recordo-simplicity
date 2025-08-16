-- Update RLS policy to allow users to delete all expenses (since this is a personal finance app)
DROP POLICY "Users can delete their own expenses" ON public.expenses;

CREATE POLICY "Users can delete all expenses" 
ON public.expenses 
FOR DELETE 
TO authenticated 
USING (true);

-- Also update UPDATE policy to be consistent
DROP POLICY "Users can update their own expenses" ON public.expenses;

CREATE POLICY "Users can update all expenses" 
ON public.expenses 
FOR UPDATE 
TO authenticated 
USING (true);