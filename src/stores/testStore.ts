import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getApiErrorMessage, isApiUnauthorizedError } from '@/api/client';
import { testApi } from '@/api/test.api';
import type { Question, Test } from '@/api/api.types';
import type { AssessmentMetric } from '@/services/testAssessment.service';
import useAuthStore from '@/stores/authStore';

const createEmptyQuestions = () => ({
  part1: [] as Question[],
  part2: [] as Question[],
  part3: [] as Question[],
  topic: '',
});

const normalizeQuestionList = (questions: unknown): Question[] => {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions
    .map((question, index) => {
      if (typeof question === 'string') {
        const normalizedText = question.trim();

        return normalizedText
          ? { id: index + 1, question_text: normalizedText }
          : null;
      }

      if (question && typeof question === 'object') {
        const candidate = question as { id?: unknown; question_text?: unknown; question?: unknown };
        const normalizedText = String(candidate.question_text ?? candidate.question ?? '').trim();

        if (!normalizedText) {
          return null;
        }

        return {
          id: typeof candidate.id === 'number' ? candidate.id : index + 1,
          question_text: normalizedText,
        };
      }

      return null;
    })
    .filter((question): question is Question => question !== null);
};

interface QuestionRecording {
  recording: string;
  timeSpent: number;
  mimeType?: string;
}

type SubmittedTestIdsByPart = Record<number, string[]>;

interface ResultMetric {
  id: string;
  title: string;
  score: number;
  color: string;
  detail: string;
}

type AssessmentResultStatus = 'idle' | 'pending' | 'completed' | 'failed';

const defaultResultMetrics = (): ResultMetric[] => [
  { id: 'fluency', title: 'Fluency & Coherence', score: 0, color: 'bg-blue-500', detail: 'Feedback will appear here after the assessment is complete.' },
  { id: 'lexical', title: 'Lexical Resource', score: 0, color: 'bg-green-500', detail: 'Feedback will appear here after the assessment is complete.' },
  { id: 'grammar', title: 'Grammar & Accuracy', score: 0, color: 'bg-purple-500', detail: 'Feedback will appear here after the assessment is complete.' },
  { id: 'pronunciation', title: 'Pronunciation', score: 0, color: 'bg-orange-500', detail: 'Feedback will appear here after the assessment is complete.' },
];

const emptySessionState = () => ({
  currentPart: 1,
  currentQuestionIndex: 0,
  timer: 30,
  questionRecordings: {} as Record<number, Record<number, QuestionRecording | null>>,
  notes: { 1: '', 2: '', 3: '' },
  isRecording: false,
  questions: createEmptyQuestions(),
  questionsLoading: false,
  questionsError: null as string | null,
});

interface TestState {
  currentPart: number;
  setCurrentPart: (part: number) => void;

  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;

  timer: number;
  setTimer: (time: number | ((prevTime: number) => number)) => void;
  resetTimer: () => void;

  questionRecordings: Record<number, Record<number, QuestionRecording | null>>; // partId -> questionIndex -> recording
  setQuestionRecording: (partId: number, questionIndex: number, recording: QuestionRecording | null) => void;

  notes: Record<number, string>;
  setNotes: (partId: number, notes: string) => void;

  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;

  questions: {
    part1: Question[];
    part2: Question[];
    part3: Question[];
    topic?: string;
  };
  questionsLoading: boolean;
  questionsError: string | null;
  fetchQuestions: () => Promise<boolean>;

  resultMetrics: ResultMetric[];
  overallScore: number;
  resultSummary: string | null;
  resultStatus: AssessmentResultStatus;
  submittedTestIds: string[];
  submittedTestIdsByPart: SubmittedTestIdsByPart;
  assessmentError: string | null;
  latestTests: Test[];

  setPendingAssessment: (payload: { testIds: string[]; testIdsByPart: SubmittedTestIdsByPart }) => void;
  setCompletedAssessment: (payload: { metrics: AssessmentMetric[]; overallScore: number; summary: string | null; tests: Test[] }) => void;
  setFailedAssessment: (message: string) => void;
  clearAssessmentResult: () => void;
  resetTestSession: () => void;

  resetTest: () => void;

  getTimeLimitForQuestion: (partId: number) => number;

  isPartComplete: (partId: number) => boolean;

  testCompleted: boolean;
  setTestCompleted: (completed: boolean) => void;
}

const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      currentPart: 1,
      setCurrentPart: (part) => set({ currentPart: part }),

      currentQuestionIndex: 0,
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),

      timer: 30,
      setTimer: (time) =>
        set((state) => ({
          timer: typeof time === "function" ? time(state.timer) : time,
        })),
      resetTimer: () => set({ timer: 30 }),

      questionRecordings: {},
      setQuestionRecording: (partId, questionIndex, recording) => set((state) => ({
        questionRecordings: {
          ...state.questionRecordings,
          [partId]: {
            ...(state.questionRecordings[partId] || {}),
            [questionIndex]: recording
          }
        }
      })),

      notes: { 1: '', 2: '', 3: '' },
      setNotes: (partId, notes) => set((state) => ({
        notes: { ...state.notes, [partId]: notes }
      })),

      isRecording: false,
      setIsRecording: (recording) => set({ isRecording: recording }),

      testCompleted: false,
      setTestCompleted: (completed) => set({ testCompleted: completed }),

      resultMetrics: defaultResultMetrics(),
      overallScore: 0,
      resultSummary: null,
      resultStatus: 'idle',
      submittedTestIds: [],
      submittedTestIdsByPart: {},
      assessmentError: null,
      latestTests: [],

      setPendingAssessment: ({ testIds, testIdsByPart }) => set(() => ({
        resultMetrics: defaultResultMetrics(),
        overallScore: 0,
        resultSummary: null,
        testCompleted: false,
        resultStatus: 'pending',
        submittedTestIds: [...new Set(testIds)],
        submittedTestIdsByPart: Object.fromEntries(
          Object.entries(testIdsByPart).map(([part, ids]) => [part, [...new Set(ids.filter(Boolean))]]),
        ),
        assessmentError: null,
        latestTests: [],
      })),

      setCompletedAssessment: ({ metrics, overallScore, summary, tests }) => set({
        resultMetrics: metrics,
        overallScore,
        resultSummary: summary,
        resultStatus: 'completed',
        testCompleted: true,
        assessmentError: null,
        latestTests: tests,
      }),

      setFailedAssessment: (message) => set({
        resultStatus: 'failed',
        testCompleted: false,
        assessmentError: message,
      }),

      clearAssessmentResult: () => set({
        resultMetrics: defaultResultMetrics(),
        overallScore: 0,
        resultSummary: null,
        resultStatus: 'idle',
        submittedTestIds: [],
        submittedTestIdsByPart: {},
        assessmentError: null,
        latestTests: [],
        testCompleted: false,
      }),

      resetTestSession: () => set(() => ({
        ...emptySessionState(),
      })),

      questions: createEmptyQuestions(),
      questionsLoading: false,
      questionsError: null,

      fetchQuestions: async () => {
        set({ questionsLoading: true, questionsError: null });

        try {
          const response = await testApi.getQuestions();

          if (response.status) {
            const normalizedQuestions = {
              part1: normalizeQuestionList(response.part1),
              part2: normalizeQuestionList(response.part2),
              part3: normalizeQuestionList(response.part3),
              topic: response.topic || '',
            };

            const hasAnyQuestions =
              normalizedQuestions.part1.length > 0 ||
              normalizedQuestions.part2.length > 0 ||
              normalizedQuestions.part3.length > 0;

            set({
              questions: normalizedQuestions,
              questionsLoading: false,
              questionsError: hasAnyQuestions ? null : 'The server returned no questions for this test.',
            });

            return hasAnyQuestions;
          }

          const message = response.error || 'Failed to load test questions.';
          set({ questionsLoading: false, questionsError: message });
          return false;
        } catch (error) {
          if (isApiUnauthorizedError(error)) {
            useAuthStore.getState().clearAuth();
          }

          const message = getApiErrorMessage(error, 'Failed to load test questions.');
          console.error('Error fetching questions:', error);
          set({ questionsLoading: false, questionsError: message });
          return false;
        }
      },

      resetTest: () => set(() => ({
        ...emptySessionState(),
        resultMetrics: defaultResultMetrics(),
        overallScore: 0,
        resultSummary: null,
        resultStatus: 'idle',
        submittedTestIds: [],
        submittedTestIdsByPart: {},
        assessmentError: null,
        latestTests: [],
        testCompleted: false,
      })),

      getTimeLimitForQuestion: (partId: number) => {
        if (partId === 1) return 30; // 30 seconds for each question in part 1
        if (partId === 2) return 120; // 2 minutes for each question in part 2
        if (partId === 3) return 40; // 40 seconds for each question in part 3
        return 30; // default fallback
      },

      isPartComplete: (partId: number) => {
        const state = get();
        const currentQuestions =
          partId === 1 ? state.questions.part1 :
            partId === 2 ? state.questions.part2 :
              state.questions.part3;

        if (!currentQuestions || currentQuestions.length === 0) {
          return false;
        }

        // Check if all questions in this part have recordings
        for (let i = 0; i < currentQuestions.length; i++) {
          const recording = state.questionRecordings[partId]?.[i];
          if (!recording || !recording.recording) {
            return false;
          }
        }
        return true;
      }
    }),
    {
      name: 'ielts-test-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({
        currentPart: state.currentPart,
        currentQuestionIndex: state.currentQuestionIndex,
        timer: state.timer,
        questionRecordings: state.questionRecordings,
        notes: state.notes,
        isRecording: state.isRecording,
        questions: state.questions,
        resultMetrics: state.resultMetrics,
        overallScore: state.overallScore,
        resultSummary: state.resultSummary,
        resultStatus: state.resultStatus,
        submittedTestIds: state.submittedTestIds,
        submittedTestIdsByPart: state.submittedTestIdsByPart,
        assessmentError: state.assessmentError,
        latestTests: state.latestTests,
        testCompleted: state.testCompleted,
      }),
    }
  )
);

export default useTestStore;
