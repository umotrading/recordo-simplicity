-- Restore old records from expenses gmp table to expenses table
-- This will copy all records and assign them to the first authenticated user
INSERT INTO public.expenses (
  name, 
  date, 
  invoice_no, 
  vendor, 
  purpose, 
  category, 
  amount, 
  payment_method, 
  receipt_url, 
  user_id, 
  created_at
)
SELECT 
  name,
  date,
  invoice_no,
  vendor,
  purpose,
  category,
  amount,
  payment_method,
  receipt_url,
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) as user_id,
  created_at
FROM "expenses gmp"
WHERE NOT EXISTS (
  SELECT 1 FROM public.expenses e 
  WHERE e.name = "expenses gmp".name 
  AND e.date = "expenses gmp".date 
  AND e.amount = "expenses gmp".amount
);