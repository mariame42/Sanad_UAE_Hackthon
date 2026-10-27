/**
 * Language Guard lexicon — shared by the live highlighter (client) and the
 * offline rewrite fallback (server). Flags labels; never infers anything.
 */
import type { Locale } from "@/lib/types";

type Kind = "diagnosis" | "judgement";

type Term = {
  pattern: RegExp;
  kind: Kind;
  observable: Record<Locale, string>;
};

const EN_HEDGE =
  "(?:\\b(?:seems|is|looks|might be|may be|probably|maybe|clearly|definitely|has|have)\\s+)?(?:(?:a|an)\\s+)?";
const AR_HEDGE =
  "(?:يبدو\\s+(?:أنه\\s+|أنها\\s+)?)?(?:لديه\\s+|لديها\\s+|عنده\\s+|مصاب(?:ة)?\\s+ب)?";

const TERMS: Term[] = [
  {
    pattern: new RegExp(`${EN_HEDGE}\\bdyslexi\\w*|${AR_HEDGE}(?:عسر القراءة|ديسلكسيا|دسلكسيا)`, "giu"),
    kind: "diagnosis",
    observable: {
      en: "difficulty with reading tasks",
      ar: "صعوبة في مهام القراءة",
    },
  },
  {
    pattern: new RegExp(`${EN_HEDGE}\\bdyscalcul\\w*`, "giu"),
    kind: "diagnosis",
    observable: {
      en: "difficulty with number-based tasks",
      ar: "صعوبة في المهام الرقمية",
    },
  },
  {
    pattern: new RegExp(
      `${EN_HEDGE}(?:\\badhd\\b|\\bhyperactiv\\w*|\\bcan'?t focus\\b|\\battention (?:problem|issue|deficit)s?\\b)|${AR_HEDGE}(?:فرط الحركة|تشتت الانتباه|نقص الانتباه)`,
      "giu",
    ),
    kind: "diagnosis",
    observable: {
      en: "difficulty staying on task during long activities",
      ar: "صعوبة في الاستمرار بالمهام الطويلة",
    },
  },
  {
    pattern: new RegExp(
      `${EN_HEDGE}(?:\\bautis\\w*|\\bon the spectrum\\b|\\basperger\\w*)|${AR_HEDGE}(?:طيف التوحد|توحدي|التوحد)`,
      "giu",
    ),
    kind: "diagnosis",
    observable: {
      en: "works best with clear, predictable instructions",
      ar: "يعمل بشكل أفضل مع تعليمات واضحة ومتوقعة",
    },
  },
  {
    pattern: new RegExp(
      `${EN_HEDGE}(?:\\b(?:learning\\s+)?disab(?:led|ility|ilities)\\b|\\bspecial needs\\b)|${AR_HEDGE}(?:معاق(?:ة)?|إعاقة|ذوي الاحتياجات)`,
      "giu",
    ),
    kind: "diagnosis",
    observable: {
      en: "may benefit from additional learning support",
      ar: "قد يستفيد من دعم تعلّم إضافي",
    },
  },
  {
    pattern: new RegExp(
      `${EN_HEDGE}(?:\\banxious\\b|\\banxiety\\b|\\bpanic\\w*)|${AR_HEDGE}(?:قلق شديد|نوبات هلع|متوتر(?:ة)?)`,
      "giu",
    ),
    kind: "diagnosis",
    observable: {
      en: "appears uncomfortable during timed or public tasks",
      ar: "يبدو غير مرتاح في المهام المحددة بوقت أو العلنية",
    },
  },
  {
    pattern: new RegExp(
      `${EN_HEDGE}(?:\\bdepress\\w*|\\bbipolar\\b|\\bocd\\b|\\bmentally ill\\b)|${AR_HEDGE}(?:مكتئب(?:ة)?|اكتئاب)`,
      "giu",
    ),
    kind: "diagnosis",
    observable: {
      en: "reduced participation compared with earlier weeks",
      ar: "مشاركة أقل مقارنة بالأسابيع السابقة",
    },
  },
  {
    pattern: new RegExp(
      `${EN_HEDGE}(?:\\blazy\\b|\\bunmotivated\\b|\\bdoesn'?t care\\b|\\bcareless\\b)|${AR_HEDGE}(?:كسول(?:ة)?|غير مهتم(?:ة)?|مهمل(?:ة)?)`,
      "giu",
    ),
    kind: "judgement",
    observable: {
      en: "assignments submitted late or incomplete",
      ar: "تسليم الواجبات متأخرة أو غير مكتملة",
    },
  },
  {
    pattern: new RegExp(
      `${EN_HEDGE}(?:\\bslow learner\\b|\\bslow\\b|\\bnot (?:smart|bright)\\b|\\bweak student\\b)|${AR_HEDGE}(?:بطيء الفهم|بطيء|طالب ضعيف)`,
      "giu",
    ),
    kind: "judgement",
    observable: {
      en: "needs more time to complete tasks",
      ar: "يحتاج وقتاً أطول لإكمال المهام",
    },
  },
];

export type LabelFlag = {
  start: number;
  end: number;
  phrase: string;
  kind: Kind;
  observable: string;
};

export function findLabels(text: string, locale: Locale): LabelFlag[] {
  const flags: LabelFlag[] = [];
  for (const term of TERMS) {
    term.pattern.lastIndex = 0;
    for (const m of text.matchAll(term.pattern)) {
      const phrase = m[0].trim();
      if (!phrase) continue;
      const start = (m.index ?? 0) + m[0].indexOf(phrase);
      flags.push({
        start,
        end: start + phrase.length,
        phrase,
        kind: term.kind,
        observable: term.observable[locale],
      });
    }
  }
  flags.sort((a, b) => a.start - b.start);
  // Drop overlaps, keep the earliest/longest.
  return flags.filter((f, i) => i === 0 || f.start >= flags[i - 1].end);
}

export function segmentText(
  text: string,
  flags: LabelFlag[],
): { text: string; flag?: LabelFlag }[] {
  const out: { text: string; flag?: LabelFlag }[] = [];
  let cursor = 0;
  for (const f of flags) {
    if (f.start > cursor) out.push({ text: text.slice(cursor, f.start) });
    out.push({ text: text.slice(f.start, f.end), flag: f });
    cursor = f.end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor) });
  return out;
}

export type GuardContext = { course?: string; task?: string; when?: string };

/** Deterministic rewrite used when no LLM is configured or it fails. */
export function rewriteFallback(
  note: string,
  ctx: GuardContext,
  locale: Locale,
): string {
  const flags = findLabels(note, locale);
  let rest = note;
  for (const f of [...flags].reverse()) {
    rest = rest.slice(0, f.start) + rest.slice(f.end);
  }
  // Keep only leftover clauses that still carry content once fillers are gone.
  const FILLER =
    /^(?:and|or|but|also|probably|maybe|really|very|the|student|he|she|they|و|أو|لكن|ربما|الطالب|الطالبة|هو|هي)$/iu;
  const leftovers = rest
    .split(/[,;.،؛—–]+|\s+-\s+/u)
    .map((clause) => {
      const words = clause.split(/\s+/).filter(Boolean);
      while (words.length && FILLER.test(words[0])) words.shift();
      while (words.length && FILLER.test(words[words.length - 1])) words.pop();
      return words.join(" ");
    })
    .filter((clause) => clause.split(" ").length >= 2);

  const observations = [...new Set(flags.map((f) => f.observable))];
  observations.push(...leftovers);
  const context = [ctx.course, ctx.task, ctx.when].filter(Boolean).join(", ");

  if (locale === "ar") {
    const body = observations.join("؛ ") || "صعوبة ملحوظة في مهمة محددة";
    return `${context ? `لوحظ في ${context}: ` : ""}${body}. لا يتضمن ذلك أي تشخيص — يُستكمل بحوار مع الطالب.`;
  }
  const body = observations.join("; ") || "difficulty observed on a specific task";
  return `${context ? `Observed in ${context}: ` : ""}${body}. No diagnosis implied — to be confirmed in a conversation with the student.`;
}
