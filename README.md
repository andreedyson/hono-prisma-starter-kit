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
JWT_SECRET="GENERATE JWT SECRET" # Remove  the " "
JWT_RESET_SECRET="GENERATE JWT RESET SECRET" # Remove  the " "
RESEND_API_KEY="RESEND API KEY" # Remove  the " "
RESEND_FROM=<RESEND EMAIL FROM>
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
Come from the PORT you define in the `.env`
