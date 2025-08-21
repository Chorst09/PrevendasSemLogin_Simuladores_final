-- Update the users table to include 'diretor' as a valid role
-- First, drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Recreate the check constraint with the new role
ALTER TABLE users 
ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user', 'diretor'));
