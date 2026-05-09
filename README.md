# 🛡️ Inventário de Valkaria - Backend

> Sistema de gerenciamento de mesas e fichas de RPG em tempo real, com suporte a múltiplos sistemas, multiclasse nativo e motor de fórmulas customizado.

[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-46%2F46-brightgreen)](./docs/IMPLEMENTATION_SUMMARY.md)

---

## 📖 O que temos hoje (v1.0 Foundation)

### ✅ Implementado

**Autenticação & Usuários**
- Registro e login com JWT
- Guards de autenticação e autorização
- Soft delete para usuários
- 46/46 testes passando

**Gestão de Mesas**
- CRUD de mesas com visibilidade (PUBLIC, PRIVATE, UNLISTED)
- Sistema de membros com roles (MASTER, PLAYER, OBSERVER)
- Sistema de convites com expiração
- Sistema de join requests
- RBAC granular com Guards

**RPG System Foundation**
- Atributos (STR, DEX, CON, etc)
- Skills/Habilidades
- Classes com features
- Raças com traits
- Moedas/Currencies
- Item categories

**Fichas de Personagem - 25 Endpoints**
- CRUD completo (create, read, update, delete)
- Auto-população de atributos, skills, moedas ao criar
- Multiclasse nativo (múltiplas classes por ficha)
- Atribuição de raça com traits automáticos
- Gerenciamento de itens e modificadores
- Efeitos com duração (buffs/debuffs)
- Session state (visibilidade em cena)
- Attribute overrides para valores customizados

**Motor de Fórmulas Customizado**
- Avaliação lazy de atributos derivados
- Precedência de fórmulas (priority)
- Detecção de ciclos (topological sort)
- Cache em memória com invalidação
- Suporte a variáveis e expressões

**Validações & Business Rules**
- Sem duplicação de effects por nome
- Validação de duração de effects (não podem ser no passado)
- Semântica de session state (isVisible/isInScene)
- Prevenção de classes duplicadas
- Validação de permissões (MASTER/PLAYER/OBSERVER)

---

## 🏗️ Arquitetura em 3 Camadas

```
┌─────────────────────────┐
│   RPG System Global     │  (atributos, classes, raças, skills)
└───────────┬─────────────┘
            │ (clone para)
            ↓
┌─────────────────────────┐
│  Table + Template       │  (mesa e suas customizações)
└───────────┬─────────────┘
            │ (instância para)
            ↓
┌─────────────────────────┐
│ Character Sheet         │  (ficha do jogador com valores)
└─────────────────────────┘
```

---

## 📊 Módulos Implementados

| Módulo | Controllers | Services | Tests | Status |
|--------|-------------|----------|-------|--------|
| User | 1 | 1 | 5 ✅ | Completo |
| Auth | 1 | 1 | 3 ✅ | Completo |
| RPG System | 6 | 6 | 16 ✅ | Completo |
| Table | 1 | 3 | - | Completo |
| Sheet | 1 | 1 | 14 ✅ | Completo |
| **Total** | **10** | **12** | **46** | **100%** |

---

## 🛠️ Stack Tecnológica

- **Framework**: [NestJS](https://nestjs.com/) v9+ (TypeScript)
- **ORM**: [Prisma](https://www.prisma.io/) v5+
- **Database**: PostgreSQL (com Docker)
- **Testing**: Jest v29+ com ts-jest
- **Validação**: `class-validator` & `class-transformer`
- **Segurança**: JWT + Custom Guards
- **Serialização**: TypeORM entities

---

## 📝 Endpoints Disponíveis

### Autenticação
```
POST   /auth/login                    # Login com email/username
POST   /user/signup                   # Registrar novo usuário
GET    /user/:id                      # Buscar usuário (com auth)
```

### Mesas & Membros
```
POST   /tables                        # Criar mesa
GET    /tables                        # Listar mesas
GET    /tables/:tableId               # Detalhe da mesa
PATCH  /tables/:tableId               # Atualizar mesa
DELETE /tables/:tableId               # Deletar mesa
POST   /tables/:tableId/invites       # Criar invite
POST   /tables/:tableId/join-requests # Solicitar entrada
```

### Fichas de Personagem (25 endpoints)
```
POST   /tables/:tableId/sheets                           # Criar ficha
GET    /tables/:tableId/sheets                           # Listar fichas
GET    /tables/:tableId/sheets/:sheetId                  # Buscar ficha
PATCH  /tables/:tableId/sheets/:sheetId/activate         # Ativar ficha

# Atributos & Skills
PATCH  /tables/:tableId/sheets/:sheetId/attributes/:id   # Atualizar atributo
PATCH  /tables/:tableId/sheets/:sheetId/skills/:id       # Atualizar skill

# Raça
PATCH  /tables/:tableId/sheets/:sheetId/race             # Atribuir raça

# Classes (multiclass)
POST   /tables/:tableId/sheets/:sheetId/classes          # Adicionar classe
PATCH  /tables/:tableId/sheets/:sheetId/classes/:id      # Atualizar nível
DELETE /tables/:tableId/sheets/:sheetId/classes/:id      # Remover classe

# Itens
POST   /tables/:tableId/sheets/:sheetId/items            # Criar item
PATCH  /tables/:tableId/sheets/:sheetId/items/:id        # Atualizar item
DELETE /tables/:tableId/sheets/:sheetId/items/:id        # Deletar item
POST   /tables/:tableId/sheets/:sheetId/items/:id/modifiers      # Adicionar mod
PATCH  /tables/:tableId/sheets/:sheetId/items/:id/modifiers/:mid # Toggle equip
DELETE /tables/:tableId/sheets/:sheetId/items/:id/modifiers/:mid # Remover mod

# Moedas, Efeitos, Overrides, Session
PATCH  /tables/:tableId/sheets/:sheetId/currencies/:id        # Atualizar moeda
POST   /tables/:tableId/sheets/:sheetId/effects               # Criar effect
PATCH  /tables/:tableId/sheets/:sheetId/effects/:id           # Toggle active
DELETE /tables/:tableId/sheets/:sheetId/effects/:id           # Remover effect
PATCH  /tables/:tableId/sheets/:sheetId/session-state         # Update visibility
POST   /tables/:tableId/sheets/:sheetId/attribute-overrides    # Criar override
DELETE /tables/:tableId/sheets/:sheetId/attribute-overrides/:id # Remover
```

---

## ⚙️ Como Instalar & Rodar

### Pré-requisitos
```bash
Node.js 18+
npm ou yarn
PostgreSQL 14+ (ou Docker)
```

### 1. Clonar e instalar dependências
```bash
git clone <repo>
cd backend/inventario-valkaria
npm install
```

### 2. Configurar variáveis de ambiente
```bash
# Copiar arquivo exemplo
cp .env.example .env

# Editar .env com suas credenciais
# DB_URL=postgresql://user:password@localhost:5432/valkaria
# SECRET_KEY=sua-chave-secreta-aqui
# NODE_ENV=development
```

### 3. Rodar PostgreSQL (com Docker)
```bash
# Se usar docker-compose (já configurado)
docker-compose up -d

# Ou instale PostgreSQL localmente
```

### 4. Preparar banco de dados
```bash
# Criar migrations
npx prisma migrate dev --name init

# Seed do banco (opcional)
npx prisma db seed
```

### 5. Rodar servidor em desenvolvimento
```bash
npm run start:dev

# Servidor rodando em http://localhost:3000
```

### 6. Rodar testes
```bash
# Todos os testes
npm test

# Com coverage
npm test -- --coverage

# Apenas um módulo
npm test -- src/user
npm test -- src/auth
npm test -- src/table/sheet
```

### 7. Build para produção
```bash
npm run build

# Output em dist/
npm run start:prod
```

---

## 📄 Licença

MIT