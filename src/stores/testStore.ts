import { create } from 'zustand';

interface TestState {
  currentPart: number;
  setCurrentPart: (part: number) => void;

  timer: number;
  setTimer: (time: number) => void;
  resetTimer: () => void;

  recordings: Record<number, Blob | null>;
  setRecording: (partId: number, recording: Blob | null) => void;

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

  resetTest: () => void;
}

const useTestStore = create<TestState>((set) => ({
  currentPart: 1,
  setCurrentPart: (part) => set({ currentPart: part }),
  
  timer: 120,
  setTimer: (time) => set({ timer: time }),
  resetTimer: () => set({ timer: 120 }),

  recordings: {},
  setRecording: (partId, recording) => set((state) => ({
    recordings: { ...state.recordings, [partId]: recording }
  })),
  
  notes: { 1: '', 2: '', 3: '' },
  setNotes: (partId, notes) => set((state) => ({
    notes: { ...state.notes, [partId]: notes }
  })),
  
  isRecording: false,
  setIsRecording: (recording) => set({ isRecording: recording }),
  
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
          "Describe a book that you have recently read.",
          "You should say: what the book was about, why you chose to read it, and how you felt about it."
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
    timer: 120,
    recordings: {},
    notes: { 1: '', 2: '', 3: '' },
    isRecording: false
  })
}));

export default useTestStore;