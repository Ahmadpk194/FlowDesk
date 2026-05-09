# FlowDesk Web

> **Created by:** Ahmad Khan
> **Tech Stack:** Next.js 15 | TailwindCSS | Lucide React | Sonner

FlowDesk Web is the modern, responsive frontend for the FlowDesk request approval system. It provides an elegant interface for employees to submit requests, managers to approve/reject them, and admins to manage users.

---

## Features

### 🏢 Dashboards
- **Employee Dashboard**: Create, view, update, and cancel personal requests.
- **Manager Dashboard**: Review all company requests with real-time status filtering.
- **Admin Dashboard**: Comprehensive user management, role assignment, and system monitoring.

### 🔐 Authentication
- Secure JWT-based authentication flow.
- Role-Based Access Control (RBAC) enforced at the UI and routing level.
- Custom login and registration experiences.

### 🎨 Design & UX
- **Elegant Landing Page**: Professional branding with a clear focus on the request lifecycle.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.
- **Glassmorphism & Micro-animations**: Premium look and feel with smooth transitions.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://flowdesk-backend-production-706d.up.railway.app/api/v1
```

### Development

```bash
# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Project Structure

```
app/
├── (auth)/          # Authentication routes (Login, Register)
├── dashboard/       # Role-based dashboards
│   ├── employee/
│   ├── manager/
│   └── admin/
├── api/             # Next.js API routes (if any)
└── page.tsx         # Elegant Landing Page
components/          # Reusable UI components
lib/
├── api/             # API service layers (Axios/Fetch)
└── utils/           # Helper functions & JWT logic
context/             # Auth & Global state providers
types/               # TypeScript definitions
```

---

## Business Rules Implemented

1. **Role Guarding**: Navigation is strictly controlled based on the user's role stored in the JWT.
2. **Request Lifecycle**: UI reflects the immutable nature of `APPROVED` or `REJECTED` requests.
3. **Admin Safety**: Built-in protections to prevent admins from deleting their own accounts.
4. **Data Normalization**: Centralized utility to handle varying backend ID formats (`_id` vs `uuid`).

---

*FlowDesk Web — Built with Next.js and TailwindCSS.*
*Created by **Ahmad Khan**.*
