# EmPay HRMS: Next-Gen Human Capital Management 🚀

**EmPay** is a premium, enterprise-grade Human Resource Management System (HRMS) designed for speed, security, and a seamless user experience. Developed for the **Odoo Hackathon 2026**, it features a sophisticated 4-portal architecture that bridges the gap between employees, managers, and finance.

## 📺 Product Walkthrough
**[Watch the Full Demo Video (Google Drive)](https://drive.google.com/drive/folders/1ZEghAkoXZK46Iwef-bbVZWXrev2wYTMY?usp=sharing)**

---

## 🏛️ Architecture: Full-Stack Serverless with Supabase
EmPay utilizes a robust, secure, and highly scalable **serverless architecture**. Moving away from insecure client-only mocking, the platform implements a true backend-driven ecosystem:
- **Real-Time Database:** Powered by Supabase (PostgreSQL) with strict referential integrity.
- **Row-Level Security (RLS):** Data visibility is enforced at the database level. Employees can only access their own records, while HR and Payroll roles receive delegated access based on their privileges.
- **Server-Side Rendering (SSR):** Leveraging Next.js App Router for instant load times, SEO optimization, and secure API routes.
- **Automated Triggers:** PostgreSQL PL/pgSQL functions automate tasks like work hour calculation based on check-in/out times and leave balance initialization.

---

## 🌐 The 4-Portal Ecosystem

### 👑 1. Admin Portal
*Control and Visibility at Scale.*
- **Global Dashboard:** High-level metrics on organization growth, expenditure, and active workforce.
- **User Provisioning:** Onboard new employees, assign them to specific companies, and manage global system permissions (Roles: Admin, HR, Payroll, Employee).
- **Cross-Module Oversight:** Full access to override or audit all other modules to maintain data integrity.

### 👥 2. Employee Portal
*Empowering the Individual.*
- **Smart Check-In/Out:** Real-time attendance logging. Background database triggers automatically calculate total work hours and flag 'half-day' or 'present' status.
- **Self-Service Leave:** Request time off (Paid, Sick, Casual, Unpaid) and track remaining balances in real-time.
- **Personalized History:** View private attendance logs and historical payslips natively within the dashboard.

### 💼 3. HR Portal
*People Management, Optimized.*
- **Workforce Directory:** Specialized filters for departments, roles, and employment status.
- **Leave Lifecycle Management:** Automated workflow for reviewing, approving, or rejecting time-off requests.
- **Talent Monitoring:** Track presence, absences, and leave trends to ensure team health and operational readiness.

### 💰 4. Payroll Portal
*Financial Accuracy & Professionalism.*
- **Salary Structures:** Define Base Salary, HRA, DA, PF, and Professional Tax percentages per employee.
- **Computation Engine:** Automated calculation of Gross Salary, Net Salary, Allowances, and Deductions based on attendance and leave records for the month.
- **One-Click Payrun:** Process monthly salaries for the entire organization instantly, transitioning statuses from Draft to Processed to Paid.
- **Document Generation:** Real-time generation of professional PDF payslips securely stored and served via the platform.

---

## ✨ Key Features
- **Role-Based Access Control (RBAC):** Bulletproof security ensuring that Payroll officers can't approve leaves, and HR managers can't process payroll, unless explicitly authorized.
- **Glassmorphism UI:** A sleek, dark-themed interface built with Tailwind CSS v4 and modern CSS techniques for a premium SaaS feel.
- **Dynamic Analytics:** Interactive charts using Recharts, providing insights into departmental distribution, attendance rates, and salary trends.
- **Responsive Design:** Fully optimized for Desktop, Tablet, and Mobile workflows.

---

## 🛠️ Tech Stack
### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Styling:** Tailwind CSS v4, CLSX, Tailwind Merge
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Components:** Radix UI primitives & React Datepicker

### Backend & Infrastructure
- **Database:** Supabase (PostgreSQL 15)
- **Authentication:** Supabase Auth (SSR configured)
- **Email/Notifications:** Resend & EmailJS
- **Security:** Advanced Row Level Security (RLS) policies and secure HTTP-only cookies.

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bhavikesh/SkyWalkers_Empay.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and configure your Supabase variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ukroajbnzgutavrzepje.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
   *(Note: The database requires seeding using the provided SQL scripts `01_init.sql` and `02_hrms_schema.sql` located in the root).*

4. **Launch the platform:**
   ```bash
   npm run dev
   ```

5. **Demo Access:**
   Open `http://localhost:3000` in your browser.

---

## 🔑 Demo Access Guide
Use any of the following credentials for testing the role-based views:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@empay.com` | *123456* |
| **HR Manager** | `hr@empay.com` | *123456* |
| **Payroll Officer** | `payroll@empay.com` | *Any* |
| **Standard Employee** | `john@empay.com` | *Any* |

---

## 🏆 Hackathon Credits
Built with ❤️ by **Team SkyWalkers** for the **Odoo Hackathon 2026**.
- [Bhavikesh Hedau](https://github.com/Bhavikesh)

---
*EmPay: Elevate Your Human Capital.* 📈
