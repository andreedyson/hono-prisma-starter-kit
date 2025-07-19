# 🔥 Hono + Prisma + MySQL Node.js Template Starter Kit

A minimalist yet scalable authentication starter kit built with [Hono](https://hono.dev/), [Prisma](https://www.prisma.io/), and MySQL. It includes secure JWT authentication, Zod-based validation, and a clear separation of concerns using route + service architecture.

---

## ✨ Features

- ⚡ Ultra-fast [Hono](https://hono.dev/) HTTP framework
- 🔐 JWT Authentication (access token)
- 🧠 Zod validation via `@hono/zod-validator`
- 🧬 Prisma ORM + MySQL schema
- 🧱 Clean folder structure (routes, services, utils)
- 🧪 Ready for real-world use

---

## 🗂️ Folder Structure
```
hono-prisma-starter-kit/
├── prisma/
│ ├── schema.prisma
├── src/
│ ├── configs/
│ │ └── env.ts
│ ├── db/
│ │ └── prisma.ts
│ ├── routes/
│ │ └── auth.route.ts
│ ├── services/
│ │ └── auth.service.ts
│ ├── middlewares/
│ │ └── auth.middleware.ts
│ │ └── error.middleware.ts
│ ├── schemas/
│ │ └── auth.schema.ts
│ ├── utils/
│ │ └── token.ts
│ │ └── email.ts
│ │ └── cookie.ts
│ ├── types/
├── .env
├── tsconfig.json
├── package.json
└── README.md
```

---

## ⚙️ Tech Stack

- **Runtime**: Node.js
- **Framework**: [Hono](https://hono.dev/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: MySQL (can be replace with PostgreSQL / other in `schema.prisma`)
- **Validation**: [Zod](https://zod.dev/)
- **Auth**: JWT with `hono/jwt`

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/andreedyson/hono-prisma-starter-kit.git
cd hono-prisma-starter-kit
```

### 2. Install dependencies
```
npm install
```

### 3. Configure .env
``` bash
cp .env.example .env
```

``` env
DATABASE_URL="your-database-url"
JWT_SECRET=your-jwt-secret
JWT_RESET_SECRET=your-reset-password-jwt-secret
RESEND_API_KEY=resend-api-key
RESEND_FROM=test@example.com
PORT="8787"
```

### 4. Setup the database
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Run the development server
```
 npm run dev
```
The main endpoint is `http://localhost:8787` / `http://localhost:${PORT}`

---

## Authentication Routes 🔒
`POST /api/auth/register`
- This register a new user

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response**
```json
{
  "message": "Successfully Registered",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "user": {
    "id": "...",
    "email": "user@example.com"
  }
}
```

`POST /api/auth/login`
- User login and create a JWT Token

**Request  Body**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "user": {
    "id": "...",
    "email": "user@example.com"
  }
}
```

`POST /api/auth/login`
- Protected routem requires Authorization: Bearer <token> header.

---

## Scripts 📦
| Command | Description |
| -------- | ------- |
| `npm run dev` | Run the local development server |
| `npx prisma studio` | Open Prisma GUI |
| `npx prisma migrate dev` | Run Prisma migrations |
| `npx prisma generate` | Generate Prisma client |

---

## Credits 🙌
- [**Hono**](https://www.hono.dev/) – A  small, simple, and ultrafast web framework built on Web Standards.
- [**Prisma**](https://www.prisma.io/) – Next generation ORM for TypeScript with powerful query and type safety.
- [**Zod**](https://www.zod.dev/) – TypeScript-first schema validation with static type inference.

---

## Support ⭐
Consider giving this template a star ⭐ on GitHub if you find it helpful!

---
Created by [@andreedyson](https://www.github.com/andreedyson)
