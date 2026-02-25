// RecordingArea.tsx
import { useRef, useMemo, memo, forwardRef } from "react";
import { VoiceVisualizer } from "react-voice-visualizer";
import useTestStore from "@/stores/testStore";
import { Card, CardContent } from "@/components/ui/card";
import { NotesPanel } from "./NotesPanel";
import { useRecordingArea } from "@/hooks/useRecordingArea";

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

  return (
    <Card className={`h-full flex flex-col overflow-hidden transition-all duration-300 border ${isRecordingInProgress ? 'border-red-300 shadow-xl shadow-red-100' : 'shadow-md border-blue-300'
      }`}>


      <CardContent className="p-0 flex-1 flex flex-col justify-between relative overflow-y-auto min-h-0">
        {/* Desktop Question Display */}
        <div className="hidden lg:block mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg mx-6 shrink-0">
          <p className="font-semibold text-xs text-blue-900 uppercase mb-1">Current Question: <em className="text-lg text-slate-800">{currentQuestion}</em></p>
          <TimerDisplay ref={desktopTimerRef} className={timerClass} initialText={formatTime(timer)} />
        </div>

        <div className="lg:hidden p-4 bg-white border-b z-10 shrink-0">
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

        <div className="flex-1 flex   lg:block overflow-x-auto lg:overflow-visible snap-x snap-mandatory no-scrollbar">
          {/* Slide 1: Visualizer */}
          <div className="w-full shrink-0 snap-center flex flex-col items-center justify-center p-4 min-w-full lg:min-w-0">
            <div className="w-full max-w-md ">
              <VoiceVisualizer
                controls={recorderControls}
                isControlPanelShown={false}
                isDefaultUIShown={false}
                isProgressIndicatorOnHoverShown={false}
                isProgressIndicatorShown={false}
                height={180}
                width="100%"
                mainBarColor="#3b82f6"
                secondaryBarColor="#93c5fd"
                barWidth={1}
                gap={1}
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
}, (prev, next) => {
  return prev.partId === next.partId &&
    prev.currentQuestion === next.currentQuestion &&
    prev.currentQuestionIndex === next.currentQuestionIndex;
});