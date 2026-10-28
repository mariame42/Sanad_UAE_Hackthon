# Sanad

Early Learning Support & Referral Platform

TDRA UAE Hackathon 2026 · Challenge Profile 20 (Zayed University) ·
Early Identification of Learning Support Needs

"Sanad" (سند) means support. Tagline: Early help, without labels.

## One-liner

Sanad helps students, frontline staff and Student Accessibility Services
(SAS) notice learning barriers early and route them to the right
support. Students give consent at every step and never receive a
diagnosis. Every case has a named human owner, and every student has a
clear path to recourse.

## Design principles: what Sanad will never do

No diagnosis. AI never infers a disability, a mental-health condition or
a "risk score" for an individual.

No surveillance. No passive monitoring of students. Every student-level
signal comes from the student or from a person who talked to them.

No labels. Students see strategies and options, never categories.

No decision without a human. AI suggests, summarizes and routes.
Qualified people decide.

No sharing without consent, except an existing safety or crisis
protocol.

## 1. The Support Ladder: a shared language (R1)

| Level \| Meaning \| Who can act \| What they can see \|

| --- \| --- \| --- \| --- \|

| L1 Learning difficulty \| An observable barrier in a task \| Anyone:
  student, faculty, TA, tutor, peer mentor \| Their own observation \|

| L2 Support need \| The student wants or accepts help \| Advisor,
  learning coach, learning center \| The student's chosen summary \|

| L3 Screening concern \| A pattern persists despite support, and the
  student agrees to SAS review \| SAS professionals only \| The case
  file shared with consent \|

| L4 Formal determination \| Assessment and accommodation decision \|
  Qualified assessors only, outside the AI \| Clinical records, never in
  Sanad analytics \|

Each level has its own entry rules, consent and data access. Faculty
never operate above L1.

## 2. Components

### A. Learning Check-in (student-facing, R3 and the silent beneficiary)

A short interactive activity: content as text, audio and video, plus a
number-sense check and a follow-the-dots hand-path check, with questions
after each content part. Students can toggle tools such as
text-to-speech, wider spacing, a dyslexia-friendly font and chunking.

The core works without a camera. Insights come from how answers change
across formats and tools.

Optional Focus Mode uses webcam gaze only to adapt pacing: it pauses the
video when the student looks away and slows text. Gaze is processed in
the browser, never stored and never sent.

Results are strategies, not learning styles. For example:
"Text-to-speech helped you answer 2 more questions correctly. Here's how
to turn it on in your LMS and Word."

Offered to everyone: at orientation, in first-year courses and inside
the LMS. It is never offered to an individual student because of a flag,
so taking it carries no stigma.

The student chooses what happens next:

Private: nothing is saved.

Saved for me: only the student sees it.

Talk to a learning coach: a summary goes to a coach (L2).

Ask SAS to look at this: the request goes to SAS for review (L3).

If results show a persistent pattern, Sanad says "Many students find it
useful to talk to someone about this" and offers a coach. It never says
"possible disability".

### B. Concern Desk (frontline network, R4)

A "Raise a concern" button inside the LMS for faculty, TAs, tutors,
advisors, peer mentors and help-desk staff.

Guided note: structured fields for what was observed, when and in which
task.

AI Language Guard rewrites diagnostic wording into observable facts. For
example, "seems dyslexic" becomes "difficulty with timed reading tasks,
weeks 3--5; strong oral contributions."

Conversation guide: a short script for approaching the student, with
"say this, not that" examples, in English and Arabic.

What a concern does:

It creates a support offer to the student through their advisor. It
never goes to SAS automatically.

The staff member can instead recommend the Check-in to the whole class,
which avoids singling anyone out.

Safety concerns go to the university's existing counseling crisis
protocol, not through the platform's normal logic.

Micro-training: 5-minute modules on non-diagnostic responding, with a
completion badge.

### C. Referral & Case Hub (R2)

Routing options: learning center, language support, academic advising,
SAS, counseling or career/wellbeing services.

AI suggests a route and explains why. A human confirms the route.

Language support is a separate path from screening, because difficulty
studying in a second language is not a learning disability.

Every case has a named owner, a response-time target (SLA), a status and
a handoff log.

Minimum necessary information: an AI-generated handoff summary contains
only what the next owner needs. The student approves it before it is
shared.

Capacity-aware: if SAS queues are full, the student immediately gets L2
support and sees an honest wait time. Sanad doesn't create demand it
can't serve.

Student Tracker: the student sees who owns their case, the current step
and the next step.

Recourse: one "I disagree" button lets the student contest a referral,
request a different owner, withdraw consent or delete their data, or
escalate to an ombudsperson or complaint process.

### D. Class Insights (R3, Universal Design for Learning)

Faculty see aggregated, course-level patterns only. For example: "38% of
the class struggled with the Module 3 reading; audio versions improved
scores in similar courses."

No individual student is ever flagged from LMS data.

Barriers are reduced for everyone, including students who will never
disclose.

### E. Outcomes & Equity Dashboard (R5)

Metrics: time from first signal to first support contact, referral
appropriateness (rated by the receiving professional), unmet demand and
wait times, opt-in rates, a student trust score (pulse survey) and
support effectiveness.

Equity view: compares outcomes by gender, language background, year and
campus. Only aggregated data is shown, and groups smaller than 10 people
are hidden.

Quarterly improvement review with SAS, Student Success, the
responsible-AI function and student representatives. Changes to
thresholds, routes and scripts are versioned and logged.

## 3. AI: what it does and doesn't do

| AI does \| AI never does \|

| --- \| --- \|

| Adapts the Check-in format and pacing \| Infers disability or
  mental-health conditions \|

| Turns diagnostic wording into observable facts \| Scores, ranks or
  flags individual students from LMS data \|

| Suggests a route and explains why \| Contacts a student without a
  human \|

| Summarizes handoffs with minimal data \| Makes referral, eligibility
  or accommodation decisions \|

| Detects class-level patterns \| Uses data to train models without
  approval \|

## 4. Consent, privacy and governance

Layered consent matches the student's choices (Private → Saved → Coach →
SAS), can be withdrawn at any time and explains in plain language what
each option means.

Role-based access: faculty see only "support offered / accepted".
Advisors see the summary. SAS see the shared file. An audit log records
every view.

Retention: check-in data is deleted after a set period unless the
student keeps it. L4 records stay in SAS systems, not in Sanad.

Compliance: UAE PDPL (Federal Decree-Law 45/2021), university data
governance, a DPIA before the pilot, a published model card, an LLM
hosted in the UAE and no vendor access to identifiable data.

Oversight: the university's responsible-AI and ethics function approves
the model and every change. A yearly external bias audit uses anonymized
data.

Family involvement: parents or sponsors are informed only if the student
explicitly authorizes it.

## 5. Accessibility of the tool itself

Arabic and English with full RTL support

WCAG 2.2 AA compliance, screen-reader tested, keyboard-only navigation

Captions and transcripts for all media

No camera required for anything

## 6. Integration

LTI 1.3: the Check-in and Concern Desk run inside the university LMS.

University SSO for sign-in.

Existing case systems: Sanad connects to SAS and counseling case systems
rather than replacing them.

## 7. Coverage of the challenge brief

| Brief item \| Covered by \|

| --- \| --- \|

| R1 Shared distinctions \| Support Ladder, Language Guard \|

| R2 Fragmented pathways \| Case Hub: owner, SLA, handoffs, routing \|

| R3 Reactive model \| Universal Check-in, Class Insights \|

| R4 Frontline confidence \| Concern Desk, conversation guide,
  micro-training \|

| R5 Continuous improvement \| Outcomes & Equity Dashboard, quarterly
  review \|

| Without labeling, monitoring or penalizing \| Design principles,
  camera-free core, no individual LMS flags \|

| Meaningful consent, proportionate information \| Layered consent,
  minimum-necessary summaries \|

| Clear ownership, human review, recourse \| Named owner,
  human-confirmed routing, "I disagree" button \|

| Silent beneficiary \| Private, universal, low-stigma Check-in \|

| Overlooked intermediary \| Concern Desk for the whole first-contact
  network \|

| Missing enabler \| Ladder, routing, capacity, governance and review
  cycle together \|

| Adaptive AI screening, analytics, LMS integration \| Adaptive
  Check-in, Class Insights, LTI 1.3 \|

| UAE strategies \| PDPL, National Policy for Empowering People of
  Determination, UAE AI Strategy 2031, UAE Charter for AI \|

## 8. Stakeholder coverage

SAS and qualified professionals: own L3--L4 and confirm routes.

Provost and Student Success leadership: use the dashboard and run the
quarterly review.

Privacy, ethics and responsible-AI functions: approve models and audit
the platform.

Students: control their data, see their case and have recourse.

Faculty, TAs, tutors, advisors, peer mentors: get the Concern Desk.

Disability advocates and student representatives: sit on the review
board and co-design the scripts.

Vendors and external analysts: see anonymized data only and make no
decisions.

## 9. Pilot KPIs (one semester, two colleges)

Median time from signal to first support contact: under 5 working days

At least 80% of referrals rated appropriate by the receiving
professional

Student trust score: 4 out of 5 or higher

No statistically significant equity gap in time to support

At least 25% of first-year students complete the Check-in

## 10. What we build for the hackathon

One web app with a role switcher (Student / Faculty / Advisor /
Leadership) and mock data.

### Must have (core of the demo)

| \# \| Feature \| How real \|

| --- \| --- \| --- \|

| 1 \| Check-in: text / audio / video / numbers / trace + questions +
  results screen with strategies + choice "keep private / coach / SAS"
  \| Fully working \|

| 2 \| Concern Desk form + AI Language Guard (LLM rewrites the note into
  neutral, observable language) \| Fully working --- the main AI moment
  \|

| 3 \| Case Hub: case list, case card with AI route suggestion and
  reasoning, "confirm / assign owner" buttons \| Working, mock data \|

| 4 \| Student view: case status + "I disagree" button \| Simple screen
  \|

| 5 \| Dashboard with 4--5 charts \| Static mock data \|

### Nice to have

Focus Mode with eye tracking (WebGazer.js): only pauses the video when
the student looks away, nothing stored

Arabic / English switch (RTL)

Class Insights screen

### Not needed for the hackathon

Real LMS integration (a slide about LTI 1.3 is enough)

Authentication (a role switcher is enough)

A real database (JSON or local storage is enough)

### Suggested stack

Next.js + Tailwind, one API route to an LLM for the Language Guard and
route suggestions, Recharts for the dashboard.

## 11. Demo script (3 minutes)

Faculty: writes a concern note "seems dyslexic". The Language Guard
rewrites it. The faculty member recommends the Check-in to the whole
class.

Student: takes the Check-in with the camera off, gets "text-to-speech
helped you", then chooses "Talk to a coach".

Advisor: sees the AI route suggestion and confirms it. The student asks
for SAS, so the case gets an owner and a logged handoff.

Student: sees the tracker and the "I disagree" button.

Leadership: sees the dashboard and the equity view.

Closing slide: "What Sanad never does".

## Open items to check before the pitch

Exact names of the UAE policy documents we cite

Which LMS Zayed University uses
