#!/bin/bash

echo "🚀 Configurando o ambiente de desenvolvimento..."

# Copiar arquivo de ambiente se não existir
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    cp .env.example .env.local
    echo "✅ Arquivo .env.local criado. Configure as variáveis de ambiente."
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Iniciar containers Docker
echo "🐳 Iniciando containers Docker..."
docker-compose up -d db

# Aguardar o banco estar pronto
echo "⏳ Aguardando o banco de dados estar pronto..."
sleep 10

# Executar migrations (se necessário)
echo "🗄️ Banco de dados configurado!"

echo "✅ Setup concluído!"
echo ""
echo "Para iniciar o desenvolvimento:"
echo "  npm run dev"
echo ""
echo "Para acessar o Adminer (gerenciador de banco):"
echo "  http://localhost:8080"
echo "  Servidor: db"
echo "  Usuário: postgres"
echo "  Senha: password"
echo "  Base de dados: nextn_db"