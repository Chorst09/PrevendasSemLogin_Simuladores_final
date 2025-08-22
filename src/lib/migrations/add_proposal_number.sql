-- Adicionar coluna proposal_number à tabela proposals
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS proposal_number VARCHAR(50);

-- Criar índice para melhorar performance de busca
CREATE INDEX IF NOT EXISTS idx_proposals_proposal_number ON proposals(proposal_number);

-- Atualizar propostas existentes com números padrão para VMs
UPDATE proposals 
SET proposal_number = 'Prop_MV_' || LPAD(CAST(ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM created_at) ORDER BY created_at) AS TEXT), 4, '0') || '/' || EXTRACT(YEAR FROM created_at)
WHERE type = 'VM' AND proposal_number IS NULL;