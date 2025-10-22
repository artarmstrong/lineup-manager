# Lineup Management App - Project Roadmap

## Project Overview
A collaborative lineup management web application with free personal lineups and premium team collaboration features.

**Tech Stack:**
- Frontend: React
- Backend: Supabase (PostgreSQL + Auth)
- Payments: Stripe
- Hosting: TBD

---

## Database Schema

The database schema is saved and updated in the database-schema.md file located in this same folder as this file.

---

## Randomized Lineup Rules

These are the rules to follow when creating a randomized lineup:
- A player will not stay in the same position for two consecutive rotations.
- A player will not repeat the same position later in the game unless no other players are eligible to play that position.
- No player will be put on the bench a second time until all other players have been on the bench once. Same for any additional rotations to the bench.
- When possible, players will not repeat in the outfield until all other eligible players have played in the outfield.
- Exception: If all players except one are locked out at a specific position, that player will play the whole game at that position and will not be rotated to the bench.

## Feature Tiers

### Free Tier ✓
- User authentication (Supabase Auth)
- Create up to 5 personal lineups (max limit)
- View, print, and delete own lineups
- Lineup configuration options:
  - Select number of innings (3-9)
  - Mark if pitcher is needed for the lineup
  - Mark if catcher is needed for the lineup
  - Flag specific players who should NOT play pitcher
  - Flag specific players who should NOT play catcher
- Auto-generate balanced lineup that rotates players evenly between:
  - Infield positions
  - Outfield positions
  - Bench (sitting out)
  - Ensures fair playing time across all innings

### Premium Tier (Subscription Required)
- Unlimited team lineups (no 5 lineup limit)
- Create team rosters with persistent player information:
  - Add/edit/remove players from team roster
  - Set position restrictions per player (cannot play specific positions)
  - Roster applies to all team lineups
  - Parent contact (up to 2 parents) information per player
- Team Settings with global configurations:
  - Team name
  - Team description
  - Set if pitcher is needed (applies to all team lineups)
  - Set if catcher is needed (applies to all team lineups)
  - Default innings setting for team lineups of 3-9 (configurable option when creating a new lineup)
  - Default value to "Rotate lineup every # of innings" with values being 1, 2, or 3 innings (configurable option when creating new lineup)
  - Default value to "Rotate pitcher every # of innings" with values being 1, 2, or 3 innings (configurable option when creating new lineup)
- Flexible lineup creation methods:
  - Auto-generate balanced lineup (like free tier)
  - Manually create and edit lineup (drag-and-drop or forms)
  - Choose innings (3-9) for each lineup
  - Rotate lineup every # of innings: 1, 2, or 3
  - Rotate pitcher every # of innings: 1, 2, or 3
- Invite team managers
- All team managers can view/edit/print team lineups
- Team management for owner of subscription (add/remove members, change roles)

