// RecordingArea.tsx
import { useRef, useMemo, memo, forwardRef, useState, useEffect } from "react";
import { VoiceVisualizer } from "react-voice-visualizer";
import useTestStore from "@/stores/testStore";
import { Card, CardContent } from "@/components/ui/card";
import { NotesPanel } from "./NotesPanel";
import { useRecordingArea } from "@/hooks/useRecordingArea";
import { Play, Pause, Trash2 } from "lucide-react";
import type { Question } from "@/api/api.types";

const TimerDisplay = memo(forwardRef<HTMLDivElement, { className: string, initialText: string }>(
  ({ className, initialText }, ref) => {
    return <div ref={ref} className={className}>{initialText}</div>;
  }
), () => true);

interface RecordingAreaProps {
  partId: number;
  currentQuestion: Question;
  currentQuestionIndex: number;
}

export const RecordingArea = memo(({
  partId,
  currentQuestion,
  currentQuestionIndex,
}: RecordingAreaProps) => {
  const timer = useTestStore.getState().timer;
  const setTimer = useTestStore((state) => state.setTimer);
  const getTimeLimitForQuestion = useTestStore((state) => state.getTimeLimitForQuestion);
  const setQuestionRecording = useTestStore((state) => state.setQuestionRecording);
  const desktopTimerRef = useRef<HTMLDivElement>(null);
  const mobileTimerRef = useRef<HTMLDivElement>(null);
  const timerDisplayRefs = useMemo(() => [desktopTimerRef, mobileTimerRef], []);

  const {
    recorderControls,
    isRecordingInProgress,
    error,
    formatTime,
    timerClass,
    handleToggleRecording
  } = useRecordingArea({
    partId,
    currentQuestionIndex,
    timer,
    getTimeLimitForQuestion,
    setQuestionRecording,
    setTimer,
    timerDisplayRefs
  });

  const [activeTab, setActiveTab] = useState<'recording' | 'notes'>('recording');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = useMemo(() => {
    return recorderControls.recordedBlob ? URL.createObjectURL(recorderControls.recordedBlob) : null;
  }, [recorderControls.recordedBlob]);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, [audioUrl]);

  if (!currentQuestion) {
    return (
      <Card className="h-full flex items-center justify-center border-0 shadow-none">
        <p className="text-gray-500">Loading question...</p>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col overflow-hidden transition-all duration-300 border-0 shadow-none`}>


      <CardContent className="p-0 flex-1 flex flex-col justify-between relative overflow-y-auto min-h-0">
        {/* Desktop Question Display */}
        <div className="hidden lg:flex mb-4 p-4 mx-6 shrink-0 items-center gap-4">
          <div className="flex-4">
            <p className="text-xl text-slate-800 font-medium leading-tight">{currentQuestion.question_text}</p>
          </div>
          <div className="flex-1 flex justify-end">
            <TimerDisplay ref={desktopTimerRef} className={timerClass} initialText={formatTime(timer)} />
          </div>
        </div>

        <div className="lg:hidden p-4 border-b z-10 shrink-0">
          <div className="flex justify-between items-start mb-2">
            <p className="font-bold text-xs text-gray-400 uppercase">Question {currentQuestionIndex + 1}</p>
          </div>
          <p className="text-lg font-medium leading-tight">{currentQuestion.question_text}</p>
          <TimerDisplay ref={mobileTimerRef} className={timerClass} initialText={formatTime(timer)} />
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm mx-6 border border-red-100">
            Microphone error. Please check browser permissions.
          </div>
        )}


        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex p-1 bg-gray-100/50 rounded-lg mx-4 mt-2">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'recording'
              ? 'bg-white text-blue-600 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]'
              : 'text-gray-500 shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.8)]'}`}
            onClick={() => setActiveTab('recording')}
          >
            Recording
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'notes'
              ? 'bg-white text-blue-600 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]'
              : 'text-gray-500 shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.8)]'}`}
            onClick={() => setActiveTab('notes')}
          >
            Scratchpad
          </button>
        </div>

        <div className="flex-1 relative min-h-0 flex flex-col">
          <div className="flex-1 relative">
            {/* Visualizer (Slide 1) - Persistent */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 transition-opacity duration-300 ${activeTab === 'recording' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
              <div className="w-full max-w-2xl">
                <VoiceVisualizer
                  controls={recorderControls}
                  isControlPanelShown={false}
                  isDefaultUIShown={false}
                  isProgressIndicatorOnHoverShown={false}
                  isProgressIndicatorShown={false}
                  height={200}
                  width="100%"
                  mainBarColor="#607580"
                  secondaryBarColor="#ff0000"
                  barWidth={2}
                  gap={1}
                />
              </div>
            </div>

            {/* Notes Panel (Slide 2) */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'notes' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
              <NotesPanel partId={partId} />
            </div>
          </div>

          <div className="p-4 bg-white border-t space-y-4 shrink-0">
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={handleToggleRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${isRecordingInProgress
                  ? "bg-red-500 hover:bg-red-600 animate-pulse scale-110"
                  : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                  }`}
              >
                {isRecordingInProgress ? (
                  <div className="w-6 h-6 bg-white rounded-sm" />
                ) : (
                  <div className="w-6 h-6 bg-white rounded-full" />
                )}
              </button>

              {audioUrl && !isRecordingInProgress && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <button
                    onClick={togglePlayback}
                    className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-gray-700 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 text-gray-700 fill-current" />
                    )}
                  </button>
                  <audio ref={audioRef} src={audioUrl} className="hidden" />

                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                      }
                      setIsPlaying(false);
                      recorderControls.clearCanvas();
                      setQuestionRecording(partId, currentQuestionIndex, null);
                    }}
                    className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors group"
                    title="Delete recording"
                  >
                    <Trash2 className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRecordingInProgress ? 'bg-red-500 animate-ping' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium text-gray-500">
                {isRecordingInProgress ? "Recording Answer..." : audioUrl ? "Recording Saved" : "Ready to Record"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
