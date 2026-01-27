// IndividualTestPage.tsx
import { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import useTestStore from "@/stores/testStore";
import { QuestionsList } from "@/components/test/QuestionsList";
import { RecordingArea } from "@/components/test/RecordingArea";
import { NotesPanel } from "@/components/test/NotesPanel";

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

// Utility to convert WebM to WAV (since most browsers record WebM/Opus)
async function convertBlobToWav(blob: Blob): Promise<Blob> {
  try {
    // If it's already WAV, return as-is
    if (blob.type.includes("wav")) return blob;

    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Create WAV file from AudioBuffer
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length * numberOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);

    // WAV Header
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, length, true);

    // Write audio data
    const channels = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true,
        );
        offset += 2;
      }
    }

    return new Blob([buffer], { type: "audio/wav" });
  } catch (err) {
    console.error("Conversion failed, returning original blob:", err);
    return blob;
  }
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
  } = useTestStore();

  const currentQuestions =
    partId === 1
      ? questions.part1
      : partId === 2
        ? questions.part2
        : questions.part3;

  // Initialize timer when part or question changes
  useEffect(() => {
    const initialTime = getTimeLimitForQuestion(partId);
    setTimer(initialTime);
    setIsRecording(false);
  }, [
    partId,
    currentQuestionIndex,
    getTimeLimitForQuestion,
    setTimer,
    setIsRecording,
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

  const goToNextPart = () => {
    if (partId < 3) {
      navigate(`/test/${partId + 1}`);
    } else {
      navigate("/results");
    }
  };

  const submitTestResults = async () => {
    setIsRecording(false);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const allRecordings = useTestStore.getState().questionRecordings;
    const recordingsToDownload: Array<{ blob: Blob; name: string }> = [];

    // Collect all recordings
    for (const pId in allRecordings) {
      for (const qIndex in allRecordings[pId]) {
        const recordingData = allRecordings[pId][qIndex];
        if (recordingData?.recording) {
          // Convert base64 back to blob for downloading
          const blob = base64ToBlob(recordingData.recording, 'audio/webm');
          recordingsToDownload.push({
            blob: blob,
            name: `Part${pId}_Question${parseInt(qIndex) + 1}`,
          });
        }
      }
    }

    if (recordingsToDownload.length === 0) {
      alert("No recordings found to download");
      navigate("/results");
      return;
    }

    // Download all as WAV files
    for (const { blob, name } of recordingsToDownload) {
      try {
        const wavBlob = await convertBlobToWav(blob);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `${name}.wav`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);

        // Small delay between downloads to prevent browser throttling
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`Failed to download ${name}:`, err);
      }
    }

    // Reset the test after submission
    resetTest();
    navigate("/results");
  };

  const goToNextQuestion = async () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      // Check if current question has been recorded before allowing to move to next
      const currentRecording = questionRecordings[partId]?.[currentQuestionIndex];
      if (!currentRecording || !currentRecording.recording) {
        alert("Please record an answer for the current question before proceeding.");
        return;
      }
      changeQuestion(currentQuestionIndex + 1);
    } else if (partId < 3) {
      // Check if all questions in this part have been recorded before allowing to proceed
      if (!isPartComplete(partId)) {
        alert(`Please record answers for all questions in Part ${partId} before proceeding.`);
        return;
      }
      goToNextPart();
    } else {
      // For the last part, check if all questions have been recorded
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

  // Check if current question has been recorded
  const currentRecording = questionRecordings[partId]?.[currentQuestionIndex];
  const isCurrentQuestionRecorded = !!(currentRecording && currentRecording.recording);

  const isNextButtonDisabled = isRecording || (!isCurrentQuestionRecorded && !isLastQuestion) || (isLastQuestion && !isPartComplete(partId));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        IELTS Speaking Test - Part {partId}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <QuestionsList
          partId={partId}
          currentQuestions={currentQuestions}
          currentQuestionIndex={currentQuestionIndex}
          onSelectQuestion={changeQuestion}
        />

        {/* Key forces remount for fresh visualizer per question */}
        <RecordingArea
          key={`${partId}-${currentQuestionIndex}`}
          partId={partId}
          currentQuestion={currentQuestions[currentQuestionIndex]}
          currentQuestionIndex={currentQuestionIndex}
        />

        <NotesPanel partId={partId} />
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0 && partId === 1}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <Button
          onClick={goToNextQuestion}
          disabled={isNextButtonDisabled}
          className={isLastQuestion ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isLastQuestion ? (
            <>
              Finish & Download All <Download className="ml-2 h-4 w-4" />
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
