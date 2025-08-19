# NextN - Sistema de Análise de Editais com Autenticação

Sistema Next.js com autenticação JWT, permissionamento de usuários e containerização Docker para análise de editais e avaliações de TI.

## 🚀 Funcionalidades

- **Autenticação JWT** com cookies httpOnly
- **Sistema de permissões** (Admin/Usuário)
- **Gerenciamento de usuários** (CRUD completo)
- **Containerização Docker** com PostgreSQL
- **Interface moderna** com Tailwind CSS e Radix UI
- **Análise de editais** e documentos PDF
- **Dashboard responsivo**

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Banco de dados**: PostgreSQL
- **Autenticação**: JWT + bcrypt
- **Containerização**: Docker & Docker Compose
- **ORM**: SQL nativo com pg

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

## 🚀 Instalação e Configuração

### 1. Configuração rápida
```bash
./scripts/setup.sh
```

### 2. Configuração manual (alternativa)

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env.local

# Iniciar banco de dados
docker-compose up -d db

# Iniciar aplicação
npm run dev
```

## 🐳 Docker

### Desenvolvimento
```bash
# Apenas banco de dados
docker-compose up -d db

# Aplicação completa
docker-compose up -d
```

## 🔐 Sistema de Autenticação

### Usuário Padrão
- **Email**: admin@nextn.com
- **Senha**: admin123
- **Role**: admin

### Endpoints da API

#### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário atual

#### Usuários (Admin apenas)
- `GET /api/users` - Listar usuários
- `POST /api/auth/register` - Criar usuário
- `GET /api/users/[id]` - Buscar usuário
- `PUT /api/users/[id]` - Atualizar usuário
- `DELETE /api/users/[id]` - Deletar usuário

### Permissões
- **Admin**: Acesso total ao sistema e gerenciamento de usuários
- **User**: Acesso às funcionalidades básicas do sistema

## 🗄️ Banco de Dados

### Acesso ao Banco
- **Adminer**: http://localhost:8080
- **Servidor**: db
- **Usuário**: postgres
- **Senha**: password
- **Database**: nextn_db

## 🔧 Desenvolvimento

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

## 📝 Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/nextn_db

# JWT
JWT_SECRET=your-super-secret-jwt-key

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```
