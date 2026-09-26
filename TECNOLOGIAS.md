# 🧵 Tecnologias do Projeto — Lunnexx / Oficina de Costura

Documentação completa de todas as tecnologias, ferramentas e serviços utilizados no projeto.

---

## 📑 Índice

- [Frontend](#-frontend)
- [Backend](#-backend)
- [Banco de Dados](#-banco-de-dados)
- [Infraestrutura AWS](#️-infraestrutura-aws)
- [Ferramentas de Desenvolvimento](#-ferramentas-de-desenvolvimento)
- [Arquitetura Geral](#-arquitetura-geral)
- [Repositórios](#-repositórios)

---

## 🎨 Frontend

Aplicações cliente: site público e painel administrativo.

### Base

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

- **React 18** — Biblioteca de UI baseada em componentes
- **Vite 8** — Build tool e dev server ultrarrápido
- **TypeScript 5.x** — Tipagem estática em toda a base

### Estilização

![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)

- **Tailwind CSS 3** — Estilização utilitária com design tokens customizados
- **CSS customizado** — Variáveis, animações e scrollbar personalizada

### Bibliotecas de UI/UX

- **Framer Motion** — Animações e transições suaves
- **React Icons** (Feather + Lucide) — Iconografia consistente
- **React Hot Toast** — Notificações e feedback visual

### Roteamento e Dados

- **React Router v7** — Navegação SPA com rotas protegidas
- **Fetch API nativo** — Requisições HTTP com interceptor de JWT
- **date-fns** — Formatação de datas em português

### Tipografia

- **Playfair Display** — Títulos e destaques
- **Inter** — Corpo do texto e UI

---

## ⚙️ Backend

APIs REST: pública (site) e administrativa (painel).

### Base

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

- **Node.js 20** — Runtime JavaScript
- **TypeScript 5.x** — Tipagem estática

### Framework HTTP

![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)

- **Fastify 5** — Framework web de alta performance

### Plugins Fastify

- **@fastify/cors** — Controle de CORS
- **@fastify/jwt** — Autenticação via JSON Web Token
- **@fastify/multipart** — Upload de arquivos
- **@fastify/static** — Servir arquivos estáticos
- **@fastify/swagger** — Geração de documentação OpenAPI
- **@fastify/swagger-ui** — Interface visual do Swagger

### Validação e Segurança

![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)

- **Zod** — Validação de schemas em runtime
- **bcrypt** — Hash de senhas (10 rounds)
- **JWT** — Autenticação stateless com roles (ADMIN / MANAGER / VIEWER)
- **dotenv** — Carregamento de variáveis de ambiente

### Geração de PDF

![Puppeteer](https://img.shields.io/badge/Puppeteer-25-40B5A4?logo=puppeteer&logoColor=white)

- **Puppeteer 25** — Chrome headless para geração de PDF (HTML → PDF)
- **Chromium** — Engine de renderização

### Utilitários

- **Nodemailer** — Envio de e-mails (configurável)
- **pino-pretty** — Logs formatados em desenvolvimento
- **tsx** — Executar TypeScript direto (dev e produção)

---

## 🗄️ Banco de Dados

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)

- **PostgreSQL 18** — Banco de dados relacional
- **Prisma 7** — ORM type-safe com migrações
- **@prisma/adapter-pg** — Driver adapter oficial para PostgreSQL

### Modelos

- `Quote` — Orçamentos (site público)
- `GalleryImage` — Imagens da galeria
- `Service` — Serviços oferecidos
- `SiteConfig` — Configurações do site
- `User` — Usuários do painel admin
- `Romaneio` — Romaneios de corte

---

## ☁️ Infraestrutura AWS

### Hospedagem

![AWS](https://img.shields.io/badge/AWS-Free_Tier-FF9900?logo=amazonaws&logoColor=white)
![S3](https://img.shields.io/badge/Amazon_S3-Static-569A31?logo=amazons3&logoColor=white)
![CloudFront](https://img.shields.io/badge/CloudFront-CDN-8C4FFF?logo=amazoncloudfront&logoColor=white)

- **Amazon S3** — Hospedagem de sites estáticos (2 buckets)
- **Amazon CloudFront** — CDN + HTTPS + proxy reverso para as APIs
- **Amazon EC2** — Servidor das APIs (t2.micro, Ubuntu 26.04)
- **Amazon RDS** — PostgreSQL gerenciado (db.t4g.micro)

### Gerenciamento e Deploy

- **AWS CLI v2** — Automação de deploy (S3, CloudFront, RDS)
- **Docker + Docker Compose** — PostgreSQL local para desenvolvimento
- **PM2** — Gerenciador de processos Node.js na EC2 (auto-restart, logs)

### Segurança e Rede

- **IAM** — Usuário de deploy com permissões mínimas
- **Security Groups** — Firewall por porta
- **VPC + Subnets** — Rede isolada
- **SSL/TLS** — HTTPS via CloudFront

### Arquitetura de Rede

┌──────────────────────────────────────────────────────┐
│ Navegador (HTTPS) │
└─────────────────┬────────────────────────────────────┘
│
┌────────┴────────┐
▼ ▼
┌─────────────┐ ┌────────────────────┐
│ CloudFront │ │ CloudFront Admin │
│ Site público│ │ + proxy /api/* │
└──────┬──────┘ └─────────┬──────────┘
│ │
▼ ▼
┌─────────┐ ┌─────────────┐
│ S3 │ │ EC2 (PM2) │
│ static │ │ 2 APIs │
└─────────┘ └──────┬──────┘
│
▼
┌─────────────┐
│ RDS Postgres│
└─────────────┘


---

## 🛠️ Ferramentas de Desenvolvimento

- **Git** — Versionamento de código
- **GitHub** — Hospedagem de repositórios (4 repos)
- **VS Code** — Editor principal
- **nano / vim** — Edição rápida no terminal
- **curl** — Testes de API
- **psql** — Cliente PostgreSQL para inspeção
- **ssh** — Acesso remoto à EC2
- **Bash** — Scripts de automação

### Gerenciamento de Pacotes

- **npm** — Em todos os projetos (frontend e backend)

---

## 🏗️ Arquitetura Geral

### Fluxo de uma requisição

1- Usuário acessa site/painel (HTTPS via CloudFront)

2- CloudFront serve o HTML/JS do S3

3- Frontend chama /api/* (mesmo domínio)

4- CloudFront redireciona /api/* para a EC2

5- Fastify recebe, valida com Zod, autentica com JWT

6- Prisma consulta o PostgreSQL (RDS)

7- Resposta volta: RDS → Prisma → Fastify → CloudFront → Navegador

### Fluxo de geração de PDF (Romaneio)

1- Admin clica em "Baixar PDF"

2- Frontend chama GET /api/admin/romaneios/:id/pdf

3- Backend busca o romaneio no banco

4- Template HTML é renderizado com os dados

5- Puppeteer (Chromium headless) gera o PDF

6- PDF retornado como download

---

## 📚 Repositórios

| Repositório | Descrição | Stack |
|-------------|-----------|-------|
| **oficina-costura-frontend** | Site público | React + Vite + Tailwind |
| **oficina-costura-frontend-adm** | Painel administrativo | React + Vite + Tailwind |
| **oficina-costura-api** | API pública | Fastify + Prisma + PostgreSQL |
| **oficina-costura-adm** | API administrativa | Fastify + Prisma + JWT + Puppeteer |

---

## 📝 Notas

- **Sem custo** — Todo o projeto roda no **AWS Free Tier** (12 meses)
- **HTTPS em tudo** — CloudFront + SSL
- **Autenticação JWT** — com roles (ADMIN / MANAGER / VIEWER)
- **PDF profissional** — gerado com Puppeteer e template HTML customizado
- **Deploy automatizado** — scripts `deploy.sh` em cada frontend
- **Versionamento** — 4 repositórios independentes no GitHub

---

<div align="center">

**Desenvolvido com ☕ e dedicação**

*Última atualização: Setembro de 2026*

</div>


