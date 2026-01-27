// RecordingArea.tsx
import { useEffect, useRef, useCallback } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import useTestStore from "@/stores/testStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecordingAreaProps {
  partId: number;
  currentQuestion: string;
  currentQuestionIndex: number;
}

// Helper function to convert Blob to base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]); // Extract base64 part
      } else {
        reject(new Error('Could not convert blob to base64'));
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
  const { timer, setTimer, getTimeLimitForQuestion, setQuestionRecording } =
    useTestStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const initialTimeRef = useRef(getTimeLimitForQuestion(partId));
  const timerStateRef = useRef(timer);

  // Update the ref when timer changes
  useEffect(() => {
    timerStateRef.current = timer;
  }, [timer]);

  const recorderControls = useVoiceVisualizer({
    onStartRecording: () => {
      // Timer starts automatically via effect watching isRecordingInProgress
    },
    onStopRecording: async (blob) => {
      // Auto-save when recording stops
      if (blob) {
        try {
          const base64Recording = await blobToBase64(blob);
          const timeSpent = initialTimeRef.current - timerStateRef.current;
          setQuestionRecording(partId, currentQuestionIndex, {
            recording: base64Recording,
            timeSpent: timeSpent > 0 ? timeSpent : initialTimeRef.current,
          });
        } catch (error) {
          console.error("Error converting blob to base64:", error);
        }
      }
    },
    onError: (err) => {
      console.error("Recording error:", err);
    },
    // Request WAV format if browser supports it, fallback to default
    mediaRecorderOptions: {
      mimeType: MediaRecorder.isTypeSupported("audio/wav")
        ? "audio/wav"
        : "audio/webm",
    },
  });

  const {
    stopRecording,
    startRecording,
    isRecordingInProgress,
    clearCanvas,
    recordedBlob,
    error,
  } = recorderControls;

  // Reset timer when question changes
  useEffect(() => {
    const initial = getTimeLimitForQuestion(partId);
    initialTimeRef.current = initial;
    setTimer(initial);
    timerStateRef.current = initial;
    clearCanvas();
  }, [partId, currentQuestionIndex]);

  // Timer logic - syncs with actual recording state from visualizer
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (isRecordingInProgress) {
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => {
          const newTimer = prevTimer - 1;
          timerStateRef.current = newTimer; // Update ref with new timer value
          if (newTimer <= 0) {
            // Use a timeout to allow state update to complete before stopping
            setTimeout(() => {
              stopRecording();
            }, 0);
            return 0;
          }
          return newTimer;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecordingInProgress, stopRecording]); // Only depend on isRecordingInProgress to prevent infinite loop

  // Handle auto-save when blob is ready (backup to onStopRecording)
  useEffect(() => {
    if (recordedBlob && !isRecordingInProgress) {
      const timeSpent = initialTimeRef.current - timerStateRef.current;
      blobToBase64(recordedBlob)
        .then(base64Recording => {
          setQuestionRecording(partId, currentQuestionIndex, {
            recording: base64Recording,
            timeSpent: timeSpent > 0 ? timeSpent : initialTimeRef.current,
          });
        })
        .catch(error => {
          console.error("Error converting blob to base64:", error);
        });
    }
  }, [
    recordedBlob,
    isRecordingInProgress,
    partId,
    currentQuestionIndex,
    setQuestionRecording,
  ]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recording - Question {currentQuestionIndex + 1}</CardTitle>
        <div
          className={`text-2xl font-mono px-4 py-2 rounded ${
            timer < 10 ? "bg-red-100 text-red-700" : "bg-gray-200"
          }`}
        >
          {formatTime(timer)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-gray-50 rounded-lg min-h-[6rem]">
          <p className="font-medium text-sm text-gray-600 mb-1">
            Current Question:
          </p>
          <p className="text-lg">{currentQuestion}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            Error accessing microphone. Please check permissions.
          </div>
        )}

        <div className="flex flex-col items-center">
          <VoiceVisualizer
            controls={recorderControls}
            isControlPanelShown={true}
            height={150}
            width="100%"
            mainBarColor="#3b82f6"
            secondaryBarColor="#93c5fd"
            barWidth={2}
            gap={1.5}
            speed={2}
          />

          {!isRecordingInProgress && recordedBlob && (
            <div className="mt-4 p-2 bg-green-50 text-green-700 rounded text-sm">
              ✓ Recording saved automatically
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
