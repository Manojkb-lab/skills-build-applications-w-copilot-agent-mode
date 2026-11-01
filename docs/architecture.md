# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep route components responsible for rendering and loading/empty/error states, and use the existing shared API client for requests. Do not move API or persistence logic into the browser.
- Logic tier decision: Keep HTTP handling and response shapes in the Express routes, and implement capability behavior in `backend/src/services/octofitService.ts`. Return deliberate 4xx responses for invalid input or missing users; do not expose Mongoose cast errors as 500s.
- Data tier decision: Add required fields, suitable defaults, and basic value validation to the existing Mongoose schemas. Keep persistence in the models/service layer and preserve the seed script's idempotence and unrelated records.
- Activity tracking approach: Validate the request fields and well-formed IDs, confirm the referenced user and team exist, then save an activity with those references, the submitted type and minutes, computed points, and an occurrence timestamp.
- Team management approach: Reject a missing or blank name with 400; create and list teams using the submitted name and mascot and expose their members. Keep membership changes in the backend.
- Leaderboard approach: Aggregate activity points per team, sort totals highest first, and return `teamName`, `totalPoints`, and sequential 1-based `rank` values.
- Workout suggestions approach: Find the user by email, use the user's goal and recent activities to select matching workouts, and include a concise reason for the first suggestion. Return a deliberate 4xx when no user matches.
- Implementation order: Complete and test the data models first, then activity/team API behavior, then leaderboard and workout suggestions, and finally connect/render each frontend route. Run the focused tier test after each stage before proceeding.

## Test plan

- Data tier: `npm run test:data --prefix octofit-tracker/backend` — schema validation failures mean required fields, defaults, or value constraints are incomplete; the seed test checks representative data, linked membership, preservation of unrelated records, and idempotence.
- API: `npm run test:api --prefix octofit-tracker/backend` — failures identify broken request validation/status codes, activity/team persistence or response shapes, leaderboard ordering/ranks, or user-specific workout suggestions.
- Frontend: `npm test --prefix octofit-tracker/frontend` — failures identify missing API wiring, rendered data, requested user email, or loading, empty, and accessible error states.
- Backend build: `npm run build --prefix octofit-tracker/backend` — TypeScript errors mean backend types or imports do not compile.
- Frontend build: `npm run build --prefix octofit-tracker/frontend` — TypeScript or Vite errors mean the frontend does not type-check or produce a production build.
- Baseline run: `npm test --prefix octofit-tracker/backend` produced 8 failures and 1 pass; the seed/idempotence test passed. `npm test --prefix octofit-tracker/frontend` produced 15 failures. These are the intentionally incomplete starter contracts to address; rerun focused tests during implementation and both full suites plus builds before completion.
