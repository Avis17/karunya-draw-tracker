-- Create lottery results table
CREATE TABLE public.lottery_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  result_number VARCHAR(6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(draw_date, slot_time)
);

-- Enable Row Level Security
ALTER TABLE public.lottery_results ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (anyone can view results)
CREATE POLICY "Anyone can view lottery results" 
ON public.lottery_results 
FOR SELECT 
USING (true);

-- Create policies for admin access (only authenticated users can insert/update/delete)
CREATE POLICY "Authenticated users can insert lottery results" 
ON public.lottery_results 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update lottery results" 
ON public.lottery_results 
FOR UPDATE 
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete lottery results" 
ON public.lottery_results 
FOR DELETE 
TO authenticated
USING (auth.uid() = created_by);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lottery_results_updated_at
BEFORE UPDATE ON public.lottery_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create profiles table for admin management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for profiles timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();