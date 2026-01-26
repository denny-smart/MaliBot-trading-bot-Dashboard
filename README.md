# MaliBot Trading Hub

A modern, full-featured trading dashboard for the MaliBot system with Google OAuth authentication and admin approval workflow.
https://malibot.vercel.app/

## 🚀 Features

### Core Functionality
- **Real-time Bot Monitoring** - Live status tracking and performance metrics
- **Trading Dashboard** - Comprehensive view of active trades and positions
- **Trade History & Analytics** - Historical data with advanced filtering and charts
- **Signal Monitoring** - Real-time trading signal visualization
- **Performance Metrics** - ROI tracking, win rates, and detailed statistics

### Authentication & Authorization
- **Google OAuth Integration** - Secure authentication via Supabase
- **Admin Approval Workflow** - New users require admin approval before accessing the platform
- **Role-Based Access Control** - Admin and user roles with different permissions
- **Protected Routes** - Automatic redirection for unauthenticated/unapproved users

### Admin Features
- **User Management** - Approve/reject pending user registrations
- **Role Assignment** - Manage user roles and permissions
- **System Monitoring** - Oversee all platform activities

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **bun** - Package manager
- **Git** - Version control

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd remix-of-deriv-trading-hub
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API Configuration
VITE_API_BASE_URL=backend url
```

**Important:** Never commit `.env.local` to version control. It's already included in `.gitignore`.

## 🚦 Running the Application

### Development Mode

```bash
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
# or
bun build
```

### Preview Production Build

```bash
npm run preview
# or
bun preview
```

## 📁 Project Structure

```
remix-of-deriv-trading-hub/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── layout/          # Layout components (Navbar, Sidebar, etc.)
│   │   └── ui/              # shadcn-ui components
│   ├── contexts/            # React contexts (AuthContext)
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # Third-party integrations
│   │   └── supabase/        # Supabase client configuration
│   ├── lib/                 # Utility functions and helpers
│   ├── pages/               # Page components (routes)
│   ├── services/            # API service layer
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── .env.local              # Environment variables (not in git)
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## 🔐 Authentication Flow

### User Registration & Login

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. After successful authentication, user is redirected to `/dashboard`
4. System checks if user is approved (`is_approved` flag in database)
5. If not approved, user is redirected to `/pending-approval` page
6. If approved, user gains access to the dashboard

### Admin Approval Process

1. New users are created with `is_approved: false` by default
2. Admin logs in and navigates to user management
3. Admin reviews pending users and approves/rejects them
4. Approved users can access the platform on next login
5. Rejected users remain on the pending approval page

### Protected Routes

All dashboard routes are protected and require:
- Valid authentication session
- Approved user status (`is_approved: true`)

Unauthenticated users are redirected to `/login`
Unapproved users are redirected to `/pending-approval`

## 🎨 Technology Stack

### Frontend Framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn-ui** - High-quality React components
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Icon library

### State Management & Data Fetching
- **TanStack Query (React Query)** - Server state management
- **React Context** - Authentication state
- **Axios** - HTTP client

### Authentication & Backend
- **Supabase** - Authentication and database
- **@supabase/supabase-js** - Supabase client library

### Routing & Forms
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Charts & Visualization
- **Recharts** - Chart library for analytics

## 📝 Development Rules & Best Practices

### Code Style
- Use **TypeScript** for all new files
- Follow **ESLint** rules (run `npm run lint`)
- Use **functional components** with hooks
- Prefer **named exports** for components

### Component Guidelines
- Keep components **small and focused**
- Use **shadcn-ui components** for UI elements
- Extract reusable logic into **custom hooks**
- Place shared components in `src/components/`
- Place page components in `src/pages/`

### State Management
- Use **React Query** for server state
- Use **Context** for global client state (auth, theme)
- Use **local state** for component-specific state
- Avoid prop drilling - use context when needed

### API Integration
- All API calls should go through `src/services/api.ts`
- Use **React Query** hooks for data fetching
- Handle loading and error states properly
- Implement proper error boundaries

### Authentication
- Always check `isAuthenticated` and `isApproved` before rendering protected content
- Use `ProtectedRoute` wrapper for protected pages
- Handle token refresh automatically via Supabase
- Clear auth state on logout

### Styling
- Use **Tailwind CSS** utility classes
- Follow the design system defined in `tailwind.config.ts`
- Use CSS variables for theming
- Ensure responsive design (mobile-first approach)

### Git Workflow
- Create feature branches from `main`
- Use descriptive commit messages
- Test before pushing
- Keep commits atomic and focused

### Environment Variables
- Never commit `.env.local` or sensitive keys
- Use `VITE_` prefix for client-side env variables
- Document all required env variables in this README

## 🐛 Troubleshooting

### Common Issues

**Issue: "Environment variables not loading"**
- Ensure `.env.local` exists in the root directory
- Verify all required `VITE_*` prefixed variables are set
- Restart the development server after changing `.env.local`

**Issue: "Authentication redirects not working"**
- Clear browser cache and cookies
- Check redirect URLs are correctly configured
- Verify you're using the correct Google account

**Issue: "User stuck on pending approval page"**
- Log out and log back in to refresh user session
- Clear browser cache and local storage
- Contact admin to verify approval status

## 📄 License

This project is proprietary and confidential.

---

<!-- Last updated: 2026-01-27 -->
