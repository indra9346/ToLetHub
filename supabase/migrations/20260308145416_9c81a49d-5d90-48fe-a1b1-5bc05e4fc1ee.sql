
-- Add videos column to houses table
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}';
