# 🛒 POS Kasir - Enterprise Point of Sales & Inventory System
A modern, highly secure, and enterprise-grade Point of Sales (POS) and Inventory Management System. Designed for high concurrency and robust data integrity, this application seamlessly handles everything from cashier checkouts and digital payments to complex inventory tracking and financial reporting.
## 🚀 Tech Stack
- **Backend:** [Laravel 12](https://laravel.com/)
- **Frontend:** [React 19](https://react.dev/) + [Inertia.js](https://inertiajs.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Premium Slate/Emerald UI)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Database:** MySQL
- **Payments:** Midtrans Integration (QRIS, E-Wallets, Virtual Accounts)
## ✨ Key Features
- **🛍️ Cashier POS:** Lightning-fast barcode scanning, dynamic cart management, and seamless cash/digital checkout flow.
- **📦 Inventory Management:** Real-time stock tracking with automated deduction and restoration logic.
- **🚚 Supplier Operations:** Manage incoming stock through Purchase Invoices and handle defective items via Supplier Returns.
- **🔄 Customer Returns:** Granular partial return processing with automated inventory re-syncing.
- **⏰ Shift Management:** Secure cashier shift tracking with enforced starting/ending cash drawer audits.
- **💳 Digital Payments:** Integrated Midtrans gateway for instant QRIS, ShopeePay, and Virtual Account settlements.
- **📊 Financial Reporting:** Dynamic, date-filterable Sales, Profitability, and Stock Valuation reports.
- **⚙️ Store Settings:** Highly customizable store profiles with dynamic logo and receipt footprint management.
## 🛡️ Advanced Engineering Highlights
This system was engineered with a strict focus on security, data integrity, and high-concurrency resilience. Key architectural decisions include:
- **Atomic Database Transactions & Pessimistic Locking:** Critical financial paths utilize `DB::transaction()` and `lockForUpdate()` to prevent race conditions during high-volume checkout and inventory operations.
- **Anti-Deadlock Mechanisms:** To guarantee system stability under massive concurrent load, multi-row locking operations enforce a deterministic, ascending `product_id` sorting algorithm to mathematically eliminate database deadlocks.
- **Zero-Trust Client Payloads:** The backend completely discards client-provided financial totals during checkout. Subtotals, discounts, and grand totals are strictly recalculated server-side using enforced 2-decimal precision (`round()`) to prevent payload tampering.
- **Atomic API Rollbacks:** External payment gateway integrations (Midtrans) are deeply encapsulated within atomic database transactions. If the payment API times out or fails, the entire database state (including pending orders and stock deductions) instantly rolls back to prevent "ghost orders".
- **Strict Data Integrity:** Hardcoded cascading deletion protections prevent the removal of products or categories tied to historical financial records.
- **Mass Assignment & IDOR Protection:** All Eloquent models strictly enforce `$fillable` arrays. Sensitive operations (like Cashier Shifts and Expenses) implement strict `auth()->id()` scoping to prevent Insecure Direct Object References (IDOR).
- **Performance & DDoS Mitigation:** Widespread application of Eager Loading (`with()`) eradicates N+1 query bottlenecks, while strict API rate limiting (`throttle`) protects authentication and checkout endpoints from brute-force and spam attacks.
## 🛠️ Installation Guide

Follow these steps to deploy the application locally:

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/pos-kasir.git
cd pos-kasir
```

### 2. Install Backend Dependencies
```bash
composer install
```

### 3. Install Frontend Dependencies
```bash
npm install
```

### 4. Configure Environment
Copy the `.env.example` file and configure your database and Midtrans credentials.
```bash
cp .env.example .env
php artisan key:generate
```
Update your `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pos_kasir
DB_USERNAME=root
DB_PASSWORD=
MIDTRANS_SERVER_KEY="your-server-key"
MIDTRANS_CLIENT_KEY="your-client-key"
MIDTRANS_IS_PRODUCTION=false
```

### 5. Run Migrations & Seeders
This will build your database schema and populate it with the default administrator account, permissions, and settings.
```bash
php artisan migrate:fresh --seed
```
**Default Admin Login:** `admin@example.com` / `password`

### 6. Link Storage
Create a symbolic link to ensure product images and store logos are publicly accessible:
```bash
php artisan storage:link
```

### 7. Start the Application
You will need two terminal windows to run the frontend build engine and the backend server simultaneously.

**Terminal 1 (Vite/React):**
```bash
npm run dev
```

**Terminal 2 (Laravel):**
```bash
php artisan serve
```
Navigate to `http://localhost:8000` to access the application.
