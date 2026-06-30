-- Create waiting_list table to hold user sign-ups
CREATE TABLE IF NOT EXISTS public.waiting_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL
);

-- Enable RLS (Row Level Security) to prevent unauthorized reads
ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (everyone can sign up)
CREATE POLICY "Allow anonymous inserts" ON public.waiting_list FOR INSERT WITH CHECK (true);

-- Create policy to restrict reads/selects to authenticated users only
CREATE POLICY "Restrict select to authenticated users" ON public.waiting_list FOR SELECT TO authenticated USING (true);
