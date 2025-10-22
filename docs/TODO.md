# Lineup Manager - TODO List

## Project Status Overview

This document tracks the implementation progress for the Lineup Manager application. We are currently focused on completing the **Free Tier** features before moving to Premium features.

---

## Free Tier Implementation Tasks

### Core Feature Completions

- [x] **5-lineup limit enforcement**
  - Check lineup count before allowing new lineup creation
  - Display error message when user reaches 5 lineup limit
  - Display lineup count indicator (e.g., "3 of 5 lineups")
  - Disable form when limit is reached
  - Location: [src/pages/LineupForm.tsx](../src/pages/LineupForm.tsx)

- [x] **Player position restrictions UI - Pitcher**
  - Add checkbox/flag for "Cannot play pitcher" in player form
  - Update UI in LineupForm to capture this restriction
  - Checkbox displays below player input fields
  - Location: [src/pages/LineupForm.tsx](../src/pages/LineupForm.tsx)

- [x] **Player position restrictions UI - Catcher**
  - Add checkbox/flag for "Cannot play catcher" in player form
  - Update UI in LineupForm to capture this restriction
  - Checkbox displays below player input fields
  - Location: [src/pages/LineupForm.tsx](../src/pages/LineupForm.tsx)

- [x] **Update Player type for position restrictions**
  - Add `cannotPitch?: boolean` field to Player type
  - Add `cannotCatch?: boolean` field to Player type
  - Updated `updatePlayer` function to accept boolean values
  - Location: [src/types/lineup.types.ts](../src/types/lineup.types.ts)

- [x] **Update rotation algorithm - Pitcher restrictions**
  - Modify algorithm to respect `cannotPitch` flag
  - Ensure only eligible players are assigned to pitcher position
  - Players with `cannotPitch=true` are skipped when assigning 'P' position
  - Location: [src/utils/rotationGenerator.ts](../src/utils/rotationGenerator.ts)

- [x] **Update rotation algorithm - Catcher restrictions**
  - Modify algorithm to respect `cannotCatch` flag
  - Ensure only eligible players are assigned to catcher position
  - Players with `cannotCatch=true` are skipped when assigning 'C' position
  - Location: [src/utils/rotationGenerator.ts](../src/utils/rotationGenerator.ts)

- [x] **Validation for pitcher/catcher settings**
  - Ensure if `usePitcher=true`, at least one player can pitch
  - Ensure if `useCatcher=true`, at least one player can catch
  - Display validation error if settings are incompatible with player restrictions
  - Clear error messages guide users to fix the issue
  - Location: [src/pages/LineupForm.tsx](../src/pages/LineupForm.tsx)

### UX Improvements

- [ ] **Add loading states to data operations**
  - Add loading spinner when creating lineup
  - Add loading spinner when deleting lineup
  - Add loading spinner when fetching lineups list
  - Add loading spinner when fetching single lineup
  - Locations: [src/pages/LineupForm.tsx](../src/pages/LineupForm.tsx), [src/pages/Lineups.tsx](../src/pages/Lineups.tsx), [src/pages/LineupView.tsx](../src/pages/LineupView.tsx)

- [ ] **Add confirmation dialog before deleting lineups**
  - Create confirmation modal/dialog component
  - Prevent accidental deletion with "Are you sure?" prompt
  - Locations: [src/pages/Lineups.tsx](../src/pages/Lineups.tsx), [src/pages/LineupView.tsx](../src/pages/LineupView.tsx)

- [ ] **Better error handling and user feedback**
  - Add toast notifications or alert messages for errors
  - Display user-friendly error messages for common failures
  - Handle network errors gracefully
  - Locations: All pages with data operations

- [x] **Display lineup count on Lineups page**
  - Show "X of 5 lineups used" counter
  - Update counter after creation/deletion
  - Warning notification when user has 4 lineups (1 remaining)
  - Error notification when user has reached 5 lineup limit
  - Info notification showing remaining lineups (0-3 lineups)
  - Location: [src/pages/Lineups.tsx](../src/pages/Lineups.tsx)

### Testing

- [ ] **Test rotation algorithm with restriction scenarios**
  - Test with all players restricted from pitcher
  - Test with all players restricted from catcher
  - Test with mixed restrictions
  - Test edge cases (only 1 player can pitch, etc.)
  - Location: Create tests in [src/test/](../src/test/)

---

## Premium Tier Features (REFERENCE ONLY - DO NOT IMPLEMENT YET)

These items are documented for future database schema considerations. They should **NOT** be implemented now, but kept in mind when making database changes to avoid conflicts later.

### Database Schema Changes Needed for Premium

- [ ] **[REFERENCE] Add `rotation_innings` field**
  - Add to `lineups.data` JSONB for configurable rotation cycles (1/2/3 innings)
  - Allows positions to rotate every 1, 2, or 3 innings instead of every inning
  - Will require rotation algorithm refactor

- [ ] **[REFERENCE] Add `pitcher_rotation_innings` field**
  - Add to `lineups.data` JSONB for independent pitcher rotation cycles
  - Allows pitcher to rotate on different cycle than position players
  - Example: positions rotate every 2 innings, pitcher rotates every 3 innings

- [ ] **[REFERENCE] Create `teams.settings` JSONB column**
  - Store team-wide default settings:
    - Default number of innings (3-9)
    - Default use pitcher (boolean)
    - Default use catcher (boolean)
    - Default rotation_innings (1/2/3)
    - Default pitcher_rotation_innings (1/2/3)
    - Team name and description

- [ ] **[REFERENCE] Create `roster` table**
  - Persistent player information per team
  - Fields: `id`, `team_id`, `player_name`, `jersey_number`, `position_restrictions` (JSONB)
  - Position restrictions stored as object: `{ cannotPitch: bool, cannotCatch: bool, cannotPlay: ['1B', '2B'] }`
  - Allows creating lineups from saved roster instead of entering players each time

- [ ] **[REFERENCE] Add `parent_contacts` to roster**
  - JSONB field for up to 2 parent contacts per player
  - Structure: `[{ name: string, email: string, phone: string, relationship: string }]`
  - For team communication features

### Premium Features

- [ ] **[REFERENCE] Unlimited team lineups**
  - Remove 5 lineup limit for premium users
  - Check subscription status before enforcing limit

- [ ] **[REFERENCE] Team roster management**
  - UI for adding/editing/removing players from team roster
  - Set position restrictions per player
  - Manage jersey numbers and player info

- [ ] **[REFERENCE] Manual lineup creation and editing**
  - Drag-and-drop interface for manual position assignment
  - Edit generated lineups before saving
  - Override auto-generation for specific innings

- [ ] **[REFERENCE] Rotation cycle configuration**
  - UI for selecting rotation_innings (1/2/3)
  - UI for selecting pitcher_rotation_innings (1/2/3)
  - Update rotation algorithm to support multi-inning cycles

- [ ] **[REFERENCE] Team invite system**
  - Send invites to team managers
  - Email notifications for invites
  - Accept/decline invite flow

- [ ] **[REFERENCE] Stripe payment integration**
  - Subscription checkout flow
  - Webhook handling for subscription events
  - Subscription management page
  - Cancel/upgrade subscription

---

## Completed Features ✓

### Authentication & User Management
- [x] User authentication (sign up, sign in, sign out)
- [x] Session management with auto-recovery
- [x] User profiles with avatar uploads
- [x] Protected routes
- [x] Email confirmation on signup

### Lineup Core Features
- [x] Player management (add, remove, reorder)
- [x] Lineup creation with metadata (name, sport)
- [x] Automatic rotation generation algorithm
- [x] Rotation display table
- [x] Lineup viewing with print support
- [x] Lineup deletion
- [x] Sport selection (baseball/softball)
- [x] Configurable rotation settings (innings, use pitcher, use catcher)
- [x] Batting order management

### Infrastructure
- [x] React Router setup with protected routes
- [x] Supabase Auth integration
- [x] Database schema for lineups, teams, subscriptions
- [x] Row-level security policies
- [x] Storage bucket for avatars
- [x] TypeScript types and database types
- [x] Test setup (Vitest + React Testing Library)
- [x] Tailwind CSS styling
- [x] Print-optimized CSS for lineups

---

## Notes

- **Current Focus**: Free Tier completion (12 tasks remaining)
- **Database**: Schema already includes tables for premium features (teams, team_members, subscriptions) but they are not yet used in the UI
- **Rotation Algorithm**: Core algorithm exists and works well. Needs updates for position restrictions
- **Testing**: Test infrastructure exists but needs expansion for business logic testing

---

*Last Updated: 2025-10-22*
