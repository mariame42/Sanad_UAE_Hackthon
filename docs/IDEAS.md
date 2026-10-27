# Big idea: diagnose the barrier, not the student

> Today every support system asks: **“What is wrong with this student?”**
> Sanad asks: **“What in this course is getting in the way — and what works for
> this student?”**

This is the social model of disability and Universal Design for Learning (UDL),
turned into a product loop. Two halves, one cycle.

Status: **implemented in the demo** (`/passport`, `/barriers`).
Builds on the Check-in tool trials (accuracy with vs without a tool); Barrier Map
replaces the old Class Insights page.

---

## 1. Learning Passport — evidence of what works, not proof of what's wrong

**Problem today.** To get extra time or another format, a student usually needs
a medical diagnosis: expensive, slow (months), stigmatising. Most students never
ask.

**Idea.** The student runs small self-experiments in Sanad — the same kind of
task with and without a tool (text-to-speech, no timer, captions…). Sanad turns
the results into a **Learning Passport**:

> Text-to-speech: +40% accuracy (6 trials) · No timer: +25% · Captioned video:
> no difference

- **Owned by the student**, not the university. Shared one course at a time
  (one click / QR), revocable at any moment.
- **Evidence, not a diagnosis.** For light, flexible adjustments (extra time,
  alternative format) the instructor can agree immediately — no SAS queue, no
  medical paperwork.
- **Portable** across courses and semesters.

**Guardrails.** Formal SAS accommodations still follow the university process;
the Passport is pitched as a pilot for flexible adjustments only. No scores
about the person, only “with tool vs without tool” comparisons.

## 2. Barrier Map — diagnose the course, not the person

Anonymous, aggregated Check-in results (groups of **n ≥ 10** only) form a map
of barriers by course × week:

> BIO101, week 3: 38% of students do markedly better with text-to-speech.
> Likely barrier: scanned PDF without a text layer.
>
> MATH120: 45-second timed quiz is a barrier for 31%. Without the timer the gap
> disappears.

Faculty get a concrete fix (“replace the PDF”, “drop the hard timer”) and the
barrier is removed **for everyone at once** — no one has to be identified, no
labels are possible, no individual data is used.

## The loop

```
student self-experiments ──► Learning Passport   (helps one student now)
          │ anonymised, n ≥ 10
          ▼
      Barrier Map ──► course fixed                (helps everyone now)
          │
          ▼
fewer referrals ──► SAS capacity freed for students who truly need it
```

The current model catches students one by one and puts them in a queue. This
loop removes the reason the queue exists — directly answering the brief's
pain point that SAS demand exceeds capacity.

## Pitch demo (proposed)

1. Student finishes Check-in → **Learning Passport** appears → shares it with
   an instructor → instructor accepts an adjustment in one click.
2. Leadership → **Barrier Map** heatmap (course × week); BIO101 week 3 glows.
3. Click **“Apply fix: accessible PDF”** → counters recalculate live:
   “~40 students won't need a referral · SAS wait 9 → 4 days”
   (clearly labelled as a simulation).
4. Closing line: *“We don't look for what's wrong with students. We find what's
   wrong with the learning — and fix it for everyone.”*

## Why it fits TDRA / the brief

- **Scales** to every university and school in the UAE; national view stays
  aggregated.
- **Strengthens the principles** instead of bending them: no diagnosis, no
  surveillance, consent-first, minimum necessary data.
- **New success metric:** barriers removed, not students flagged.

## Open questions

- Will the university accept Passport evidence for flexible adjustments in a
  pilot? (policy decision)
- Which LMS does Zayed University use — can “fix” actions (accessible PDF,
  timer settings) be pushed there directly?
- Impact numbers in the demo are simulated; real ones need a pilot.

## Implementation

| Piece | Where | Notes |
| --- | --- | --- |
| Evidence model | `src/lib/passport.ts` | `buildPassportEvidence()`: accuracy with vs without each tool, plus text / audio / video formats |
| Passport data | `MockStoreProvider` | Rebuilt from Check-in attempts (any consent except “private”); shares carry a code |
| Passport UI | `/passport` | Student card with photo, evidence, formats; share per course with code; revoke |
| Faculty view | `/passport` (faculty role) | Only active shares; accept / “let's talk first”; the student sees the answer |
| Barrier Map | `/barriers`, `src/lib/mock/barriers.ts` | Heatmap course × week, sequential ramp, n < 10 hatched and hidden |
| Fix simulation | `projectImpact()` | Apply / undo fix → students reached, referrals avoided, SAS wait |
| Live counters | `/dashboard` | Passport adjustments accepted, barriers fixed |
| Demo script | `DemoConductor` | 7 steps around the loop |

Not built: QR sharing, pushing fixes into the LMS, real aggregation pipeline.
