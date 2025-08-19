#!/bin/bash

echo "🚀 Configurando o ambiente NextN..."

# Verificar se Docker está disponível
if command -v docker &> /dev/null && docker info &> /dev/null; then
    DOCKER_AVAILABLE=true
    echo "✅ Docker disponível"
else
    DOCKER_AVAILABLE=false
    echo "❌ Docker não disponível"
fi

# Verificar se PostgreSQL local está disponível
if command -v psql &> /dev/null; then
    POSTGRES_AVAILABLE=true
    echo "✅ PostgreSQL local disponível"
else
    POSTGRES_AVAILABLE=false
    echo "❌ PostgreSQL local não disponível"
fi

# Copiar arquivo de ambiente se não existir
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    cp .env.example .env.local
    echo "✅ Arquivo .env.local criado."
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Escolher método de banco de dados
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "🐳 Usando Docker para PostgreSQL..."
    
    # Iniciar apenas o banco de dados
    docker compose up -d db
    
    echo "⏳ Aguardando PostgreSQL inicializar..."
    sleep 15
    
    # Verificar se o container está rodando
    if docker compose ps db | grep -q "Up"; then
        echo "✅ PostgreSQL Docker iniciado com sucesso!"
        
        # Atualizar .env.local para usar Docker
        sed -i '' 's|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:password@localhost:5432/nextn_db|g' .env.local
        
        echo "🗄️ Banco de dados Docker configurado!"
        echo ""
        echo "Para acessar o Adminer (gerenciador de banco):"
        echo "  docker compose up -d adminer"
        echo "  Acesse: http://localhost:8080"
        echo "  Servidor: db"
        echo "  Usuário: postgres"
        echo "  Senha: password"
        echo "  Database: nextn_db"
    else
        echo "❌ Erro ao iniciar PostgreSQL Docker"
        DOCKER_AVAILABLE=false
    fi
fi

if [ "$DOCKER_AVAILABLE" = false ] && [ "$POSTGRES_AVAILABLE" = true ]; then
    echo "🗄️ Usando PostgreSQL local..."
    
    # Criar banco de dados se não existir
    createdb nextn_db 2>/dev/null || echo "Banco nextn_db já existe"
    
    # Executar script SQL
    echo "📋 Executando migrations..."
    psql -d nextn_db -f init.sql
    
    # Atualizar .env.local para usar PostgreSQL local
    USER=$(whoami)
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$USER@localhost:5432/nextn_db|g" .env.local
    
    echo "✅ PostgreSQL local configurado!"
fi

if [ "$DOCKER_AVAILABLE" = false ] && [ "$POSTGRES_AVAILABLE" = false ]; then
    echo "❌ Nem Docker nem PostgreSQL local estão disponíveis."
    echo "Por favor, instale uma das opções:"
    echo "  Docker: https://www.docker.com/products/docker-desktop/"
    echo "  PostgreSQL: brew install postgresql@15"
    exit 1
fi

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Para iniciar o desenvolvimento:"
echo "  npm run dev"
echo ""
echo "Acesse a aplicação:"
echo "  http://localhost:3000/login"
echo ""
echo "Usuário admin padrão:"
echo "  Email: admin@nextn.com"
echo "  Senha: admin123"