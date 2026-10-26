# FlowDesk

A full-stack request approval system with dedicated dashboards for employees, managers, and administrators.

FlowDesk brings request submission, review, and user management into one application, with role-based workflows and a clear request lifecycle.

## Features

### Employee Dashboard
- Create and track personal requests.
- View request statuses and review feedback.
- Cancel requests according to the application's workflow rules.

### Manager Dashboard
- Review employee requests.
- Approve or reject requests with feedback.
- Track requests through the approval process.

### Admin Dashboard
- Manage users and assign roles.
- Access administrative controls and system health information.

### Authentication and Access Control
- JWT-based authentication.
- Role-specific navigation and protected frontend routes.
- Separate interfaces for employees, managers, and administrators.

### Request Lifecycle
- Track requests from submission to a final decision.
- Prevent further changes to approved or rejected requests.
- Provide validation messages and toast notifications for user actions.

## Repository Structure

```text
frontend/    Next.js web application
backend/     Backend API
README.md    Project overview
```

Originally developed in separate frontend and backend repositories, then consolidated into this repository with commit history preserved. The repository creation date reflects the consolidation, not the start of development.

## Frontend Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js with App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Authentication state | React Context API |
| Validation | Zod |
| Icons | Lucide React |
| Toast notifications | Sonner |

See the documentation inside `backend/` for backend technologies, configuration, and API details.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Ahmadpk194/FlowDesk.git
cd FlowDesk
```

### 2. Configure and start the backend

Follow the setup instructions inside `backend/` to install dependencies, configure the required services and environment variables, and start the API.

### 3. Install frontend dependencies

In a separate terminal, navigate to the cloned repository's `frontend/` directory:

```bash
cd frontend
npm install
```

### 4. Configure the frontend

Create a `.env.local` file inside `frontend/` and set the backend API base URL:

```env
NEXT_PUBLIC_API_URL=<your-backend-api-base-url>
```

Replace the placeholder with the actual API URL, including the API prefix where required.

### 5. Start the frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Development Notes

- Frontend and backend dependencies are installed separately.
- Run each application from its own directory.
- Frontend route guards support navigation; API authorization must be enforced independently by the backend.
- Keep environment files and private credentials out of version control.

## Author

**Ahmad Khan**

- [GitHub](https://github.com/Ahmadpk194)
- [LinkedIn](https://www.linkedin.com/in/ahmad-khan-974203a8/)
