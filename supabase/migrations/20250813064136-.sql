-- Create admin authentication system
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users policies (only admins can access)
CREATE POLICY "Only admins can view admin users" 
ON public.admin_users 
FOR ALL
USING (role = 'admin');

-- Insert admin user
-- Username: raman, Password: Raman@2025!
INSERT INTO public.admin_users (username, password_hash, role)
VALUES (
  'raman',
  'Raman@2025!',
  'admin'
);

-- Add trigger for admin_users timestamps
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();