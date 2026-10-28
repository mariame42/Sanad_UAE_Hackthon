export type ActivityId =
  | "read"
  | "watch"
  | "numbers"
  | "trace"
  | "timed"
  | "memory"
  | "visual_verbal"
  | "tool_trial";

export type ModeId = "read" | "watch";

/** Journey bar steps (content modes + tools). */
export type JourneyId = ModeId | "numbers" | "trace" | "tools";

export type Question = {
  id: string;
  promptEn: string;
  promptAr: string;
  optionsEn: string[];
  optionsAr: string[];
  correctIndex: number;
};

export type Activity = {
  id: ActivityId;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  transcriptEn?: string;
  transcriptAr?: string;
  questions: Question[];
};

/** Shared reading for the calm Check-in path — speaks to you, not about "learners". */
export const PASSAGE_TITLE_EN = "Why a good night's sleep helps you remember";
export const PASSAGE_TITLE_AR = "لماذا يساعدك نومٌ جيد على التذكّر";

export const PASSAGE_TOPIC_EN = "Sleep and memory";
export const PASSAGE_TOPIC_AR = "النوم والذاكرة";

export const PASSAGE_CHUNKS_EN = [
  "After you study, your brain keeps working while you sleep. It sorts what you learned and stores the useful parts for later.",
  "When you sleep seven to nine hours after studying, you usually recall more than when you stay up late to review.",
  "A short rest before a test can help you feel clearer than another late-night cram session.",
];

export const PASSAGE_CHUNKS_AR = [
  "بعد أن تدرس، يستمر دماغك في العمل أثناء نومك. يرتّب ما تعلّمته ويخزّن الأجزاء المفيدة لاحقاً.",
  "عندما تنام سبع إلى تسع ساعات بعد الدراسة، تتذكر عادة أكثر مما لو سهرت للمراجعة.",
  "راحة قصيرة قبل الاختبار قد تساعدك على التركيز أكثر من سهرٍ آخر للمذاكرة.",
];

/** Portrait (720x1280) clip shown in Watch mode. */
export const WATCH_VIDEO_SRC = "/videos/How_Sleep_Sorts_Your_Memories.mp4";

export const PASSAGE_EN = PASSAGE_CHUNKS_EN.join(" ");
export const PASSAGE_AR = PASSAGE_CHUNKS_AR.join(" ");

const sharedQuestions: Question[] = [
  {
    id: "r1",
    promptEn: "What can help you remember what you studied?",
    promptAr: "ما الذي يمكن أن يساعدك على تذكّر ما درست؟",
    optionsEn: [
      "Sleeping after you study",
      "Skipping rest entirely",
      "Only cramming all night",
      "Avoiding sleep before a test",
    ],
    optionsAr: [
      "النوم بعد الدراسة",
      "تجنّب الراحة تماماً",
      "السهر للمذاكرة فقط",
      "تجنّب النوم قبل الاختبار",
    ],
    correctIndex: 0,
  },
  {
    id: "r2",
    promptEn: "What helps your brain store new information?",
    promptAr: "ما الذي يساعد دماغك على تخزين المعلومات الجديدة؟",
    optionsEn: [
      "Cramming all night",
      "Sleeping after study",
      "Skipping meals",
      "Avoiding rest",
    ],
    optionsAr: [
      "السهر للمذاكرة طوال الليل",
      "النوم بعد الدراسة",
      "تخطي الوجبات",
      "تجنّب الراحة",
    ],
    correctIndex: 1,
  },
  {
    id: "l1",
    promptEn: "Compared with staying up late, sleeping after study usually helps you…",
    promptAr: "مقارنةً بالسهر، النوم بعد الدراسة يساعدك عادة على…",
    optionsEn: [
      "Recall more",
      "Forget faster",
      "Need more labels",
      "Skip consent",
    ],
    optionsAr: [
      "التذكّر أكثر",
      "النسيان أسرع",
      "المزيد من التصنيفات",
      "تخطي الموافقة",
    ],
    correctIndex: 0,
  },
  {
    id: "v1",
    promptEn: "Before a test, what may help you feel clearer?",
    promptAr: "قبل الاختبار، ما الذي قد يساعدك على الشعور بصفاء أكبر؟",
    optionsEn: [
      "A short rest",
      "Another all-night cram",
      "Skipping sleep",
      "Studying without breaks",
    ],
    optionsAr: [
      "راحة قصيرة",
      "سهر آخر للمذاكرة",
      "تخطي النوم",
      "الدراسة دون فواصل",
    ],
    correctIndex: 0,
  },
  {
    id: "v2",
    promptEn: "While you sleep, what does your brain do with what you studied?",
    promptAr: "أثناء نومك، ماذا يفعل دماغك بما درست؟",
    optionsEn: [
      "It sorts and stores useful parts",
      "It deletes everything you learned",
      "It only works if you cram",
      "It waits for a diagnosis label",
    ],
    optionsAr: [
      "يرتّب ويخزّن الأجزاء المفيدة",
      "يمحو كل ما تعلّمته",
      "يعمل فقط إذا سهرت للمذاكرة",
      "ينتظر تصنيفاً تشخيصياً",
    ],
    correctIndex: 0,
  },
  {
    id: "v3",
    promptEn: "Sleep after study usually helps you…",
    promptAr: "النوم بعد الدراسة يساعدك عادة على…",
    optionsEn: [
      "Recall more later",
      "Need more labels",
      "Skip rest forever",
      "Avoid tools that fit you",
    ],
    optionsAr: [
      "التذكّر أكثر لاحقاً",
      "المزيد من التصنيفات",
      "تجنّب الراحة إلى الأبد",
      "تجنّب الأدوات التي تناسبك",
    ],
    correctIndex: 0,
  },
];

export const activities: Activity[] = [
  {
    id: "read",
    titleEn: "Read",
    titleAr: "قراءة",
    bodyEn: PASSAGE_EN,
    bodyAr: PASSAGE_AR,
    questions: [sharedQuestions[0], sharedQuestions[1], sharedQuestions[2]],
  },
  {
    id: "watch",
    titleEn: "Watch",
    titleAr: "مشاهدة",
    bodyEn: PASSAGE_EN,
    bodyAr: PASSAGE_AR,
    transcriptEn:
      "Different needs. Same goals. Sleep, rest, and tools that fit you keep learning dignified — without labels.",
    transcriptAr:
      "احتياجات مختلفة. أهداف واحدة. النوم والراحة والأدوات التي تناسبك تحفظ كرامة التعلّم — بلا تصنيفات.",
    questions: [sharedQuestions[3], sharedQuestions[4], sharedQuestions[5]],
  },
  {
    id: "numbers",
    titleEn: "Number sense",
    titleAr: "حس الأعداد",
    bodyEn:
      "A short number check — same idea as reading: what helps you with quantities, not a label about you. Take your time. You can use scrap paper if that feels easier.",
    bodyAr:
      "تحقق قصير من الأعداد — نفس فكرة القراءة: ما الذي يساعدك مع الكميات، لا تصنيف عنك. خذ وقتك. يمكنك استخدام ورقة مسودة إن سهّل ذلك.",
    questions: [
      {
        id: "n1",
        promptEn: "Which amount is larger?",
        promptAr: "أي مقدار أكبر؟",
        optionsEn: ["47", "74", "They are equal", "Cannot tell"],
        optionsAr: ["47", "74", "متساويان", "لا يمكن التحديد"],
        correctIndex: 1,
      },
      {
        id: "n2",
        promptEn: "You buy 3 packs. Each pack has 4 pens. How many pens in total?",
        promptAr: "اشتريت 3 علب. كل علبة فيها 4 أقلام. كم قلماً في المجموع؟",
        optionsEn: ["7", "12", "34", "43"],
        optionsAr: ["7", "12", "34", "43"],
        correctIndex: 1,
      },
      {
        id: "n3",
        promptEn: "In the number 352, what does the digit 5 stand for?",
        promptAr: "في العدد 352، ماذا يمثل الرقم 5؟",
        optionsEn: ["5 ones", "5 tens", "5 hundreds", "5 thousands"],
        optionsAr: ["5 آحاد", "5 عشرات", "5 مئات", "5 آلاف"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "trace",
    titleEn: "Follow the dots",
    titleAr: "تتبع النقاط",
    bodyEn:
      "A short hand-path check — same idea as reading: what helps you draw or write more comfortably, not a label about you. Use a finger, mouse, or stylus.",
    bodyAr:
      "تحقق قصير لمسار اليد — نفس فكرة القراءة: ما الذي يساعدك على الرسم أو الكتابة براحة أكبر، لا تصنيف عنك. استخدم إصبعاً أو فأرة أو قلماً.",
    questions: [],
  },
  {
    id: "timed",
    titleEn: "Timed word list",
    titleAr: "قائمة كلمات بوقت",
    bodyEn:
      "You have ~45 seconds. Mark which words appeared in the passage: sleep, recall, cram, diagnosis, rest.",
    bodyAr:
      "لديك نحو 45 ثانية. حدّد الكلمات التي ظهرت في النص: نوم، تذكّر، مذاكرة مكثفة، تشخيص، راحة.",
    questions: [
      {
        id: "t1",
        promptEn: "Which word was NOT in the supportive message for you?",
        promptAr: "أي كلمة لم تكن في رسالة الدعم الموجّهة لك؟",
        optionsEn: ["Diagnosis as a requirement", "Sleep", "Recall", "Rest"],
        optionsAr: ["التشخيص كمتطلب", "نوم", "تذكّر", "راحة"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "memory",
    titleEn: "Working-memory span",
    titleAr: "مدى الذاكرة العاملة",
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
    titleEn: "Visual vs verbal instructions",
    titleAr: "تعليمات بصرية مقابل لفظية",
    bodyEn:
      "Verbal: Circle the campus service that owns L3 screening. Visual: [You] → [Coach L2] → [SAS L3].",
    bodyAr:
      "لفظي: ضع دائرة حول الخدمة التي تملك إحالة L3. بصري: [أنت] ← [مدرب L2] ← [خدمات الإتاحة L3].",
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
    titleEn: "Tool trial",
    titleAr: "تجربة الأدوات",
    bodyEn: PASSAGE_EN,
    bodyAr: PASSAGE_AR,
    questions: [
      {
        id: "tt1",
        promptEn: "Which statement matches how Sanad supports you?",
        promptAr: "أي عبارة تطابق كيف يدعمك سند؟",
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

export const QUICK_IDS: ActivityId[] = ["read", "watch", "numbers", "trace"];
export const FULL_IDS: ActivityId[] = [
  "read",
  "watch",
  "numbers",
  "trace",
  "timed",
  "memory",
  "visual_verbal",
  "tool_trial",
];

export const JOURNEY_STEPS: {
  id: JourneyId;
  labelEn: string;
  labelAr: string;
  hintEn: string;
  hintAr: string;
}[] = [
  {
    id: "read",
    labelEn: "Read",
    labelAr: "قراءة",
    hintEn: "About 3 minutes",
    hintAr: "نحو 3 دقائق",
  },
  {
    id: "watch",
    labelEn: "Watch",
    labelAr: "مشاهدة",
    hintEn: "About 3 minutes",
    hintAr: "نحو 3 دقائق",
  },
  {
    id: "numbers",
    labelEn: "Numbers",
    labelAr: "أعداد",
    hintEn: "About 2 minutes",
    hintAr: "نحو دقيقتين",
  },
  {
    id: "trace",
    labelEn: "Trace",
    labelAr: "تتبع",
    hintEn: "About 2 minutes",
    hintAr: "نحو دقيقتين",
  },
  {
    id: "tools",
    labelEn: "Your tools",
    labelAr: "أدواتك",
    hintEn: "See what helped",
    hintAr: "انظر ما ساعدك",
  },
];
