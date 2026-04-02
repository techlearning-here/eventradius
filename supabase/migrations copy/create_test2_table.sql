-- Create test2 table for debugging purposes
CREATE TABLE public.test2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test2 ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to view test2 records
CREATE POLICY "Test2 records are viewable by everyone" 
ON public.test2 
FOR SELECT 
USING (true);

-- Create policy to allow authenticated users to insert test2 records
CREATE POLICY "Authenticated users can insert test2 records" 
ON public.test2 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update test2 records
CREATE POLICY "Authenticated users can update test2 records" 
ON public.test2 
FOR UPDATE 
TO authenticated
USING (true);

-- Create policy to allow authenticated users to delete test2 records
CREATE POLICY "Authenticated users can delete test2 records" 
ON public.test2 
FOR DELETE 
TO authenticated
USING (true);
