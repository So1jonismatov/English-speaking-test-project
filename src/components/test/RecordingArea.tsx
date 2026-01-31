// RecordingArea.tsx
import { useEffect, useRef, useMemo, useCallback } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import useTestStore from "@/stores/testStore";
import { Card, CardContent } from "@/components/ui/card";
import { NotesPanel } from "./NotesPanel";

interface RecordingAreaProps {
  partId: number;
  currentQuestion: string;
  currentQuestionIndex: number;
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

export function RecordingArea({
  partId,
  currentQuestion,
  currentQuestionIndex,
}: RecordingAreaProps) {
  const { timer, setTimer, getTimeLimitForQuestion, setQuestionRecording } = useTestStore();
  const sessionInfoRef = useRef({ partId, currentQuestionIndex });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  return (
    <Card className={`h-full flex flex-col overflow-hidden transition-all duration-300 border ${isRecordingInProgress ? 'border-red-300 shadow-xl shadow-red-100' : 'shadow-md border-blue-300'
      }`}>


      <CardContent className="p-0 flex-1 flex flex-col justify-between relative overflow-y-auto min-h-0">
        {/* Desktop Question Display */}
        <div className="hidden lg:block mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg mx-6 shrink-0">
          <p className="font-semibold text-xs text-blue-900 uppercase mb-1">Current Question: <em className="text-lg text-slate-800">{currentQuestion}</em></p>
          <div className={timerClass}>{formatTime(timer)}</div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white border-b z-10 shrink-0">
          <div className="flex justify-between items-start mb-2">
            <p className="font-bold text-xs text-gray-400 uppercase">Question {currentQuestionIndex + 1}</p>
          </div>
          <p className="text-lg font-medium leading-tight">{currentQuestion}</p>
          <div className={timerClass}>{formatTime(timer)}</div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm mx-6 border border-red-100">
            Microphone error. Please check browser permissions.
          </div>
        )}

        <div className="flex-1 flex   lg:block overflow-x-auto lg:overflow-visible snap-x snap-mandatory no-scrollbar">
          {/* Slide 1: Visualizer */}
          <div className="w-full shrink-0 snap-center flex flex-col items-center justify-center p-4 min-w-full lg:min-w-0">
            <div className="w-full max-w-md ">
              <VoiceVisualizer
                controls={recorderControls}
                isControlPanelShown={false}
                height={180}
                width="100%"
                mainBarColor="#3b82f6"
                secondaryBarColor="#93c5fd"
                barWidth={3}
                gap={2}
              />
            </div>
          </div>

          {/* Slide 2: Notes (Mobile Only) */}
          <div className="w-full shrink-0 snap-center p-4 min-w-full lg:hidden overflow-y-auto">
            <div className="h-full bg-amber-50 rounded-xl p-4 border border-amber-100">
              <h3 className="font-bold text-sm uppercase text-amber-800 mb-2">Scratchpad</h3>
              <NotesPanel partId={partId} embedded={true} />
            </div>
          </div>
        </div>

        {/* Mobile Indicators */}
        <div className="flex justify-center gap-1.5 mb-4 lg:hidden">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
        </div>

        {/* Bottom Controls Area */}
        <div className="p-6 bg-gray-50 border-t flex justify-center items-center lg:bg-transparent lg:border-none lg:pt-0">
          <button
            onClick={handleToggleRecording}
            aria-label={isRecordingInProgress ? "Stop Recording" : "Start Recording"}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95
              ${isRecordingInProgress
                ? "bg-red-500 ring-4 ring-red-100"
                : "bg-blue-600 ring-4 ring-blue-100"}
            `}
          >
            {isRecordingInProgress ? (
              <div className="w-5 h-5 bg-white rounded-sm" />
            ) : (
              <div className="w-0 h-0 border-t-10 border-t-transparent border-l-16 border-l-white border-b-10 border-b-transparent ml-1" />
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}