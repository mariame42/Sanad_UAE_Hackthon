# Sanad (سند)

**Early help, without labels.**

Early Learning Support & Referral Platform for TDRA UAE Hackathon 2026 —
Challenge Profile 20 (Zayed University): *Early Identification of Learning Support Needs*.

Sanad helps students, frontline staff, and Student Accessibility Services (SAS)
notice learning barriers early and route them to the right support. Students give
consent at every step. AI never diagnoses. Every case has a named human owner.

## Tech stack

| Layer | Choice |
| --- | --- |
| App | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS |
| Charts | Recharts (analytics later) |
| AI | LLM API (assistive drafting only) |
| Tasks | Makefile |

## Getting started

```bash
make install   # npm install
cp .env.example .env.local   # add LLM keys when ready
make dev       # http://localhost:3000
```

Other targets: `make build`, `make start`, `make lint`, `make clean`.

## Folder structure

```
src/
  app/                  # routes & API
    api/llm/            # LLM endpoint (stub)
    page.tsx            # welcome page
  components/
    welcome/            # welcome UI
    ui/                 # shared UI (later)
  features/
    check-in/           # Learning Check-in
    concern-intake/     # Concern Intake (staff)
    sas-triage/         # SAS Triage Console
    analytics/          # Continuity & Learning Loop
  lib/
    llm/                # LLM client helpers
    types/
  hooks/
```

Design docs at the repo root: `challenge.md`, `Sanad_Project_Description.md`.

## Principles (non-negotiable)

- No diagnosis or individual risk scores
- No surveillance — signals come from people, with consent
- No labels for students — strategies and options only
- Humans decide; AI suggests and routes
- No sharing without consent (except existing safety protocols)

## Current status

Welcome page only. Feature modules are scaffolded empty for the next build steps.
