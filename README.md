<div align="center">

# 🛡️ Linha & Ponto — API Administrativa

**Backend do painel admin da oficina Lunnexx — com autenticação JWT e geração de PDF**

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)](https://fastify.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-25-40B5A4?logo=puppeteer&logoColor=white)](https://pptr.dev)

[📚 Documentação completa](./TECNOLOGIAS.md)

</div>

---

## ✨ Sobre o projeto

API REST **administrativa** que alimenta o painel da oficina de costura Lunnexx.

Além do CRUD protegido por **autenticação JWT**, esta API gera **PDFs profissionais de romaneio de corte** usando **Puppeteer** (Chrome headless) — com layout fiel ao modelo de negócio da oficina.

### 🎯 Funcionalidades

- 🔐 **Autenticação JWT** com bcrypt
- 👥 **Gestão de usuários** com roles (ADMIN, MANAGER, VIEWER)
- 📋 **Gestão de orçamentos** (CRUD + estatísticas)
- 📄 **Gestão de romaneios** de corte (CRUD completo)
- 🖨️ **Geração de PDF** com Puppeteer
- 📊 **Dashboard** com estatísticas em tempo real
- 📚 **Documentação Swagger** em `/docs`

---

## 🚀 Tecnologias

- **Node.js 20** + **TypeScript**
- **Fastify 5** — framework HTTP
- **Prisma 7** — ORM type-safe
- **PostgreSQL 18** — banco relacional
- **JWT** — autenticação stateless
- **bcrypt** — hash de senhas
- **Puppeteer 25** — geração de PDF
- **Zod** — validação de schemas

---

## 🛠️ Rodando localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL (via Docker ou RDS)
- Chromium/Chrome (para Puppeteer)

### Instalação

```bash
# Clonar
git clone https://github.com/ErisonFelipe/oficina-costura-adm.git
cd oficina-costura-adm

# Instalar
npm install

# Instalar Chrome para Puppeteer
npx puppeteer browsers install chrome

# Configurar variáveis
cp .env.example .env
# Edite o .env com DATABASE_URL e JWT_SECRET

# Gerar Prisma Client
npx prisma generate

# Aplicar migrations
npx prisma migrate deploy

# Criar usuário admin
npm run seed

# Rodar
npm run dev
A API estará em http://localhost:3334.

Credenciais iniciais
E-mail: admin@oficina.local
Senha:  admin123
⚠️ Troque a senha após o primeiro login!

📁 Estrutura
src/
├── config/            # env, database
├── controllers/       # auth, quote, user, romaneio
├── middlewares/       # authenticate, authorize
├── routes/            # Rotas protegidas
├── schemas/           # Validação Zod
├── services/          # Regras de negócio
├── templates/         # Template HTML do PDF
├── utils/             # pdfGenerator, mailer, imageHandler
├── types/
└── server.ts

🛣️ Endpoints
Autenticação
Método	Rota	Descrição
POST	/api/auth/login	Login
GET	/api/auth/me	Dados do usuário logado
POST	/api/auth/logout	Logout
Orçamentos (protegido)
Método	Rota	Descrição
GET	/api/admin/quotes	Listar com filtros
GET	/api/admin/quotes/stats	Estatísticas
PATCH	/api/admin/quotes/:id/status	Atualizar status
DELETE	/api/admin/quotes/:id	Deletar
Romaneios (protegido) 🆕
Método	Rota	Descrição
POST	/api/admin/romaneios	Criar romaneio
GET	/api/admin/romaneios	Listar com filtros
GET	/api/admin/romaneios/stats	Estatísticas
GET	/api/admin/romaneios/:id	Buscar por ID
PATCH	/api/admin/romaneios/:id	Atualizar
DELETE	/api/admin/romaneios/:id	Deletar
GET	/api/admin/romaneios/:id/pdf	Gerar PDF 📄
Usuários (ADMIN)
Método	Rota	Descrição
GET	/api/admin/users	Listar usuários
POST	/api/admin/users	Criar usuário
PATCH	/api/admin/users/:id	Atualizar
DELETE	/api/admin/users/:id	Deletar

📄 Geração de PDF
O PDF do romaneio é gerado em 3 etapas:

Template HTML (src/templates/romaneio.template.ts) renderiza os dados com CSS

Puppeteer carrega o HTML no Chrome headless

Chrome converte para PDF A4 e retorna como download

O template usa a identidade visual Lunnexx e inclui:

Cabeçalho com nome da oficina

Dados do cliente, produto e corte

Grade de distribuição (cor × tamanho × quantidade)

Cobrança e valores

2 assinaturas (conferente + cortador)

🔒 Segurança
✅ Senhas com hash bcrypt (10 rounds)
✅ JWT com expiração (7 dias)
✅ Middleware de autenticação
✅ Autorização por role (RBAC)
✅ Validação Zod em todos os endpoints
✅ CORS configurado por origem
✅ SSL/TLS com RDS

🔗 Projeto completo
Este repositório é 1 de 4 do sistema Lunnexx:

Repositório	Descrição
🌐 Site público	Interface pública
🔐 Painel admin	Interface administrativa
⚙️ API pública	Backend do site
🛡️ API admin	Este repositório
📚 Documentação técnica completa: TECNOLOGIAS.md

<div align="center">
Feito com ☕ e dedicação

© 2026 Lunnexx — Oficina de Costura

</div>
