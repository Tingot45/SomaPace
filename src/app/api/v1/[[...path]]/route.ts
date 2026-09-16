import { NextRequest, NextResponse } from "next/server";

// --- IN-MEMORY DATABASE & CONFIGS ---

const ADMIN_PHONE = "+254700000000";
const STUDENT_PHONE = "+254711111111";

let currentUser = {
  id: "wanjiku-123",
  firstName: "Wanjiku",
  lastName: "Kamau",
  fullName: "Wanjiku Kamau",
  phone: STUDENT_PHONE,
  role: "student" as const,
  grade: 6,
  subjects: ["mathematics", "english"],
  xp: 120,
  streak: 3,
  level: 2,
  onboardingComplete: true,
  createdAt: new Date().toISOString(),
};

const adminUser = {
  id: "admin-123",
  firstName: "SomaPace",
  lastName: "Admin",
  fullName: "SomaPace Admin",
  phone: ADMIN_PHONE,
  role: "admin" as const,
  grade: 10,
  subjects: ["mathematics", "english"],
  xp: 1500,
  streak: 12,
  level: 10,
  onboardingComplete: true,
  createdAt: new Date().toISOString(),
};

const subjects = [
  {
    id: "mathematics",
    name: "Mathematics",
    slug: "mathematics",
    emoji: "📐",
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    gradeRange: [4, 10] as [number, number],
    topics: 2,
    progress: 50,
  },
  {
    id: "english",
    name: "English",
    slug: "english",
    emoji: "📚",
    color: "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    gradeRange: [4, 10] as [number, number],
    topics: 1,
    progress: 0,
  },
  {
    id: "kiswahili",
    name: "Kiswahili",
    slug: "kiswahili",
    emoji: "🌍",
    color: "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    gradeRange: [4, 10] as [number, number],
    topics: 0,
    progress: 0,
  },
  {
    id: "integrated-science",
    name: "Integrated Science",
    slug: "integrated-science",
    emoji: "🧪",
    color: "bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    gradeRange: [4, 10] as [number, number],
    topics: 0,
    progress: 0,
  },
  {
    id: "social-studies",
    name: "Social Studies",
    slug: "social-studies",
    emoji: "🗺️",
    color: "bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
    gradeRange: [4, 10] as [number, number],
    topics: 0,
    progress: 0,
  },
];

let topics = [
  {
    id: "understanding-fractions",
    subjectId: "mathematics",
    title: "Understanding Fractions",
    description: "Learn what fractions are, numerator and denominator, proper vs improper fractions with local Kenyan examples.",
    difficulty: "easy" as const,
    grade: [6],
    lessonCount: 1,
    quizCount: 1,
    flashcardCount: 4,
    practiceCount: 1,
    progress: { completed: true, percent: 100 },
    estimatedMinutes: 10,
  },
  {
    id: "adding-fractions",
    subjectId: "mathematics",
    title: "Adding and Subtracting Fractions",
    description: "Master adding and subtracting fractions with same or different denominators using real-life shopping math.",
    difficulty: "medium" as const,
    grade: [6],
    lessonCount: 1,
    quizCount: 1,
    flashcardCount: 2,
    practiceCount: 1,
    progress: { completed: false, percent: 0 },
    estimatedMinutes: 12,
  },
  {
    id: "nouns",
    subjectId: "english",
    title: "Proper and Common Nouns",
    description: "Understand nouns in English with examples from Kenyan landmarks, cities, and people.",
    difficulty: "easy" as const,
    grade: [6],
    lessonCount: 1,
    quizCount: 1,
    flashcardCount: 1,
    practiceCount: 1,
    progress: { completed: false, percent: 0 },
    estimatedMinutes: 10,
  },
];

const lessons: Record<string, any> = {
  "understanding-fractions": {
    id: "understanding-fractions-lesson",
    topicId: "understanding-fractions",
    title: "Understanding Fractions",
    status: "published",
    createdAt: new Date().toISOString(),
    progress: { completed: true, percent: 100 },
    content: {
      title: "Understanding Fractions",
      subject: "Mathematics",
      grade: [6],
      readingTimeMinutes: 5,
      objectives: [
        "Define what a fraction is",
        "Identify the numerator and denominator",
        "Recognize different types of fractions",
      ],
      sections: [
        {
          type: "hook",
          title: "Introduction",
          content: "Did you know? When Mama Njeri buys a full chapati and divides it into 4 equal pieces for her children, each child gets 1/4 of the chapati. That's a fraction!",
        },
        {
          type: "explanation",
          title: "What is a Fraction?",
          content: "A fraction is a way of representing a part of a whole. Think of a full plate of ugali. If you share it equally between 2 people, each person gets half (1/2) of the ugali. In mathematics, we write fractions as two numbers separated by a line: the top number is called the numerator and the bottom number is called the denominator. The numerator tells us how many parts we have, and the denominator tells us how many equal parts the whole is divided into.",
        },
        {
          type: "explanation",
          title: "Types of Fractions",
          content: "There are three main types of fractions: proper fractions (where the numerator is less than the denominator, like 3/4), improper fractions (where the numerator is greater than or equal to the denominator, like 5/3), and mixed numbers (a whole number combined with a fraction, like 2 1/3). In Kenya, when you buy mitungi (scoops) of maize at the market, you might get 2 and a half scoops - that's a mixed number!",
        },
        {
          type: "worked_example",
          title: "Sharing Mandazis",
          content: [
            "1. Mama Achieng has 3 mandazis to share equally among 4 children.",
            "2. Each mandazi can be divided into 4 equal pieces = 12 pieces total.",
            "3. Each child gets 12 ÷ 4 = 3 pieces.",
            "4. Since each piece is 1/4 of a mandazi, each child gets 3/4 of a mandazi.",
          ],
        },
        {
          type: "kenyan_application",
          title: "Fractions in Kenyan Daily Life",
          content: [
            "At Wakulima Market in Nairobi, a farmer sells 3/4 of his tomato harvest and keeps 1/4 for his family.",
            "When making chai for visitors, if a recipe calls for 2 1/2 cups of milk and you only have 1 cup, you need 1/2 cup more.",
          ],
        },
        {
          type: "misconception",
          title: "Common Misconceptions",
          subsections: [
            { heading: "Myth: A bigger denominator means a bigger fraction", body: "Actually, 1/8 is smaller than 1/4 because the pizza is cut into more pieces!" },
            { heading: "Myth: Improper fractions are always wrong", body: "Improper fractions like 7/4 are perfectly valid and just mean more than one whole." },
          ],
        },
        {
          type: "summary",
          title: "Summary",
          content: "Fractions are parts of a whole. The numerator is the top number (parts we have) and the denominator is the bottom number (total equal parts). We use fractions daily - from sharing food to measuring ingredients.",
        },
      ],
    },
  },
  "adding-fractions": {
    id: "adding-fractions-lesson",
    topicId: "adding-fractions",
    title: "Adding and Subtracting Fractions",
    status: "published",
    createdAt: new Date().toISOString(),
    progress: { completed: false, percent: 0 },
    content: {
      title: "Adding and Subtracting Fractions",
      subject: "Mathematics",
      grade: [6],
      readingTimeMinutes: 6,
      objectives: [
        "Add and subtract fractions with the same denominator",
        "Add and subtract fractions with different denominators",
        "Apply addition and subtraction to real-life shopping problems",
      ],
      sections: [
        {
          type: "hook",
          title: "Introduction",
          content: "If you have 1/4 of a watermelon and your brother gives you another 2/4 of the same watermelon, how much watermelon do you have in total? Let's find out how to easily add them!",
        },
        {
          type: "explanation",
          title: "Adding with Same Denominators",
          content: "When fractions have the same denominator (the bottom number), adding them is very easy. You simply add the numerators (the top numbers) and keep the denominator the same. For example, 1/4 + 2/4 = (1 + 2)/4 = 3/4. This is because the whole is still cut into the same size pieces, you just have more of them.",
        },
        {
          type: "explanation",
          title: "Adding with Different Denominators",
          content: "If the denominators are different, like 1/2 and 1/3, we cannot add them directly because the pieces are different sizes. We first need to find a Common Denominator (usually the Lowest Common Multiple or LCM of the denominators). For 2 and 3, the LCM is 6. We convert 1/2 into 3/6, and 1/3 into 2/6. Now we can add: 3/6 + 2/6 = 5/6.",
        },
        {
          type: "worked_example",
          title: "Shopping for Sugar",
          content: [
            "1. You buy 1/2 kg of sugar at the duka.",
            "2. Your sister buys 3/4 kg of sugar.",
            "3. To find the total sugar, we calculate 1/2 + 3/4.",
            "4. The LCM of 2 and 4 is 4. Convert 1/2 to 2/4.",
            "5. Add: 2/4 + 3/4 = 5/4, which is 1 1/4 kg.",
          ],
        },
        {
          type: "summary",
          title: "Summary",
          content: "To add fractions with the same denominator, add the top numbers. For different denominators, find the LCM first, convert the fractions, then add.",
        },
      ],
    },
  },
  "nouns": {
    id: "nouns-lesson",
    topicId: "nouns",
    title: "Proper and Common Nouns",
    status: "published",
    createdAt: new Date().toISOString(),
    progress: { completed: false, percent: 0 },
    content: {
      title: "Proper and Common Nouns",
      subject: "English",
      grade: [6],
      readingTimeMinutes: 4,
      objectives: [
        "Distinguish between proper and common nouns",
        "Use capitalization correctly with proper nouns",
        "Identify nouns in given sentences",
      ],
      sections: [
        {
          type: "hook",
          title: "Introduction",
          content: "Everything around us has a name - from the 'city' we live in to the specific name of that city like 'Nairobi'. In English, these names are called Nouns!",
        },
        {
          type: "explanation",
          title: "What is a Noun?",
          content: "A noun is a naming word. It names a person, place, thing, or idea. Examples include teacher, classroom, book, and happiness.",
        },
        {
          type: "explanation",
          title: "Common Nouns vs. Proper Nouns",
          content: "Common nouns are general names for people, places, or things (e.g., river, country, boy). They do not start with a capital letter unless they begin a sentence. Proper nouns are specific names of unique people, places, or things (e.g., River Tana, Kenya, Jomo). Proper nouns ALWAYS start with a capital letter!",
        },
        {
          type: "worked_example",
          title: "Spotting the Capitals",
          content: [
            "Sentence: 'last week, maria visited mount kenya.'",
            "Correction: 'Last week, Maria visited Mount Kenya.'",
            "Explanation: 'Maria' is a proper noun (person's name) and 'Mount Kenya' is a proper noun (specific mountain place), so they must be capitalized.",
          ],
        },
        {
          type: "summary",
          title: "Summary",
          content: "Common nouns are general, proper nouns are specific and capitalized.",
        },
      ],
    },
  },
};

const quizzes: Record<string, any> = {
  "understanding-fractions": {
    id: "understanding-fractions-quiz",
    topicId: "understanding-fractions",
    title: "Fractions Basics Quiz",
    passingScore: 70,
    questions: [
      {
        id: "q1",
        prompt: "What is the numerator in the fraction 3/5?",
        type: "mcq",
        options: ["3", "5", "8", "15"],
        correctIndex: 0,
        explanation: "The numerator is the top number, which is 3.",
      },
      {
        id: "q2",
        prompt: "Mama Wambui has 2/3 of a cake. She gives 1/3 to her neighbour. How much cake does she have left?",
        type: "mcq",
        options: ["1/3", "1/2", "2/3", "1/6"],
        correctIndex: 0,
        explanation: "2/3 - 1/3 = 1/3. She has 1/3 of the cake left.",
      },
      {
        id: "q3",
        prompt: "Which fraction is equivalent to 1/2?",
        type: "mcq",
        options: ["2/3", "3/6", "4/5", "1/4"],
        correctIndex: 1,
        explanation: "3/6 = 1/2 because 3 divided by 6 equals 0.5.",
      },
    ],
  },
  "adding-fractions": {
    id: "adding-fractions-quiz",
    topicId: "adding-fractions",
    title: "Adding Fractions Quiz",
    passingScore: 70,
    questions: [
      {
        id: "aq1",
        prompt: "What is 1/4 + 2/4?",
        type: "mcq",
        options: ["3/8", "3/4", "1/2", "3/16"],
        correctIndex: 1,
        explanation: "Since denominators are the same, 1/4 + 2/4 = (1+2)/4 = 3/4.",
      },
      {
        id: "aq2",
        prompt: "What is 1/2 + 1/4?",
        type: "mcq",
        options: ["2/6", "3/4", "1/2", "5/4"],
        correctIndex: 1,
        explanation: "LCM of 2 and 4 is 4. Convert 1/2 to 2/4. 2/4 + 1/4 = 3/4.",
      },
    ],
  },
  "nouns": {
    id: "nouns-quiz",
    topicId: "nouns",
    title: "Nouns Basics Quiz",
    passingScore: 70,
    questions: [
      {
        id: "nq1",
        prompt: "Which of the following is a proper noun?",
        type: "mcq",
        options: ["city", "country", "Nairobi", "river"],
        correctIndex: 2,
        explanation: "Nairobi is a specific name of a city, so it is a proper noun.",
      },
    ],
  },
};

const flashcards: Record<string, any[]> = {
  "understanding-fractions": [
    { id: "c1", topicId: "understanding-fractions", front: "What is a fraction?", back: "A fraction is a number representing a part of a whole, written as two numbers separated by a line (e.g., 3/4).", hint: "Think of chapati sharing" },
    { id: "c2", topicId: "understanding-fractions", front: "What is the numerator?", back: "The numerator is the top number in a fraction, telling us how many parts we have.", hint: "Top number" },
    { id: "c3", topicId: "understanding-fractions", front: "What is a proper fraction?", back: "A proper fraction has a numerator smaller than the denominator (e.g., 2/5). It represents less than one whole.", hint: "Numerator < denominator" },
    { id: "c4", topicId: "understanding-fractions", front: "Give a real-life example of an improper fraction from Kenya.", back: "If 5 matatu seats are shared among 3 families equally, each family gets 5/3 seats worth - an improper fraction representing more than one whole.", hint: "Numerator > denominator" },
  ],
  "adding-fractions": [
    { id: "ac1", topicId: "adding-fractions", front: "How do you add fractions with the same denominator?", back: "Add the numerators together and keep the denominator the same.", hint: "Simple addition of top numbers" },
    { id: "ac2", topicId: "adding-fractions", front: "What is the LCM of 3 and 5?", back: "15 is the Lowest Common Multiple.", hint: "LCM" },
  ],
  "nouns": [
    { id: "nc1", topicId: "nouns", front: "What is a common noun?", back: "A general name for a person, place, or thing.", hint: "e.g., car, school" },
  ],
};

const practiceQuestions: Record<string, any[]> = {
  "understanding-fractions": [
    {
      id: "p1",
      topicId: "understanding-fractions",
      prompt: "A farmer at Wakulima Market divides 3/4 of his mangoes equally among 4 children. What fraction does each child get?",
      type: "mcq",
      options: ["3/16", "3/4", "4/3", "1/4"],
      correctAnswer: "3/16",
      explanation: "3/4 ÷ 4 = 3/4 × 1/4 = 3/16 of the mangoes.",
      difficulty: "medium",
      hint: "Think about what dividing by 4 means.",
    },
  ],
  "adding-fractions": [
    {
      id: "ap1",
      topicId: "adding-fractions",
      prompt: "At a birthday, John eats 1/8 of the cake, and Alice eats 3/8. What fraction is remaining?",
      type: "mcq",
      options: ["1/2", "3/8", "1/4", "5/8"],
      correctAnswer: "1/2",
      explanation: "They ate 1/8 + 3/8 = 4/8 = 1/2. Remaining is 1 - 1/2 = 1/2.",
      difficulty: "medium",
      hint: "Add their shares first, then subtract from 1.",
    },
  ],
  "nouns": [
    {
      id: "np1",
      topicId: "nouns",
      prompt: "Identify the proper noun in: 'The boy went to Kisumu.'",
      type: "mcq",
      options: ["boy", "went", "Kisumu", "The"],
      correctAnswer: "Kisumu",
      explanation: "Kisumu is the specific name of a city, so it is proper.",
      difficulty: "easy",
      hint: "Look for capital letters.",
    },
  ],
};

let materials = [
  {
    id: "mat-fractions",
    filename: "fractions_grade6.pdf",
    grade: 6,
    subject: "mathematics",
    status: "processed" as const,
    description: "Kenyan curriculum Grade 6 fractions overview",
    createdAt: new Date().toISOString(),
    sizeBytes: 102400,
  },
];

let pendingReviews = [
  {
    id: "rev-1",
    title: "Fractions in Multiples",
    subject: "mathematics",
    grade: 6,
    sourceMaterialId: "mat-fractions",
    sourceMaterialName: "fractions_grade6.pdf",
    lessonContent: {
      title: "Fractions in Multiples",
      subject: "Mathematics",
      grade: [6],
      readingTimeMinutes: 5,
      objectives: ["Identify multiples of fractions", "Apply to sharing division"],
      sections: [
        { type: "explanation", title: "Overview", content: "Multiplying fractions by whole numbers is like repeated addition..." },
      ],
    },
    status: "pending" as "pending" | "approved" | "rejected",
    createdAt: new Date().toISOString(),
  },
];

let generationJobs: any[] = [];

// --- HELPER FUNCTION TO GET CURRENT AUTH USER FROM REQUEST HEADER ---

function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.includes("admin")) {
    return adminUser;
  }
  return currentUser;
}

// --- CONTROLLER FOR ALL REQUEST METHODS ---

async function handleRequest(req: NextRequest, { params }: { params: { path?: string[] } }) {
  const url = new URL(req.url);
  const pathParts = params.path ?? [];
  const fullPath = "/" + pathParts.join("/");
  const method = req.method;

  try {
    // --- AUTHENTICATION ROUTES ---
    if (fullPath === "/auth/login") {
      const body = await req.json();
      const user = body.phone === ADMIN_PHONE ? adminUser : currentUser;
      return NextResponse.json({
        user,
        token: user.role === "admin" ? "mock-token-admin" : "mock-token-student",
        refreshToken: "mock-refresh-token",
      });
    }

    if (fullPath === "/auth/register") {
      const body = await req.json();
      currentUser = {
        ...currentUser,
        firstName: body.firstName || "Wanjiku",
        lastName: body.lastName || "Kamau",
        fullName: `${body.firstName || "Wanjiku"} ${body.lastName || "Kamau"}`,
        phone: body.phone,
        grade: body.grade || 6,
      };
      return NextResponse.json({
        user: currentUser,
        token: "mock-token-student",
        refreshToken: "mock-refresh-token",
      });
    }

    if (fullPath === "/auth/me") {
      const user = getAuthUser(req);
      return NextResponse.json(user);
    }

    if (fullPath === "/auth/refresh") {
      return NextResponse.json({
        token: "mock-token-refreshed",
        refreshToken: "mock-refresh-token",
      });
    }

    // --- SUBJECTS & TOPICS ---
    if (fullPath === "/subjects") {
      return NextResponse.json({ subjects });
    }

    // Match GET /subjects/:subjectId/topics
    if (pathParts[0] === "subjects" && pathParts[2] === "topics" && method === "GET") {
      const subjectId = pathParts[1];
      const filtered = topics.filter((t) => t.subjectId === subjectId);
      return NextResponse.json({
        topics: filtered,
        total: filtered.length,
      });
    }

    // Match GET /topics/:topicId
    if (pathParts[0] === "topics" && pathParts.length === 2 && method === "GET") {
      const topicId = pathParts[1];
      const topic = topics.find((t) => t.id === topicId);
      if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
      return NextResponse.json(topic);
    }

    // Match GET /topics/:topicId/lesson
    if (pathParts[0] === "topics" && pathParts[2] === "lesson" && method === "GET") {
      const topicId = pathParts[1];
      const lesson = lessons[topicId];
      if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      return NextResponse.json(lesson);
    }

    // Match GET /topics/:topicId/quiz
    if (pathParts[0] === "topics" && pathParts[2] === "quiz" && method === "GET") {
      const topicId = pathParts[1];
      const quiz = quizzes[topicId];
      if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      return NextResponse.json(quiz);
    }

    // Match GET /topics/:topicId/flashcards
    if (pathParts[0] === "topics" && pathParts[2] === "flashcards" && method === "GET") {
      const topicId = pathParts[1];
      const list = flashcards[topicId] ?? [];
      return NextResponse.json({
        flashcards: list,
        total: list.length,
      });
    }

    // Match GET /topics/:topicId/practice
    if (pathParts[0] === "topics" && pathParts[2] === "practice" && method === "GET") {
      const topicId = pathParts[1];
      const list = practiceQuestions[topicId] ?? [];
      return NextResponse.json({
        questions: list,
      });
    }

    // --- PAYMENTS ---
    if (fullPath === "/payments/initiate") {
      const body = await req.json();
      return NextResponse.json({
        orderId: "order_" + Math.random().toString(36).substr(2, 9),
        checkoutUrl: "#",
        mpesaStkPush: true,
        amount: 700,
      });
    }

    if (pathParts[0] === "payments" && pathParts[2] === "status" && method === "GET") {
      const orderId = pathParts[1];
      return NextResponse.json({
        status: "completed",
        orderId,
        amount: 700,
      });
    }

    // --- STUDENT DASHBOARD ---
    if (fullPath === "/dashboard") {
      const user = getAuthUser(req);
      const data = {
        user: {
          fullName: user.fullName,
          grade: user.grade,
          streak: user.streak,
          xp: user.xp,
          level: user.level,
        },
        continueLearning: topics[0],
        recommendation: {
          topicId: "adding-fractions",
          title: "Adding and Subtracting Fractions",
          minutes: 12,
          subject: "Mathematics",
        },
        weakTopics: [],
        recentActivity: [
          { id: "act1", type: "lesson_complete", title: "Understanding Fractions", at: new Date().toISOString(), subject: "mathematics" },
          { id: "act2", type: "quiz_complete", title: "Fractions Basics Quiz", at: new Date().toISOString(), subject: "mathematics" },
        ],
        weeklyMinutes: [10, 15, 0, 12, 8, 20, 15],
        badges: [
          { id: "b1", name: "Fast Starter", emoji: "⚡", earnedAt: new Date().toISOString() },
          { id: "b2", name: "Fraction Master", emoji: "🍕", earnedAt: new Date().toISOString() },
        ],
      };
      return NextResponse.json(data);
    }

    // --- SUBMIT PROGRESS & QUIZ RESULTS ---
    if (pathParts[0] === "lessons" && pathParts[2] === "progress" && method === "POST") {
      const lessonId = pathParts[1];
      currentUser.xp += 15;
      return NextResponse.json({ xpEarned: 15 });
    }

    if (pathParts[0] === "quizzes" && pathParts[2] === "submit" && method === "POST") {
      const quizId = pathParts[1];
      const body = await req.json();
      const answers = body.answers ?? {};

      // Calculate score based on correct answers
      const quizData = Object.values(quizzes).find((q: any) => q.id === quizId) as any;
      let correctCount = 0;
      const explanations: any[] = [];

      if (quizData) {
        quizData.questions.forEach((q: any, i: number) => {
          const userAns = answers[i];
          const isCorrect = userAns === q.correctIndex;
          if (isCorrect) correctCount++;
          explanations.push({
            questionIndex: i,
            correct: isCorrect,
            explanation: q.explanation,
          });
        });
      }

      const score = quizData ? Math.round((correctCount / quizData.questions.length) * 100) : 100;
      const passed = score >= (quizData?.passingScore ?? 70);
      const xpEarned = passed ? 30 : 5;
      currentUser.xp += xpEarned;

      return NextResponse.json({
        score,
        passed,
        xpEarned,
        explanations,
      });
    }

    // Match PATCH /flashcards/:rating/review or PATCH /flashcards/:id/review
    if (pathParts[0] === "flashcards" && pathParts[2] === "review" && method === "PATCH") {
      return NextResponse.json({ status: "ok" });
    }

    // --- ADMIN ENDPOINTS ---
    if (fullPath === "/admin/materials") {
      if (method === "GET") {
        return NextResponse.json({
          materials,
          total: materials.length,
        });
      }
      if (method === "POST") {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const metadataStr = formData.get("metadata") as string;
        const meta = metadataStr ? JSON.parse(metadataStr) : { grade: 6, subject: "mathematics" };

        const newMat = {
          id: "mat-" + Math.random().toString(36).substr(2, 9),
          filename: file ? file.name : "uploaded_material.pdf",
          grade: Number(meta.grade) || 6,
          subject: meta.subject || "mathematics",
          status: "processed" as const,
          description: meta.description || "Uploaded curriculum PDF",
          createdAt: new Date().toISOString(),
          sizeBytes: file ? file.size : 204800,
        };

        materials.unshift(newMat);

        // Also mock creating a review
        const newReview = {
          id: "rev-" + Math.random().toString(36).substr(2, 9),
          title: "Lessons from " + newMat.filename,
          subject: newMat.subject,
          grade: newMat.grade,
          sourceMaterialId: newMat.id,
          sourceMaterialName: newMat.filename,
          lessonContent: {
            title: "Exploring " + newMat.filename.replace(".pdf", ""),
            subject: newMat.subject.toUpperCase(),
            grade: [newMat.grade],
            readingTimeMinutes: 5,
            objectives: ["Understand main points of source material", "Connect with Kenyan applications"],
            sections: [
              { type: "explanation", title: "Introduction", content: "Based on the uploaded curriculum material..." },
            ],
          },
          status: "pending" as const,
          createdAt: new Date().toISOString(),
        };
        pendingReviews.unshift(newReview);

        return NextResponse.json(newMat);
      }
    }

    if (pathParts[0] === "admin" && pathParts[1] === "materials" && method === "DELETE") {
      const matId = pathParts[2];
      materials = materials.filter((m) => m.id !== matId);
      return new NextResponse(null, { status: 204 });
    }

    if (pathParts[0] === "admin" && pathParts[1] === "materials" && pathParts[3] === "reprocess" && method === "POST") {
      return NextResponse.json({ jobId: "job-" + Math.random().toString(36).substr(2, 9) });
    }

    if (fullPath === "/admin/stats") {
      return NextResponse.json({
        totals: {
          users: 124,
          students: 118,
          materials: materials.length,
          lessonsGenerated: Object.keys(lessons).length,
          revenueKES: 82600,
          pendingReviews: pendingReviews.length,
        },
        recentActivity: [
          { id: "act1", type: "signup", description: "Wanjiku Kamau registered as student (Grade 6)", at: new Date().toISOString() },
          { id: "act2", type: "upload", description: "Material fractions_grade6.pdf uploaded successfully", at: new Date().toISOString() },
        ],
        lessonsPerSubject: {
          "mathematics": 2,
          "english": 1,
          "kiswahili": 0,
        },
        weeklySignups: [5, 8, 12, 10, 15, 20, 25],
      });
    }

    if (fullPath === "/admin/reviews") {
      return NextResponse.json({
        reviews: pendingReviews,
        total: pendingReviews.length,
      });
    }

    if (pathParts[0] === "admin" && pathParts[1] === "reviews" && pathParts[3] === "approve" && method === "POST") {
      const revId = pathParts[2];
      const review = pendingReviews.find((r) => r.id === revId);
      if (review) {
        review.status = "approved";
        // Create actual lesson and topic from this approved content
        const newTopicId = "topic-" + Math.random().toString(36).substr(2, 9);
        topics.push({
          id: newTopicId,
          subjectId: review.subject,
          title: review.title,
          description: "Approved lesson: " + review.title,
          difficulty: "medium" as const,
          grade: [review.grade],
          lessonCount: 1,
          quizCount: 0,
          flashcardCount: 0,
          practiceCount: 0,
          progress: { completed: false, percent: 0 },
          estimatedMinutes: 8,
        });

        lessons[newTopicId] = {
          id: "lesson-" + Math.random().toString(36).substr(2, 9),
          topicId: newTopicId,
          title: review.title,
          status: "published",
          createdAt: new Date().toISOString(),
          content: {
            title: review.title,
            subject: review.subject,
            grade: [review.grade],
            readingTimeMinutes: 5,
            objectives: review.lessonContent.objectives,
            sections: review.lessonContent.sections,
          },
        };

        pendingReviews = pendingReviews.filter((r) => r.id !== revId);
      }
      return NextResponse.json({ status: "approved" });
    }

    if (pathParts[0] === "admin" && pathParts[1] === "reviews" && pathParts[3] === "reject" && method === "POST") {
      const revId = pathParts[2];
      pendingReviews = pendingReviews.filter((r) => r.id !== revId);
      return NextResponse.json({ status: "rejected" });
    }

    if (fullPath === "/admin/generate") {
      const body = await req.json();
      const job = {
        id: "job-" + Math.random().toString(36).substr(2, 9),
        materialId: body.materialId,
        materialName: materials.find((m) => m.id === body.materialId)?.filename || "document.pdf",
        subject: body.subject,
        grade: body.grade,
        status: "completed" as const,
        estimatedTimeSec: 10,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      generationJobs.push(job);
      return NextResponse.json({ jobId: job.id });
    }

    if (fullPath === "/admin/generation-queue") {
      return NextResponse.json({ jobs: generationJobs });
    }

    return NextResponse.json({ error: "Method or Path not implemented in Mock API" }, { status: 501 });
  } catch (err: any) {
    console.error("Mock API Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, ctx: any) {
  return handleRequest(req, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  return handleRequest(req, ctx);
}

export async function PUT(req: NextRequest, ctx: any) {
  return handleRequest(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: any) {
  return handleRequest(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: any) {
  return handleRequest(req, ctx);
}
