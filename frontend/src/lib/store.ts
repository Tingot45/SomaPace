import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  role: "student" | "teacher" | "admin";
  grade?: number;
  subjects?: string[];
  xp: number;
  streak: number;
  level: number;
  onboardingComplete: boolean;
  avatarUrl?: string;
  createdAt: string;
}

interface AuthSlice {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
}

interface UISlice {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  language: "en" | "sw";
  setLanguage: (lang: "en" | "sw") => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

interface LearningSlice {
  currentTopicId: string | null;
  setCurrentTopicId: (id: string | null) => void;
  currentSubjectId: string | null;
  setCurrentSubjectId: (id: string | null) => void;
  quizState: {
    answers: Record<number, number>;
    currentIndex: number;
    timeRemaining?: number;
  };
  setQuizAnswer: (questionIndex: number, answerIndex: number) => void;
  setQuizCurrentIndex: (index: number) => void;
  resetQuizState: () => void;
  flashcardDeckId: string | null;
  setFlashcardDeckId: (id: string | null) => void;
}

type StoreState = AuthSlice & UISlice & LearningSlice;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          currentTopicId: null,
          currentSubjectId: null,
          quizState: { answers: {}, currentIndex: 0 },
          flashcardDeckId: null,
        }),

      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      darkMode: false,
      setDarkMode: (dark) => set({ darkMode: dark }),
      language: "en",
      setLanguage: (lang) => set({ language: lang }),
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      currentTopicId: null,
      setCurrentTopicId: (id) => set({ currentTopicId: id }),
      currentSubjectId: null,
      setCurrentSubjectId: (id) => set({ currentSubjectId: id }),
      quizState: { answers: {}, currentIndex: 0 },
      setQuizAnswer: (questionIndex, answerIndex) =>
        set((s) => ({
          quizState: {
            ...s.quizState,
            answers: { ...s.quizState.answers, [questionIndex]: answerIndex },
          },
        })),
      setQuizCurrentIndex: (index) =>
        set((s) => ({ quizState: { ...s.quizState, currentIndex: index } })),
      resetQuizState: () =>
        set({ quizState: { answers: {}, currentIndex: 0 } }),
      flashcardDeckId: null,
      setFlashcardDeckId: (id) => set({ flashcardDeckId: id }),
    }),
    {
      name: "somapace-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        darkMode: state.darkMode,
        language: state.language,
      }),
    }
  )
);

export function getStoredAuth(): { token: string; refreshToken: string; user: User } | null {
  try {
    const raw = localStorage.getItem("somapace-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const state = parsed.state;
    if (state?.token && state?.refreshToken && state?.user) {
      return { token: state.token, refreshToken: state.refreshToken, user: state.user };
    }
    return null;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return getStoredAuth()?.token ?? null;
}