import { jsPDF } from "jspdf";
import { STUDENT_PROFILE } from "@/lib/student-profile";
import type { LearningPassport } from "@/lib/types";

const INDIGO: [number, number, number] = [27, 42, 74];
const SEA: [number, number, number] = [47, 158, 149];
const GOLD: [number, number, number] = [138, 109, 31];
const MUTED: [number, number, number] = [100, 116, 139];
const LINE: [number, number, number] = [226, 232, 240];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function pct(n: number | null) {
  return n === null ? "—" : `${n}%`;
}

/**
 * Download a clean one-page Learning Passport PDF (English layout for reliable fonts).
 * Evidence only — no diagnosis language.
 */
export async function exportPassportPdf(passport: LearningPassport) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const contentW = pageW - marginX * 2;
  let y = 48;

  // Header bar
  doc.setFillColor(...INDIGO);
  doc.rect(0, 0, pageW, 72, "F");
  doc.setFillColor(...SEA);
  doc.rect(0, 72, pageW, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Sanad  ·  Learning Passport", marginX, 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Evidence of what works  ·  Not a diagnosis", marginX, 54);

  y = 104;

  // Identity card
  doc.setDrawColor(...LINE);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginX, y, contentW, 88, 6, 6, "FD");

  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("STUDENT", marginX + 16, y + 20);

  doc.setTextColor(...INDIGO);
  doc.setFontSize(16);
  doc.text(passport.studentName || STUDENT_PROFILE.nameEn, marginX + 16, y + 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const idLine = [
    `ID: ${passport.studentId || STUDENT_PROFILE.id}`,
    STUDENT_PROFILE.universityEn,
    STUDENT_PROFILE.programEn,
  ].join("   ·   ");
  doc.text(idLine, marginX + 16, y + 58);
  doc.text(`Updated: ${formatDate(passport.updatedAt)}`, marginX + 16, y + 74);

  y += 112;

  // Guardrail
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const guard =
    "This Passport records flexible learning adjustments only (with tool vs without). Formal SAS accommodations still follow university process. Owned by the student — share or revoke anytime.";
  const guardLines = doc.splitTextToSize(guard, contentW);
  doc.text(guardLines, marginX, y);
  y += guardLines.length * 11 + 18;

  // Evidence section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...INDIGO);
  doc.text("1. What helped in Check-in", marginX, y);
  y += 8;
  doc.setDrawColor(...SEA);
  doc.setLineWidth(1.5);
  doc.line(marginX, y, marginX + 160, y);
  y += 18;

  // Table header
  const colTool = marginX;
  const colWith = marginX + contentW * 0.48;
  const colWithout = marginX + contentW * 0.66;
  const colDelta = marginX + contentW * 0.84;

  doc.setFillColor(...INDIGO);
  doc.rect(marginX, y - 10, contentW, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Tool / strategy", colTool + 8, y);
  doc.text("With", colWith, y);
  doc.text("Without", colWithout, y);
  doc.text("Delta", colDelta, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  passport.evidence.forEach((e, i) => {
    if (y > pageH - 80) {
      doc.addPage();
      y = 48;
    }
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, y - 10, contentW, 22, "F");
    }
    doc.setTextColor(...INDIGO);
    doc.setFontSize(9);
    doc.text(e.labelEn, colTool + 8, y);
    doc.setTextColor(...MUTED);
    doc.text(pct(e.withPct), colWith, y);
    doc.text(pct(e.withoutPct), colWithout, y);
    const delta =
      e.deltaPct === null
        ? "—"
        : e.deltaPct > 0
          ? `+${e.deltaPct}%`
          : `${e.deltaPct}%`;
    doc.setTextColor(...(e.deltaPct !== null && e.deltaPct > 0 ? SEA : MUTED));
    doc.setFont("helvetica", "bold");
    doc.text(delta, colDelta, y);
    doc.setFont("helvetica", "normal");
    y += 22;
  });

  y += 16;

  // Formats
  if (y > pageH - 120) {
    doc.addPage();
    y = 48;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...INDIGO);
  doc.text("2. Where it clicked (by format)", marginX, y);
  y += 8;
  doc.setDrawColor(...SEA);
  doc.line(marginX, y, marginX + 180, y);
  y += 20;

  const cols = Math.min(5, Math.max(1, passport.formats.length));
  const gap = 6;
  const boxW = (contentW - gap * (cols - 1)) / cols;
  passport.formats.forEach((f, i) => {
    const x = marginX + i * (boxW + gap);
    doc.setDrawColor(...LINE);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, boxW, 52, 4, 4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(...GOLD);
    doc.text(f.format.toUpperCase(), x + 8, y + 18);
    doc.setTextColor(...INDIGO);
    doc.setFontSize(14);
    doc.text(pct(f.pct), x + 8, y + 40);
  });
  y += 72;

  // Strategies
  if (passport.strategyTitles.length) {
    if (y > pageH - 100) {
      doc.addPage();
      y = 48;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INDIGO);
    doc.text("3. Strategies to keep", marginX, y);
    y += 8;
    doc.setDrawColor(...SEA);
    doc.line(marginX, y, marginX + 140, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    passport.strategyTitles.forEach((title) => {
      const lines = doc.splitTextToSize(`•  ${title}`, contentW);
      doc.text(lines, marginX, y);
      y += lines.length * 12 + 4;
    });
    y += 8;
  }

  // Focus (optional)
  if (passport.focus) {
    if (y > pageH - 90) {
      doc.addPage();
      y = 48;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INDIGO);
    doc.text("4. Focus session (optional camera)", marginX, y);
    y += 8;
    doc.setDrawColor(...SEA);
    doc.line(marginX, y, marginX + 200, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(
      `Focused ${passport.focus.pct}% of tracked time  ·  Longest stretch ${passport.focus.longestSec}s  ·  Look-aways ${passport.focus.lookAways}`,
      marginX,
      y,
    );
    y += 14;
    doc.setFontSize(8);
    doc.text(
      "Processed on-device. Video was never stored or uploaded.",
      marginX,
      y,
    );
    y += 20;
  }

  // Active shares
  const active = passport.shares.filter((s) => !s.revokedAt);
  if (active.length) {
    if (y > pageH - 80) {
      doc.addPage();
      y = 48;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INDIGO);
    doc.text("Shared with (revocable)", marginX, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    active.forEach((s) => {
      doc.text(`${s.course}  ·  ${s.code}  ·  ${formatDate(s.sharedAt)}`, marginX, y);
      y += 12;
    });
  }

  // Footer
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...LINE);
    doc.line(marginX, pageH - 36, pageW - marginX, pageH - 36);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(
      "Sanad — Early help, without labels. Student-owned · Not a diagnosis · Zayed University demo",
      marginX,
      pageH - 22,
    );
    doc.text(`Page ${p} of ${pages}`, pageW - marginX, pageH - 22, {
      align: "right",
    });
  }

  const slug = (passport.studentName || "passport")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  doc.save(`sanad-learning-passport-${slug || "export"}.pdf`);
}
