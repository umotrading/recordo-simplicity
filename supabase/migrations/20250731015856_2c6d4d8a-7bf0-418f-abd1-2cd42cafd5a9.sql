-- Add user_id columns to tables that need user association
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.top_ups ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.agent_records ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.agent_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS on all tables
ALTER TABLE public.agent_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_types ENABLE ROW LEVEL SECURITY;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Enable delete for all users" ON public.expenses;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.expenses;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.expenses;
DROP POLICY IF EXISTS "Enable update for all users" ON public.expenses;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.top_ups;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.top_ups;

-- Create user-specific RLS policies for expenses
CREATE POLICY "Users can view their own expenses" 
ON public.expenses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
ON public.expenses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user-specific RLS policies for top_ups
CREATE POLICY "Users can view their own top_ups" 
ON public.top_ups 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own top_ups" 
ON public.top_ups 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own top_ups" 
ON public.top_ups 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own top_ups" 
ON public.top_ups 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user-specific RLS policies for agents
CREATE POLICY "Users can view their own agents" 
ON public.agents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents" 
ON public.agents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" 
ON public.agents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" 
ON public.agents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user-specific RLS policies for agent_records
CREATE POLICY "Users can view their own agent_records" 
ON public.agent_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent_records" 
ON public.agent_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent_records" 
ON public.agent_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent_records" 
ON public.agent_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user-specific RLS policies for agent_items
CREATE POLICY "Users can view their own agent_items" 
ON public.agent_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent_items" 
ON public.agent_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent_items" 
ON public.agent_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent_items" 
ON public.agent_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Keep agent_categories and item_types as public read-only for all authenticated users
CREATE POLICY "Authenticated users can view agent_categories" 
ON public.agent_categories 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view item_types" 
ON public.item_types 
FOR SELECT 
TO authenticated
USING (true);

-- Secure storage bucket policies
CREATE POLICY "Users can view their own receipts" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own receipts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own receipts" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own receipts" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);