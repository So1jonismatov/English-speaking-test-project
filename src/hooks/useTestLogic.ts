import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import useTestStore from "@/stores/testStore";
import {
  handleNextQuestion,
  handlePreviousQuestion,
  isNextButtonDisabled,
} from "@/functions/Test_functions";
import { submitCompleteTest } from "@/services/testSubmission.service";

export const useTestLogic = (partId: number) => {
  const navigate = useNavigate();
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  const currentQuestionIndex = useTestStore(state => state.currentQuestionIndex);
  const setCurrentQuestionIndex = useTestStore(state => state.setCurrentQuestionIndex);
  const questions = useTestStore(state => state.questions);
  const questionsLoading = useTestStore(state => state.questionsLoading);
  const questionsError = useTestStore(state => state.questionsError);
  const getTimeLimitForQuestion = useTestStore(state => state.getTimeLimitForQuestion);
  const questionRecordings = useTestStore(state => state.questionRecordings);
  const setTimer = useTestStore(state => state.setTimer);
  const setIsRecording = useTestStore(state => state.setIsRecording);
  const isPartComplete = useTestStore(state => state.isPartComplete);
  const isRecording = useTestStore(state => state.isRecording);
  const setPendingAssessment = useTestStore(state => state.setPendingAssessment);
  const fetchQuestions = useTestStore((state) => state.fetchQuestions);

  useEffect(() => {
    // Only fetch if all parts are empty to avoid resetting if they were already loaded
    if (
      questions.part1.length === 0 &&
      questions.part2.length === 0 &&
      questions.part3.length === 0
    ) {
      void fetchQuestions();
    }
  }, []); // Empty dependency array - only run once on mount

  const currentQuestions =
    partId === 1
      ? (questions?.part1 || [])
      : partId === 2
        ? (questions?.part2 || [])
        : (questions?.part3 || []);

  useEffect(() => {
    // Reset question index when switching parts
    if (partId !== useTestStore.getState().currentPart) {
      setCurrentQuestionIndex(0);
      useTestStore.getState().setCurrentPart(partId);
    }

    const initialTime = getTimeLimitForQuestion(partId);
    setTimer(initialTime);
    setIsRecording(false);
  }, [
    partId,
    getTimeLimitForQuestion,
    setTimer,
    setIsRecording,
    setCurrentQuestionIndex,
  ]);

  // Ensure currentQuestionIndex is always valid for current part
  const safeQuestionIndex = currentQuestions.length > 0
    ? Math.min(currentQuestionIndex, currentQuestions.length - 1)
    : 0;

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

  const goToNextPart = useCallback(async () => {
    if (partId < 3) {
      navigate(`/test/${partId + 1}`);
    } else {
      navigate("/");
    }
  }, [partId, navigate]);

  const submitTestResults = useCallback(async () => {
    setIsRecording(false);
    setIsSubmittingTest(true);

    // Submit all test recordings to the backend
    const allRecordings = useTestStore.getState().questionRecordings;
    const allQuestions = useTestStore.getState().questions;

    const result = await submitCompleteTest(allRecordings, allQuestions);

    if (result.success) {
      setPendingAssessment({
        testIds: result.testIds,
        testIdsByPart: result.testIdsByPart,
      });
      navigate("/");
    } else {
      alert(result.message || "Failed to submit test results. Please try again.");
      setIsRecording(false);
      setIsSubmittingTest(false);
    }
  }, [navigate, setIsRecording, setPendingAssessment]);

  const goToNextQuestion = useCallback(async () => {
    await handleNextQuestion(
      partId,
      safeQuestionIndex,
      currentQuestions,
      questionRecordings,
      // navigate,
      changeQuestion,
      goToNextPart,
      submitTestResults,
      isPartComplete,
    );
  }, [
    partId,
    safeQuestionIndex,
    currentQuestions,
    questionRecordings,
    navigate,
    changeQuestion,
    goToNextPart,
    submitTestResults,
    isPartComplete,
  ]);

  const goToPreviousQuestion = useCallback(() => {
    handlePreviousQuestion(
      partId,
      safeQuestionIndex,
      changeQuestion,
      navigate,
    );
  }, [partId, safeQuestionIndex, changeQuestion, navigate]);

  const isLastQuestion =
    safeQuestionIndex === currentQuestions.length - 1 && partId === 3;

  const isCurrentQuestionRecorded =
    !!questionRecordings[partId]?.[safeQuestionIndex]?.recording;

  const nextButtonDisabled = isNextButtonDisabled(
    isRecording,
    isCurrentQuestionRecorded,
    isLastQuestion,
  ) || isSubmittingTest;

  return {
    currentQuestionIndex: safeQuestionIndex,
    currentQuestions,
    questionsLoading,
    questionsError,
    isRecording,
    isSubmittingTest,
    changeQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    isLastQuestion,
    isCurrentQuestionRecorded,
    nextButtonDisabled,
    retryFetchQuestions: fetchQuestions,
  };
};
