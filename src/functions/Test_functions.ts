import type { Question } from "@/api/api.types";

type QuestionRecordings = Record<
  number,
  Record<number, { recording: string; timeSpent: number; mimeType?: string } | null>
>;

export function base64ToBlob(
  base64: string,
  mimeType: string = "audio/webm",
): Blob {
  const normalizedBase64 = base64.includes(",")
    ? base64.split(",").pop() || ""
    : base64;
  const byteCharacters = atob(normalizedBase64);
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
  currentQuestions: Question[],
  questionRecordings: QuestionRecordings,
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

  // Note: Audio submission now happens when completing the entire test
  // Individual question submissions removed to match backend API design

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
): boolean => {
  return (
    isRecording ||
    (!isCurrentQuestionRecorded && !isLastQuestion)
  );
};
