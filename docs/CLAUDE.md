# Claude Code Reference - Lineup Manager

Quick reference for common commands and project context when working with Claude Code.

## Project Overview

**Type**: React + TypeScript web application
**Purpose**: User authentication and lineup management
**Database**: Supabase (PostgreSQL)
**Build Tool**: Vite 7

## Tech Stack Quick Reference

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Database & Auth**: Supabase
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + React Testing Library

## Common Development Commands

```bash
# Development
npm run dev              # Start dev server (localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint

# Testing
npm run test             # Tests in watch mode
npm run test:ui          # Tests with UI interface
npm run test:coverage    # Tests with coverage report

# Git
git status              # Check current status
git add .               # Stage all changes
git commit -m "msg"     # Commit with message
git push                # Push to remote
```

## Project Structure

```
src/
├── components/          # Reusable React components
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts (Auth, etc.)
│   └── AuthContext.tsx
├── lib/                # Configuration & utilities
│   └── supabase.ts
├── pages/              # Route pages
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   └── Profile.tsx
├── test/               # Test setup
│   └── setup.ts
├── App.tsx             # Main routing
└── main.tsx            # Entry point
```

## Environment Variables

Located in `.env` file (not committed to git):

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Tables

### profiles
- `id` (UUID) - References auth.users
- `full_name` (TEXT)
- `avatar_url` (TEXT)
- `updated_at` (TIMESTAMP)

**RLS Policies**: Users can only view/update their own profile

### Storage Buckets
- `avatars` - Public bucket for user profile pictures

## Common Tasks Reference

### Adding a New Page/Route
1. Create component in `src/pages/`
2. Add route in [src/App.tsx](src/App.tsx)
3. Use `<ProtectedRoute>` wrapper if authentication required

### Working with Supabase
- Client instance: Import from [src/lib/supabase.ts](src/lib/supabase.ts)
- Auth context: Use `useAuth()` hook from [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)
- Database queries: Use supabase client methods

### Adding New Database Tables
1. Write SQL in Supabase SQL Editor
2. Set up Row Level Security (RLS) policies
3. Document schema in [docs/database-schema.md](docs/database-schema.md)

### Writing Tests
- Create `.test.tsx` or `.test.ts` file next to source
- Use React Testing Library for components
- See examples:
  - [src/components/UserAvatar.test.tsx](src/components/UserAvatar.test.tsx)
  - [src/test/example.test.ts](src/test/example.test.ts)

## Key Files to Know

| File | Purpose |
|------|---------|
| [src/lib/supabase.ts](src/lib/supabase.ts) | Supabase client configuration |
| [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) | Authentication state & methods |
| [src/App.tsx](src/App.tsx) | Main routing configuration |
| [src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx) | Auth guard for protected routes |
| [.env](.env) | Environment variables (local only) |
| [docs/database-schema.md](docs/database-schema.md) | Database documentation |

## Authentication Flow

1. User signs up → Email confirmation sent
2. User confirms email → Can now sign in
3. Sign in → Session stored in Supabase
4. Protected routes check auth status
5. Unauthenticated users → Redirected to login

## Important Notes

- All Vite env variables must start with `VITE_` prefix
- Restart dev server after changing `.env`
- Check spam folder for confirmation emails
- RLS policies protect all database operations
- Avatar images stored with user ID prefix for security

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Env vars not working | Restart dev server (`npm run dev`) |
| Auth errors | Check Supabase credentials in `.env` |
| Email not received | Check spam, verify SMTP in Supabase |
| Build errors | Run `npm install` and check dependencies |
| Test failures | Check test setup in [src/test/setup.ts](src/test/setup.ts) |

## Next Development Steps

- [ ] Build lineup management features
- [ ] Add database tables for lineup data
- [ ] Implement real-time features with Supabase subscriptions
- [ ] Extend user profiles with additional fields
- [ ] Add more comprehensive tests

## Resources

- [Vite Docs](https://vite.dev)
- [React Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [React Router Docs](https://reactrouter.com)
- [Vitest Docs](https://vitest.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Last Updated**: 2025-10-21
**Git Branch**: main
**Status**: Clean working directory
