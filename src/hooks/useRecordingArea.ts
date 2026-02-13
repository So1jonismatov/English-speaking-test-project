import { useEffect, useRef, useMemo, useCallback } from "react";
import { useVoiceVisualizer } from "react-voice-visualizer";
import useTestStore from "@/stores/testStore";

interface UseRecordingAreaProps {
  partId: number;
  currentQuestionIndex: number;
  timer: number;
  getTimeLimitForQuestion: (partId: number) => number;
  setQuestionRecording: (partId: number, questionIndex: number, recording: any) => void;
  setTimer: (time: number | ((prevTime: number) => number)) => void;
}

interface UseRecordingAreaReturn {
  visualizerOptions: any;
  recorderControls: any;
  isRecordingInProgress: boolean;
  stopRecording: () => void;
  startRecording: () => void;
  clearCanvas: () => void;
  recordedBlob: Blob | null;
  error: string | null;
  sessionInfoRef: React.RefObject<{ partId: number; currentQuestionIndex: number }>;
  timerRef: React.RefObject<NodeJS.Timeout | null>;
  formatTime: (seconds: number) => string;
  timerClass: string;
  handleToggleRecording: () => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]);
      } else {
        reject(new Error("Could not convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const useRecordingArea = ({
  partId,
  currentQuestionIndex,
  timer,
  getTimeLimitForQuestion,
  setQuestionRecording,
  setTimer
}: UseRecordingAreaProps): UseRecordingAreaReturn => {
  const sessionInfoRef = useRef({ partId, currentQuestionIndex });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const visualizerOptions = useMemo(() => ({
    onStartRecording: () => {
      sessionInfoRef.current = { partId, currentQuestionIndex };
    },
    mediaRecorderOptions: {
      mimeType: MediaRecorder.isTypeSupported("audio/wav") ? "audio/wav" : "audio/webm",
    },
  }), [partId, currentQuestionIndex]);

  const recorderControls = useVoiceVisualizer(visualizerOptions);

  const {
    stopRecording,
    startRecording,
    isRecordingInProgress,
    clearCanvas,
    recordedBlob,
    error,
  } = recorderControls;

  useEffect(() => {
    const initial = getTimeLimitForQuestion(partId);
    setTimer(initial);
    clearCanvas();
    if (timerRef.current) clearInterval(timerRef.current);
  }, [partId, currentQuestionIndex]);

  useEffect(() => {
    if (isRecordingInProgress) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecordingInProgress, stopRecording, setTimer]);

  useEffect(() => {
    if (recordedBlob && !isRecordingInProgress) {
      const { partId: savedPartId, currentQuestionIndex: savedIndex } = sessionInfoRef.current;
      const initialTime = getTimeLimitForQuestion(savedPartId);
      const timeSpent = initialTime - timer;

      blobToBase64(recordedBlob)
        .then((base64Recording) => {
          setQuestionRecording(savedPartId, savedIndex, {
            recording: base64Recording,
            timeSpent: timeSpent > 0 ? timeSpent : initialTime,
          });
        })
        .catch((err) => console.error("Save error:", err));
    }
  }, [recordedBlob, isRecordingInProgress, timer, getTimeLimitForQuestion, setQuestionRecording]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const timerClass = useMemo(() => {
    return `text-xl font-mono px-3 py-1 rounded transition-colors ${timer < 10 ? "bg-red-100 text-red-700 animate-pulse" : "bg-gray-50 text-gray-800"
      }`;
  }, [timer]);

  const handleToggleRecording = useCallback(() => {
    if (isRecordingInProgress) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecordingInProgress, startRecording, stopRecording]);

  return {
    visualizerOptions,
    recorderControls,
    isRecordingInProgress,
    stopRecording,
    startRecording,
    clearCanvas,
    recordedBlob,
    error,
    sessionInfoRef,
    timerRef,
    formatTime,
    timerClass,
    handleToggleRecording
  };
};