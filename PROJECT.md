# FitPulseAI Project Brief

## 1. Product Summary

FitPulseAI is a personalized AI fitness coach for adults who want practical guidance that adapts to their goals, schedule, equipment, progress, and recovery. The product combines workout planning, nutrition tracking, progress visibility, and conversational coaching in one experience.

The core promise is:

> A coach in your pocket that understands your context, adapts your plan, and helps you stay consistent.

FitPulseAI is not intended to provide medical advice or replace a qualified healthcare professional. Users with injuries, medical conditions, or uncertainty about exercise safety should consult an appropriate professional.

The governing product and architecture plan is [docs/MASTER-PLAN.md](docs/MASTER-PLAN.md). It is the authority for phasing; the numbered sections below record what has actually been built against it and where the implementation diverges or falls short.

## 2. Target Users

### Primary users

- Adults aged 18-50 in North America and Western Europe
- Busy professionals who need flexible, efficient plans
- Beginners who need structure and confidence
- Intermediate and advanced users who want adaptive programming
- People pursuing fat loss, muscle gain, strength, endurance, or general fitness
- Home-workout users and wearable owners

### Initial launch assumptions

- English-language product
- Mobile-first user experience
- Initial launch focused on one or two English-speaking markets
- Privacy-conscious handling of health and fitness data

## 3. Product Principles

1. **Personalized by default:** recommendations use the user's goals, constraints, preferences, and history.
2. **Actionable AI:** AI suggestions should create or update real plans, logs, or schedules where appropriate.
3. **Safety before novelty:** hard constraints and validation remain deterministic; generative AI does not make unvalidated exercise or health claims.
4. **Low-friction tracking:** logging should be quick enough to support daily use.
5. **Respectful engagement:** reminders are useful, configurable, and never guilt-driven.
6. **Progress over perfection:** the product rewards consistency and adapts after missed sessions.
7. **Privacy by design:** collect only what is needed, make permissions explicit, and support deletion and export.

## 4. MVP Scope

The MVP should validate one question: **Does a personalized plan plus simple tracking improve user consistency?**

### Included in MVP

- Account creation and authentication
- Guided onboarding and user profile
- Goal selection and fitness track selection
- Basic profile inputs:
  - Age, height, weight, and gender (optional where appropriate)
  - Fitness level and experience
  - Primary goal
  - Available days and session duration
  - Home or gym environment
  - Equipment available
  - Injuries or limitations
  - Dietary preferences and restrictions
  - Notification preferences
- Three initial tracks:
  - Fat Loss at Home
  - Muscle Gain at Gym
  - General Fitness
- Rule-based personalized workout plans
- Workout plan view with exercises, sets, reps, rest, and session duration
- Workout completion and exercise logging
- Manual nutrition logging with calories and macros
- Weight logging
- Progress dashboard with weight trend, workouts completed, and basic adherence
- Basic AI coach chat for fitness questions and plan guidance
- Configurable workout reminders
- Medical and nutrition disclaimer surfaces

### Explicitly deferred

These features are roadmap items, not MVP acceptance criteria:

- Camera-based form analysis and rep counting
- Photo-based food recognition
- Wearable and health-platform integrations
- Proactive autonomous agent and predictive interventions
- RAG or vector-based long-term chat memory
- Social feeds, groups, leaderboards, and coach marketplace
- Advanced gamification beyond a basic consistency streak
- AR coaching
- Multi-language support
- Human coaching marketplace
- Enterprise wellness features

## 5. Core User Journeys

### Onboarding to first plan

1. User creates an account.
2. User answers a short, progressive questionnaire.
3. User selects a goal, environment, equipment, availability, and limitations.
4. System generates a validated starter plan.
5. User reviews the plan and can edit relevant preferences.
6. User sees the next recommended workout.

### Completing a workout

1. User opens today's workout.
2. User views exercises, sets, reps, rest, and instructions.
3. User records completion and optional actual reps, weight, or notes.
4. System updates adherence and progress metrics.
5. System recommends the next session without requiring manual recalculation.

### Logging nutrition and weight

1. User adds a meal manually.
2. System records calories and macros when available.
3. User records weight when desired.
4. Dashboard compares recent intake and weight trends with the user's goal.
5. Coach chat can explain trends without diagnosing medical conditions.

### Asking the coach

1. User asks a question in natural language.
2. Backend loads relevant profile and recent activity context.
3. Coach responds within supported safety and scope rules.
4. Where supported, the response links to an action such as adjusting a workout or logging an event.
5. The system does not invent user history or claim certainty where data is missing.

## 6. Recommended Technical Direction

The existing repository is organized into `Backend` and `Frontend`. Keep the first implementation modular and easy to replace as the product grows.

### Frontend

- Mobile-first application experience
- Choose Flutter or React Native before implementation begins
- Authenticated navigation for onboarding, home, plan, logging, progress, and coach chat
- Consistent form validation and accessible controls

### Backend

- REST API initially; GraphQL can be evaluated after usage patterns are known
- Authentication and authorization at every protected endpoint
- Deterministic services for profile, plan rules, workout logs, nutrition logs, and progress calculations
- AI service isolated behind a backend interface so the LLM provider can change
- Background job support reserved for reminders and future agent workflows

### Data storage

- PostgreSQL for users, profiles, goals, plans, workouts, logs, and progress records
- Redis may be introduced for sessions, rate limits, and caching
- Object storage only when a future feature requires images or videos
- Vector storage is deferred until a concrete memory or retrieval use case is validated

### External services

Integrate only when an MVP requirement needs one:

- Managed authentication provider or backend authentication module
- LLM provider for coach chat, behind server-side secrets
- Nutrition database API only if the initial manual food catalog is insufficient
- Push notification provider for reminders

## 7. Initial Domain Model

Core entities:

- `User`: identity, account status, and consent state
- `Profile`: body statistics, fitness level, schedule, equipment, limitations, preferences
- `Goal`: goal type, target values, and status
- `Track`: supported program template and constraints
- `WorkoutPlan`: user-specific plan, track, dates, and version
- `ScheduledWorkout`: planned session and completion status
- `Exercise`: name, category, muscle groups, equipment, instructions, and safety notes
- `WorkoutLog`: completed session, duration, notes, and performance data
- `NutritionLog`: date, meal, food items, calories, and macros
- `BodyMetric`: dated weight and optional measurements
- `ChatMessage`: user message, coach response, context metadata, and safety flags
- `NotificationPreference`: reminder types, schedule, frequency, and opt-in state

Health-related and personal data must have an explicit retention, access, export, and deletion policy before production launch.

## 8. Personalization Approach

Use a hybrid model:

- **Rules determine safety and feasibility:** schedule conflicts, rest days, equipment availability, injury exclusions, session duration, and progression limits.
- **Templates determine reliable structure:** warm-up, exercise order, set and rep ranges, rest, and progression patterns.
- **AI provides language and bounded variation:** explanations, substitutions from an approved exercise set, motivation, and conversational guidance.
- **User feedback updates future recommendations:** completed sessions, difficulty, soreness, preferences, and missed workouts.

Every generated plan must be validated against profile constraints before it is shown to the user. The LLM must not be the sole authority for exercise selection, calories, injury handling, or medical guidance.

## 9. API Surface for MVP

Representative endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /me`
- `PUT /me/profile`
- `GET /tracks`
- `POST /plans/generate`
- `GET /plans/current`
- `GET /workouts/today`
- `POST /workouts/{id}/complete`
- `POST /workout-logs`
- `POST /nutrition-logs`
- `GET /progress/summary`
- `POST /body-metrics`
- `POST /coach/messages`
- `GET /notification-preferences`
- `PUT /notification-preferences`

Protected endpoints must validate the authenticated user's ownership of every resource. Add request validation, rate limiting, structured errors, and audit-friendly logs.

## 10. Safety, Privacy, and Trust Requirements

- Use TLS for all network traffic and secure secret storage.
- Never expose LLM or third-party API keys in the frontend.
- Obtain consent before collecting health, nutrition, wearable, or camera data.
- Let users view, edit, export, and delete their data.
- Minimize storage of raw images and videos; prefer derived metrics where possible.
- Encrypt sensitive data at rest where supported by the deployment environment.

## 11. Verified Local Launch Status

The project has been validated in the local workspace as of 2026-09-13.

### Working runtime

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- AI service: http://localhost:8001

### Verified behaviors

- `GET /` returns the public status payload with service metadata and local URLs.
- `GET /health` returns `200` with backend health details.
- `POST /api/auth/register` returns `201` and creates a user token.
- `POST /api/auth/login` returns `200` for valid credentials.
- Frontend signup flow reaches the authenticated dashboard successfully.
- Coach chat and dark mode toggling work in the live app shell.
- Production frontend build passes with Vite and TypeScript.
- Repository test passes for the user profile persistence layer.

### Local commands

```powershell
# Frontend
cd Frontend
npm install
npm run dev

# Backend
cd Backend
npm install
npm start

# AI service
cd Backend/ai-service
python main.py
```

### Notes

- The API root is intentionally public and informational.
- Protected endpoints require a bearer token from the auth flow.
- If port 4000 is already occupied by a stale backend process, stop the stale process before restarting the API.
- Do not use the root URL as a protected route check in the browser or frontend client.
- Sanitize and validate all user input, including chat content.
- Add prompt-injection defenses and constrain tool/action execution.
- Display clear medical and nutrition disclaimers.
- Do not diagnose, prescribe treatment, or promise specific health outcomes.
- Include a way to report unsafe or inappropriate coach responses.

## 11. Delivery Phases

### Phase 1: Foundation

- Confirm product assumptions with target users.
- Choose frontend framework, backend framework, database, and authentication approach.
- Define UX flows and visual language.
- Establish development, test, and deployment environments.

### Phase 2: MVP Build

- Implement authentication, onboarding, profile, goals, and tracks.
- Implement rule-based plan generation and workout views.
- Add workout, nutrition, weight, and progress logging.
- Add basic coach chat and reminders.
- Add automated tests for core domain rules and API authorization.

### Phase 3: Private Beta

- Test with a small cohort.
- Measure onboarding completion, first-workout completion, weekly adherence, and retention.
- Review generated plans with a qualified fitness professional.
- Fix usability, safety, accuracy, and reliability issues.

### Phase 4: AI Expansion

- Add richer conversational context and approved actions.
- Add adaptive readiness and plan adjustment.
- Evaluate food photo logging and wearable integrations.
- Introduce proactive notifications only after notification preferences and opt-out controls are proven.

### Phase 5: Growth Platform

- Add advanced analytics, gamification, social accountability, localization, and integrations based on validated demand.
- Evaluate computer vision and coach marketplace features separately with privacy and safety reviews.

## 12. Success Metrics

### Activation

- Onboarding completion rate
- Percentage of new users who generate a plan
- Time from account creation to first workout
- First-week workout completion rate

### Engagement and retention

- Workouts completed per active user per week
- Weekly nutrition and weight logging rate
- Four-week retention
- Reminder opt-out and notification engagement rates

### Product quality

- Plan generation failure rate
- Invalid or constraint-violating plan rate
- API error rate and response latency
- Coach response safety review rate
- User-reported recommendation usefulness

### Business validation

- Trial-to-paid conversion after monetization exists
- Customer acquisition cost and retention by channel
- Subscription cancellation reasons

## 13. MVP Definition of Done

The MVP is ready for private beta when:

- A new user can register, complete onboarding, and receive a plan.
- Plans respect equipment, schedule, goal, and declared limitations.
- A user can complete and log a workout in a few minutes.
- Nutrition, weight, and workout data appear in the progress dashboard.
- Coach chat uses verified user context and handles unsupported or medical questions safely.
- Reminders respect user preferences and can be disabled.
- Protected resources cannot be accessed across users.
- Core backend rules, API authorization, and critical frontend flows have automated tests.
- Data deletion and basic privacy/consent flows are implemented.
- The product has been reviewed for exercise safety by a qualified subject-matter expert.

## 14. Immediate Next Steps

1. Confirm whether the first client will be Flutter or React Native.
2. Confirm the backend language and framework.
3. Convert the MVP scope into frontend screens and backend user stories.
4. Define the initial exercise catalog and approved substitutions.
5. Create the database schema and API contract.
6. Build authentication and onboarding first.
7. Implement deterministic plan generation before connecting an LLM.
8. Test the first complete journey: onboarding -> plan -> workout completion -> progress update.

## 15. Frontend Implementation Record

The frontend is being developed as a responsive cross-platform React + TypeScript application in `Frontend`. The same UI code is intended to support desktop web, tablet, and mobile-sized screens. `Backend` is reserved for API, authentication, data, and AI functionality and must remain independent of frontend mock state.

### Completed UI foundation

- Initialized a Vite React + TypeScript frontend.
- Added Lucide icons and a local PostCSS configuration.
- Built the responsive FitPulseAI overview dashboard.
- Added desktop sidebar navigation and a mobile navigation drawer.
- Added responsive tablet and mobile breakpoints.
- Added light and dark theme switching.
- Added dashboard cards for streak, weekly workouts, goal progress, energy, today's workout, coach note, weight trend, and nutrition intake.
- Added a local interactive workout completion state for UI validation.
- Confirmed the frontend production build with `npm run build`.

### Current limitation

The authenticated workspace now uses the backend for profile, workout, nutrition, progress, coach, and reminder settings. Remaining frontend work is production hardening, richer data visualization, and expanded error/loading states.

## 16. Active Frontend UI Sprint

The active sprint follows this order:

1. Establish view switching without introducing backend dependencies.
2. Build the full My Plan view and workout detail interaction.
3. Build the onboarding flow and local profile state.
4. Build nutrition logging and progress detail views.
5. Build the coach chat interface with mock conversation state.
6. Add shared loading, empty, error, modal, toast, and validation states.
7. Split the prototype into reusable components, pages, types, and local mock data modules.
8. Verify desktop, tablet, mobile, light, and dark states after each slice.

### Current implementation target

The next frontend slice is the My Plan view. It must allow a user to:

- Review the week's scheduled sessions.
- Open today's lower-body session.
- Inspect exercises, sets, reps, rest, and intensity.
- Mark the workout complete in local UI state.
- Return to the overview with updated workout status.

This slice is intentionally local-only. API calls, persistence, authentication, and generated plans belong to later frontend integration work after the Backend contract exists.

### Change log

- `2026-09-11`: Added the initial cross-platform dashboard UI, responsive navigation, dashboard mock data, and theme switching.
- `2026-09-11`: Started the view-driven frontend milestone with the My Plan workflow.
- `2026-09-11`: Added the first real frontend view: weekly plan navigation, workout detail, exercise metadata, local completion feedback, responsive layout, and dark-mode support.
- `2026-09-11`: Added the local onboarding flow with goal, training setup, and weekly rhythm selection.
- `2026-09-11`: Added Nutrition, Progress, Coach, and Settings views with local interactions for meal logging, progress ranges, chat messages, theme preferences, and profile settings.
- `2026-09-11`: Wired dashboard actions and sidebar navigation to the new frontend views; the frontend MVP UI is now complete enough for backend contract work.
- `2026-09-13`: Connected Nutrition, Progress, Coach, and reminder settings views to authenticated backend APIs and verified meal logging in the browser.
- `2026-09-23`: Made the guest workout the unauthenticated entry point. A visitor now answers one goal question, receives a real workout, performs it, and only then is offered an account; the pre-signup session is logged against the account once it exists. Extracted the duplicated `apiRequest` helper into `Frontend/src/api.ts`.

## 17. Backend Handoff Decision

Backend implementation will begin only after the frontend MVP screens and their local interaction states are complete enough to define a stable API contract. The `Backend` folder remains reserved for backend code and must not contain frontend assets or mock UI components.

### Planned backend language split

- **JavaScript/TypeScript:** primary API server, authentication, request validation, database access, workout and nutrition domain services, notifications, and integration orchestration.
- **Python:** isolated AI functionality such as workout recommendation experiments, nutrition analysis, prompt pipelines, evaluation scripts, and future machine-learning services.
- **Communication boundary:** the JavaScript API will call Python AI functionality through an explicit service interface. The frontend will communicate with the JavaScript API only and will never call Python AI services directly.

### Backend start gate

Begin backend files after these frontend views exist:

- Authentication and onboarding
- Overview and My Plan
- Workout completion and logging
- Nutrition logging
- Progress details
- Coach chat interface
- Settings and notification preferences
- Shared loading, empty, error, validation, and success states

At that point, define the API contract from the completed UI workflows, then create the JavaScript API foundation and Python AI service boundary as separate backend modules.

## 18. Backend Implementation Record

### Completed backend foundation

- Added `Backend/src/server.js` as the frontend-facing JavaScript API.
- Added in-memory user, profile, workout, nutrition, and body-metric state for local development.
- Added registration and login routes with bearer-token ownership checks.
- Added tracks, profile, plan, workout completion, nutrition log, body metric, progress summary, and coach message routes.
- Added deterministic plan fallback when the AI service is unavailable.
- Added `Backend/ai-service/main.py` as a Python AI service boundary.
- Added deterministic plan generation and coach responses in Python until an LLM provider and safety evaluation process are selected.
- Added a safety response for pain, injury, and hurt-related coach messages.
- Added service README files and local run instructions.

### Current backend limitations

- Workout, nutrition, body-metric, and notification preference records are persisted through a resolved adapter that uses PostgreSQL when reachable and the local file store otherwise (see section 19); the session store remains as a local session/activity cache.
- Authentication is suitable for local development but is not production-ready.
- PostgreSQL profile persistence, password hashing, and expiring local sessions are implemented; refresh tokens and managed production session infrastructure remain pending.
- Request validation, configurable CORS, JSON body limits, authentication/coach rate limiting, and secret-gated database bootstrap are implemented for the API.
- The Python AI service is deterministic and does not call an external model.
- CORS defaults to the local frontend origin and must be set to the deployed frontend origin before deployment.

### Backend validation

- JavaScript syntax check passed with `node --check src/server.js`.
- Python compilation passed with `python -m py_compile ai-service/main.py`.
- JavaScript API health and registration smoke tests passed on port `4000`.
- Python AI health and coach response smoke tests passed on port `8001`.

### Change log continuation

- `2026-09-11`: Started backend implementation after the frontend MVP UI handoff gate passed.
- `2026-09-11`: Added the JavaScript API foundation and Python AI service boundary with local smoke-tested routes.
- `2026-09-11`: Replaced plaintext password storage with salted Node `scrypt` hashing, normalized email login, duplicate-email protection, and credential validation.
- `2026-09-11`: Added the initial PostgreSQL schema contract, indexes, environment template, and database handoff notes.
- `2026-09-13`: Added persistent local sessions, protected today's workout retrieval, backend-backed workout completion, and persisted activity logs.
- `2026-09-13`: Added PostgreSQL repositories for activity logs and notification preferences, progress aggregation, and regression coverage for the completed MVP data paths.
- `2026-09-15`: Added backend request validation, configurable CORS, request-size limits, rate limiting, protected bootstrap behavior, and focused security tests.
- `2026-09-15`: Repaired frontend CI and added independent backend CI for JavaScript tests, syntax checks, and Python service compilation.
- `2026-09-15`: Added expiring local sessions, credential-free session persistence, legacy-session cleanup, and session security tests.
- `2026-09-15`: Added authenticated user data export and deletion with cascading PostgreSQL cleanup and session revocation.
- `2026-09-15`: Expanded AI Coach with intent classification, verified activity context, safety routing, actionable responses, optional provider integration, metadata, and Python regression tests.

### Current backend next step

 Add production session management, ownership tests across every protected resource, and deployment secrets/observability. CI now covers the frontend and backend repositories, and frontend privacy controls are wired to authenticated export/deletion endpoints. Keep the deterministic fallback and Python service contract in place until an approved AI provider and safety evaluation process are selected.

### Supabase decision

Supabase is the planned hosted persistence platform. The backend `.env` contains the anon key, service role key, and JWT secret. The current value under `SUPABASE_DATABASE_URL` is the REST project URL, not a PostgreSQL connection string; the backend now detects that distinction and derives the public project URL for status purposes. A real `postgres://` or `postgresql://` Supabase pooler connection string is still required before persistence can be enabled. The server-only service role key and JWT secret must stay in backend environment variables and must never be sent to the React frontend.

As of `2026-09-23` the configured project also fails to resolve at the pooler host (`tenant/user postgres.<ref> not found`), which means it has been deleted or paused. Persistence does not depend on it: see the adapter in section 19.

## 19. Offline-First Persistence, Safety Layer, and the Guest Wedge

This section records the `2026-09-23` increment. It implements Phase 1 of the master plan — "Onboarding → static workout → signup" — and removes the two blockers that made the application unrunnable and unsafe.

### Persistence adapter

Every write path was previously gated on a reachable PostgreSQL instance, so a paused or deleted Supabase project took down registration, login, workout logging, nutrition logging, and coach messages together. Persistence is now resolved at boot by `Backend/src/store.js`:

- `PERSISTENCE=local` pins the file store; `PERSISTENCE=postgres` pins PostgreSQL and fails loudly if no connection string is configured.
- The default, `auto`, uses PostgreSQL when a connection string exists and the database answers a short reachability probe, and otherwise falls back to the file store with a warning.
- `Backend/src/local-store.js` implements the identical contract in the same snake_case shape as the PostgreSQL repository, so callers cannot tell the two apart. Writes are atomic (write-then-rename) and mutations are serialized, so a concurrent read-modify-write cannot interleave.
- `Backend/src/profile.js` holds the single definition of the profile shape, previously duplicated across both adapters.
- `/health` and `/health/database` report the resolved mode under `persistence`.

The file store is a development and offline-resilience facility, not a production persistence strategy. `Backend/data/local-store.json` holds real health data and session tokens and is gitignored; it must never be committed.

### Non-delegable safety layer

Safety screening previously lived only in the Python AI service, so a red-flag message degraded to a generic coaching reply whenever that service was down. `Backend/src/safety.js` now screens in the API process, and the urgent branch short-circuits before any delegation:

- Red flags — cardiac symptoms, breathing difficulty, loss of consciousness, severe bleeding, sudden neurological symptoms, head injury, major trauma — return an urgent stop-and-seek-care message with `source: 'api-safety-layer'`, whether or not the AI service is reachable.
- Pain and injury reports escalate to stop-the-movement and consult-a-professional guidance without urgent wording.
- The layer never diagnoses, never prescribes treatment, and never surfaces to the user as a selectable mode.

### Deterministic instant workout

`Backend/src/workout-catalog.js` and `Backend/src/instant-workout.js` turn one goal answer into a complete, time-boxed session with no model call and no network dependency. Exercise selection is rule-based rather than generated: each movement declares the equipment it needs and the conditions it must be avoided for, and the generator can only choose from what survives those filters. This is deliberate — exercise selection is a safety-critical decision, so a language model must not be its sole authority, and the whole path costs nothing at runtime.

The public `POST /api/instant-workout` endpoint is rate-limited and accepts a deliberately small input surface, because it is reachable before an account exists. Warm-up and cool-down scale with the session, and the set count shrinks before the warm-up is sacrificed, so a five-minute session is a circuit rather than a truncated workout.

### Guest flow

`Frontend/src/InstantWorkoutView.tsx` renders the wedge: one goal question, a preview carrying the generator's own reasoning for the session, a timer-driven player built from the `workSeconds` and `restSeconds` fields the generator emits, and a completion screen whose call to action is the account offer. The visitor trains before any account exists. Registration logs the completed session against the new account, and onboarding resumes at the equipment question because the goal is already known.

### Validation

- Backend suite: 28 tests passing, including persistence isolation, safety escalation, and generator time-fit, limitation-filtering, and calorie-plausibility coverage.
- Frontend `npm run build` passes. Two dead declarations that had been failing `tsc` (`caloriePercent` in `App.tsx`, an unused `TrendingDown` import in `WorkspaceViews.tsx`) were removed.
- The full guest journey was verified against a live server: instant workout → registration → pre-signup session logged → profile saved → progress reflects the work → red-flag message still intercepted in the API process.

### Known gaps

- Limitations, equipment, and environment are collected by the generator but the guest flow does not yet ask for them; it sends goal and duration only. The onboarding path collects environment and days but not limitations or equipment.
- Session duration and calorie estimates assume a 75 kg default body weight, since no weight is known before an account exists.
- The AI service remains deterministic and does not call an external model.

## 20. The Memory Engine and the User Genome

This section records the `2026-09-23` increment. It implements Phase 2 of the master plan — "Memory Engine — User Genome, Vector Memory, 'Coach Remembers'" — whose stated magic moment is the coach volunteering a constraint the user mentioned weeks earlier without being reminded of it.

### Layer structure

`Backend/src/memory/` holds four layers, each usable on its own:

- `embedding.js` — text to vector, deterministic and offline.
- `extractor.js` — message to atomic facts, rule-based.
- `memory-store.js` — facts to storage, with merge-on-write and ranked recall.
- `genome.js` — everything known to one composed picture, plus adherence patterns.

`index.js` re-exports all four. The coach route consumes all of them; `GET /api/genome` consumes the last two.

### Embeddings, and what they are not

The master plan's cost architecture routes deterministic work to a local engine at zero runtime cost and reserves external models for complex reasoning. `embedding.js` is the retrieval half of that: a hashed feature space over unigrams, adjacent bigrams, and character trigrams, with domain terms folded onto canonical concepts first, L2-normalized to 384 dimensions. No network call, no model weights, no per-request cost, and it works offline.

It is **not** a semantic model, and the module says so. "My joint is sore" and "my knee aches" match only because the synonym table maps both onto the same concepts. The table is therefore load-bearing rather than decorative, and it should grow whenever a near-miss is seen in practice. A real model — on-device SLM or hosted — plugs in through `setEmbeddingProvider` without touching any caller, which is the seam that makes the swap cheap.

Multi-word concepts are folded before tokenizing (`lower back` to `lowerback`, `resistance bands` to `band`), because the tokenizer splits on hyphens and spaces and a replacement that gets split again is a silent no-op.

### Extraction rules

Two rules govern `extractor.js`, and both are asserted directly in the test suite because both erode quietly as rules are added:

1. **Precision over recall.** A memory is replayed to the user as something the coach knows, so a wrong one is worse than a missing one. Every rule requires positive evidence rather than inferring from a keyword.
2. **Never store a diagnosis.** "I have arthritis in my knee" becomes "Reports a knee limitation to work around". The coach cannot verify a condition it was told about, must not repeat it as fact, and must not build a training plan on one it inferred. The user's own words stay in the conversation; only the constraint is kept.

Six kinds are extracted: `limitation`, `equipment`, `schedule`, `preference`, `context`, `goal`. Limitations need both a body area and a complaint about it in the same message, and the body area may be borrowed from an adjacent clause when that clause claims it possessively — which is what makes the plan's own example work, since "I have arthritis in my knee and it hurts when I squat" puts the area and the complaint in different clauses. Equipment polarity is read from the last possession or negation marker before each item, so "I have dumbbells and a bench" records both while "I have dumbbells but no barbell" records one of each.

**A red-flag message produces zero memories.** A medical event is not a fact about the user's preferences, and the coach must never replay it later as background. This is the memory layer's contribution to the safety layer's guarantee, and it is asserted rather than inferred.

### Storage, recall, and forgetting

The `memories` table is one row per atomic fact, with the embedding stored inline as `JSONB` and compared in application code. Moving to pgvector with an HNSW index is the upgrade path once a user's memory count makes a linear scan expensive; it is not needed yet.

Ranking on read combines three signals, because similarity alone is a poor proxy for what is worth saying: similarity to the query, confidence, and salience (reinforcement count and recency). Recency has a deliberate floor — a knee limitation from eight months ago is still true, and letting it decay to nothing would reintroduce exactly the forgetfulness the engine exists to fix. Standing constraints (limitations and available equipment) bypass ranking entirely, because they apply to every training decision regardless of what was asked.

A restated fact reinforces rather than duplicates: same kind, same subject, same polarity, and cosine similarity above a threshold bumps confidence and `last_seen_at`. Polarity is compared explicitly so that "Likes running" is never merged into "Dislikes running".

Memories are isolated per user at every entry point, deletable one at a time or all at once, and included in the data export. Embeddings are derived data and are excluded from the export in both adapters — the fact is the content.

### The User Genome

`genome.js` composes what is known into one shape and is recomputed on read rather than stored, so it cannot drift out of sync with the memories and logs it derives from. It carries identity, constraints, preferences, schedule, equipment, context, goals, history, and patterns.

`patterns` is deliberately forward-looking. Phase 3's churn model runs on rules before it runs on a model, and those rules need adherence signals — how often someone actually trains against how often they said they would, and whether the trend is up or down. Computing them here once means the coach and the churn model cannot disagree about the same user. A streak survives a single missed day, because training Monday and Wednesday is what a person means by "still on track".

### Wiring, and what stays deterministic

`POST /api/coach/messages` now recalls standing constraints plus query-ranked memories and sends them to the AI service as the master plan's `[USER MEMORY]` block, structured and pre-rendered. Extraction runs *after* the reply is composed, so a memory write can never delay or change the response the user is waiting on, and a failure there is swallowed because the conversation already succeeded. The reply carries what was learned and reinforced, which is what the interface shows.

The Python service accepts `memories` and folds them into its context. Its deterministic fallback opens with the remembered constraint, so "You told me about your knee before, so that stays in the plan" survives the provider being unavailable — which is exactly when that path runs.

One behaviour was corrected while wiring this. A non-urgent safety flag was replacing the coach's reply entirely whenever the AI service was down, so a twinge returned the safety text and nothing else. The safety layer is documented as constraining output rather than becoming it, so the fallback now leads with the safety guidance and still appends the coaching and the remembered constraint. Dropping the safety line would be worse; dropping the coaching made a twinge indistinguishable from an emergency.

### Endpoints

- `GET /api/memory` — the user's memories, ordered safety-first, plus engine status.
- `DELETE /api/memory/:id` — forget one; 404s for an id the user does not own.
- `DELETE /api/memory` — forget everything.
- `GET /api/genome` — the composed genome, including the progress narrative.
- `/health` reports the active embedding provider under `memoryEngine`.

`DELETE` was added to the CORS `Access-Control-Allow-Methods` list; without it the browser preflight would have blocked forgetting a memory from the interface.

### Interface

- The coach sidebar is now "What Nova remembers", grouped by kind with per-memory removal. A memory the user cannot see or remove would be a liability rather than a feature, so the panel is the primary surface rather than a settings page. A note above the composer confirms what was just noted.
- Progress carries the Progress Narrative — the master plan's magic feature of that name, composed deterministically from the log with no model call. It reports what the log shows and stops there: no projection, no promised outcome.
- Settings carries a coach-memory row showing the count, with a confirmed "Forget all".

`WorkspaceViews.tsx` had its own copy of `apiRequest` with a *different argument order* from the shared helper in `api.ts` — two functions with one name and two contracts is a defect waiting to happen, so the local copy was removed and every call site converted.

### Validation

- Backend suite: 89 tests passing, of which 61 are new (12 embedding, 16 extractor, 18 store, 15 genome). Coverage includes embedding determinism and normalization, synonym convergence, extractor rules for every kind and the red-flag suppression, merge-versus-insert, recall ranking and filtering, per-user isolation, forgetting and ownership, export shape, and genome history, streak, trend, adherence, and narrative composition.
- Frontend `npm run build` passes; `oxlint` reports only the pre-existing `set-state-in-effect` warning in `WorkspaceViews.tsx`.
- Verified live against a running server and the Python service: a message stating a knee problem and home dumbbells extracted four memories; a later session asking only to "swap an exercise" returned `You told me about your knee before, so that stays in the plan` from a previous conversation; restating the knee reinforced rather than duplicated; red-flag messages stored nothing; a deleted memory disappeared and a foreign id 404'd; the export contained the facts and no embeddings; and with the AI service unreachable the deterministic path still carried both the safety guidance and the remembered constraint.

### Known gaps

- Recall is lexical, not semantic. Paraphrase without shared vocabulary will miss until a real embedding provider is configured.
- The extractor is English-only. Phase 4 adds Urdu, and the rules will need a language-aware layer rather than a translation shim.
- **Urdu and Roman-Urdu are not handled by either the extractor or the embedding synonym table.** This is a Phase 2 gap to close before Phase 4 rather than during it, since Roman-Urdu input is plausible from the existing user base.
- Extraction is rule-based and will miss phrasings outside the tables. The tables are the tuning surface.
- Memory has no expiry policy. Nothing is forgotten automatically; only the user removes a memory.
- `buildGenome` re-reads memories that the coach route has already recalled, so a coach message reads memory twice. Correct but redundant, and worth collapsing if the table grows.
- The churn model itself is Phase 3. Phase 2 supplies the adherence signals it will read; nothing consumes `patterns` yet beyond the narrative.

## 21. Predictive Intervention: the Churn Model, the Offers, and the Letter

This section records the `2026-09-23` increment. It implements Phase 3 of the master plan — "Predictive Intervention" — whose stated claim is that FitPulse "notices quit patterns 3-5 days early, intervenes personally", and which the master plan notes no fitness app does.

Its four magic features from §9.1 are all built here: the Sunday Letter, the Why Button, Bad Day Mode, and the Comeback Message. Phase 2 supplied the raw material — what the person told the coach and how they actually train — and this section is the first layer that spends it.

The whole layer is deterministic and local. Nothing in `intervention/` calls a model, so a retention message never fails because the AI service is down, which is exactly the moment it would be needed.

### Layer structure

`Backend/src/intervention/` holds five modules, each usable on its own:

- `risk.js` — a training log to a band, a score, and the named rules behind both.
- `interventions.js` — a band and its drivers to one offer, in words that pass a machine-checked tone rule.
- `letter.js` — a week to a Sunday Letter.
- `why.js` — a question to an explanation, or to an honest admission that there is none.
- `service.js` — all of the above plus what was already turned down, to what to say right now, if anything.

`index.js` re-exports them. Every route that uses this layer reads only the genome, so the churn model, the Why Button, the letter and the coach cannot disagree about the same person.

### The churn model, and why it is measured against a rhythm

The load-bearing decision is that the model does not measure "how long since the last session". It measures **how long compared to this person's own rhythm**.

A rule that fires at seven days of silence cannot satisfy the master plan's own claim. By seven days the lapse has already happened, and the message is an obituary rather than an intervention. So `LAPSE_DAYS = 7` is a floor rather than the trigger, and the genome derives a personal threshold instead:

```js
const lapseThresholdDays = typicalGapDays === null ? LAPSE_DAYS : Math.max(LAPSE_DAYS, typicalGapDays * RHYTHM_BREAK_RATIO)
```

`RHYTHM_BREAK_RATIO` is `1.75`. Someone who trains every other day is visibly off-rhythm on day four and gets a `cadence-break` driver — a real early-warning signal, three days before a seven-day rule would say anything at all. Someone who trains weekly is not off-rhythm on day five, and saying so would be noise rather than care. The threshold is personal because the behaviour is.

With too little history for a rhythm, the absolute thresholds are the only honest measure, and they are labelled as such: `silence` at 7+ days, again at 5, and a much lighter 0.15 at 3. The driver's own `detail` string says "5 days since the last session" without pretending to know what five days means for that person.

The model is deliberately not learned. With one person's history there is nothing to learn from, and a score nobody can interrogate is worse than visible arithmetic.

### Drivers, bands, and why every number can be printed

Every signal is a named rule with a stated weight, and every one is returned as a `driver` carrying a plain-English `detail` in the user's own numbers. That is what makes the band explainable — the intervention card and the Why Button both have to say *why*, and a model whose reasons cannot be printed is a model whose reasons cannot be checked.

Eight rules contribute: `silence` (0.45), `cadence-break` (0.20–0.35, scaled by how far past the rhythm the gap runs), `drifting` (0.1), `prior-lapse` (0.2), `trend-down` (0.15), `plan-too-big` (0.15), `behind-commitment` (0.1), `streak-broken` (0.15), `weekday-drift` (0.15), and `early-days` (0.25 with nothing logged, 0.15 with one or two sessions).

Two rules push the other way — `trend-up` (-0.2) and `on-commitment` (-0.15) — and they are kept in the list rather than dropped, because what is working is as useful to name as what is not.

Bands are `steady` (below 0.3), `watch` (0.3), `at-risk` (0.55) and `lapsed`. The `lapsed` band is the one exception to the arithmetic: a break long by the person's own standard *is* the lapse, whatever the score says:

```js
if (daysSince !== null && daysSince >= lapseThreshold) band = 'lapsed'
```

Stated as a rule rather than left to the weights, so the band and the comeback message can never disagree about whether someone is away.

Two further guards are worth recording, because both were chosen against the obvious alternative:

- **Protective rules soften a score; they cannot erase one.** `MAX_PROTECTIVE_OFFSET = 0.15` caps how much the negative drivers may subtract. A `trend-up` covers the last four weeks while a cadence break is happening *now*, and letting the older, happier signal cancel the newer one would mean the model talks itself out of exactly the warning it exists to give.
- **Confidence is reported, not hidden.** `high` needs three or more sessions and three or more active days in the last 28; `medium` needs eight sessions; anything less is `low`. A prediction from two sessions is not a prediction, and the offer's wording changes to match rather than presenting a guess as a forecast.

### The five interventions, and the order they are chosen in

`selectIntervention` is a decision table, and the order is the point:

1. **`comeback`** — the master plan's Comeback Message, for the `lapsed` band. Answered before anything else, because a comeback message sent to someone who is not actually away reads as a machine that has lost track of them.
2. **`right-size`** — on the `plan-too-big` driver. A plan problem has a concrete remedy, so it comes before a check-in: "You set 6 days a week and the log shows about 2. That is a plan that is too big, not a person who is not trying."
3. **`check-in`** — on the `cadence-break` driver. This is the rule the master plan's "3-5 days early" claim rests on, and it fires on the *signal* rather than on how far the score has climbed, because a cadence break that has not moved the band yet is precisely the case worth speaking to.
4. **`restart-small`** — on `early-days`. Someone who has not started needs a first session, not a comeback.
5. **`bad-day`** — the master plan's Bad Day Mode, and the default for everything else that has moved the band. "Five minutes of easy mobility, or a full rest day — your call." Nothing here pushes, which is the point of it being the default.

Each offer carries a one-tap `action` and a real `alternative` (`Rest day`, `Keep it as it is`, `I am on track`), because the master plan's Bad Day Mode is "one tap removes guilt, offers alternative" — the alternative has to be a selectable thing rather than a sentiment.

One ordering decision was reversed during this work and is worth recording. The `check-in` rule was originally held back when confidence was `low`, on the reasoning that a shaky model should say less. That was backwards: `check-in` is the *least* assertive thing this layer can say — a question rather than an instruction — and withholding it produced a non-monotonic order where a low-confidence cadence break fell through to `bad-day`, a more directive message. The guard is gone and `tentative` carries the doubt to the interface instead, where it belongs.

### The tone rule is machine-checked

The user promise is "never makes you feel guilty", and the natural way to write a retention message is to name the shortfall — which is precisely what makes someone feel guilty. So the constraint is enforced rather than reviewed.

`checkTone` runs two pattern sets over every composed message. The guilt set catches second-person accusation (`you didn't`, `you failed to`, `you should have`), diminishment (`you only`), shame vocabulary (`lazy`, `excuses`, `undisciplined`), disappointment (`disappointed`, `let me down`), streak guilt (`fell off`, `broke your streak`, `ruined`) and comparison (`you're behind`). The overpromise set catches `guarantee`, promised outcomes (`you will lose`), and medical claims (`cure`, `treat`, `diagnose`, `heal`).

The sets are deliberately narrow. "You set 4 days a week; the log shows fewer" is a fact and has to stay allowed, while "you only managed 2" is the same fact used as a weapon — so the tests assert both directions, with eight guilt strings that must be caught and four true statements that must pass through.

The check runs in three places. The tests sweep every template. `build()` runs it at runtime on every composed intervention and substitutes `NEUTRAL_FALLBACK` on a violation. `buildSundayLetter` does the same and flags `toneFallback: true`. The runtime branch should be unreachable — the sweep covers every template the composers can produce — and it is kept because the cost of being wrong is a guilt trip aimed at someone already slipping away. Bland is recoverable; that is not.

### Saying nothing: the suppression windows

"Never makes you feel guilty" is mostly a statement about what the product does after a *no*. An offer that reappears on the next page load has ignored the answer, so the history of what was offered is stored and read on every check:

- Anything turned down buys **three days of quiet, of any kind** — `QUIET_AFTER_DISMISSAL_DAYS`.
- The same offer is not made twice in a week — `SAME_KIND_COOLDOWN_DAYS`.
- An offer that was accepted is retired for a fortnight — `ACCEPTED_COOLDOWN_DAYS` — because taking it changed the plan.

**Reads are pure.** `GET /api/intervention` records nothing, so a standing offer stays standing rather than counting down a timer the user never agreed to. Only an explicit accept or dismiss writes an event.

A suppressed check still returns the risk assessment. The score is a fact about the log and a dashboard may want it; it is the *speaking* that is suppressed, not the knowing.

### The Sunday Letter

The master plan's description is the specification: *"Personal letter, not stats report."* Its own example — "You struggled Thursday. Next week Wednesday is lighter. Also — your squat depth improved. I noticed." — does three specific things: it names one hard thing, one adjustment, and one thing the person did not know was being watched. That last clause is the whole feature. Being noticed is the product.

What this implementation can honestly notice is bounded by what it records. There is no squat depth here, so the letter never claims any. It notices the things the log and the Memory Engine actually hold, in the order they are worth saying: a run inside the week, a constraint the plan is still honouring, a weekday that has become theirs, a milestone at the point it stops being small, and failing all of those, the plainest true thing left.

Two properties matter more than the wording:

- **The letter is stable for the whole week it describes.** Everything is measured against the Sunday that closed the reviewed week rather than against the moment the letter is opened, so reading it on Tuesday and again on Friday gives the same letter. A letter about last week that changes when you re-read it is not a letter.
- **An empty week is reported as an empty week.** "Nothing was logged between Monday and Sunday. I am not going to make that mean anything. Some weeks are like that, and the plan does not need to be rebuilt over one of them." No substitute statistic, no encouragement bolted on to cover it.

An invented "I noticed" is worse than no letter, so the metadata has to agree with the body. This was a live-run defect: `/api/letter` reported `observation: "constraint"` for a week with zero sessions, because `observe` was being run regardless and a remembered knee limitation always looks like something to say. The body deliberately wrote nothing of the kind, so the field was claiming a line the letter never printed. `observe` is now skipped entirely on an empty week and the observation is `none`.

The letter's one adjustment is framed as a change to the plan rather than as advice about the person, and a lapse is answered first and with the specific number — "Next week starts at two days. Anything above that is a bonus, not the target." That branch has to come before the general at-risk line, which would otherwise swallow it and turn the most concrete sentence in the letter into the vaguest.

### The Why Button

The master plan's example is *"Why 3 sets? Because your last 2 sessions declined in set 4."* That answer needs per-set performance data, which at the time of this increment the system did not record — and a Why Button that invents a reason is worse than no Why Button, because the entire value of the feature is that the explanation can be trusted. *(The data model that closes this is §24. The rule below is what made the layer honest while the data was missing, and it is the rule §24 built the answer on top of rather than around.)*

So the module is built on one rule: **an answer either cites evidence from the genome or admits there is none. There is no third branch.** `explain` returns `confident: false` exactly when it took the second one, so the interface can render an admission differently from an explanation. Asked the master plan's own per-set question, it declined in as many words: "I cannot point to a reason for that specific movement yet — per-exercise and per-set reasoning needs session-level detail this system does not record, and I would rather say that than invent one." *(That exact sentence is now reached only when there is no per-set record at all — a new account, or a movement nothing has been logged for. When there is a record, §24 answers the question.)*

Questions are routed to one of nine explainers by an ordered topic list — `constraint`, `exercise`, `frequency`, `recovery`, `intensity`, `nutrition`, `progress`, `plan`, `general` — where first match wins and the specific topics come before the general ones. Two routing bugs found in live use are worth recording, because both failed silently:

- **`rest days?` sat inside the frequency pattern**, so "Do I need a rest day?" was answered as a question about weekly frequency. Counting rest days is frequency; needing one is recovery. Removed.
- **`\bsquat\b` does not match "squats"** — `t` to `s` is not a word boundary — so every plural movement name fell through to the general explainer with nothing looking wrong. People write "why do my squats hurt" far more often than "why does my squat hurt". The movement pattern now takes `\w*` suffixes throughout and the constraint pattern accepts plurals.

The constraint rule sits above the exercise rule on purpose. "Why is my knee sore after squats?" names both, and the exercise explainer is the one that has less to say; answering a question about pain with what the movement record shows would be a worse answer than the one the constraint explainer can give, which is to say what the person told us and what the plan does about it. That ordering did not change when §24 gave the exercise explainer something to answer with — a sore knee is a fact about the person, and a set count is not.

Answers report the same numbers the risk model used, restated in a `context` block, so the Why Button and the intervention card cannot disagree about why.

Every answer is composed from the genome, never by the model. A generated reason cannot be checked, and being checkable is the point.

### Endpoints

- `GET /api/intervention` — the risk assessment, the offer if there is one, and the suppression reason if there is not. Pure.
- `POST /api/intervention/:kind/(accept|dismiss)` — records the response; 404s for a kind the layer cannot produce.
- `GET /api/intervention/history` — what was offered and what came of it.
- `POST /api/coach/why` — an explanation or an admission, under the existing coach rate limiter, with the question capped at 500 characters.
- `GET /api/letter` — the Sunday Letter for the most recently completed week.

Accepting does real work rather than recording a click. The session is built from the same genome the offer came from, so the constraints the coach has remembered are the constraints the session respects, at a duration matched to the offer (`comeback` 15 minutes, `bad-day` 5, `check-in` 12, `restart-small` 10, `right-size` 20).

`intervention_events` is one row per thing offered and what came of it — `kind`, `status` checked against `offered | accepted | dismissed`, and `created_at` — indexed by `(user_id, created_at DESC)`. It is implemented in both adapters, so the no-nagging contract holds identically on the file-backed store and on Postgres.

`formatInterventionForPrompt` renders any open offer into the coach's prompt, so the coach can talk about an offer that is currently on screen. It may acknowledge it; it must not push toward it.

### Interface

- `InterventionViews.tsx` holds the four Phase 3 surfaces: `RiskSummary`, `Intervention`, `WhyAnswer`, `SundayLetter`, plus `InterventionCard`, `WhyButton` and `SundayLetterPanel`.
- The offer sits **above the stats grid** on the Overview. If the product has noticed something worth saying, that is more important than the dashboard.
- The letter sits **above the charts** in Progress, because it is the part written for a person rather than for a dashboard, and the only thing there that speaks.
- The Why Button appears on the plan view ("Why this plan?") and on every exercise detail ("Why Knee push-up?"). The `WhyPanel` renders the answer, the evidence list, and — when `confident` is false — an `is-admission` treatment with a note that the answer is honest rather than useful, plus suggested questions the genome *can* answer. A dead end becomes a path rather than a shrug.
- Accepting an offer renders the built session inline, so the tap has a visible result.

### Validation

- Backend suite: **142 tests passing**, of which 53 are Phase 3 — 22 in `intervention-risk.test.js` and 31 in `intervention.test.js`. The remaining 89 are the Phase 1 and 2 suites §19 and §20 record, unchanged.
- Coverage includes: the tone rule in both directions and over every template; the selection table as a decision table over eight cases; the suppression rules read directly and through storage; the letter's week window, its stability across the week, its empty week, and its lapse branch; and the Why Button's routing, its refusals, and its grammar.
- Frontend `npm run build` passes; `oxlint` reports only the pre-existing `set-state-in-effect` warning in `WorkspaceViews.tsx`. One new warning from `WhyPanel` was fixed rather than suppressed.
- Verified live end to end against a running server: a user with a remembered knee constraint, a planted Tuesday/Thursday anchor, and twelve backdated sessions ending eleven days ago scored `band: "lapsed"`, `score: 0.8`, `confidence: "high"` on a `typicalGapDays` of 2 — the rhythm-relative model working on a real history. Accepting the comeback offer built a genuine 15-minute session that loaded nothing through the knee, and the next `GET /api/intervention` reported `suppressed: { reason: "recently-accepted", detail: "comeback was accepted 0 day(s) ago." }`. The coach acknowledged the open offer without pressuring and stopped mentioning it once taken.

### Known gaps

- ~~**Per-set and per-exercise performance is not recorded**, which is why the Why Button must decline the master plan's own headline example.~~ **Closed in §24.** A session now carries a `sets` array, the genome summarises it per movement, and the Why Button answers the headline question from it.
- **`weekday-drift` rarely fires alone.** `anchorRecentCount` is measured over the same 14-day window that the driver requires to be empty, so in practice a drifted anchor almost always coincides with a lapse, and the `bad-day` route it feeds is rarely reached from that driver. The signal is correct but largely redundant with `silence`.
- ~~**The Overview's "A note for you" coach panel still shows hardcoded text** ("You've been consistent this week...") that is not derived from the user's actual log.~~ **Closed in §24.** The panel now renders the genome's Progress Narrative.
- The churn model is not personalised beyond the rhythm ratio. Weights are hand-set constants, and there is no per-user calibration — defensible with one person's history, and the thing to revisit when there is more.
- There is no delivery mechanism. The Sunday Letter is composed on request rather than sent, and nothing emails or notifies. The master plan's letter is something that arrives; this is something that is available.
- ~~The letter's milestone observation is capped at 40 sessions and keys off a multiple of five, which is a placeholder for a real notion of what is worth marking.~~ **Closed in §24.** It is now a personal best — a week that beat every week before it.
- Phase 2's open gaps still apply underneath this layer: recall is lexical rather than semantic, the extractor is English-only, and there is no memory expiry policy. The Urdu and Roman-Urdu gap in particular has to close before Phase 4 rather than during it.

## 22. Voice and Hands-Free: Four Voices, Three Languages, No Vendor

This section records the `2026-09-24` increment. It implements Phase 4 of the master plan — "Voice + Hands-Free" — whose verbatim scope is *"Voice workout mode, 4 voices, English + Urdu"*.

The plan hedged this phase: *"Why wait: Voice is a multiplier on a good product."* That is the right way to read what follows. Nothing here invents a feature; it makes the existing workout usable by someone whose hands are on a bar rather than a screen. The one place it goes beyond the plan is scope: the plan says English + Urdu, and §4.5 lists *"English / Urdu / Roman Urdu"*, so all three are here. Roman Urdu is the one that matters most in practice — it is how Urdu speakers actually type, and it is the only language of the three whose speakers have no script barrier to typing it.

§21 closed with an obligation: *"The Urdu and Roman-Urdu gap in particular has to close before Phase 4 rather than during it."* `Backend/src/memory/language.js` closed it, and everything below depends on it in every layer.

### Layer structure

`Backend/src/voice/` holds five modules, and the split is the design:

- `intent.js` — a sentence to a structured command. Rule-based, in-process, no network anywhere in it.
- `session.js` — a command and a session state to the next session state plus the **acts** that happened. A pure state machine with an injected clock.
- `personas.js` — an act, a voice and a language to a sentence a person can hear.
- `speech.js` — the seams where a real transcription or synthesis provider would attach.
- `index.js` — re-exports.

The load-bearing decision is the split between the second and third. **`session.js` never composes a sentence.** It emits acts — `{ act: 'reps-logged', reps: 12 }`, `{ act: 'rest-started', seconds: 45, next: {...} }` — and `personas.js` renders them. That is what makes four voices across three languages a pair of small tables instead of twelve copies of a workout state machine, and it is what lets the tone rule be checked against the finished text rather than against a template nobody can be sure of.

### One rule set, three languages

The classifier reads one set of patterns. Urdu never appears in them, because it does not arrive intact.

`memory/language.js` rewrites Urdu onto the English concepts the existing rules already read, in four ordered tiers:

- **STRUCTURAL** — regexes with captures that *reorder*. Urdu is SOV and English is SVO, so "بارہ ریپس ہو گئے" has the verb last. A phrase map cannot express that; a regex with captures can rewrite it to "12 reps" directly.
- **PHRASE_MAP** — multi-word phrases, applied before single words so "ہو گئے" is not eaten by "گئے".
- **WORD_MAP** — single words and number words.
- **POST_STRUCTURAL** — clean-up that depends on the earlier tiers having run.

`detectLanguage` returns `'urdu' | 'roman-urdu' | 'english'` from two marker sets: `ROMAN_URDU_MARKERS` for Latin-script Urdu ("barah reps ho gaye") and `STRONG_MARKERS` for the Arabic script.

Two consequences are worth stating plainly, because they are choices rather than oversights:

- **The normalizer is not a translator.** It moves a closed set of workout concepts across, and anything outside that set reaches the classifier as it was written and comes back `unknown`. The failure mode is a missed command, which the session answers by asking again — never an invented one.
- **Movement names are never translated.** An Urdu sentence carries the English exercise name inside it, because that is what the plan calls the movement and what the screen shows. Translating "Goblet squat" into Urdu would be a second vocabulary to keep in sync for no gain.

### Input language and output language are separate

The classifier auto-detects what the person *said*. The persona setting decides what the coach *says back*. They are deliberately not the same switch, and the reason is the ordinary case: someone with the coach set to English who says "بارہ ریپس" should hear an answer, not be told they used the wrong language. The session replies in the language they chose for the coach, which is the language they asked to be spoken to in.

### The state machine

```js
applyCommand(session, command, { now }) // -> { session, acts }
tickSession(session, { now })           // advances an elapsed rest, returns the session
```

Both are pure and both take `now`. Nothing reads the clock itself, which is why the whole workout lifecycle — including the last second of a rest — is testable without waiting for it. The server holds one session per person in memory with a six-hour idle TTL; the reasoning for keeping it out of the database is recorded at `state.voice` in `server.js`.

### Four voices, and one rule they all obey

The personas are the master plan's four: Friendly & Warm, Professional & Calm, Energetic & Motivational, Child-Friendly. Each is a table of lines per language, and each has its own prosody — rate and pitch — so they are distinguishable by ear and not only by wording. A test asserts no two voices share a prosody pair.

Over all twelve cells sits `checkTone`, the last gate before any line leaves the process. It is the same kind of machine-checked rule as the Phase 3 intervention tone check, and it exists for the same reason: a voice that says "you only did eight" is a voice that makes someone feel watched rather than coached. No guilt, no overpromise, no exclamation-mark encouragement — which is what makes Child-Friendly a genuine fourth option rather than a louder second one.

Language tags travel with the language objects on `/api/voice/options`, so the client never keeps its own copy of which locale a language is spoken in. Roman Urdu is spoken **from the Urdu lines** with a `ur-PK` tag and captioned in Latin: the person reads "barah reps ho gaye" and hears it pronounced correctly. That is only expressible because the caption and the spoken text are separate fields on the speech plan.

### Speech runs on the device

`Frontend/src/voice.ts` uses the browser's own `SpeechSynthesis` for output and `SpeechRecognition` for input. That is a decision, not a shortcut: the audio never leaves the device, there is no per-utterance cost, and the feature works with no network at all. What it costs is that the voice is the platform's rather than ours, and that a browser without `SpeechRecognition` cannot listen.

So nothing is assumed. Both capabilities are discovered at call time. `speech.js` on the server holds the matching seams — `setTranscriptionProvider` and `setSynthesisProvider` — and with no provider configured, transcription **refuses** rather than guessing. Three deliberate non-behaviours are documented in the module:

- **It does not queue.** `SpeechSynthesis` queues by default; every utterance cancels what came before it. The alternative sounds like being ignored at exactly the moment the feature exists to feel responsive.
- **It does not decide what to say.** It is handed a plan the server composed and speaks it.
- **Barge-in stops the coach when a transcript is *sent*, not when speech is detected.** A half-heard sentence the person abandoned is not worth cutting the coach off for.

Every utterance also carries a deadline derived from its own length, because `onend` is not guaranteed — an engine with no audio device, or one that drops the event on a long line, would otherwise leave the screen saying "Coach is talking" indefinitely.

### The screen

`Frontend/src/VoiceWorkoutView.tsx` owns three things the server cannot:

- **Barge-in**, from both sides: `stopSpeaking()` before the POST, and the listener's first transcript stopping the coach.
- **The caption**, which is the whole experience on a device with no synthesiser and the only legible form of Roman Urdu.
- **Typing.** A shared office, a sleeping baby, or a browser that refuses the microphone are all ordinary, and none of them should mean the feature is unavailable. Typing is a first-class way to give a command, not a hidden fallback.

The big number is chosen by the *kind* of step, because the kinds genuinely differ: a rep set counts down from a target, a hold is written in seconds, and a warm-up is not a target at all but a length. The server sends `kind` and `stepSeconds` rather than leaving the screen to infer it, because inferring "no rep target" as "warm-up" is a guess that happens to be right today.

Hands-free opens **over** the workspace rather than taking a place in the navigation: it is a mode, and the session it belongs to is the one on the Overview.

### What running the app found

The UI was driven end to end in headless Chrome against the live stack — guest wedge, registration, onboarding, the workspace, voice setup in Urdu, and a live session driven by typed commands. Four defects came out of looking at the screens, and none of them would have been caught by a test:

- **The entire auth screen had no CSS.** Forty-one class names across the app had no rule at all; all seven `auth-*` classes were among them. The first screen anyone sees after the guest workout rendered as unstyled inline fields.
- **A giant black em-dash for warm-ups.** The timer had neither `targetReps` nor `targetSeconds` to show and fell back to a placeholder at 78px, which reads as a broken glyph. Fixed at the source, by sending `kind` and `stepSeconds`.
- **The onboarding flow was unreachable.** `App.tsx` opened onboarding only when the profile had no goal — and every profile is created with `goal: 'Fat loss'`, so the test was satisfied by the placeholder and never fired. New accounts trained to a goal nobody had asked them about. See below.
- **A native browser button on the onboarding screen.** `.back-button` was reset in three scoped rules and never as a base rule, so the fourth context — onboarding — got the default chrome.

The class-name cross-check that found the first and fourth is three lines of matching, and it is worth repeating whenever a screen is added.

### The onboarding flag

`DEFAULT_PROFILE` is full of guesses, starting with `goal: 'Fat loss'`. Every field of it looks exactly like an answer, which is precisely why the client could not tell one from a guess.

`onboarded` is now that distinction, and it is deliberately not derivable from the rest of the profile: somebody whose real goal *is* fat loss and somebody who was defaulted to it have identical fields and different situations. It is `false` on the create path in both adapters, `true` only through `PUT /api/me/profile`, and the server sets it itself — a client that sends `onboarded: false` is overridden. A store that has never heard of the flag reads as not-onboarded, checked strictly as `=== true` so a text column's `'false'` cannot be truthy.

The Postgres column arrives through an idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` beside the `CREATE TABLE`. `CREATE TABLE IF NOT EXISTS` is a no-op on a database that already has the table, so a column added later needs its own statement or an existing deployment silently keeps the old shape and every read of it fails.

### The deployment that could not reach anything

The deployed Vercel frontend failed every request with `POST http://localhost:4000/api/auth/register net::ERR_CONNECTION_REFUSED`. The diagnosis is a build-time environment issue, not a code defect: `VITE_API_BASE_URL` was never set on the deployment, and `api.ts` falls back to `http://localhost:4000` — which in a visitor's browser is *their own machine*. Vite inlines the value at build time, so nothing about this fails loudly: the build succeeds, the bundle ships, and every request dies against a server that was never there.

`api.ts` now detects that case and refuses before the request, with a message that names the variable. Verified by serving a production build: the guest screen says *"This build has no API address configured, so it cannot reach the coach. Set VITE_API_BASE_URL for this deployment and rebuild."* — instead of a connection error against the visitor's laptop.

**Setting the variable is necessary and not sufficient.** The backend is not deployed anywhere, so the deployed frontend has no API to reach whatever the variable says. Until there is a hosted backend, the local stack is the only working configuration, and the Vercel deployment should be read as a UI preview rather than a working app.

### Validation

- Backend suite: **282 tests passing**, of which **134 are Phase 4** — 30 in `voice-intent.test.js`, 34 in `voice-session.test.js`, 25 in `voice-personas.test.js`, 19 in `voice-speech.test.js`, and the 26 in `language.test.js` that the phase depends on. The remaining 148 are the Phase 1–3 suites §19–§21 record, plus the 4 added to `persistence.test.js` for the onboarding flag. The gap pass added 10 of those: 3 in `language.test.js`, 4 in `voice-intent.test.js`, and 3 in `persistence.test.js` for the voice session's round trip through the store.
- Coverage includes: one pattern set driven by English, Urdu and Roman Urdu input; the SOV-to-SVO reordering; the state machine's full lifecycle including the last second of a rest; the tone rule over every template in every voice and language; prosody distinctness; the caption/spoken-text split for Roman Urdu; and the provider seams, including that a missing provider refuses rather than guesses.
- The **singular/plural regression** is worth calling out. `1 sets, 22 reps` was found by running the API rather than by reading it, and the test that now guards it drives four distinct real sessions — a one-set session stopped past the half-minute, a one-rep target, a single reported rep on a movement that cannot be counted down, and the last second of a rest — rather than hand-written fixtures. Seconds are the case that had to be driven: holds and rests are floored at five, so "1 second" is reachable only at the boundary.
- Frontend `tsc -b` and `npm run build` both pass; `oxlint` reports only the pre-existing `set-state-in-effect` warning in `WorkspaceViews.tsx`.
- Verified live end to end against a running stack, driven in headless Chrome: guest wedge → registration → onboarding → Overview → hands-free → Urdu persona → a live session advanced by typed commands, with the transcript, the rest countdown and the summary all correct, and **zero console errors**.
- The two frontend gaps were re-verified the same way, from a clean account, because neither is reachable from the backend suite. Onboarding: shown at sign-in, exited without completing, server still reports `onboarded=false`, **re-asked on a later load**, then completed and confirmed to stay closed across another load. Microphone: entered hands-free on that account with the microphone left refused, and the button ran `Starting… -> Paused` — `Listening` never appeared, and the refusal note was shown. Zero console errors on both.
- Verified against the live API: a full session driven to a stop logs exactly once, a second stop does not re-log, and `/api/progress/summary` reflects it. The onboarding flag was verified across register → `PUT` → re-login, including that a client-supplied `onboarded: false` is overridden.

### The gap pass of 2026-09-24

Six of the gaps this section originally recorded are closed. What each one actually was, and how it was shown to be closed rather than assumed closed:

- **`do minute rest` and `teen reps` classified as `unknown`.** `do`, `teen`, `char` and `saat` are each both a real Urdu numeral and a real English word, so none of them could go in the Roman-Urdu marker set — the marker that would have caught `teen` would also have caught `do reps`. `language.js` now counts them only from the position that disambiguates: a numeral followed by a count unit, with `do reps` and `do sets` excluded because counting reps is the one thing English does say that way. A positional numeral decides a short message on its own and needs density to decide a long one. Guarded by three tests in `language.test.js`, including that the positional numerals reach the same numbers the word map already had — a fix that reads a numeral as Urdu must not change what it counts.
- **"I stopped training last week" read as `silence`.** `stop\w*` matched before the phrase could be read as a report. `intent.js` now separates the two: a past time reference (`last week`, `yesterday`, `ago`, `used to`) together with a past verb marks the sentence as *reportable*, and a reportable sentence is skipped for `silence` and `stop-workout` only. It is `continue` rather than `return`, deliberately — "I stopped training last week and want to start again" still reaches `start-workout`. Logging is exempt because a dated log entry is still a log entry. Four tests.
- **The microphone button claimed "Listening" before the browser had confirmed it.** `voice.ts` now surfaces the recogniser's `onstart`, which is the browser confirming the microphone is genuinely open, and `VoiceWorkoutView` gained `starting` as a real third state rather than a second boolean — "the browser has been asked and has not yet answered" is neither on nor off. Verified in headless Chrome with the microphone deliberately left refused, which is the case that used to lie: the label now runs `Starting… -> Paused`, `Listening` never appears, and the refusal note is shown.
- **The voice session did not survive a server restart.** It was in the process's memory on purpose, and the cost was that a restart mid-session left the person holding a microphone for a session the server had forgotten. It now persists through `saveVoiceSession`, `loadVoiceSessions` and `deleteVoiceSession` in both adapters, with `voice_sessions` added to `schema.sql`; writes are fire-and-forget on every route that touches the session, so a store that is slow or down costs durability rather than the turn. Verified by killing the process and restarting it — and the first attempt at that was **invalid**, because the boot log said `Port 4000 is already in use` and the old process was answering from memory. The valid run restored the session and returned `totalReps=10 status=active`.
- **`plan-panel`, `voice-live` and `macro` were class hooks with no rules**, left over from earlier increments. Removed.
- **Onboarding was asked once and not enforced.** The guard ran on the auth response, so registering and closing the tab before finishing the questionnaire was enough to never be asked again — and never be given a plan. It now runs on the `/api/me` load, keyed on the token so a dismissal does not bring the sheet back until the next sign-in. Verified both directions: exit setup, reload, re-asked; complete setup, reload, stays closed.

### Known gaps, and what is accepted rather than fixed

The remaining gaps in this phase are not work deferred for lack of time. Each is a platform limit or a deliberate product call, recorded with its reasoning so that a later pass can tell the difference between an oversight and a decision.

- **Barge-in is one turn behind.** The coach finishes the phrase the person talked over, because stopping is triggered by a *sent transcript* rather than by detected speech. Detecting speech means holding the microphone open against the synthesiser, which is a permissions and echo-cancellation problem rather than a wording one.
- **No on-device Urdu TTS.** Roman Urdu is spoken from the Urdu lines with a `ur-PK` tag; whether the platform has a usable Urdu voice installed is a platform question, and the caption is the guarantee.
- **A workout named with an outcome claim** ("Guaranteed fat burner") is announced with the generic fallback line rather than by name — the safety layer refusing to speak a promise, which is correct and sounds slightly odd.
- **A session under thirty seconds logs no duration.** `elapsedMinutes` uses `Math.round`, so anything below thirty seconds floors to zero and `server.js:209` passes `null` rather than a number. This is correct as designed and was left alone: rounding a twenty-five-second session up to "1 minute" would put a figure in someone's history larger than the work they did, and the whole posture of this product is that the log says what happened. The reps still count; only the minutes are absent. A future pass that wants to record very short sessions should add a *seconds* field rather than make minutes lie.
- Phase 2 and 3 gaps still stand underneath: no memory expiry policy, recall is lexical until a real embedding provider is configured, per-set performance is not recorded, and the Overview's "A note for you" panel still shows hardcoded text.

## 23. The Sign-In Screen, and the CORS Refusal Behind It

This section records the `2026-09-24` follow-up increment. §22 fixed the deployed bundle's *silent* failure — a production build with no `VITE_API_BASE_URL` — and this one fixes what happened after that: the deployed frontend was reaching `http://localhost:4000` correctly and the local API was refusing it.

### The refusal, and why the error message was useless

The browser reported:

> Access to fetch at 'http://localhost:4000/api/auth/login' from origin 'https://fit-pulse-ai-iota.vercel.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The 'Access-Control-Allow-Origin' header has a value 'http://localhost:5173' that is not equal to the supplied origin.

The backend's `ALLOWED_ORIGINS` defaulted to `http://localhost:5173`, and the backend's `.env` did not override it, so the Vercel origin was never on the list. That part is a one-line configuration fix. The message is the interesting part.

`sendJson` always wrote an `Access-Control-Allow-Origin` header, falling back to `config.allowedOrigins[0]` when the request's origin was not allowed. So a refused request did not look refused — it looked like the header had been *misconfigured*, and the reader goes looking through CORS plumbing instead of at the allowlist. **Omitting the header is what "this origin is not allowed" actually looks like on the wire.** That is what the server does now, and `corsHeaders()` builds the block conditionally rather than writing it literally.

The second fix is that the server now says so itself:

```
Blocked a request from https://fit-pulse-ai-iota.vercel.app — not in ALLOWED_ORIGINS (currently: http://localhost:5173).
```

Once per origin, on stdout, where the person running the server will see it. The entire diagnosis here came from a browser console on a different machine being pasted into a conversation, which is a bad way to find out that a server refused a request.

### The allowlist, and the wildcard

Vercel gives every preview deployment its own hostname, so an exact-match list is wrong between deploys. `originAllowed` now accepts `*` in an entry, and it does not cross a dot:

```js
const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^.]*')
return new RegExp(`^${escaped}$`).test(origin)
```

`https://fit-pulse-ai-*.vercel.app` therefore covers the production host and every preview host, and cannot reach `fit-pulse-ai.attacker.vercel.app` or anywhere outside `vercel.app`. The scheme is matched literally, so a downgrade to `http://` is not accepted.

It is still a wildcard, and the cost is stated in the code and in `.env.example`: Vercel lets anyone create a project, so somebody registering `fit-pulse-ai-something` gets a hostname the pattern accepts. That is a fine trade for a local development backend and a bad one for anything holding real accounts, where the exact origin belongs in the list. The ten cases that pin this behaviour are in `security.test.js`, because CORS is the one failure that cannot be tested from inside the process — a wrong allowlist is invisible to every unit and every server-side request, and shows up only in somebody else's browser.

The same check caught a second, quieter problem: `fetch` rejects with **"Failed to fetch"** for the API being down, a CORS refusal, DNS failure and a dropped connection alike. That string was on screen during this failure. `api.ts` now catches the rejection and says what is knowable — which endpoint was unreachable — rather than naming the browser's own API.

### The screen

The screenshot the user sent showed the auth form rendering as plain inline inputs with the labels beside them. That was the deployed bundle, which predated §22's CSS. The fix existed; it had not been deployed. But the accompanying note — *"quite simple (dull)"* — was about the design rather than the bug, and it was fair: a centred white card with two fields is the minimum viable sign-in page, and it was being asked to do the hardest job in the product.

Signing up to a fitness app asks a stranger to hand over their body's history and trust that something useful comes back. A bare form answers none of that. So the screen is now two panels:

- **The brand panel** states three capabilities, each one a shipped phase rather than a slogan: *It remembers* (§20's memory engine), *Hands-free, on your device* (§22's voice mode, including that the audio never leaves the phone), and *It notices the slip* (§21's churn model). Its footer states the safety posture — *"Guidance, not medicine. FitPulse never diagnoses or prescribes, and your logs are yours to export or delete."* — which is both true and the thing a person about to enter health data most wants to know.
- **The form panel** is a column on the page ground rather than a card on it, with focused input styling, a password reveal toggle, and a switch link.

On narrow screens the panel hugs its content and keeps all three points. An earlier cut hid the third one to save about 60px, which cost the strongest argument on the device where attention is shortest; the footer goes instead, since it is the piece that can be found elsewhere and the person has already used the guest workout by this point.

The password reveal is small and worth naming: a password field with no way to read what was typed is the most common reason a sign-in fails on a phone keyboard, and the toggle only changes the input's `type` — the value is never rewritten.

### What running it found

- **The point icons were mis-centred and mis-sized.** `.auth-points span` was written for the description text and also matched `.auth-point-icon`, overriding its `display: grid` with `display: block` and giving it the paragraph's `max-width`. Specificity is not a reason to write a selector that matches things it does not mean.
- **A lighter rectangle sat behind the form in dark mode.** A pre-existing `.dark-mode .auth-card` plate survived the redesign, which had removed the card's background in both themes. Removed rather than recoloured.

Both were found by looking at the screenshot, and neither would have been caught by a test.

### Validation

- Backend suite: **283 tests passing**, one more than §22 — the origin allowlist decision table in `security.test.js`. *(Corrected in §24: this line read "272", which cannot be one more than the 282 §22 records. The two neighbours agree at 282 and 316, so the figure here was the slip.)*
- Verified with `curl` against the running server, exactly as a browser does it: the preflight from `https://fit-pulse-ai-iota.vercel.app` returns 204 with `Access-Control-Allow-Origin` echoing that origin, and a preflight from an unrelated origin returns 204 with **no** `Access-Control-Allow-Origin` at all.
- Verified through the UI with a real account: registered over the API, then signed in through the redesigned form — filling the fields, toggling the reveal (`text` then `password`), submitting — landing in the workspace as `Returning User` with **zero console errors**. Onboarding correctly appeared, that account never having completed it.
- The full walkthrough of §22 was re-run end to end afterwards and is still green.
- `tsc -b` and `npm run build` clean.

### Known gaps

- **The backend still is not deployed**, so the deployed frontend reaches a laptop that has to be running. The CORS fix makes that work while it is; it does not make the deployment self-sufficient. A hosted backend plus `VITE_API_BASE_URL` set in Vercel is the remaining step, and it is a hosting decision rather than a code one.
- **`ALLOWED_ORIGINS` on a deployed backend is the operator's responsibility**, and the failure mode is the same silence that caused this one — except that in production the server log is not somewhere anyone is watching. A startup line naming the allowlist would help; there is one in the refusal path and not yet in the boot path.
- **The brand panel is not localised.** Phase 4 built three languages for the workout and the app's chrome is English throughout, so this is consistent rather than new, but it is the screen where a first impression is formed.
- The auth screen has **no loading skeleton and no "forgot password"** path. The first is cosmetic; the second is a real product gap with no backend behind it at all.

## 24. Per-Set Performance: the Record the Why Button Needed

This section records the `2026-09-25` increment. It closes the three gaps §21 opened and named, and it is the increment that lets the Coach AI layer answer the master plan's own headline question.

### The gap, quoted from where it was left

§21 wrote the hole down in as many words:

> **Per-set and per-exercise performance is not recorded**, which is why the Why Button must decline the master plan's own headline example. Closing this is a data-model change — sets, reps and load per exercise per session — not a wording change, and it is the single largest gap in this layer.

The master plan's example is *"Why 3 sets? Because your last 2 sessions declined in set 4."* Until now the Why Button answered it by admitting it could not, and `Backend/test/intervention.test.js` asserted that admission verbatim — which made the shortcoming a tested guarantee rather than something nobody had noticed. That test is not deleted here. It is kept, and it now covers the case it was always really about: an exercise question with no per-set record behind it still returns an admission, and `confident` is still `false` for it. An honesty property that is only tested on the happy path is not tested.

### A set is a field on the session, not a table

`Backend/db/schema.sql` gains one column: `workout_logs.sets`, `JSONB`. Three reasons, in order of weight:

1. **Nothing queries into a set.** Every consumer — the genome, the churn model, the Why Button, the letter — loads the history and reasons over it in application code. That is how the genome already works, and a joined table would buy an index nobody uses.
2. **The shape will grow.** `voice_sessions` set the precedent for a document-shaped record that is read whole. Unpacking a shape that changes every increment costs a migration every time it changes.
3. The column is added with its own idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, because `CREATE TABLE IF NOT EXISTS` is a no-op against a database that already exists. This is the same trap §20 recorded, and it is worth stating twice.

The shape is `{ exercise, reps, loadKg, heldSeconds }`, and two decisions inside it are deliberate:

- **A set records what was done, not what was prescribed.** `reps` is null on a hold and `heldSeconds` is null on a lift. Defaulting either to zero would put a number in the record that nobody performed — and that number would then average into every figure quoted back to the person.
- **A set cannot be empty.** A row recording neither reps nor a hold is refused at the boundary. It would count toward the session's set totals while saying nothing about what was done, which is worse than having one fewer set on file.

`Backend/src/training-sets.js` owns the shape, the validation and the summary — `normaliseSets`, `summariseExercises`, `matchExercise`. Both storage adapters implement it: `repository.js` for Postgres and `local-store.js` for the file store. A session logged before this increment reads back as an empty list rather than `undefined`, so every consumer can iterate a log without a guard. No new entry was needed in `store.js`'s `CONTRACT` — the existing methods carry the field.

### The genome summarises it per movement

`buildGenome` gains a `training` block, computed by `summariseExercises`: per movement, the sessions it appears in, total sets, total reps, median reps per set, median sets per session, a trend, and the last three sessions in full.

Two things about it are worth recording.

**The unit is the set, not the session.** "You did four sessions of squats" says nothing about whether the fourth set was being finished, which is exactly what the plan is asking when it asks for three.

**The trend splits the movement's own history in half**, rather than comparing against a date range or a population baseline. Four sessions in a fortnight and four across four months are different stories, so the comparison that matters is against this movement's own recent past. Below three sessions the answer is `new` — calling a first session a direction is worse than saying there is not one yet.

**The raw sessions are kept, newest first.** "The drop came at set 3" cannot be recovered from a median, so the ordered list survives into the summary for the Why Button to quote.

### The Why Button answers the headline question

The exercise explainer was rewritten from a decline into an answer with three branches:

- **A movement named and on file** — it cites the sessions, the total sets, the sets-per-session, and the set that gave out. A set is called a drop when it falls a fifth below the best set of that session and comes after it. Anything smaller is ordinary variation, and calling it a decline would turn noise into a story.
- **No movement named but a record exists** — it answers with what sets usually come to, across the movements that do have one.
- **Nothing tracked** — the original admission, unchanged.

The `topic !== 'exercise'` exemption was removed from the `confident` calculation, which is now `evidence.length > 0 && topic !== 'nutrition'`. That is the rule it always claimed to be: an answer either cites evidence from the genome or admits there is none, and there is no third branch. The exemption existed because there was nothing to cite; it is gone now that there is.

`why.context` also carries a `movements` list — capped at six to match the prompt — so the interface can restate the same numbers the explanation used. The Why Button and the intervention card must never disagree about why.

### The camera produces real set boundaries

`Frontend/src/CameraWorkoutView.tsx` counts reps but cannot see where a set ends. To a pose model, someone standing between sets and someone standing at the top of a rep are the same picture. So the boundary belongs to the person: a **Finish set** action banks whatever the counter holds and starts the next set from zero.

This also fixed a promise the screen was making and not keeping. The note under the exercise picker reads *"Anything already counted stays in the session total"* — and switching movement mid-set was silently discarding those reps, because the counter was replaced without banking it. Banking on the boundary makes both the note and the record true.

`finishSet` installs a **fresh** counter rather than resetting the existing one. The tracker reads `counterRef` on every frame, so a reset would let the boundary itself register as movement, and the first rep of the next set would be counted before it happened.

`Frontend/src/pose/sets.ts` holds the logic — reading a set off a counter, grouping for the summary, converting to the wire shape — and lives outside the screen so it can be tested without a camera. That matters because it is the last pure function before the data leaves the device and writes into a health record. The camera now posts `sets` structured rather than flattening them into a note; the note is a summary of the data rather than the data itself.

### The other two gaps

**The Overview's "A note for you" panel** showed a fixed sentence — *"You've been consistent this week, Jordan"* — to everyone, including someone who had never trained, directly above a card that genuinely *was* derived. It now renders the genome's Progress Narrative, served by a new `GET /api/coach/note`, which returns the text and the facts it was built from. The byline says `N sessions logged · last one N days ago` rather than `Coach Nova · just now`, and the status chip says `From your log` rather than `Online` — nothing there is a live session, and the chip should not imply someone is waiting.

The narrative is the Progress Narrative feature, and it is deterministic and offline. No model is called for it, and there is no path by which that panel can say something about a person that is not in their record.

**The letter's milestone** counted to five and stopped at forty. Five is a round number rather than an achievement — the fifth session says nothing the fourth did not — and the rule expired at forty, which is precisely when a person's records get harder to beat and therefore more worth naming. It is replaced by a **personal best**: a week with more sessions than every week before it, measured against the person's own history and bounded at the week they started. Weeks before the first session are not quieter weeks, they are weeks that did not exist, and counting them would let a record be set against nothing.

It is true in the week it happens and false the next time they beat it, so the line is structurally unable to repeat, and it is never awarded for a number somebody else chose. A first week of one session is not a personal best — naming it one would be dressing up the first thing anyone ever did. The now-dead `throughLastWeek` flag went with the rule it served.

### Validation

- Backend suite: **316 tests passing**, up from 282 in §22 — 34 new. `training-sets.test.js` is 26 of them and covers the module's whole contract: validation on every malformed shape (each returning an error sentence rather than throwing), the per-session caps, hold-versus-lift nulls, case- and space-insensitive grouping, the three-session floor on a trend, and the newest-first ordering of the retained raw sessions. The rest are a per-set round trip through the store, the genome's `training` assertions, the reworked Why Button in both directions, and three tests for the new milestone — the old rule had **none**, which is how it went unnoticed that the suite stayed green when it was replaced.
- Frontend suite: **84 tests passing**, up from 71. `pose/sets.test.ts` is 13 of them, written against the real pose fixtures, and it asserts the rounding rule rather than a magic millisecond value.
- `tsc -b` clean; `oxlint src` reports only the two pre-existing `set-state-in-effect` warnings; `npm run build` clean at 362.66 kB / 115.26 kB gzip.
- **Verified live over HTTP**, which is the check that matters for a data-model change. Three declining sessions of goblet squats were posted with `sets`, and:
  - `POST /api/coach/why` with *"Why 3 sets of goblet squats?"* returned `confident: true`, citing the per-set numbers of each session.
  - **The master plan's headline question, *"Why 3 sets of squats?"*, returned**: *"Goblet squat has been logged across 4 sessions, 16 sets in all. It runs to about 4 sets a session. Last time the sets went 12, 11, 6, 4, so the drop came at set 3."*
  - `GET /api/coach/note` returned the narrative with its basis, and a **brand-new account** returned the opening branch rather than the consistent-week sentence: *"Nothing logged yet. The plan is built around fat loss, and the first session is the one that starts the record."* — with a basis line reading `0 sessions`. The second clause tracks the account's stated goal, so the sentence is composed rather than swapped.
- The client's wire output was fed through the server's `normaliseSets` directly, confirming the two shapes agree: `[12, 10, 6]` reps and a 45-second plank were accepted, stored with the correct nulls, and read back as two movements and four sets.

### What is not verified

**No camera was available, so the camera screen has not been driven.** The set-boundary logic beneath it — `setFrom`, `groupSets`, `toWireSets` — is covered by 13 tests, and the screen typechecks, builds and serves. The screen itself is not. This is the same standing gap §22 recorded for the voice mode, and it is larger here: set boundaries are the one thing this increment added that only a person in front of a camera can exercise.

### Known gaps

- **Load is recorded and never used.** A set carries `loadKg`, the camera view sends none, and nothing reads it. It is stored because retrofitting it later would leave a hole in the middle of the record, and because whether somebody is getting stronger is mostly a question about load.
- **The drop threshold is a fixed fifth.** It is a defensible default rather than a personalised one. With a single person's history there is nothing to calibrate against.
- **A set carries no timing.** Two sessions of four sets look identical whether they took twenty minutes or an hour, so nothing in this layer can speak to rest or density.
- **The set boundary is only as good as the person's finger.** Nothing detects a set ending, so a set nobody finished is invisible, and a session where the count was never banked reads as an empty record rather than as a miscount. `summariseExercises` reports `tracked: false` for it, which is honest but not the same as right.
- The accepted gaps from §21 stand underneath this work: there is still no delivery mechanism for the letter, recall is lexical rather than semantic, there is no memory expiry policy, `weekday-drift` remains largely redundant with `silence`, and the churn weights are still hand-set.
