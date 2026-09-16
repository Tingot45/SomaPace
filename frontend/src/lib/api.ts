import { getStoredToken, getStoredAuth, useStore } from "./store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.somapace.co.ke/api/v1";

interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  retries?: number;
}

interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

class ApiClient {
  private base: string;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(base: string) {
    this.base = base;
  }

  private async request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
    const { params, body, headers, retries = 0, ...rest } = opts;
    const url = new URL(`${this.base}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, String(v));
      });
    }

    let token = getStoredToken();

    const requestHeaders = { ...headers } as Record<string, string>;
    if (body && body instanceof FormData === false) {
      requestHeaders["Content-Type"] = "application/json";
    } else if (body instanceof FormData) {
      delete requestHeaders["Content-Type"];
    }

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url.toString(), {
      method,
      headers: requestHeaders,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      ...rest,
    });

    if (res.status === 401 && !path.includes("/auth/") && retries < 1) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        return this.request<T>(method, path, { ...opts, retries: 1 });
      }
      useStore.getState().logout();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw this.createError("Session expired", 401);
    }

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw this.createError(
        data?.message ?? data?.detail ?? `Request failed with status ${res.status}`,
        res.status,
        data
      );
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  private createError(message: string, status: number, data?: unknown): ApiError {
    const err = new Error(message) as ApiError;
    err.status = status;
    err.data = data;
    return err;
  }

  private async refreshAccessToken(): Promise<string | null> {
    const auth = getStoredAuth();
    if (!auth?.refreshToken) return null;

    if (this.isRefreshing && this.refreshPromise) return this.refreshPromise;

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const res = await fetch(`${this.base}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: auth.refreshToken }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        const { token, refreshToken } = data;
        useStore.getState().setTokens(token, refreshToken);
        return token;
      } catch {
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async uploadWithProgress<T>(
    method: string,
    path: string,
    formData: FormData,
    onProgress?: (pct: number) => void
  ): Promise<T> {
    const token = getStoredToken();
    const url = `${this.base}${path}`;

    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) resolve(data);
          else reject(this.createError(data.message ?? "Upload failed", xhr.status, data));
        } catch {
          reject(this.createError("Invalid response", xhr.status));
        }
      });

      xhr.addEventListener("error", () => reject(this.createError("Network error", 0)));
      xhr.send(formData);
    });
  }

  async login(phone: string, password: string) {
    return this.request<{
      user: import("./store").User;
      token: string;
      refreshToken: string;
    }>("POST", "/auth/login", { body: { phone, password } });
  }

  async register(data: {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    grade: number;
    termsAccepted: boolean;
  }) {
    return this.request<{
      user: import("./store").User;
      token: string;
      refreshToken: string;
    }>("POST", "/auth/register", { body: data });
  }

  async getMe() {
    return this.request<import("./store").User>("GET", "/auth/me");
  }

  async getSubjects(params?: { grade?: number }) {
    return this.request<{ subjects: Subject[] }>("GET", "/subjects", { params });
  }

  async getTopics(subjectId: string, params?: { page?: number; limit?: number }) {
    return this.request<TopicResponse>("GET", `/subjects/${subjectId}/topics`, { params });
  }

  async getTopic(topicId: string) {
    return this.request<Topic>("GET", `/topics/${topicId}`);
  }

  async getLesson(topicId: string) {
    return this.request<Lesson>("GET", `/topics/${topicId}/lesson`);
  }

  async getQuiz(topicId: string) {
    return this.request<Quiz>("GET", `/topics/${topicId}/quiz`);
  }

  async getFlashcards(topicId: string, params?: { page?: number; limit?: number }) {
    return this.request<{ flashcards: Flashcard[]; total: number }>("GET", `/topics/${topicId}/flashcards`, { params });
  }

  async getPracticeQuestions(topicId: string, params?: { difficulty?: string }) {
    return this.request<{ questions: PracticeQuestion[] }>("GET", `/topics/${topicId}/practice`, { params });
  }

  async initiatePayment(data: { planId: string; phone: string }) {
    return this.request<PaymentInit>("POST", "/payments/initiate", { body: data });
  }

  async getPaymentStatus(orderId: string) {
    return this.request<PaymentStatus>("GET", `/payments/${orderId}/status`);
  }

  async getDashboard() {
    return this.request<DashboardData>("GET", "/dashboard");
  }

  async submitProgress(
    lessonId: string,
    data: { percent: number; completed: boolean; timeSpentSec: number }
  ) {
    return this.request<{ xpEarned: number }>("POST", `/lessons/${lessonId}/progress`, {
      body: data,
    });
  }

  async submitQuizResult(quizId: string, answers: Record<number, number>) {
    return this.request<{ score: number; passed: boolean; xpEarned: number; explanations: { questionIndex: number; correct: boolean; explanation: string }[] }>(
      "POST",
      `/quizzes/${quizId}/submit`,
      { body: { answers } }
    );
  }

  async updateFlashcard(cardId: { reviewRating: number; easeFactor: number; intervalDays: number; dueForReview: boolean }) {
    return this.request<unknown>("PATCH", `/flashcards/${cardId.reviewRating}/review`, {
      body: cardId,
    });
  }

  async uploadMaterial(
    file: File,
    metadata: { grade: number; subject: string; description?: string },
    onProgress?: (pct: number) => void
  ) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("metadata", JSON.stringify(metadata));
    return this.uploadWithProgress<Material>("POST", "/admin/materials", fd, onProgress);
  }

  async getMaterials(params?: { grade?: number; subject?: string; status?: string; page?: number }) {
    return this.request<{ materials: Material[]; total: number }>("GET", "/admin/materials", { params });
  }

  async deleteMaterial(id: string) {
    return this.request<void>("DELETE", `/admin/materials/${id}`);
  }

  async reprocessMaterial(id: string) {
    return this.request<{ jobId: string }>("POST", `/admin/materials/${id}/reprocess`);
  }

  async getAdminStats() {
    return this.request<AdminStats>("GET", "/admin/stats");
  }

  async getPendingReviews(params?: { page?: number; limit?: number }) {
    return this.request<{ reviews: ContentReview[]; total: number }>("GET", "/admin/reviews", { params });
  }

  async approveLesson(id: string) {
    return this.request<unknown>("POST", `/admin/reviews/${id}/approve`);
  }

  async rejectLesson(id: string, reason: string) {
    return this.request<unknown>("POST", `/admin/reviews/${id}/reject`, { body: { reason } });
  }

  async triggerGeneration(data: { materialId: string; grade: number; subject: string }) {
    return this.request<{ jobId: string }>("POST", "/admin/generate", { body: data });
  }

  async getGenerationQueue() {
    return this.request<{ jobs: GenerationJob[] }>("GET", "/admin/generation-queue");
  }
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  gradeRange: [number, number];
  topics: number;
  progress: number;
}

export interface TopicResponse {
  topics: Topic[];
  total: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  grade: number[];
  lessonCount: number;
  quizCount: number;
  flashcardCount: number;
  practiceCount: number;
  progress?: { completed: boolean; percent: number };
  estimatedMinutes: number;
}

export interface LessonSection {
  type:
    | "hook"
    | "objective"
    | "explanation"
    | "worked_example"
    | "kenyan_application"
    | "diagram"
    | "misconception"
    | "summary";
  title: string;
  content?: string | string[];
  items?: string[];
  subsections?: { heading: string; body: string }[];
  mermaid?: string;
}

export interface RecapQuizItem {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface LessonContent {
  title: string;
  subject: string;
  grade: number[];
  readingTimeMinutes: number;
  objectives: string[];
  sections: LessonSection[];
  recapQuiz: RecapQuizItem[];
  keyTerms?: { term: string; definition: string }[];
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  content: LessonContent;
  audioUrl?: string;
  status: "draft" | "approved" | "published";
  createdAt: string;
  progress?: { completed: boolean; percent: number };
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: "mcq";
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  topicId: string;
  title: string;
  questions: QuizQuestion[];
  timeLimitMinutes?: number;
  passingScore: number;
}

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  hint?: string;
  intervalDays?: number;
  ease?: number;
  dueForReview?: boolean;
}

export interface PracticeQuestion {
  id: string;
  topicId: string;
  prompt: string;
  type: "open" | "calculation" | "short";
  difficulty: "easy" | "medium" | "hard";
  hint: string;
  modelAnswer: string;
  explanation: string;
}

export interface Material {
  id: string;
  filename: string;
  grade: number;
  subject: string;
  status: "pending" | "processing" | "processed" | "failed";
  description?: string;
  createdAt: string;
  sizeBytes?: number;
  errorMessage?: string;
}

export interface PaymentInit {
  orderId: string;
  checkoutUrl?: string;
  mpesaStkPush?: boolean;
  amount: number;
}

export interface PaymentStatus {
  status: "pending" | "completed" | "failed" | "cancelled";
  orderId: string;
  amount?: number;
}

export interface DashboardData {
  user: { fullName: string; grade: number; streak: number; xp: number; level: number };
  continueLearning?: Topic;
  recommendation?: { topicId: string; title: string; minutes: number; subject: string };
  weakTopics: Topic[];
  recentActivity: { id: string; type: string; title: string; at: string; subject?: string }[];
  weeklyMinutes: number[];
  badges: { id: string; name: string; emoji: string; earnedAt: string }[];
}

export interface AdminStats {
  totals: {
    users: number;
    students: number;
    materials: number;
    lessonsGenerated: number;
    revenueKES: number;
    pendingReviews: number;
  };
  recentActivity: { id: string; type: string; description: string; at: string }[];
  lessonsPerSubject: Record<string, number>;
  weeklySignups: number[];
}

export interface ContentReview {
  id: string;
  title: string;
  subject: string;
  grade: number;
  sourceMaterialId?: string;
  sourceMaterialName?: string;
  lessonContent: LessonContent;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  materialId: string;
  materialName: string;
  subject: string;
  grade: number;
  status: "queued" | "processing" | "completed" | "failed";
  estimatedTimeSec?: number;
  startedAt?: string;
  completedAt?: string;
}

export const api = new ApiClient(API_URL);