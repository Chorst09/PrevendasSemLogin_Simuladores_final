-- Add password_change_required column to users table
-- This will be true by default for new 'diretor' and 'user' roles

-- Add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'password_change_required') THEN
        ALTER TABLE users ADD COLUMN password_change_required BOOLEAN DEFAULT false;
        
        -- Set password_change_required to true for all existing 'diretor' and 'user' roles
        UPDATE users 
        SET password_change_required = true 
        WHERE role IN ('diretor', 'user');
        
        -- For existing admins, set to false
        UPDATE users
        SET password_change_required = false
        WHERE role = 'admin';
    END IF;
END $$;
