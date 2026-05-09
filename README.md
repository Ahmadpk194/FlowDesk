# 🚀 FlowDesk Web

> **Enterprise-grade Request Approval System**
> Built by **[Ahmad Khan](https://www.linkedin.com/in/ahmad-khan-974203a8/)**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

FlowDesk Web is a high-performance, responsive frontend built for a sophisticated request approval lifecycle. It features a robust Role-Based Access Control (RBAC) system, elegant micro-animations, and a mobile-first design aesthetic.

---

## ✨ Key Features

### 🏢 Intelligent Dashboards
- **👨‍💼 Employee Hub**: Seamlessly create, track, and manage personal requests. Features real-time status updates and cancellation logic.
- **🛡️ Manager Portal**: A centralized command center for reviewing, approving, or rejecting requests with mandatory feedback loops.
- **⚙️ Admin Console**: Full-scale user management, role delegation, and system health monitoring.

### 🔐 Security & Architecture
- **JWT-Powered Auth**: Secure, stateless authentication with automated token handling.
- **Deep RBAC**: Navigation and API interactions are strictly enforced based on user roles.
- **Validation**: Strict schema validation using **Zod** for both form inputs and API responses.

### 🎨 Premium UX/UI
- **Responsive Mastery**: Fluid layouts that adapt perfectly from 4K monitors to mobile devices.
- **Glassmorphism**: Modern UI components with subtle transparency and blur effects.
- **Instant Feedback**: Toast notifications via **Sonner** for every critical action.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.2.6](https://nextjs.org/) (App Router)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.steventey.com/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/) & [Zod](https://zod.dev/)
- **State Management**: React Context API (Auth-aware)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>

# 2. Install dependencies
npm install

# 3. Setup Environment Variables
cp .env.example .env.local
```

### Environment Configuration

Configure your `.env.local` with the following:

```env
NEXT_PUBLIC_API_URL=https://flowdesk-backend-production-706d.up.railway.app/api/v1
```

### Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app in action.

---

## 📂 Project Structure

```text
app/
├── (auth)/             # Authentication flow (Login/Register)
├── dashboard/          # Role-specific dashboard layouts
│   ├── admin/          # User & System management
│   ├── employee/       # Personal request tracking
│   └── manager/        # Approval workflow
├── globals.css         # Tailwind & Custom design tokens
└── layout.tsx          # Root provider & Layout wrapper
components/
├── auth/               # Auth-specific components
├── dashboard/          # Reusable dashboard widgets
└── ui/                 # Custom high-quality UI components (Modals, etc.)
lib/
├── api/                # Modular API service layers (Axios/Fetch)
└── utils/              # JWT decoding & helper functions
context/                # Global Auth & State providers
types/                  # Centralized TypeScript definitions
```

---

## 📜 Business Rules & Logic

1. **Immutable States**: Once a request is `APPROVED` or `REJECTED`, it becomes immutable to maintain audit integrity.
2. **Role Guarding**: Users are automatically redirected if they attempt to access routes outside their permission level.
3. **Smart Normalization**: A unified utility handles different backend ID structures (`_id` vs `uuid`) seamlessly.

---

Developed with ❤️ by **[Ahmad Khan](https://www.linkedin.com/in/ahmad-khan-974203a8/)**.
