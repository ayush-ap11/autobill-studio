# 🚀 Autobill Studio - Invoice Generator SaaS

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Autobill Studio is a **multi-tenant SaaS application** that enables companies to register and manage their **customers, goods/services, and invoices**. Each company operates in its own isolated scope, while the **Super Admin** has global visibility across the platform.

---

## ✨ Feature Workflow

1. **Company Registration & Login**
   - A company registers on the platform (**self-service**, no admin approval needed).
   - Login via **Google OAuth** or **Email + Password**.
   - After login, redirected to their **Invoice Dashboard**.

2. **Company Dashboard**
   - Manage **Customers** (add, update, delete, list).
   - Manage **Goods/Services** (add, update, delete, list).
   - Manage **Invoices**:
     - Create invoices  
     - View invoice details  
     - Download invoices as PDF  
     - Send invoices via email  

3. **Data Isolation**
   - Each company can only view and manage its own resources.

4. **Admin (SaaS Owner)**
   - Login via **Google OAuth** or **Email + OTP + Password**.
   - Has **global access** to all companies, customers, goods, and invoices.
   - Can monitor and manage all platform activities.

---

## 🛠 Project Structure

- **Project Initialization**: Bootstrapped with `create-next-app`.  
- **Database**: `lib/db.ts` — MongoDB connection with Mongoose.  
- **Models**:  
  - `models/Company.ts` — Company schema (name, gstin, email, phone, etc.).  
  - `models/Customer.ts` — Customer schema linked to a company.  
  - `models/Invoice.ts` — Invoice schema with items, taxes, pre-save invoice number.  
  - `models/Item.ts` — Goods/Services schema.  
  - `models/Owner.ts` — User/Owner schema with password hashing and roles (`superAdmin`, `owner`).  
- **Auth Helper**:  
  - `lib/auth.ts` — Extracts `companyId` or `adminId` from JWT in headers/cookies.  

---

## 📌 API Routes

### ✅ Implemented Routes

#### Auth
- **POST** `/api/auth/register` — `app/api/auth/register/route.ts`  
  Registers a new company and redirects directly to the dashboard.  

- **GET** `/api/auth/google` & `/callback` — `app/api/auth/google/route.ts`, `app/api/auth/google/callback/route.ts`  
  Handles Google OAuth login and sets JWT in cookies.  

- **POST** `/api/auth/login` — `app/api/auth/login/route.ts`  
  Allows company login with email + password.  

- **POST** `/api/auth/logout` — `app/api/auth/logout/route.ts`  
  Clears JWT cookies and logs the user out.  

#### Company
- **GET/PUT** `/api/company/me` — `app/api/company/me/route.ts`  
  Get or update current company’s profile.  

---

### ⏳ Remaining Routes to Implement

#### Auth (Login/Logout)
- `POST /api/auth/login` — `app/api/auth/login/route.ts`  
  *Handles login for both Owner and SuperAdmin using Email + Password.  
   - For Owners: login with the company email registered during company creation.  
   - For SuperAdmin: login with SuperAdmin credentials (requires OTP if enabled).*

- `POST /api/auth/register-superadmin` — `app/api/auth/register-superadmin/route.ts`  
  *Registers a new SuperAdmin account. This is separate from company registration.* 🚧 *Remaining to implement.*

---

#### Customers (Company-Scoped)
- **POST & GET** `/api/customers` — `app/api/customers/route.ts`  
  Should allow company to add new customers and list all customers.  

- **PUT & DELETE** `/api/customers/[id]` — `app/api/customers/[id]/route.ts`  
  Should allow updating or deleting a customer by ID (only within the company scope).  

---

#### Goods/Services
- **POST & GET** `/api/goods` — `app/api/goods/route.ts`  
  Should allow adding new products/services and listing them.  

- **PUT & DELETE** `/api/goods/[id]` — `app/api/goods/[id]/route.ts`  
  Should allow updating or deleting a product/service by ID.  

---

#### Invoices
- **POST & GET** `/api/invoices` — `app/api/invoices/route.ts`  
  Should create new invoices and list all invoices of a company.  

- **GET** `/api/invoices/[id]` — `app/api/invoices/[id]/route.ts`  
  Should fetch details of a specific invoice.  

- **GET** `/api/invoices/[id]/pdf` — `app/api/invoices/[id]/pdf/route.ts`  
  Should generate and return a downloadable PDF of the invoice.  

- **POST** `/api/invoices/[id]/email` — `app/api/invoices/[id]/email/route.ts`  
  Should send invoice PDF via email to customer.  

---

#### Admin (Super Admin)
- **GET** `/api/admin/companies` — `app/api/admin/companies/route.ts`  
  Should return a list of all registered companies for monitoring.  


---

## 🎨 App Directory & UI
- **Entry/Layout**: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/favicon.ico`  
- **Fonts**: `app/ui/fonts.ts`  
- **Assets**: `public/` folder for SVGs & images  

---

## 🚦 How to Run

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
