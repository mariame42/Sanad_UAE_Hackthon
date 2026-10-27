# Sanad (سند)

**Early help, without labels.**

Early Learning Support & Referral Platform for TDRA UAE Hackathon 2026 —
Challenge Profile 20 (Zayed University).

## Tech stack

Next.js · Tailwind CSS · Recharts · LLM API · Makefile

## Getting started

```bash
make install
cp .env.example .env.local   # optional LLM_API_KEY
make dev
```

## Demo roles

Use the header role switcher (or `/role`):

| Role | Start at |
| --- | --- |
| Student | `/check-in`, `/passport`, `/my-case` |
| Faculty | `/concern`, `/class-insights`, `/passport` |
| Advisor / SAS | `/cases` |
| Leadership | `/dashboard` |

Language toggle (EN/AR + RTL) and dark mode are in the header.

## Demo script (3 min)

1. Faculty → Concern Desk → Language Guard → recommend Check-in to class  
2. Student → Check-in → strategies → Saved for me → Learning Passport  
3. Student → Passport → share with a course / revoke  
4. Faculty → Passport → see shared evidence (flexible adjustment)  
5. Advisor → Cases → confirm route / assign owner  
6. Student → My case → I disagree  
7. Leadership → Dashboard · Principles → `/principles`

### Presenter tools

- **🎬 Demo button** (bottom corner): the script above, one click per step — it
  switches role and opens the right screen. **Reset demo data** lives there too.
- **Split screen**: demo data is saved in `localStorage` and syncs between
  tabs, while the role is per tab. Put Faculty/Advisor in one window and
  Student in another — changes appear live.
- No `LLM_API_KEY`? Language Guard, route suggestion and handoff summary fall
  back to deterministic rules (`src/lib/language-guard.ts`), labelled
  “Offline rules” in the UI.

## Next big idea

**Diagnose the barrier, not the student** — a student-owned *Learning Passport*
(evidence of what works instead of a diagnosis) plus a course-level *Barrier
Map* that fixes obstacles for everyone. See [`docs/IDEAS.md`](docs/IDEAS.md).

## Routes

- `/` welcome  
- `/role` role picker  
- `/check-in` Learning Check-in  
- `/passport` Learning Passport (evidence of what works)  
- `/concern` Concern Desk + Language Guard  
- `/cases` Case Hub  
- `/my-case` Student tracker + recourse  
- `/dashboard` Outcomes & Equity  
- `/class-insights` Course-level patterns  
- `/principles` What Sanad never does  

LLM assistive drafting: `POST /api/llm` (`language_guard`, `route_suggest`, `handoff_summary`) with offline fallbacks.
