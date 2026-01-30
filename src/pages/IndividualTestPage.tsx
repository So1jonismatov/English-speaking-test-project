// IndividualTestPage.tsx
import { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import useTestStore from "@/stores/testStore";
import { QuestionsList } from "@/components/test/QuestionsList";
import { RecordingArea } from "@/components/test/RecordingArea";
import { NotesPanel } from "@/components/test/NotesPanel";
import { fakeApiService } from "@/services/fakeApiService";
import { AssessmentLoading } from "@/components/test/AssessmentLoading";

// Utility to convert base64 to Blob
function base64ToBlob(base64: string, mimeType: string = 'audio/webm'): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}



export default function IndividualTestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const partId = parseInt(id || "1");

  const {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    questions,
    getTimeLimitForQuestion,
    questionRecordings,
    setTimer,
    setIsRecording,
    isPartComplete,
    resetTest,
    isRecording,
    assessmentStatus,
    setAssessmentStatus,
    setTestCompleted,
  } = useTestStore();

  const currentQuestions =
    partId === 1
      ? questions.part1
      : partId === 2
        ? questions.part2
        : questions.part3;

  // Initialize timer when part or question changes
  useEffect(() => {
    // If assessment is pending, don't reset anything yet
    if (assessmentStatus === 'pending') return;

    // Reset question index to 0 when part changes
    if (partId !== useTestStore.getState().currentPart) {
      setCurrentQuestionIndex(0);
      useTestStore.getState().setCurrentPart(partId);
    }

    const initialTime = getTimeLimitForQuestion(partId);
    setTimer(initialTime);
    setIsRecording(false);
  }, [
    partId,
    currentQuestionIndex,
    getTimeLimitForQuestion,
    setTimer,
    setIsRecording,
    assessmentStatus,
    setCurrentQuestionIndex
  ]);

  const changeQuestion = useCallback(
    (newIndex: number) => {
      setIsRecording(false);
      setTimer(getTimeLimitForQuestion(partId));
      setCurrentQuestionIndex(newIndex);
    },
    [
      setIsRecording,
      setTimer,
      getTimeLimitForQuestion,
      partId,
      setCurrentQuestionIndex,
    ],
  );

  const goToNextPart = async () => {
    if (partId < 3) {
      if (partId === 2) {
        // Trigger assessment before Part 3
        setAssessmentStatus('pending');
        await fakeApiService.assessPart2();
        setAssessmentStatus('completed');
        navigate(`/test/${partId + 1}`);
      } else {
        navigate(`/test/${partId + 1}`);
      }
    } else {
      navigate("/");
    }
  };

  const submitTestResults = async () => {
    // Mark test as completed and navigate home (which is now results page)
    setIsRecording(false);
    setTestCompleted(true);
    navigate("/");
  };

  const goToNextQuestion = async () => {
    // 1. Validate Recording
    const currentRecording = questionRecordings[partId]?.[currentQuestionIndex];
    if (!currentRecording || !currentRecording.recording) {
      alert("Please record an answer for the current question before proceeding.");
      return;
    }

    // 2. Submit Audio to Fake API (Download)
    try {
      const blob = base64ToBlob(currentRecording.recording, 'audio/webm');
      const filename = `Part${partId}_Question${currentQuestionIndex + 1}`;
      await fakeApiService.submitAudio(blob, filename); // This triggers download
    } catch (error) {
      console.error("Failed to submit audio:", error);
      // Continue anyway? Use alert?
    }

    // 3. Navigate
    if (currentQuestionIndex < currentQuestions.length - 1) {
      changeQuestion(currentQuestionIndex + 1);
    } else if (partId < 3) {
      if (!isPartComplete(partId)) {
        alert(`Please record answers for all questions in Part ${partId} before proceeding.`);
        return;
      }
      await goToNextPart();
    } else {
      if (!isPartComplete(partId)) {
        alert(`Please record answers for all questions in Part ${partId} before finishing.`);
        return;
      }
      await submitTestResults();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      changeQuestion(currentQuestionIndex - 1);
    } else if (partId > 1) {
      navigate(`/test/${partId - 1}`);
    }
  };

  const isLastQuestion =
    currentQuestionIndex === currentQuestions.length - 1 && partId === 3;

  const isCurrentQuestionRecorded = !!(questionRecordings[partId]?.[currentQuestionIndex]?.recording);
  const isNextButtonDisabled = isRecording || (!isCurrentQuestionRecorded && !isLastQuestion && assessmentStatus !== 'pending');

  if (assessmentStatus === 'pending') {
    return <AssessmentLoading />;
  }

  return (
    <div>

      <div className="p-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out h-full flex flex-col min-h-0">
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
          disabled={isNextButtonDisabled}
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
  );
}
