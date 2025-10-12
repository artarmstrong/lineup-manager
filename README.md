# Lineup Manager

A web application built with React, TypeScript, Vite, and Supabase for user authentication and lineup management.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Authentication**: Supabase
- **Routing**: React Router v7
- **Styling**: CSS

## Features

- User authentication (sign up, sign in, sign out)
- Protected routes for authenticated users
- Session management with Supabase
- Modern React with TypeScript
- Fast development with Vite HMR

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Supabase account and project

### Setup

1. **Clone the repository** (if not already done)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Go to [Supabase](https://app.supabase.com)
   - Create a new project or use an existing one
   - Go to Project Settings > API
   - Copy your project URL and anon key

4. **Configure environment variables**
   - Open the `.env` file in the root directory
   - Replace the placeholder values with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Enable Email Auth in Supabase** (if not already enabled)
   - Go to Authentication > Providers in your Supabase dashboard
   - Ensure Email provider is enabled
   - Configure email templates if needed

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:5173`
   - You should see the login/signup page

## Project Structure

```
src/
├── components/
│   ├── Auth.tsx              # Login/Signup component
│   ├── Auth.css
│   └── ProtectedRoute.tsx    # Route wrapper for authentication
├── contexts/
│   └── AuthContext.tsx       # Authentication context and provider
├── lib/
│   └── supabase.ts          # Supabase client configuration
├── pages/
│   ├── Dashboard.tsx         # Protected dashboard page
│   └── Dashboard.css
├── App.tsx                   # Main app with routing
└── main.tsx                  # App entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication Flow

1. User visits the app and sees the Auth page (login/signup)
2. User can sign up with email and password
3. Supabase sends a confirmation email (check your spam folder)
4. After email confirmation, user can sign in
5. Authenticated users are redirected to the Dashboard
6. Protected routes automatically redirect unauthenticated users to the login page

## Next Steps

Now that authentication is set up, you can:

1. **Create database tables** in Supabase for your lineup data
2. **Add RLS (Row Level Security) policies** to secure your data
3. **Build lineup management features** in new components/pages
4. **Add more routes** for different features
5. **Implement real-time features** using Supabase subscriptions
6. **Add profile management** and user settings

## Troubleshooting

- **Environment variables not loading**: Make sure your variables start with `VITE_` prefix and restart the dev server
- **Email confirmation not received**: Check spam folder or configure SMTP settings in Supabase
- **Authentication errors**: Verify your Supabase URL and anon key are correct in `.env`

## Resources

- [Vite Documentation](https://vite.dev)
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com)
