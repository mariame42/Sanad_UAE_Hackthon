export type ActivityId =
  | "read"
  | "listen"
  | "watch"
  | "timed"
  | "memory"
  | "visual_verbal"
  | "tool_trial";

export type Activity = {
  id: ActivityId;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  transcriptEn?: string;
  transcriptAr?: string;
  questions: {
    id: string;
    promptEn: string;
    promptAr: string;
    optionsEn: string[];
    optionsAr: string[];
    correctIndex: number;
  }[];
};

export const PASSAGE_EN =
  "Zayed University students often juggle lectures, labs, and group projects. When readings are long, some learners benefit from hearing the text, wider spacing, or breaking the page into smaller chunks. Support works best when it is offered early, with consent, and without labels.";

export const PASSAGE_AR =
  "غالباً ما يوازن طلاب جامعة زايد بين المحاضرات والمختبرات والمشاريع الجماعية. عندما تكون القراءات طويلة، يستفيد بعض المتعلمين من سماع النص أو تباعد أوسع أو تقسيم الصفحة إلى أجزاء أصغر. الدعم أفضل عندما يُقدَّم مبكراً وبموافقة ودون تصنيفات.";

export const activities: Activity[] = [
  {
    id: "read",
    titleEn: "1. Read (text)",
    titleAr: "1. قراءة (نص)",
    bodyEn: PASSAGE_EN,
    bodyAr: PASSAGE_AR,
    questions: [
      {
        id: "r1",
        promptEn: "What helps some learners with long readings?",
        promptAr: "ما الذي يساعد بعض المتعلمين مع القراءات الطويلة؟",
        optionsEn: [
          "Hearing the text or chunking",
          "Skipping consent",
          "Public labels",
          "Waiting for a crisis",
        ],
        optionsAr: [
          "سماع النص أو التقسيم",
          "تخطي الموافقة",
          "تصنيفات علنية",
          "انتظار الأزمة",
        ],
        correctIndex: 0,
      },
      {
        id: "r2",
        promptEn: "Support works best when it is…",
        promptAr: "يعمل الدعم بشكل أفضل عندما يكون…",
        optionsEn: [
          "Early, with consent, without labels",
          "Forced and anonymous",
          "Diagnostic first",
          "Faculty-only",
        ],
        optionsAr: [
          "مبكراً وبموافقة ودون تصنيفات",
          "قسرياً ومجهولاً",
          "تشخيصياً أولاً",
          "لأعضاء هيئة التدريس فقط",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "listen",
    titleEn: "2. Listen (audio)",
    titleAr: "2. استماع (صوت)",
    bodyEn:
      "Play the audio (or use Text-to-speech on the transcript), then answer. Same ideas as the reading.",
    bodyAr:
      "شغّل الصوت (أو استخدم تحويل النص إلى كلام للنص المكتوب) ثم أجب. نفس أفكار القراءة.",
    transcriptEn: PASSAGE_EN,
    transcriptAr: PASSAGE_AR,
    questions: [
      {
        id: "l1",
        promptEn: "According to the passage, labels should be…",
        promptAr: "وفقاً للنص، يجب أن تكون التصنيفات…",
        optionsEn: ["Avoided", "Required", "Public", "Automatic"],
        optionsAr: ["متجنَّبة", "مطلوبة", "علنية", "تلقائية"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "watch",
    titleEn: "3. Watch (video)",
    titleAr: "3. مشاهدة (فيديو)",
    bodyEn:
      "Watch the short campus clip (or read captions). Focus on the message: different needs, same goals.",
    bodyAr:
      "شاهد مقطع الحرم القصير (أو اقرأ الترجمة). الرسالة: احتياجات مختلفة، أهداف واحدة.",
    transcriptEn:
      "Different needs. Same goals. Early help without labels keeps support dignified for every student.",
    transcriptAr:
      "احتياجات مختلفة. أهداف واحدة. المساعدة المبكرة بلا تصنيفات تحفظ كرامة الدعم لكل طالب.",
    questions: [
      {
        id: "v1",
        promptEn: "The campus message emphasizes…",
        promptAr: "تؤكد رسالة الحرم على…",
        optionsEn: [
          "Different needs, same goals",
          "One learning style",
          "Diagnosis first",
          "Surveillance",
        ],
        optionsAr: [
          "احتياجات مختلفة وأهداف واحدة",
          "أسلوب تعلّم واحد",
          "التشخيص أولاً",
          "المراقبة",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "timed",
    titleEn: "4. Timed word list",
    titleAr: "4. قائمة كلمات بوقت",
    bodyEn:
      "You have ~45 seconds. Mark which words appeared in the passage: consent, lecture, diagnosis, chunking, crisis.",
    bodyAr:
      "لديك نحو 45 ثانية. حدّد الكلمات التي ظهرت في النص: موافقة، محاضرة، تشخيص، تقسيم، أزمة.",
    questions: [
      {
        id: "t1",
        promptEn: "Which word was NOT in the supportive message?",
        promptAr: "أي كلمة لم تكن في رسالة الدعم؟",
        optionsEn: ["Diagnosis as a requirement", "Consent", "Chunking", "Lecture"],
        optionsAr: ["التشخيص كمتطلب", "موافقة", "تقسيم", "محاضرة"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "memory",
    titleEn: "5. Working-memory span",
    titleAr: "5. مدى الذاكرة العاملة",
    bodyEn: "Remember this sequence, then choose it: 7 — Blue — Gate — 2",
    bodyAr: "احفظ التسلسل ثم اختره: 7 — أزرق — بوابة — 2",
    questions: [
      {
        id: "m1",
        promptEn: "Which sequence did you see?",
        promptAr: "أي تسلسل رأيت؟",
        optionsEn: [
          "7 — Blue — Gate — 2",
          "2 — Gate — Blue — 7",
          "7 — Green — Gate — 2",
          "Blue — 7 — 2 — Gate",
        ],
        optionsAr: [
          "7 — أزرق — بوابة — 2",
          "2 — بوابة — أزرق — 7",
          "7 — أخضر — بوابة — 2",
          "أزرق — 7 — 2 — بوابة",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "visual_verbal",
    titleEn: "6. Visual vs verbal instructions",
    titleAr: "6. تعليمات بصرية مقابل لفظية",
    bodyEn:
      "Verbal: Circle the campus service that owns L3 screening. Visual: [Student] → [Coach L2] → [SAS L3].",
    bodyAr:
      "لفظي: ضع دائرة حول الخدمة التي تملك إحالة L3. بصري: [طالب] ← [مدرب L2] ← [خدمات الإتاحة L3].",
    questions: [
      {
        id: "vv1",
        promptEn: "Who owns L3 screening concern review?",
        promptAr: "من يملك مراجعة قلق الإحالة L3؟",
        optionsEn: ["SAS professionals", "Any faculty alone", "Vendors", "Parents only"],
        optionsAr: [
          "متخصصو خدمات الإتاحة",
          "أي عضو هيئة تدريس وحده",
          "الموردون",
          "أولياء الأمور فقط",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "tool_trial",
    titleEn: "7. Tool trial",
    titleAr: "7. تجربة الأدوات",
    bodyEn:
      "Turn on text-to-speech, wider spacing, dyslexia-friendly font, or chunking, then re-read a short line and answer.",
    bodyAr:
      "فعّل تحويل النص إلى كلام أو التباعد أو الخط المريح أو التقسيم، ثم أعد قراءة سطر قصير وأجب.",
    questions: [
      {
        id: "tt1",
        promptEn: "Which statement matches Sanad?",
        promptAr: "أي عبارة تطابق سند؟",
        optionsEn: [
          "Tools are strategies, not labels",
          "Tools diagnose disability",
          "Camera is required",
          "Results are risk scores",
        ],
        optionsAr: [
          "الأدوات استراتيجيات وليست تصنيفات",
          "الأدوات تشخّص الإعاقة",
          "الكاميرا مطلوبة",
          "النتائج درجات خطر",
        ],
        correctIndex: 0,
      },
    ],
  },
];

export const QUICK_IDS: ActivityId[] = ["read", "listen", "watch", "tool_trial"];
export const FULL_IDS: ActivityId[] = activities.map((a) => a.id);
