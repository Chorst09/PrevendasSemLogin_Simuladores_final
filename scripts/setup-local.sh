#!/bin/bash

echo "🚀 Configurando o ambiente de desenvolvimento (PostgreSQL local)..."

# Verificar se o PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado."
    echo "Instale o PostgreSQL:"
    echo "  brew install postgresql@15"
    echo "  brew services start postgresql@15"
    exit 1
fi

# Copiar arquivo de ambiente se não existir
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    cp .env.example .env.local
    
    # Atualizar URL do banco para local
    sed -i '' 's|postgresql://postgres:password@localhost:5432/nextn_db|postgresql://$(whoami)@localhost:5432/nextn_db|g' .env.local
    
    echo "✅ Arquivo .env.local criado e configurado para PostgreSQL local."
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Criar banco de dados se não existir
echo "🗄️ Configurando banco de dados..."
createdb nextn_db 2>/dev/null || echo "Banco nextn_db já existe ou erro na criação"

# Executar script SQL
echo "📋 Executando migrations..."
psql -d nextn_db -f init.sql

echo "✅ Setup concluído!"
echo ""
echo "Para iniciar o desenvolvimento:"
echo "  npm run dev"
echo ""
echo "Usuário admin padrão:"
echo "  Email: admin@nextn.com"
echo "  Senha: admin123"