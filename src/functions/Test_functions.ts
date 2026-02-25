import { fakeApiService } from "@/services/fakeApiService";

export function base64ToBlob(
  base64: string,
  mimeType: string = "audio/webm",
): Blob {
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

export const handleNextQuestion = async (
  partId: number,
  currentQuestionIndex: number,
  currentQuestions: any[],
  questionRecordings: any,
  // navigate: (path: string) => void,
  changeQuestion: (index: number) => void,
  goToNextPart: () => Promise<void>,
  submitTestResults: () => Promise<void>,
  isPartComplete: (partId: number) => boolean,
) => {
  const currentRecording = questionRecordings[partId]?.[currentQuestionIndex];
  if (!currentRecording || !currentRecording.recording) {
    alert(
      "Please record an answer for the current question before proceeding.",
    );
    return;
  }

  try {
    const blob = base64ToBlob(currentRecording.recording, "audio/webm");
    const filename = `Part${partId}_Question${currentQuestionIndex + 1}`;
    await fakeApiService.submitAudio(blob, filename);
  } catch (error) {
    console.error("Failed to submit audio:", error);
  }

  if (currentQuestionIndex < currentQuestions.length - 1) {
    changeQuestion(currentQuestionIndex + 1);
  } else if (partId < 3) {
    if (!isPartComplete(partId)) {
      alert(
        `Please record answers for all questions in Part ${partId} before proceeding.`,
      );
      return;
    }
    await goToNextPart();
  } else {
    if (!isPartComplete(partId)) {
      alert(
        `Please record answers for all questions in Part ${partId} before finishing.`,
      );
      return;
    }
    await submitTestResults();
  }
};

export const handlePreviousQuestion = (
  partId: number,
  currentQuestionIndex: number,
  changeQuestion: (index: number) => void,
  navigate: (path: string) => void,
) => {
  if (currentQuestionIndex > 0) {
    changeQuestion(currentQuestionIndex - 1);
  } else if (partId > 1) {
    navigate(`/test/${partId - 1}`);
  }
};

export const isNextButtonDisabled = (
  isRecording: boolean,
  isCurrentQuestionRecorded: boolean,
  isLastQuestion: boolean,
  assessmentStatus: string,
): boolean => {
  return (
    isRecording ||
    (!isCurrentQuestionRecorded &&
      !isLastQuestion &&
      assessmentStatus !== "pending")
  );
};
