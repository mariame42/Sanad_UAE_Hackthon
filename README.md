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
| Student | `/check-in`, `/my-case` |
| Faculty | `/concern`, `/class-insights` |
| Advisor / SAS | `/cases` |
| Leadership | `/dashboard` |

Language toggle (EN/AR + RTL) and dark mode are in the header.

## Demo script (3 min)

1. Faculty → Concern Desk → Language Guard → recommend Check-in to class  
2. Student → Check-in (quick path) → strategies → Talk to a coach  
3. Advisor → Cases → confirm route / assign owner  
4. Student → My case → I disagree  
5. Leadership → Dashboard  
6. Principles → `/principles`

## Routes

- `/` welcome  
- `/role` role picker  
- `/check-in` Learning Check-in (7 activities)  
- `/concern` Concern Desk + Language Guard  
- `/cases` Case Hub  
- `/my-case` Student tracker + recourse  
- `/dashboard` Outcomes & Equity  
- `/class-insights` Course-level patterns  
- `/principles` What Sanad never does  

LLM assistive drafting: `POST /api/llm` (`language_guard`, `route_suggest`, `handoff_summary`) with offline fallbacks.
