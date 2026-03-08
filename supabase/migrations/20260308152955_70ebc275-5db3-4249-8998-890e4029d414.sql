-- Grant admin role to existing user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('34fa5d54-72a8-43b0-adf6-648ef6246d63', 'admin') 
ON CONFLICT (user_id, role) DO NOTHING;