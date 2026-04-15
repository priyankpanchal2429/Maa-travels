# Bus Management System

Full-stack authentication boilerplate for a Bus Management Service.

---

## Stack

| Layer    | Tech                       | Deploy      |
|----------|----------------------------|-------------|
| Frontend | Next.js 14 + TypeScript    | Vercel      |
| Backend  | Node.js + Express + TS     | Render      |
| Database | MongoDB Atlas              | MongoDB     |
| Auth     | JWT + Refresh Token Cookie | —           |

---

## Quick Start — Local Development

### 1. Clone and set up

```bash
git clone <your-repo>
cd bus-management-system
```

### 2. Backend

```bash
cd backend
npm install

# Copy env and fill in your values
cp .env.example .env

# Seed the default admin user (Bus001 / admin123)
npm run seed

# Start dev server
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install

# Copy env file
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Default Admin Credentials

| Field    | Value      |
|----------|------------|
| User ID  | `Bus001`   |
| Password | `admin123` |

> ⚠️ **Change immediately in production!**

---

## Auth Flow

| Feature                   | How                                                              |
|---------------------------|------------------------------------------------------------------|
| Login                     | User ID + Password → JWT access token (15m) + refresh cookie    |
| Silent refresh            | Axios interceptor auto-refreshes on 401                         |
| Logout                    | Clears token from memory + httpOnly cookie                       |
| Self change password      | Profile page: old password → new password                       |
| Force change password     | Shown after admin reset; no old password required               |
| Admin reset password      | Admin panel → user row → Reset button → sets mustChangePassword  |
| Create user (admin only)  | Admin panel → Add User → auto-generated User ID (BusXXX)        |
| Delete / toggle active    | Admin panel → user row → action buttons                          |

---

## Deployment

### Backend → Render

1. Push to GitHub
2. New Web Service on Render, connect repo, point to `backend/`
3. Set all env vars from `.env.example` (click "Generate value" for secrets)
4. MongoDB Atlas: whitelist `0.0.0.0/0` (Render has dynamic IPs)

### Frontend → Vercel

1. New Project on Vercel, connect repo, point to `frontend/`
2. Add env var: `NEXT_PUBLIC_API_URL=https://your-api.onrender.com`
3. Deploy

---

## API Endpoints

| Method | Route                                   | Auth         |
|--------|-----------------------------------------|--------------|
| POST   | `/api/auth/login`                       | No           |
| POST   | `/api/auth/logout`                      | Yes          |
| POST   | `/api/auth/refresh`                     | Cookie only  |
| GET    | `/api/auth/me`                          | Yes          |
| PUT    | `/api/auth/change-password`             | Yes          |
| PUT    | `/api/auth/force-change-password`       | Yes          |
| POST   | `/api/auth/admin/users`                 | Admin only   |
| GET    | `/api/auth/admin/users`                 | Admin only   |
| PUT    | `/api/auth/admin/users/:userId/reset-password` | Admin only |
| PATCH  | `/api/auth/admin/users/:userId/toggle-active`  | Admin only |
| DELETE | `/api/auth/admin/users/:userId`         | Admin only   |
| GET    | `/api/health`                           | No           |
