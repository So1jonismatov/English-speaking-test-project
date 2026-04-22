import { testApi } from '@/api/test.api';
import { getApiErrorMessage, isApiUnauthorizedError } from '@/api/client';
import { base64ToBlob } from '@/functions/Test_functions';
import type { Question } from '@/api/api.types';
import { getSubmittedTestIds } from '@/services/testAssessment.service';
import useAuthStore from '@/stores/authStore';

export interface TestSubmissionData {
  part: number;
  questions: Question[];
  files: Blob[];
}

type StoredQuestionRecording = {
  recording: string;
  timeSpent: number;
  mimeType?: string;
};

type StoredQuestionRecordingsByPart = Record<number, Record<number, StoredQuestionRecording | null>>;

type QuestionGroups = {
  part1: Question[];
  part2: Question[];
  part3: Question[];
};

export type SubmittedTestIdsByPart = Record<number, string[]>;

export interface TestSubmissionResult {
  success: boolean;
  message?: string;
  submittedParts: number[];
  testIds: string[];
  testIdsByPart: SubmittedTestIdsByPart;
}

export interface RetryFailedSubmissionResult {
  success: boolean;
  message?: string;
  retriedParts: number[];
  testIds: string[];
  testIdsByPart: SubmittedTestIdsByPart;
}

const getAudioFileExtension = (mimeType: string): string => {
  if (mimeType.includes('wav')) {
    return 'wav';
  }

  if (mimeType.includes('mpeg')) {
    return 'mp3';
  }

  if (mimeType.includes('ogg')) {
    return 'ogg';
  }

  return 'webm';
};

const serializeQuestions = (questions: Question[]): string => {
  return JSON.stringify(
    questions
      .map((question) => question.question_text.trim())
      .filter((questionText) => questionText.length > 0),
  );
};

const getQuestionsForPart = (part: number, questions: QuestionGroups): Question[] => {
  if (part === 1) {
    return questions.part1;
  }

  if (part === 2) {
    return questions.part2;
  }

  return questions.part3;
};

const preparePartFiles = (
  part: number,
  partQuestions: Question[],
  questionRecordings: StoredQuestionRecordingsByPart,
): { success: true; files: Blob[] } | { success: false; message: string } => {
  if (partQuestions.length === 0) {
    return {
      success: false,
      message: `Part ${part} has no questions loaded. Please reload the test and try again.`,
    };
  }

  const files: Blob[] = [];
  const recordings = questionRecordings[part] || {};

  for (let index = 0; index < partQuestions.length; index++) {
    const recording = recordings[index];

    if (!recording?.recording) {
      return {
        success: false,
        message: `Part ${part}, question ${index + 1} is missing a recording.`,
      };
    }

    try {
      files.push(base64ToBlob(recording.recording, recording.mimeType || 'audio/webm'));
    } catch (conversionError) {
      console.error(`Error converting recording for part ${part} question ${index + 1}:`, conversionError);
      return {
        success: false,
        message: `Part ${part}, question ${index + 1} could not be prepared for upload.`,
      };
    }
  }

  return { success: true, files };
};

const getKnownTestIds = async (): Promise<Set<string>> => {
  try {
    const response = await testApi.getTests();
    const tests = Array.isArray(response.tests) ? response.tests : [];
    return new Set(getSubmittedTestIds(tests));
  } catch {
    return new Set<string>();
  }
};

const resolveCreatedTestIds = async (
  response: { test_id?: string; id?: string; task_id?: string },
  knownTestIds: Set<string>,
): Promise<string[]> => {
  const directIds = [response.test_id, response.id, response.task_id]
    .map((value) => (typeof value === 'string' && value.trim() ? value.trim() : ''))
    .filter(Boolean);

  if (directIds.length > 0) {
    return [...new Set(directIds)];
  }

  try {
    const testsResponse = await testApi.getTests();
    const tests = Array.isArray(testsResponse.tests) ? testsResponse.tests : [];
    return getSubmittedTestIds(tests).filter((testId) => !knownTestIds.has(testId));
  } catch {
    return [];
  }
};

/**
 * Submit test audio files to the backend
 * POST /test
 */
export const submitTestAudio = async (
  part: number,
  questions: Question[],
  files: Blob[]
): Promise<TestSubmissionResult> => {
  if (questions.length === 0) {
    return {
      success: false,
      message: `Part ${part} has no questions to submit.`,
      submittedParts: [],
      testIds: [],
      testIdsByPart: {},
    };
  }

  if (files.length !== questions.length) {
    return {
      success: false,
      message: `Part ${part} is missing one or more recordings.`,
      submittedParts: [],
      testIds: [],
      testIdsByPart: {},
    };
  }

  try {
    const knownTestIds = await getKnownTestIds();
    const formData = new FormData();

    formData.append('questions', serializeQuestions(questions));
    formData.append('part', part.toString());

    files.forEach((file, index) => {
      const extension = getAudioFileExtension(file.type);
      formData.append('files', file, `part${part}_question${index + 1}.${extension}`);
    });

    const response = await testApi.createTest(formData);

    if (!response.status) {
      return {
        success: false,
        message: response.message || response.error || `Part ${part} submission was rejected by the server.`,
        submittedParts: [],
        testIds: [],
        testIdsByPart: {},
      };
    }

    const resolvedTestIds = await resolveCreatedTestIds(response as { test_id?: string; id?: string; task_id?: string }, knownTestIds);

    return {
      success: true,
      message: response.message,
      submittedParts: [part],
      testIds: resolvedTestIds,
      testIdsByPart: { [part]: resolvedTestIds },
    };
  } catch (error) {
    if (isApiUnauthorizedError(error)) {
      useAuthStore.getState().clearAuth();
    }

    console.error('Error submitting test audio:', error);
    return {
      success: false,
      message: getApiErrorMessage(error, `Failed to submit part ${part}.`),
      submittedParts: [],
      testIds: [],
      testIdsByPart: {},
    };
  }
};

/**
 * Submit all parts of the test
 */
export const submitCompleteTest = async (
  questionRecordings: StoredQuestionRecordingsByPart,
  questions: QuestionGroups,
): Promise<TestSubmissionResult> => {
  const submittedParts: number[] = [];
  const testIds: string[] = [];
  const testIdsByPart: SubmittedTestIdsByPart = {};

  try {
    for (let part = 1; part <= 3; part++) {
      const partQuestions = getQuestionsForPart(part, questions);
      const preparedFiles = preparePartFiles(part, partQuestions, questionRecordings);

      if (!preparedFiles.success) {
        return {
          success: false,
          message: preparedFiles.message,
          submittedParts,
          testIds,
          testIdsByPart,
        };
      }

      const result = await submitTestAudio(part, partQuestions, preparedFiles.files);

      if (!result.success) {
        console.error(`Failed to submit part ${part}`);
        return {
          success: false,
          message: result.message,
          submittedParts,
          testIds,
          testIdsByPart,
        };
      }

      submittedParts.push(...result.submittedParts);
      testIds.push(...result.testIds);
      testIdsByPart[part] = [...new Set(result.testIds)];
    }

    const uniqueTestIds = [...new Set(testIds)];

    if (uniqueTestIds.length === 0) {
      return {
        success: false,
        message: 'The test was submitted, but the backend did not return any trackable test ids.',
        submittedParts,
        testIds: [],
        testIdsByPart,
      };
    }

    return {
      success: true,
      submittedParts,
      testIds: uniqueTestIds,
      testIdsByPart,
    };
  } catch (error) {
    console.error('Error submitting complete test:', error);

    return {
      success: false,
      message: getApiErrorMessage(error, 'Failed to submit the completed test.'),
      submittedParts,
      testIds,
      testIdsByPart,
    };
  }
};

export const retryFailedSubmittedParts = async (
  failedTestIds: string[],
  submittedTestIdsByPart: SubmittedTestIdsByPart,
  questionRecordings: StoredQuestionRecordingsByPart,
  questions: QuestionGroups,
): Promise<RetryFailedSubmissionResult> => {
  const failedIdSet = new Set(failedTestIds.map((testId) => testId.trim()).filter(Boolean));
  const retriedParts = Object.entries(submittedTestIdsByPart)
    .filter(([, testIds]) => testIds.some((testId) => failedIdSet.has(testId)))
    .map(([part]) => Number(part))
    .filter((part) => Number.isFinite(part));

  if (retriedParts.length === 0) {
    return {
      success: false,
      message: 'The failed assessment could not be retried because no matching submitted part was found.',
      retriedParts: [],
      testIds: [...new Set(Object.values(submittedTestIdsByPart).flat())],
      testIdsByPart: submittedTestIdsByPart,
    };
  }

  const nextTestIdsByPart: SubmittedTestIdsByPart = Object.fromEntries(
    Object.entries(submittedTestIdsByPart).map(([part, testIds]) => [part, [...new Set(testIds)]]),
  );

  for (const part of retriedParts) {
    const partQuestions = getQuestionsForPart(part, questions);
    const preparedFiles = preparePartFiles(part, partQuestions, questionRecordings);

    if (!preparedFiles.success) {
      return {
        success: false,
        message: preparedFiles.message,
        retriedParts,
        testIds: [...new Set(Object.values(nextTestIdsByPart).flat())],
        testIdsByPart: nextTestIdsByPart,
      };
    }

    const result = await submitTestAudio(part, partQuestions, preparedFiles.files);

    if (!result.success || result.testIds.length === 0) {
      return {
        success: false,
        message: result.message || `Part ${part} could not be re-submitted.`,
        retriedParts,
        testIds: [...new Set(Object.values(nextTestIdsByPart).flat())],
        testIdsByPart: nextTestIdsByPart,
      };
    }

    nextTestIdsByPart[part] = [...new Set(result.testIds)];
  }

  return {
    success: true,
    retriedParts,
    testIds: [...new Set(Object.values(nextTestIdsByPart).flat())],
    testIdsByPart: nextTestIdsByPart,
  };
};
