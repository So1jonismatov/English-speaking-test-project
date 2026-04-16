import { getApiErrorMessage, isApiUnauthorizedError } from '@/api/client';
import { testApi } from '@/api/test.api';
import type { Test, UnknownRecord } from '@/api/api.types';
import useAuthStore from '@/stores/authStore';

export interface AssessmentMetric {
  id: string;
  title: string;
  score: number;
  color: string;
  detail: string;
}

export interface AssessmentResult {
  overallScore: number;
  metrics: AssessmentMetric[];
  summary: string | null;
  tests: Test[];
}

export interface AssessmentProgressItem {
  testId: string;
  status: string;
  state: 'pending' | 'completed' | 'failed';
}

export interface AssessmentRefreshResult {
  state: 'pending' | 'completed' | 'failed';
  progress: AssessmentProgressItem[];
  assessment?: AssessmentResult;
  message?: string;
}

type MetricConfig = {
  id: AssessmentMetric['id'];
  title: AssessmentMetric['title'];
  color: AssessmentMetric['color'];
  scoreKeys: string[];
  detailKeys: string[];
};

const METRIC_CONFIGS: MetricConfig[] = [
  {
    id: 'fluency',
    title: 'Fluency & Coherence',
    color: 'bg-blue-500',
    scoreKeys: ['fluency', 'fluency_and_coherence', 'fluency_coherence'],
    detailKeys: ['fluency_feedback', 'fluency_detail', 'fluency_comment', 'fluency_and_coherence_feedback'],
  },
  {
    id: 'lexical',
    title: 'Lexical Resource',
    color: 'bg-green-500',
    scoreKeys: ['lexical', 'lexical_resource', 'vocabulary'],
    detailKeys: ['lexical_feedback', 'lexical_resource_feedback', 'lexical_detail', 'vocabulary_feedback'],
  },
  {
    id: 'grammar',
    title: 'Grammar & Accuracy',
    color: 'bg-purple-500',
    scoreKeys: ['grammar', 'grammar_accuracy', 'grammar_range_accuracy', 'grammar_range_and_accuracy'],
    detailKeys: ['grammar_feedback', 'grammar_detail', 'grammar_accuracy_feedback', 'grammar_range_and_accuracy_feedback'],
  },
  {
    id: 'pronunciation',
    title: 'Pronunciation',
    color: 'bg-orange-500',
    scoreKeys: ['pronunciation', 'accent'],
    detailKeys: ['pronunciation_feedback', 'pronunciation_detail', 'accent_feedback'],
  },
];

const OVERALL_SCORE_KEYS = [
  'overall_score',
  'overallscore',
  'band_score',
  'bandscore',
  'total_score',
  'totalscore',
  'final_score',
  'finalscore',
  'score',
];

const SUMMARY_KEYS = [
  'summary',
  'feedback',
  'overall_feedback',
  'overallfeedback',
  'comment',
  'comments',
  'remarks',
  'ai_feedback',
];

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const normalizeKey = (key: string): string => {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(/[^0-9.\-]/g, '');
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const roundScore = (value: number): number => {
  return Math.round(value * 10) / 10;
};

const collectMatchingValues = (
  source: unknown,
  candidateKeys: string[],
  matches: unknown[] = [],
): unknown[] => {
  const normalizedKeySet = new Set(candidateKeys.map(normalizeKey));

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!isRecord(value)) {
      return;
    }

    Object.entries(value).forEach(([key, nestedValue]) => {
      if (normalizedKeySet.has(normalizeKey(key))) {
        matches.push(nestedValue);
      }

      visit(nestedValue);
    });
  };

  visit(source);
  return matches;
};

const extractFirstText = (source: unknown, candidateKeys: string[]): string => {
  return collectMatchingValues(source, candidateKeys)
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .find((value) => value.length > 0) || '';
};

const extractNumericAverage = (sources: unknown[], candidateKeys: string[]): number | null => {
  const values = sources
    .flatMap((source) => collectMatchingValues(source, candidateKeys))
    .map(toFiniteNumber)
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return roundScore(total / values.length);
};

const normalizeTestId = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

const extractTestId = (value: unknown): string | null => {
  if (isRecord(value)) {
    return (
      normalizeTestId(value.test_id) ||
      normalizeTestId(value.task_id) ||
      normalizeTestId(value.id)
    );
  }

  return normalizeTestId(value);
};

const classifyAssessmentState = (status: string): AssessmentProgressItem['state'] => {
  const normalized = normalizeKey(status);

  if (['failed', 'error', 'cancelled', 'rejected'].some((value) => normalized.includes(value))) {
    return 'failed';
  }

  if (['completed', 'complete', 'success', 'succeeded', 'done', 'finished', 'graded', 'evaluated'].some((value) => normalized.includes(value))) {
    return 'completed';
  }

  return 'pending';
};

const normalizeTests = (tests: Test[]): Test[] => {
  const seen = new Set<string>();

  return tests.filter((test, index) => {
    const testId = extractTestId(test) || `index-${index}`;

    if (seen.has(testId)) {
      return false;
    }

    seen.add(testId);
    return true;
  });
};

const buildAssessmentResult = (tests: Test[]): AssessmentResult => {
  const metrics = METRIC_CONFIGS.map((config) => {
    const score = extractNumericAverage(tests, config.scoreKeys) ?? 0;
    const detail = tests
      .map((test) => extractFirstText(test, config.detailKeys))
      .find((value) => value.length > 0) || 'No detailed feedback was returned for this criterion.';

    return {
      id: config.id,
      title: config.title,
      score,
      color: config.color,
      detail,
    };
  });

  const metricScores = metrics.map((metric) => metric.score).filter((score) => score > 0);
  const overallScore =
    extractNumericAverage(tests, OVERALL_SCORE_KEYS) ??
    (metricScores.length > 0
      ? roundScore(metricScores.reduce((sum, score) => sum + score, 0) / metricScores.length)
      : 0);

  const summary = tests
    .map((test) => extractFirstText(test, SUMMARY_KEYS))
    .find((value) => value.length > 0) || null;

  return {
    overallScore,
    metrics,
    summary,
    tests,
  };
};

const fetchTestsByIds = async (testIds: string[]): Promise<Test[]> => {
  const directResponses = await Promise.all(
    testIds.map(async (testId) => {
      try {
        const response = await testApi.getTest(testId);
        return response.status && response.test ? response.test : null;
      } catch {
        return null;
      }
    }),
  );

  const directTests = directResponses.filter((test): test is Test => test !== null);

  if (directTests.length === testIds.length) {
    return normalizeTests(directTests);
  }

  const listResponse = await testApi.getTests();
  const listedTests = Array.isArray(listResponse.tests) ? listResponse.tests : [];
  const byId = new Map<string, Test>();

  listedTests.forEach((test) => {
    const testId = extractTestId(test);
    if (testId) {
      byId.set(testId, test);
    }
  });

  const merged = [...directTests];

  testIds.forEach((testId) => {
    const fallbackTest = byId.get(testId);
    if (fallbackTest) {
      merged.push(fallbackTest);
    }
  });

  return normalizeTests(merged);
};

export const getSubmittedTestIds = (tests: Test[]): string[] => {
  return normalizeTests(tests)
    .map((test) => extractTestId(test))
    .filter((testId): testId is string => Boolean(testId));
};

export const refreshAssessmentResults = async (testIds: string[]): Promise<AssessmentRefreshResult> => {
  try {
    const uniqueTestIds = [...new Set(testIds.map((testId) => testId.trim()).filter(Boolean))];

    if (uniqueTestIds.length === 0) {
      return {
        state: 'failed',
        progress: [],
        message: 'No submitted test ids are available for status tracking.',
      };
    }

    const statusResponses = await Promise.all(
      uniqueTestIds.map(async (testId) => {
        const response = await testApi.getStatus(testId);
        return {
          testId,
          status: response.test_status || 'pending',
        };
      }),
    );

    const progress = statusResponses.map((item) => ({
      ...item,
      state: classifyAssessmentState(item.status),
    }));

    if (progress.some((item) => item.state === 'failed')) {
      return {
        state: 'failed',
        progress,
        message: 'The assessment service reported a failure for at least one submitted test.',
      };
    }

    if (progress.some((item) => item.state === 'pending')) {
      return {
        state: 'pending',
        progress,
      };
    }

    const tests = await fetchTestsByIds(uniqueTestIds);
    const assessment = buildAssessmentResult(tests);

    return {
      state: 'completed',
      progress,
      assessment,
    };
  } catch (error) {
    if (isApiUnauthorizedError(error)) {
      useAuthStore.getState().clearAuth();
    }

    return {
      state: 'failed',
      progress: [],
      message: getApiErrorMessage(error, 'Failed to refresh assessment results.'),
    };
  }
};
