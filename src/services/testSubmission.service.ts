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

export interface TestSubmissionResult {
  success: boolean;
  message?: string;
  submittedParts: number[];
  testIds: string[];
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
    };
  }

  if (files.length !== questions.length) {
    return {
      success: false,
      message: `Part ${part} is missing one or more recordings.`,
      submittedParts: [],
      testIds: [],
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
      };
    }

    const resolvedTestIds = await resolveCreatedTestIds(response as { test_id?: string; id?: string; task_id?: string }, knownTestIds);

    return {
      success: true,
      message: response.message,
      submittedParts: [part],
      testIds: resolvedTestIds,
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
    };
  }
};

/**
 * Submit all parts of the test
 */
export const submitCompleteTest = async (
  questionRecordings: Record<number, Record<number, { recording: string; timeSpent: number } | null>>,
  questions: {
    part1: Question[];
    part2: Question[];
    part3: Question[];
  }
): Promise<TestSubmissionResult> => {
  const submittedParts: number[] = [];
  const testIds: string[] = [];

  try {
    for (let part = 1; part <= 3; part++) {
      const partQuestions = part === 1 ? questions.part1 : part === 2 ? questions.part2 : questions.part3;

      if (partQuestions.length === 0) {
        return {
          success: false,
          message: `Part ${part} has no questions loaded. Please reload the test and try again.`,
          submittedParts,
          testIds,
        };
      }

      const files: Blob[] = [];
      const recordings = questionRecordings[part] || {};

      for (let i = 0; i < partQuestions.length; i++) {
        const recording = recordings[i];

        if (!recording?.recording) {
          return {
            success: false,
            message: `Part ${part}, question ${i + 1} is missing a recording.`,
            submittedParts,
            testIds,
          };
        }

        try {
          files.push(base64ToBlob(recording.recording, 'audio/webm'));
        } catch (conversionError) {
          console.error(`Error converting recording for part ${part} question ${i + 1}:`, conversionError);
          return {
            success: false,
            message: `Part ${part}, question ${i + 1} could not be prepared for upload.`,
            submittedParts,
            testIds,
          };
        }
      }

      const result = await submitTestAudio(part, partQuestions, files);

      if (!result.success) {
        console.error(`Failed to submit part ${part}`);
        return {
          success: false,
          message: result.message,
          submittedParts,
          testIds,
        };
      }

      submittedParts.push(...result.submittedParts);
      testIds.push(...result.testIds);
    }

    const uniqueTestIds = [...new Set(testIds)];

    if (uniqueTestIds.length === 0) {
      return {
        success: false,
        message: 'The test was submitted, but the backend did not return any trackable test ids.',
        submittedParts,
        testIds: [],
      };
    }

    return {
      success: true,
      submittedParts,
      testIds: uniqueTestIds,
    };
  } catch (error) {
    console.error('Error submitting complete test:', error);

    return {
      success: false,
      message: getApiErrorMessage(error, 'Failed to submit the completed test.'),
      submittedParts,
      testIds,
    };
  }
};
