-- Migration script to add missing columns to existing proposals table
-- Run this if you have an existing database with proposals table

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'proposals' AND column_name = 'status') THEN
        ALTER TABLE proposals ADD COLUMN status VARCHAR(50) DEFAULT 'Salva';
    END IF;
END $$;

-- Add type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'proposals' AND column_name = 'type') THEN
        ALTER TABLE proposals ADD COLUMN type VARCHAR(50) DEFAULT 'GENERAL';
    END IF;
END $$;

-- Update existing records to have appropriate types based on products
UPDATE proposals 
SET type = CASE 
    WHEN products::text ILIKE '%vm%' OR products::text ILIKE '%virtual%' THEN 'VM'
    WHEN products::text ILIKE '%pabx%' OR products::text ILIKE '%sip%' THEN 'PABX_SIP'
    WHEN products::text ILIKE '%fibra%' OR products::text ILIKE '%fiber%' THEN 'FIBER'
    WHEN products::text ILIKE '%radio%' THEN 'RADIO'
    ELSE 'GENERAL'
END
WHERE type = 'GENERAL';
