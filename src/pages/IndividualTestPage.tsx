// IndividualTestPage.tsx
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { QuestionsList } from "@/components/test/QuestionsList";
import { RecordingArea } from "@/components/test/RecordingArea";
import { NotesPanel } from "@/components/test/NotesPanel";
import { AssessmentLoading } from "@/components/test/AssessmentLoading";
import { useTestLogic } from "@/hooks/useTestLogic";

export default function IndividualTestPage() {
  const { id } = useParams<{ id: string }>();
  const partId = parseInt(id || "1");

  const {
    currentQuestionIndex,
    currentQuestions,
    assessmentStatus,
    changeQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    isLastQuestion,
    nextButtonDisabled,
  } = useTestLogic(partId);

  if (assessmentStatus === "pending") {
    return <AssessmentLoading />;
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full p-5 h-full max-w-[1200px] max-h-[800px] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out flex flex-col min-h-0">
        <h1 className="text-3xl font-bold mb-6 text-center shrink-0">
          IELTS Speaking Test - Part {partId}
        </h1>

        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Left Column: Questions List (25%) */}
            <div className="hidden lg:block w-1/4 h-full overflow-hidden">
              <QuestionsList
                partId={partId}
                currentQuestions={currentQuestions}
                currentQuestionIndex={currentQuestionIndex}
                onSelectQuestion={changeQuestion}
              />
            </div>

            {/* Middle Column: Recording Area (50%) */}
            <div className="flex-1 lg:w-2/4 h-full min-h-0">
              <RecordingArea
                key={`${partId}-${currentQuestionIndex}`}
                partId={partId}
                currentQuestion={currentQuestions[currentQuestionIndex]}
                currentQuestionIndex={currentQuestionIndex}
              />
            </div>

            {/* Right Column: Notes Panel (25%) */}
            <div className="hidden lg:block w-1/4 h-full overflow-hidden">
              <NotesPanel partId={partId} />
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-8 shrink-0">
          <Button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0 && partId === 1}
            variant="outline"
            className="min-w-[140px] shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={goToNextQuestion}
            disabled={nextButtonDisabled}
            className={`min-w-[180px] shadow-md transition-all hover:scale-105 ${isLastQuestion ? "bg-green-600 hover:bg-green-700 shadow-green-200" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"}`}
          >
            {isLastQuestion ? (
              <>
                Finish Test <Download className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next Question <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
