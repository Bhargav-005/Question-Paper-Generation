Q-PAPER Webapp — Architecture & Documentation

Overview
- This repository implements Q-PAPER: a web application for generating, mapping, and reviewing educational questions and syllabi using a React frontend, a Node/TypeScript server, and ML helpers.

Connections & Architecture
- Frontend (`client/`): Vite + React + TypeScript. Communicates with the server via REST endpoints exposed in `server/` (see `server/routes.ts`). Static assets served from `client/public/`.
- Server (`server/`): Node.js + TypeScript. Exposes API routes (auth, admin, question generation, ML mapping) and connects to the local Postgres database (`server/db.ts`). Server also orchestrates calls to internal services in `server/services/` such as `aiService.ts`, `mlMappingService.ts`, and `questionService.ts`.
- ML (optional local/python): `ml/` contains mapping scripts (e.g., `co_topic_mapper.py`) and `requirements.txt`. ML scripts can be run offline to pre-compute mappings or prototypes; server services can call external ML APIs or this local ML pipeline when integrated.
- Database & Auth: Uses local Postgres for data and custom/mock auth for security. Server middleware in `server/middleware/` handles auth checks.

Data Flow / Workflow
1. User interacts with UI in `client/src/pages/*` (e.g., `Generate.tsx`, `CourseSetup.tsx`).
2. UI calls server REST endpoints defined in `server/routes/`.
3. Server controllers (`server/controllers/`) validate and route requests to services in `server/services/`.
4. Services perform business logic: call AI APIs (`aiService.ts`), call ML mapping (`mlMappingService.ts`), persist/fetch from DB (`server/db.ts`).
5. Server returns structured responses to the frontend; frontend updates state and UI via React + query client (`client/src/lib/queryClient.ts`).
6. For ML workflows, the server may enqueue or call `ml/` scripts or external ML endpoints; results feed back into services and are stored.

Pages (high-level) — `client/src/pages/`
- `Home.tsx` — Dashboard / landing view for authenticated users.
- `Dashboard.tsx` — Overview of courses, recent activity, quick actions.
- `Login.tsx` — Authentication UI integrating institutional auth flows.
- `Generate.tsx` & `GenerateQuestions.tsx` — UIs to request AI-generated questions and tune generation parameters.
- `CourseSetup.tsx` — Create/edit courses and basic metadata.
- `Syllabus.tsx` — Create/edit syllabi for a course.
- `CourseOutcomes.tsx` — Define course outcomes and map to syllabus topics.
- `COSyllabusMapping.tsx` — Map course outcomes to syllabus items (uses ML mapping helpers).
- `MappingReview.tsx` — Review suggested mappings from ML or AI, accept/reject.
- `Preview.tsx` / `SampleQuestions.tsx` — Preview generated questions and sample sets.
- `Export.tsx` — Export questions or mappings to CSV/PDF formats.
- `Blueprint.tsx` / `DebugWorkflow.tsx` — Tools for admins and debugging generation pipelines.
- `admin/*` — Admin-specific pages (manage users, courses, system settings).

UI Modules & Components — `client/src/components/`
- Layout: `AppLayout.tsx`, `AdminLayout.tsx`, `Header.tsx`, `Sidebar.tsx` — page scaffolding and navigation.
- UI primitives: `ui/` contains reusable components (buttons, inputs, dialogs, cards, forms, charts, calendar, avatar, etc.). These are used across pages to maintain consistent look-and-feel.
- Hooks: `hooks/` (e.g., `use-mobile.tsx`, `use-toast.ts`) provide cross-cutting behavior.
- Lib: `client/src/lib/` contains `queryClient.ts` and `utils.ts` — shared utilities and API clients.

Server Modules & Services — `server/`
- `routes/` — Route definitions grouped by area (auth, admin, api endpoints).
- `controllers/` — Controller functions that parse requests and call services.
- `services/` — Core business logic:
  - `aiService.ts`: wraps AI provider calls (generation, embedding, etc.).
  - `mlMappingService.ts`: provides mapping suggestions (topic ↔ outcome) using ML models or heuristics.
  - `questionService.ts`: question generation, formatting, and persistence.
- `db.ts`: database connection helpers and queries (Postgres).
- `middleware/`: authentication and request-level middleware.

Tech Stack
- Frontend: Vite, React, TypeScript, Tailwind/CSS (project uses `postcss.config.js`) and a component library of custom UI primitives.
- Backend: Node.js, TypeScript, Express-like routing (see `server/index.ts` and `server/routes.ts`).
- Database & Auth: Local Postgres + Custom/Mock Auth.
- ML / AI: Python prototyping in `ml/` and AI providers via `server/services/aiService.ts`. The project supports local ML scripts and external AI APIs.
- Dev tooling: ESBuild (terminal `esbuild`), TypeScript (`tsconfig.json`), Vite dev server (`vite.config.ts`), test scripts in `server/tests/`.

Setup & Local Development (quick)
- Frontend (client):
  - cd into `client/` and install deps (e.g., `npm install`).
  - Start dev server: `npm run dev` (configured via `vite`).
- Server: Install root deps, then run the server (e.g., `npm run dev` or `tsx server/index.ts`).
- ML: create a Python environment and install `ml/requirements.txt` to run `co_topic_mapper.py` when needed.
- Environment: copy and populate `.env` from provided sample variables (AI API keys, DB connection strings).

License & Contributing
- Follow repository conventions for commits; open PRs against `main` for changes. Add tests for non-trivial logic.

--
This README is saved as README_FULL.md with a developer-oriented summary of connections, workflow, pages, modules, and tech stack.