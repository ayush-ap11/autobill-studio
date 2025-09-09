This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## Autobill Studio - Project Documentation & Changelog

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Structure & Key Steps

Below is a step-by-step summary of the main features, files, and changes made so far, with file paths for reference:

### 1. Project Initialization
- Bootstrapped with `create-next-app` (Next.js)
- Initial files: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, etc.

### 2. MongoDB Integration
- **Database connection utility:**
	- `lib/db.ts` — Handles MongoDB connection using Mongoose.

### 3. Models (Mongoose Schemas)
- **Company model:**
	- `models/Company.ts` — Company schema with fields like name, gstin, email, phone, address, logoUrl, bankDetails, and status.
- **Customer model:**
	- `models/Customer.ts` — Customer schema linked to Company.
- **Invoice model:**
	- `models/Invoice.ts` — Invoice schema with items, taxes, status, and pre-save hook for invoice number.
- **Item model:**
	- `models/Item.ts` — Item schema for products/services.
- **User model:**
	- `models/User.ts` — User schema with password hashing and roles.

### 4. Authentication & Authorization
- **JWT-based authentication helper:**
	- `lib/auth.ts` — Extracts companyId from JWT in headers or cookies.

### 5. API Routes
- **Company registration:**
	- `app/api/auth/register/route.ts` — Registers a new company (pending approval).
- **Google OAuth:**
	- `app/api/auth/google/route.ts` — Redirects to Google OAuth consent screen.
	- `app/api/auth/google/callback/route.ts` — Handles Google OAuth callback, verifies company, issues JWT, sets cookie.
- **Company profile (me):**
	- `app/api/company/me/route.ts` — Get and update current company details (protected route).

### 6. App Directory & UI
- **App entry and layout:**
	- `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/favicon.ico`
- **Fonts:**
	- `app/ui/fonts.ts` — Font configuration.

### 7. Public Assets
- **SVGs and images:**
	- `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`

---

## How to Run

 First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


