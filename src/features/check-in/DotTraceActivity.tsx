"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type Pt = { x: number; y: number };

/** Paths in 0–100 viewBox space (responsive). */
const PATHS: Pt[][] = [
  [
    { x: 12, y: 50 },
    { x: 32, y: 28 },
    { x: 52, y: 50 },
    { x: 72, y: 28 },
    { x: 88, y: 50 },
  ],
  [
    { x: 14, y: 22 },
    { x: 14, y: 78 },
    { x: 50, y: 78 },
    { x: 50, y: 22 },
    { x: 86, y: 22 },
    { x: 86, y: 78 },
  ],
  [
    { x: 18, y: 55 },
    { x: 32, y: 28 },
    { x: 48, y: 72 },
    { x: 64, y: 28 },
    { x: 78, y: 72 },
    { x: 88, y: 42 },
  ],
];

const HIT_R = 7;
const PASS_SCORE = 0.62;

type Props = {
  locale: "en" | "ar";
  onComplete: (result: { correct: number; total: number }) => void;
};

function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pointToSegment(p: Pt, a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
}

function pathError(stroke: Pt[], guide: Pt[]) {
  if (stroke.length < 2) return 1;
  let sum = 0;
  for (const p of stroke) {
    let best = Infinity;
    for (let i = 0; i < guide.length - 1; i++) {
      best = Math.min(best, pointToSegment(p, guide[i], guide[i + 1]));
    }
    sum += best;
  }
  return sum / stroke.length / 100;
}

function scoreTrial(stroke: Pt[], guide: Pt[]) {
  let hits = 0;
  let cursor = 0;
  for (const g of guide) {
    let found = false;
    for (let i = cursor; i < stroke.length; i++) {
      if (dist(stroke[i], g) <= HIT_R) {
        hits += 1;
        cursor = i;
        found = true;
        break;
      }
    }
    if (!found) break;
  }
  const hitRatio = hits / guide.length;
  const err = pathError(stroke, guide);
  const closeness = Math.max(0, 1 - err * 4);
  return hitRatio * 0.65 + closeness * 0.35;
}

export function DotTraceActivity({ locale, onComplete }: Props) {
  const ar = locale === "ar";
  const svgRef = useRef<SVGSVGElement>(null);
  const strokeRef = useRef<Pt[]>([]);
  const drawingRef = useRef(false);

  const [trial, setTrial] = useState(0);
  const [stroke, setStroke] = useState<Pt[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [trialDone, setTrialDone] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [hasStroke, setHasStroke] = useState(false);

  const guide = PATHS[trial];
  const guideLine = useMemo(
    () => guide.map((p) => `${p.x},${p.y}`).join(" "),
    [guide],
  );

  const toLocal = useCallback((clientX: number, clientY: number): Pt | null => {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return {
      x: ((clientX - r.left) / r.width) * 100,
      y: ((clientY - r.top) / r.height) * 100,
    };
  }, []);

  const appendPoint = useCallback(
    (clientX: number, clientY: number) => {
      const p = toLocal(clientX, clientY);
      if (!p) return;
      const prev = strokeRef.current;
      const last = prev[prev.length - 1];
      if (last && dist(last, p) < 0.8) return;
      const next = [...prev, p];
      strokeRef.current = next;
      setStroke(next);
      setHasStroke(true);
    },
    [toLocal],
  );

  function finishStroke() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const points = strokeRef.current;
    if (points.length < 4) {
      strokeRef.current = [];
      setStroke([]);
      setHasStroke(false);
      return;
    }
    const s = scoreTrial(points, guide);
    setLastScore(s);
    setTrialDone(true);
  }

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (trialDone) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    strokeRef.current = [];
    setStroke([]);
    setHasStroke(false);
    appendPoint(e.clientX, e.clientY);
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drawingRef.current || trialDone) return;
    appendPoint(e.clientX, e.clientY);
  }

  function onPointerUp() {
    finishStroke();
  }

  function retry() {
    drawingRef.current = false;
    strokeRef.current = [];
    setStroke([]);
    setHasStroke(false);
    setTrialDone(false);
    setLastScore(null);
  }

  function next() {
    if (lastScore === null) return;
    const nextScores = [...scores, lastScore];
    if (trial + 1 >= PATHS.length) {
      const correct = nextScores.filter((s) => s >= PASS_SCORE).length;
      onComplete({ correct, total: PATHS.length });
      return;
    }
    setScores(nextScores);
    setTrial((t) => t + 1);
    retry();
  }

  const strokeLine = stroke.map((p) => `${p.x},${p.y}`).join(" ");
  const passed = lastScore !== null && lastScore >= PASS_SCORE;

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--sanad-sea)]">
        {ar
          ? `المسار ${trial + 1} من ${PATHS.length}`
          : `Path ${trial + 1} of ${PATHS.length}`}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
        {ar ? "تتبع النقاط" : "Follow the dots"}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {ar
          ? "ارسم خطاً يصل النقاط بالترتيب — بإصبعك أو الماوس أو القلم. خذ وقتك. هذا ليس درجة، فقط ما يساعدك مع المهام اليدوية."
          : "Draw a line that connects the dots in order — finger, mouse, or stylus. Take your time. This is not a grade — just what helps you with hand tasks."}
      </p>

      <div
        className="mt-5 select-none overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] dark:border-slate-600 dark:bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)]"
        style={{ touchAction: "none" }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="mx-auto block h-[min(52vw,22rem)] w-full max-w-xl cursor-crosshair touch-none"
          role="img"
          aria-label={
            ar
              ? "لوحة تتبع النقاط. اسحب للربط بالترتيب."
              : "Dot tracing board. Drag to connect in order."
          }
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <polyline
            points={guideLine}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="1.8 1.8"
            className="text-slate-300 dark:text-slate-600"
          />
          {strokeLine ? (
            <polyline
              points={strokeLine}
              fill="none"
              stroke="var(--sanad-sea)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {guide.map((p, i) => (
            <g key={`${trial}-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="3.2"
                className="fill-white stroke-[var(--sanad-indigo)] dark:fill-slate-900"
                strokeWidth="0.7"
              />
              <text
                x={p.x}
                y={p.y + 1.1}
                textAnchor="middle"
                className="fill-[var(--sanad-indigo)] dark:fill-[#C5D0F0]"
                style={{ fontSize: "3.2px", fontWeight: 700 }}
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {trialDone && lastScore !== null ? (
        <p
          className={`mt-4 text-sm font-medium ${
            passed
              ? "text-[var(--sanad-sea)]"
              : "text-slate-600 dark:text-slate-300"
          }`}
          role="status"
        >
          {passed
            ? ar
              ? "مسار سلس — جاهز للتالي."
              : "Smooth path — ready for the next one."
            : ar
              ? "يمكنك إعادة المحاولة أو المتابعة. الإيقاع الهادئ مقبول."
              : "You can retry or continue. A calm pace is fine."}
        </p>
      ) : (
        <p className="mt-4 text-xs text-slate-400">
          {ar
            ? "ابدأ من 1 واسحب حتى آخر نقطة دون رفع الإصبع إن أمكن."
            : "Start at 1 and drag through to the last dot without lifting if you can."}
        </p>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        {trialDone ? (
          <>
            <Button type="button" variant="secondary" onClick={retry}>
              {ar ? "إعادة المحاولة" : "Try again"}
            </Button>
            <Button
              type="button"
              className="!bg-[var(--sanad-indigo)]"
              onClick={next}
            >
              {trial + 1 >= PATHS.length
                ? ar
                  ? "إنهاء المسارات"
                  : "Finish paths"
                : ar
                  ? "المسار التالي"
                  : "Next path"}
            </Button>
          </>
        ) : hasStroke ? (
          <Button type="button" variant="secondary" onClick={retry}>
            {ar ? "مسح" : "Clear"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
