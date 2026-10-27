# Sanad (سند)

**Early help, without labels.**

Early Learning Support & Referral Platform for TDRA UAE Hackathon 2026 —
Challenge Profile 20 (Zayed University).

## Tech stack

Next.js · Tailwind CSS · Recharts · LLM API · Makefile

## Getting started

Requires Node.js 20.9+.

```bash
make dev        # installs deps, creates .env.local, starts http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `make` | List all targets |
| `make install` | `npm ci` (re-runs only when the lockfile changes) |
| `make env` | Create `.env.local` from `.env.example` (`LLM_API_KEY` is optional) |
| `make dev` | Dev server (`PORT=4000 make dev` to change the port) |
| `make build` / `make start` / `make prod` | Production build / serve it / both |
| `make lint` / `make typecheck` | ESLint / TypeScript |
| `make check` | Lint + typecheck + build — run before pushing |
| `make smoke` | Serve the production build and hit every page + the LLM API |
| `make all` | `check` + `smoke` |
| `make clean` / `make distclean` | Remove `.next` / also `node_modules` |

## Demo roles

Use the header role switcher (or `/role`):

| Role | Start at |
| --- | --- |
| Student | `/check-in`, `/passport`, `/my-case` |
| Faculty | `/concern`, `/adjustments`, `/barriers` |
| Advisor / SAS | `/cases` |
| Leadership | `/dashboard`, `/barriers` |

Language toggle (EN/AR + RTL) and dark mode are in the header.

## Demo script (4 min)

Story: **diagnose the barrier, not the student** (see [`docs/IDEAS.md`](docs/IDEAS.md)).

1. Faculty → Concern Desk → Language Guard → recommend Check-in to class  
2. Student → Check-in → Text-to-speech helped → Talk to a coach  
3. Student → Learning Passport → share ENG 101 (exactly what the instructor sees)  
4. Faculty → Adjustments → accept in one click (no diagnosis needed)  
5. Advisor → Cases → AI suggests, human decides · Privacy Lens  
6. Leadership → Barrier Map → Apply fix → referrals and SAS wait drop  
7. Close → `/principles`

### Presenter tools

- **🎬 Demo button** (bottom corner): the script above, one click per step — it
  switches role and opens the right screen. **Reset demo data** lives there too.
- **Split screen**: demo data is saved in `localStorage` and syncs between
  tabs, while the role is per tab. Put Faculty/Advisor in one window and
  Student in another — changes appear live.
- No `LLM_API_KEY`? Language Guard, route suggestion and handoff summary fall
  back to deterministic rules (`src/lib/language-guard.ts`), labelled
  “Offline rules” in the UI.

## Big idea

**Diagnose the barrier, not the student** — a student-owned *Learning Passport*
(evidence of what works instead of a diagnosis) plus a course-level *Barrier
Map* that fixes obstacles for everyone. See [`docs/IDEAS.md`](docs/IDEAS.md).

## Routes

- `/` welcome  
- `/role` role picker  
- `/check-in` Learning Check-in (7 activities)  
- `/concern` Concern Desk + Language Guard  
- `/cases` Case Hub  
- `/passport` Learning Passport (student-owned evidence, share / revoke per course)  
- `/adjustments` Faculty: passport-based adjustment requests  
- `/barriers` Barrier Map (course × week) + Apply fix simulation  
- `/my-case` Student tracker + recourse  
- `/dashboard` Outcomes & Equity  
- `/class-insights` → redirects to `/barriers`  
- `/principles` What Sanad never does  

LLM assistive drafting: `POST /api/llm` (`language_guard`, `route_suggest`, `handoff_summary`) with offline fallbacks.
