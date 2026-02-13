import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface QuestionRecording {
  recording: string; // Store as base64 string for localStorage compatibility
  timeSpent: number; // Time spent on this question in seconds
}

interface ResultMetric {
  id: string;
  title: string;
  score: number;
  color: string;
  detail: string;
}

interface TestState {
  currentPart: number;
  setCurrentPart: (part: number) => void;

  // Current question in the part
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;

  timer: number;
  setTimer: (time: number | ((prevTime: number) => number)) => void;
  resetTimer: () => void;

  // Recording state for each question
  questionRecordings: Record<number, Record<number, QuestionRecording | null>>; // partId -> questionIndex -> recording
  setQuestionRecording: (partId: number, questionIndex: number, recording: QuestionRecording | null) => void;

  notes: Record<number, string>;
  setNotes: (partId: number, notes: string) => void;

  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;

  questions: {
    part1: string[];
    part2: string[];
    part3: string[];
  };
  fetchQuestions: () => Promise<void>;

  // Results data
  resultMetrics: ResultMetric[];
  overallScore: number;

  resetTest: () => void;

  // Get time limit for a specific question based on part
  getTimeLimitForQuestion: (partId: number) => number;

  // Check if all questions in a part have been recorded
  isPartComplete: (partId: number) => boolean;

  assessmentStatus: 'idle' | 'pending' | 'completed';
  setAssessmentStatus: (status: 'idle' | 'pending' | 'completed') => void;

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

      timer: 30, // 30 seconds for part 1, first question
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

      assessmentStatus: 'idle',
      setAssessmentStatus: (status) => set({ assessmentStatus: status }),

      testCompleted: false,
      setTestCompleted: (completed) => set({ testCompleted: completed }),

      resultMetrics: [
        { id: "fluency", title: "Fluency & Coherence", score: 7.5, color: "bg-blue-500", detail: "You spoke at length without noticeable effort or loss of coherence. You demonstrated a good range of connectives and discourse markers." },
        { id: "lexical", title: "Lexical Resource", score: 8.0, color: "bg-green-500", detail: "You used a wide range of vocabulary with very natural and sophisticated control of lexical features." },
        { id: "grammar", title: "Grammar & Accuracy", score: 7.0, color: "bg-purple-500", detail: "You used a mix of simple and complex sentence forms. There were some minor errors but they did not impede communication." },
        { id: "pronunciation", title: "Pronunciation", score: 7.5, color: "bg-orange-500", detail: "Your pronunciation was generally clear with effective use of intonation and stress." },
      ],
      overallScore: 7.5,

      questions: {
        part1: [],
        part2: [],
        part3: []
      },

      fetchQuestions: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));

        set({
          questions: {
            part1: [
              "What is your name?",
              "Where are you from?",
              "Do you work or study?",
              "What do you like to do in your free time?"
            ],
            part2: [
              "Describe a book that you have recently read. You should say: what the book was about, why you chose to read it, and how you felt about it."
            ],
            part3: [
              "How important is reading in your culture?",
              "Do you think digital books will replace physical books?",
              "What are the benefits of reading to children?"
            ]
          }
        });
      },

      resetTest: () => set({
        currentPart: 1,
        currentQuestionIndex: 0,
        timer: 30,
        questionRecordings: {},
        notes: { 1: '', 2: '', 3: '' },
        isRecording: false,
        assessmentStatus: 'idle',
        testCompleted: false,
        resultMetrics: [
          { id: "fluency", title: "Fluency & Coherence", score: 7.5, color: "bg-blue-500", detail: "You spoke at length without noticeable effort or loss of coherence. You demonstrated a good range of connectives and discourse markers." },
          { id: "lexical", title: "Lexical Resource", score: 8.0, color: "bg-green-500", detail: "You used a wide range of vocabulary with very natural and sophisticated control of lexical features." },
          { id: "grammar", title: "Grammar & Accuracy", score: 7.0, color: "bg-purple-500", detail: "You used a mix of simple and complex sentence forms. There were some minor errors but they did not impede communication." },
          { id: "pronunciation", title: "Pronunciation", score: 7.5, color: "bg-orange-500", detail: "Your pronunciation was generally clear with effective use of intonation and stress." },
        ],
        overallScore: 7.5
      }),

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
      // No custom serializer needed if recording is already a base64 string
    }
  )
);

export default useTestStore;