# Lineup Manager

A web application built with React, TypeScript, Vite, and Supabase for user authentication and lineup management.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Authentication**: Supabase
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4

## Features

- User authentication (sign up, sign in, sign out)
- Protected routes for authenticated users
- User profiles with avatar uploads
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

5. **Set up the database tables and storage** (see Database Setup section below)

6. **Enable Email Auth in Supabase** (if not already enabled)
   - Go to Authentication > Providers in your Supabase dashboard
   - Ensure Email provider is enabled
   - Configure email templates if needed

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   - Navigate to `http://localhost:5173`
   - You should see the home page

## Database Setup

Before using the app, you need to set up the database tables and storage in Supabase.

### 1. Create the Profiles Table

Go to your Supabase project's SQL Editor and run the following:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 2. Create the Avatars Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **"New Bucket"**
3. Name it **"avatars"**
4. Make it **public**
5. Create the bucket

### 3. Set up Storage Policies

In the SQL Editor, run the following policies for the avatars bucket:

```sql
-- Policy: Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Anyone can view avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Project Structure

```
src/
├── components/
│   └── ProtectedRoute.tsx    # Route wrapper for authentication
├── contexts/
│   └── AuthContext.tsx       # Authentication context and provider
├── lib/
│   └── supabase.ts           # Supabase client configuration
├── pages/
│   ├── Home.tsx              # Landing page
│   ├── Login.tsx             # Login page
│   ├── Signup.tsx            # Signup page
│   ├── Dashboard.tsx         # Protected dashboard page
│   └── Profile.tsx           # User profile page
├── App.tsx                   # Main app with routing
└── main.tsx                  # App entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report

## Authentication Flow

1. User visits the app and sees the Home page
2. User can sign up with email and password
3. Supabase sends a confirmation email (check your spam folder)
4. After email confirmation, user can sign in
5. Authenticated users can access the Dashboard and Profile pages
6. Protected routes automatically redirect unauthenticated users to the login page

## User Profile Features

- **Full Name**: Users can update their display name
- **Avatar Upload**: Users can upload profile pictures directly to Supabase Storage
- **Avatar Preview**: Shows current avatar or default initial placeholder
- **Automatic Storage**: Images are securely stored with proper access controls

## Testing

This project uses Vitest for testing. Tests are located alongside their source files with the `.test.ts` or `.test.tsx` extension.

### Running Tests

```bash
# Run tests in watch mode (recommended during development)
npm run test

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Writing Tests

Example test files are included:
- [src/components/UserAvatar.test.tsx](src/components/UserAvatar.test.tsx) - Component testing example
- [src/test/example.test.ts](src/test/example.test.ts) - Utility function testing example

To add a new test, create a file with `.test.ts` or `.test.tsx` extension next to the file you want to test.

### Test Setup

- **Framework**: Vitest
- **React Testing**: @testing-library/react
- **DOM Matchers**: @testing-library/jest-dom
- **Environment**: jsdom
- **Setup File**: [src/test/setup.ts](src/test/setup.ts)

## Next Steps

Now that authentication and profiles are set up, you can:

1. **Build lineup management features** in new components/pages
2. **Add more database tables** for your lineup data
3. **Add more routes** for different features
4. **Implement real-time features** using Supabase subscriptions
5. **Extend the profile** with additional fields as needed
6. **Write tests** for your new features

## Troubleshooting

- **Environment variables not loading**: Make sure your variables start with `VITE_` prefix and restart the dev server
- **Email confirmation not received**: Check spam folder or configure SMTP settings in Supabase
- **Authentication errors**: Verify your Supabase URL and anon key are correct in `.env`

## Resources

- [Vite Documentation](https://vite.dev)
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com)
- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
