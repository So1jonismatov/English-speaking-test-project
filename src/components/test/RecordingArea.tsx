// RecordingArea.tsx
import { useRef, useMemo, memo, forwardRef, useState, useEffect } from "react";
import { VoiceVisualizer } from "react-voice-visualizer";
import useTestStore from "@/stores/testStore";
import { Card, CardContent } from "@/components/ui/card";
import { NotesPanel } from "./NotesPanel";
import { useRecordingArea } from "@/hooks/useRecordingArea";
import { Play, Pause, Trash2 } from "lucide-react";

const TimerDisplay = memo(forwardRef<HTMLDivElement, { className: string, initialText: string }>(
  ({ className, initialText }, ref) => {
    return <div ref={ref} className={className}>{initialText}</div>;
  }
), () => true);

interface RecordingAreaProps {
  partId: number;
  currentQuestion: string;
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

  return (
    <Card className={`h-full flex flex-col overflow-hidden transition-all duration-300 border-0 shadow-none`}>


      <CardContent className="p-0 flex-1 flex flex-col justify-between relative overflow-y-auto min-h-0">
        {/* Desktop Question Display */}
        <div className="hidden lg:flex mb-4 p-4 mx-6 shrink-0 items-center gap-4">
          <div className="flex-4">
            <p className="text-xl text-slate-800 font-medium leading-tight">{currentQuestion}</p>
          </div>
          <div className="flex-1 flex justify-end">
            <TimerDisplay ref={desktopTimerRef} className={timerClass} initialText={formatTime(timer)} />
          </div>
        </div>

        <div className="lg:hidden p-4 border-b z-10 shrink-0">
          <div className="flex justify-between items-start mb-2">
            <p className="font-bold text-xs text-gray-400 uppercase">Question {currentQuestionIndex + 1}</p>
          </div>
          <p className="text-lg font-medium leading-tight">{currentQuestion}</p>
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

            {/* Notes (Slide 2 - Mobile Only Tabs) */}
            <div className={`w-full h-full p-2 absolute inset-0 lg:hidden transition-opacity duration-300 ${activeTab === 'notes' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
              <div className="h-full rounded-xl p-2 bg-yellow-50/10">
                <NotesPanel partId={partId} embedded={true} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls Area */}
        <div className="p-6 flex justify-center items-center gap-6 lg:bg-transparent lg:border-none lg:pt-0">
          {audioUrl && (
            <audio ref={audioRef} src={audioUrl} className="hidden" />
          )}

          {/* Custom Play/Pause (Left of Record) */}
          {!isRecordingInProgress && recorderControls.recordedBlob && (
            <button
              onClick={togglePlayback}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 shadow-sm transition-all hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-right-4 duration-300"
              title={isPlaying ? "Pause review" : "Play review"}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>
          )}

          <button
            onClick={handleToggleRecording}
            aria-label={isRecordingInProgress ? "Stop Recording" : "Start Recording"}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0
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

          {/* Custom Delete (Right of Record) */}
          {!isRecordingInProgress && recorderControls.recordedBlob && (
            <button
              onClick={() => { recorderControls.clearCanvas(); setIsPlaying(false); }}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-red-50 text-red-400 shadow-sm transition-all hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-left-4 duration-300"
              title="Delete and re-record"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}, (prev, next) => {
  return prev.partId === next.partId &&
    prev.currentQuestion === next.currentQuestion &&
    prev.currentQuestionIndex === next.currentQuestionIndex;
});