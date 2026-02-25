import { useEffect, useRef, useMemo, useCallback } from "react";
import { useVoiceVisualizer } from "react-voice-visualizer";

interface UseRecordingAreaProps {
  partId: number;
  currentQuestionIndex: number;
  timer: number;
  getTimeLimitForQuestion: (partId: number) => number;
  setQuestionRecording: (partId: number, questionIndex: number, recording: any) => void;
  setTimer: (time: number | ((prevTime: number) => number)) => void;
  timerDisplayRefs: React.RefObject<HTMLDivElement | null>[];
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
  timerRef: React.RefObject<any>;
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
  setTimer,
  timerDisplayRefs
}: UseRecordingAreaProps): UseRecordingAreaReturn => {
  const sessionInfoRef = useRef({ partId, currentQuestionIndex });
  const timerRef = useRef<any>(null);
  const currentTimerValueRef = useRef(timer);

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

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    const initial = getTimeLimitForQuestion(partId);
    setTimer(initial);
    currentTimerValueRef.current = initial;
    clearCanvas();
    if (timerRef.current) (timerRef.current as any).pause();

    // Reset display for all refs
    timerDisplayRefs.forEach(ref => {
      if (ref.current) {
        ref.current.textContent = formatTime(initial);
        // Reset classes to default (remove red warning)
        ref.current.classList.remove("bg-red-100", "text-red-700", "animate-pulse");
        ref.current.classList.add("bg-gray-50", "text-gray-800");
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partId, currentQuestionIndex]);

  // Keep a ref to stopRecording to avoid dependency cycles
  const stopRecordingRef = useRef(stopRecording);
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  useEffect(() => {
    if (isRecordingInProgress) {
      if (timerRef.current) clearInterval(timerRef.current);

      let timeLeft = currentTimerValueRef.current;

      const updateDisplay = (time: number) => {
        const formatted = formatTime(time);
        const isWarning = time < 10;

        timerDisplayRefs.forEach(ref => {
          if (ref.current) {
            ref.current.textContent = formatted;
            if (isWarning) {
              ref.current.classList.remove("bg-gray-50", "text-gray-800");
              ref.current.classList.add("bg-red-100", "text-red-700", "animate-pulse");
            } else {
              ref.current.classList.remove("bg-red-100", "text-red-700", "animate-pulse");
              ref.current.classList.add("bg-gray-50", "text-gray-800");
            }
          }
        });
      };

      timerRef.current = setInterval(() => {
        timeLeft -= 1;
        currentTimerValueRef.current = timeLeft;
        updateDisplay(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(timerRef.current);
          if (stopRecordingRef.current) stopRecordingRef.current();
          currentTimerValueRef.current = 0;
          updateDisplay(0);
        }
      }, 1000);

    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecordingInProgress, timerDisplayRefs, formatTime]);

  useEffect(() => {
    if (recordedBlob && !isRecordingInProgress) {
      const { partId: savedPartId, currentQuestionIndex: savedIndex } = sessionInfoRef.current;
      const initialTime = getTimeLimitForQuestion(savedPartId);
      const timeSpent = initialTime - currentTimerValueRef.current;

      blobToBase64(recordedBlob)
        .then((base64Recording) => {
          setQuestionRecording(savedPartId, savedIndex, {
            recording: base64Recording,
            timeSpent: timeSpent > 0 ? timeSpent : initialTime,
          });
        })
        .catch((err) => console.error("Save error:", err));
    }
  }, [recordedBlob, isRecordingInProgress, getTimeLimitForQuestion, setQuestionRecording]);

  const timerClass = useMemo(() => {
    return `text-xl font-mono px-3 py-1 rounded transition-colors bg-gray-50 text-gray-800`;
  }, []);

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
    error: error ? error.toString() : null,
    sessionInfoRef,
    timerRef,
    formatTime,
    timerClass,
    handleToggleRecording
  };
};