For this kind of project, React alone is enough, but if you want something closer to production quality and easier structure, I’d lean toward Next.js.

Why:

React = just UI library. You’ll need to manually set up routing, structure, maybe Vite, etc.
Next.js = React + file-based routing + better project structure + API routes if needed + easier scaling later.

Since your backend is already separate in NestJS, you probably won’t use Next.js backend features much, but its routing/layout system is still very convenient.

So practical recommendation:

Use Next.js + TypeScript
UI: Tailwind CSS
State/data fetching: TanStack Query or built-in fetch
Forms: React Hook Form
UI components: shadcn/ui

That stack is very common and pairs nicely with your backend.

Pages you’ll need

Think in terms of roles.

Public pages
1. Login page

Route: /login

Fields:

email
password

Actions:

login
redirect based on role

Optional:

forgot password later
2. Register page

Route: /register

Fields:

name
email
password
Shared authenticated pages
3. Dashboard

Route: /dashboard

Different content by role.

For Employee:

total requests
pending requests
approved requests
rejected requests

For Manager:

pending approvals count
recently submitted requests

For Admin:

total users
total requests
system stats
4. Profile page

Route: /profile

Show:

name
email
role
createdAt

Actions:

logout
Employee pages
5. My Requests

Route: /requests/my

Table:

| Title | Status | Created At | Actions |

Actions:

view
cancel if pending

Filters:

status
6. Create Request

Route: /requests/new

Form:

title
description

Submit → POST /requests

7. Request Details

Route: /requests/[id]

Show:

title
description
status
rejection reason
createdBy
reviewedBy

Buttons:

cancel (if pending + owner)
Manager pages
8. All Requests

Route: /requests

Table:

| Title | Employee | Status | Date | Actions |

Filters:

pending
approved
rejected
cancelled

Actions:

view
approve
reject
9. Approve/Reject modal

Could be modal instead of page.

Reject form:

rejection reason textarea
Admin pages
10. Users Management

Route: /users

Table:

| Name | Email | Role | Created | Actions |

Actions:

change role
delete
11. User Details

Route: /users/[id]

Show:

profile info
requests maybe
12. Analytics (future)

Route: /analytics

Cards:

total users
requests by status
charts

Could use charts from recharts.

Suggested folder structure (Next.js App Router)
app/
├── login/
├── register/
├── dashboard/
├── profile/
├── requests/
│   ├── page.tsx
│   ├── new/
│   ├── my/
│   └── [id]/
├── users/
│   ├── page.tsx
│   └── [id]/
└── analytics/

Components:

components/
├── navbar.tsx
├── sidebar.tsx
├── request-table.tsx
├── stats-card.tsx
├── role-guard.tsx
├── forms/
Layout idea

After login:

Sidebar layout

Left sidebar:

Dashboard
My Requests / Requests
Users (admin)
Analytics
Profile

Main area:

page content

This fits admin dashboards very well.

Auth flow frontend

Store:

access token
refresh token (prefer httpOnly cookie ideally)

Protect routes:

middleware or route guards

Redirect:

unauthenticated → login
My honest recommendation

Because this is portfolio/project based:

Use Next.js.

Not because React can’t do it—but because when recruiters or other developers see:

Next.js
TypeScript
Tailwind CSS
TanStack Query

…it signals a more modern frontend stack.

Your backend is already nicely modular, so pairing it with a clean Next.js dashboard will make the whole project feel much more complete.

A simple stack could be:

Next.js
Tailwind
shadcn/ui
Axios
TanStack Query
React Hook Form

That’s enough. No need to summon 47 state managers and turn this into a science fair project 😄

If you want, I can suggest a full UI wireframe/page flow for FlowDesk next.