// IndividualTestPage.tsx
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, ArrowRight, Download, RefreshCcw } from "lucide-react";
import { QuestionsList } from "@/components/test/QuestionsList";
import { RecordingArea } from "@/components/test/RecordingArea";
import { NotesPanel } from "@/components/test/NotesPanel";
import { useTestLogic } from "@/hooks/useTestLogic";

export default function IndividualTestPage() {
  const { id } = useParams<{ id: string }>();
  const partId = parseInt(id || "1");

  const {
    currentQuestionIndex,
    currentQuestions,
    questionsLoading,
    questionsError,
    isSubmittingTest,
    changeQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    isLastQuestion,
    nextButtonDisabled,
    retryFetchQuestions,
  } = useTestLogic(partId);

  if (questionsLoading) {
    return (
      <div className="h-screen w-screen bg-[#F0F7EE] flex items-center justify-center">
        <div className="text-2xl font-medium text-gray-600">Loading questions...</div>
      </div>
    );
  }

  if (questionsError) {
    return (
      <div className="h-screen w-screen bg-[#F0F7EE] flex items-center justify-center px-4">
        <div className="max-w-lg rounded-2xl bg-white p-8 shadow-lg border text-center space-y-4">
          <div className="flex justify-center text-red-500">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Could not load test questions</h2>
          <p className="text-gray-600">{questionsError}</p>
          <Button onClick={() => void retryFetchQuestions()} className="min-w-[180px]">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestions || currentQuestions.length === 0) {
    return (
      <div className="h-screen w-screen bg-[#F0F7EE] flex items-center justify-center px-4">
        <div className="max-w-lg rounded-2xl bg-white p-8 shadow-lg border text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">No questions available</h2>
          <p className="text-gray-600">The server did not return any questions for this test.</p>
          <Button onClick={() => void retryFetchQuestions()} variant="outline" className="min-w-[180px]">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reload Questions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#F0F7EE] flex items-center justify-center overflow-hidden">
      <div className="w-full p-4 md:p-8 h-full max-w-[1600px] flex flex-col min-h-0">
        <h1 className="text-md md:text-3xl font-bold mb-6 text-center shrink-0">
          <span className="text-[#DC143C]">IELTS</span>  Speaking Test: Part {partId}
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
                partId={partId}
                currentQuestion={currentQuestions?.[currentQuestionIndex]}
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
            {isSubmittingTest ? (
              <>
                Submitting... <RefreshCcw className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : isLastQuestion ? (
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
