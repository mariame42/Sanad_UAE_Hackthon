"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FaceLandmarker, FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import { emptySegment, partOf, type SegmentStats } from "./focusStats";

/**
 * `NEXT_PUBLIC_FOCUS_CAMERA=mock` swaps the webcam + model for a scripted gaze
 * (for presentations: no permission prompt, no internet, same numbers and UI).
 */
export const FOCUS_MOCK = process.env.NEXT_PUBLIC_FOCUS_CAMERA === "mock";

/** Pinned to the installed package version; the model is Google's float16 face landmarker. */
const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

/** A glance shorter than this does not break a focus stretch (blinks, quick checks). */
const LOOK_AWAY_MS = 800;
/** Looking back must hold this long before focus counts again. */
const LOOK_BACK_MS = 250;
const FRAME_MS = 66; // ~15 fps is plenty and keeps the laptop cool

export type FocusStatus = "off" | "starting" | "on" | "denied" | "error";
export type Gaze = "focused" | "away" | "noface";

export type FocusLive = {
  gaze: Gaze;
  /** Focus share for the whole session so far, 0–100. */
  pct: number;
  /** Current uninterrupted stretch, seconds. */
  streakSec: number;
  lookAways: number;
};

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

const MODEL_LOAD_MS = 20_000;

/** MediaPipe WASM prints INFO via console and Next shows it as [browser] errors. */
const MEDIAPIPE_NOISE =
  /face_landmarker|gl_context|XNNPACK|TensorFlow Lite|OpenGL error checking|vision_wasm|Sets FaceBlendshapesGraph|put_char|fd_write/i;

function silenceMediaPipeLogs() {
  const methods = ["log", "info", "warn", "debug", "error"] as const;
  const originals = Object.fromEntries(
    methods.map((m) => [m, console[m].bind(console)]),
  ) as Record<(typeof methods)[number], (...args: unknown[]) => void>;

  const quiet = (...args: unknown[]) => {
    const text = args
      .map((a) =>
        a instanceof Error ? `${a.message}\n${a.stack ?? ""}` : String(a),
      )
      .join(" ");
    return MEDIAPIPE_NOISE.test(text);
  };

  for (const m of methods) {
    console[m] = (...args: unknown[]) => {
      if (quiet(...args)) return;
      originals[m](...args);
    };
  }

  return () => {
    for (const m of methods) console[m] = originals[m];
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/** Load once per page; GPU first, CPU if the GPU delegate is unavailable. */
function loadLandmarker() {
  landmarkerPromise ??= (async () => {
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const fileset = await withTimeout(
      FilesetResolver.forVisionTasks(WASM_BASE),
      MODEL_LOAD_MS,
      "Focus model WASM",
    );
    const options = (delegate: "GPU" | "CPU") => ({
      baseOptions: { modelAssetPath: MODEL_URL, delegate },
      runningMode: "VIDEO" as const,
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    });
    try {
      return await withTimeout(
        FaceLandmarker.createFromOptions(fileset, options("GPU")),
        MODEL_LOAD_MS,
        "Focus model GPU",
      );
    } catch {
      return withTimeout(
        FaceLandmarker.createFromOptions(fileset, options("CPU")),
        MODEL_LOAD_MS,
        "Focus model CPU",
      );
    }
  })();
  landmarkerPromise.catch(() => {
    landmarkerPromise = null;
  });
  return landmarkerPromise;
}

/**
 * Is the student looking at the screen in this frame?
 * Head pose from the transformation matrix + eye direction from blendshapes;
 * no calibration needed. Thresholds are deliberately forgiving.
 */
function lookingAtScreen(r: FaceLandmarkerResult): Gaze {
  if (!r.faceLandmarks.length) return "noface";

  const m = r.facialTransformationMatrixes?.[0]?.data;
  if (m) {
    // Column-major 4×4: R[row][col] = m[col * 4 + row].
    const yaw = (Math.asin(Math.max(-1, Math.min(1, -m[2]))) * 180) / Math.PI;
    let pitch = (Math.atan2(m[6], m[10]) * 180) / Math.PI;
    if (pitch > 90) pitch -= 180;
    if (pitch < -90) pitch += 180;
    if (Math.abs(yaw) > 30 || Math.abs(pitch) > 25) return "away";
  }

  const shapes = r.faceBlendshapes?.[0]?.categories;
  if (shapes) {
    const score = (name: string) =>
      shapes.find((c) => c.categoryName === name)?.score ?? 0;
    const both = (a: string) => (score(`${a}Left`) + score(`${a}Right`)) / 2;
    if (both("eyeBlink") > 0.6) return "away"; // eyes closed (short blinks are smoothed out)
    const sideways = Math.max(
      (score("eyeLookOutLeft") + score("eyeLookInRight")) / 2,
      (score("eyeLookInLeft") + score("eyeLookOutRight")) / 2,
    );
    if (sideways > 0.6 || both("eyeLookUp") > 0.6 || both("eyeLookDown") > 0.75) {
      return "away";
    }
  }
  return "focused";
}

/** Small seeded PRNG so every mock run tells the same story. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Focus stretch lengths (s) per part for the mock: video holds attention best. */
const MOCK_STRETCH: Record<ReturnType<typeof partOf>, [number, number]> = {
  text: [5, 13],
  video: [14, 28],
  questions: [8, 18],
};

/** Scripted gaze: long focus stretches, short look-aways, the odd quick glance. */
function mockGaze(seed = 7) {
  const rand = mulberry32(seed);
  const between = ([a, b]: [number, number]) => (a + rand() * (b - a)) * 1000;
  let gaze: Gaze = "noface";
  let until = performance.now() + 600;
  return (now: number, segment: string): Gaze => {
    if (now < until) return gaze;
    if (gaze === "focused") {
      gaze = "away";
      // One in four is a glance short enough to be smoothed out.
      until = now + (rand() < 0.25 ? between([0.3, 0.6]) : between([1.2, 2.8]));
    } else {
      gaze = "focused";
      until = now + between(MOCK_STRETCH[partOf(segment)]);
    }
    return gaze;
  };
}

const EYE_COLOR = "rgba(77, 179, 176, 0.9)";
const IRIS_COLOR = "rgba(201, 162, 39, 0.95)";

function drawEyes(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  r: FaceLandmarkerResult,
  connections: {
    eyes: { start: number; end: number }[];
    irises: { start: number; end: number }[];
  },
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
  if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const pts = r.faceLandmarks[0];
  if (!pts) return;
  const w = canvas.width;
  const h = canvas.height;
  const stroke = (list: { start: number; end: number }[], color: string, width: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (const { start, end } of list) {
      const a = pts[start];
      const b = pts[end];
      if (!a || !b) continue;
      ctx.moveTo(a.x * w, a.y * h);
      ctx.lineTo(b.x * w, b.y * h);
    }
    ctx.stroke();
  };
  stroke(connections.eyes, EYE_COLOR, Math.max(1.5, w / 320));
  stroke(connections.irises, IRIS_COLOR, Math.max(2, w / 240));
}

/**
 * Webcam focus tracking for the Check-in. Everything runs in this tab:
 * frames go to the on-device model and are dropped; only the numbers stay,
 * and only in memory until the student chooses what to save.
 */
export function useFocusTracker(enabled: boolean, segment: string) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const segmentRef = useRef(segment);
  const statsRef = useRef<Record<string, SegmentStats>>({});
  const [status, setStatus] = useState<FocusStatus>("off");
  const [live, setLive] = useState<FocusLive>({
    gaze: "noface",
    pct: 0,
    streakSec: 0,
    lookAways: 0,
  });

  // Focus state machine, kept in refs so the frame loop never re-renders.
  const focusedRef = useRef(false);
  const pendingSinceRef = useRef<number | null>(null);
  const streakStartRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  const closeStretch = useCallback((now: number) => {
    if (streakStartRef.current === null) return;
    const seg = (statsRef.current[segmentRef.current] ??= emptySegment());
    seg.stretches.push(now - streakStartRef.current);
    streakStartRef.current = null;
  }, []);

  // Switching part closes the stretch in the old part and starts one in the new.
  useEffect(() => {
    if (segmentRef.current === segment) return;
    const now = performance.now();
    closeStretch(now);
    segmentRef.current = segment;
    if (focusedRef.current) streakStartRef.current = now;
  }, [segment, closeStretch]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    let attached: HTMLVideoElement | null = null;
    let raf = 0;
    let lastVideoTime = -1;
    let lastFrame = 0;
    let lastPublish = 0;
    const unmuteLogs = silenceMediaPipeLogs();

    /** Feed one gaze reading into the focus state machine and the per-part totals. */
    const update = (now: number, gaze: Gaze) => {
      const raw = gaze === "focused";

      // Hysteresis: a state must hold for a moment before it counts.
      if (raw === focusedRef.current) {
        pendingSinceRef.current = null;
      } else {
        pendingSinceRef.current ??= now;
        const hold = focusedRef.current ? LOOK_AWAY_MS : LOOK_BACK_MS;
        if (now - pendingSinceRef.current >= hold) {
          const at = pendingSinceRef.current;
          focusedRef.current = raw;
          pendingSinceRef.current = null;
          const seg = (statsRef.current[segmentRef.current] ??= emptySegment());
          if (raw) {
            streakStartRef.current = at;
          } else {
            seg.lookAways += 1;
            closeStretch(at);
          }
        }
      }

      const seg = (statsRef.current[segmentRef.current] ??= emptySegment());
      const dt = lastTickRef.current === null ? 0 : Math.min(now - lastTickRef.current, 250);
      lastTickRef.current = now;
      seg.trackedMs += dt;
      if (focusedRef.current) seg.onMs += dt;

      if (now - lastPublish > 250) {
        lastPublish = now;
        const all = Object.values(statsRef.current);
        const tracked = all.reduce((n, s) => n + s.trackedMs, 0);
        const on = all.reduce((n, s) => n + s.onMs, 0);
        setLive({
          gaze: focusedRef.current ? "focused" : gaze === "noface" ? "noface" : "away",
          pct: tracked ? Math.round((on / tracked) * 100) : 0,
          streakSec:
            streakStartRef.current === null
              ? 0
              : Math.round((now - streakStartRef.current) / 1000),
          lookAways: all.reduce((n, s) => n + s.lookAways, 0),
        });
      }
    };

    const tick = (landmarker: FaceLandmarker, connections: Parameters<typeof drawEyes>[3]) => {
      if (cancelled) return;
      raf = requestAnimationFrame(() => tick(landmarker, connections));
      const video = videoRef.current;
      const now = performance.now();
      if (!video || video.readyState < 2 || now - lastFrame < FRAME_MS) return;
      if (video.currentTime === lastVideoTime) return;
      lastVideoTime = video.currentTime;
      lastFrame = now;

      let result: FaceLandmarkerResult;
      try {
        result = landmarker.detectForVideo(video, now);
      } catch {
        return;
      }
      if (canvasRef.current) drawEyes(canvasRef.current, video, result, connections);
      update(now, lookingAtScreen(result));
    };

    const mockTick = (next: ReturnType<typeof mockGaze>) => {
      if (cancelled) return;
      raf = requestAnimationFrame(() => mockTick(next));
      const now = performance.now();
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      update(now, next(now, segmentRef.current));
    };

    if (FOCUS_MOCK) {
      // Same lifecycle as the real camera, minus the camera.
      const boot = setTimeout(() => {
        if (cancelled) return;
        setStatus("on");
        lastTickRef.current = null;
        mockTick(mockGaze());
      }, 900);
      queueMicrotask(() => !cancelled && setStatus("starting"));
      return () => {
        cancelled = true;
        clearTimeout(boot);
        cancelAnimationFrame(raf);
        closeStretch(performance.now());
        focusedRef.current = false;
        pendingSinceRef.current = null;
        lastTickRef.current = null;
        setStatus("off");
        unmuteLogs();
      };
    }

    (async () => {
      setStatus("starting");
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch (e) {
        if (!cancelled) {
          setStatus(e instanceof DOMException && e.name === "NotAllowedError" ? "denied" : "error");
        }
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      attached = videoRef.current;
      if (attached) {
        attached.srcObject = stream;
        await attached.play().catch(() => {});
      }
      try {
        const landmarker = await loadLandmarker();
        if (cancelled) return;
        const { FaceLandmarker } = await import("@mediapipe/tasks-vision");
        setStatus("on");
        lastTickRef.current = null;
        tick(landmarker, {
          eyes: [...FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, ...FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE],
          irises: [...FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, ...FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS],
        });
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      closeStretch(performance.now());
      focusedRef.current = false;
      pendingSinceRef.current = null;
      lastTickRef.current = null;
      stream?.getTracks().forEach((t) => t.stop());
      if (attached) attached.srcObject = null;
      setStatus("off");
      unmuteLogs();
    };
  }, [enabled, closeStretch]);

  /** Snapshot of everything measured so far (closes the running stretch first). */
  const snapshot = useCallback(() => {
    if (focusedRef.current) {
      const now = performance.now();
      closeStretch(now);
      streakStartRef.current = now;
    }
    return structuredClone(statsRef.current);
  }, [closeStretch]);

  const reset = useCallback(() => {
    statsRef.current = {};
    streakStartRef.current = focusedRef.current ? performance.now() : null;
  }, []);

  return { videoRef, canvasRef, status, live, snapshot, reset };
}
