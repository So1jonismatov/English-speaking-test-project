import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import useTestStore from "@/stores/testStore";
import {
  handleNextQuestion,
  handlePreviousQuestion,
  isNextButtonDisabled,
} from "@/functions/Test_functions";

export const useTestLogic = (partId: number) => {
  const navigate = useNavigate();

  const currentQuestionIndex = useTestStore(state => state.currentQuestionIndex);
  const setCurrentQuestionIndex = useTestStore(state => state.setCurrentQuestionIndex);
  const questions = useTestStore(state => state.questions);
  const getTimeLimitForQuestion = useTestStore(state => state.getTimeLimitForQuestion);
  const questionRecordings = useTestStore(state => state.questionRecordings);
  const setTimer = useTestStore(state => state.setTimer);
  const setIsRecording = useTestStore(state => state.setIsRecording);
  const isPartComplete = useTestStore(state => state.isPartComplete);
  const isRecording = useTestStore(state => state.isRecording);
  const assessmentStatus = useTestStore(state => state.assessmentStatus);
  const setAssessmentStatus = useTestStore(state => state.setAssessmentStatus);
  const setTestCompleted = useTestStore(state => state.setTestCompleted);
  const fetchQuestions = useTestStore((state) => state.fetchQuestions);

  useEffect(() => {
    // Only fetch if all parts are empty to avoid resetting if they were already loaded
    if (
      questions.part1.length === 0 &&
      questions.part2.length === 0 &&
      questions.part3.length === 0
    ) {
      fetchQuestions();
    }
  }, [questions, fetchQuestions]);

  const currentQuestions =
    partId === 1
      ? questions.part1
      : partId === 2
        ? questions.part2
        : questions.part3;

  useEffect(() => {
    if (assessmentStatus === "pending") return;

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
    setCurrentQuestionIndex,
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

  const goToNextPart = useCallback(async () => {
    if (partId < 3) {
      if (partId === 2) {
        setAssessmentStatus("pending");
        setTimeout(() => {
          setAssessmentStatus("completed");
          navigate(`/test/${partId + 1}`);
        }, 2000);
      } else {
        navigate(`/test/${partId + 1}`);
      }
    } else {
      navigate("/");
    }
  }, [partId, setAssessmentStatus, navigate]);

  const submitTestResults = useCallback(async () => {
    setIsRecording(false);
    setTestCompleted(true);
    navigate("/");
  }, [setIsRecording, setTestCompleted, navigate]);

  const goToNextQuestion = useCallback(async () => {
    await handleNextQuestion(
      partId,
      currentQuestionIndex,
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
    currentQuestionIndex,
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
      currentQuestionIndex,
      changeQuestion,
      navigate,
    );
  }, [partId, currentQuestionIndex, changeQuestion, navigate]);

  const isLastQuestion =
    currentQuestionIndex === currentQuestions.length - 1 && partId === 3;

  const isCurrentQuestionRecorded =
    !!questionRecordings[partId]?.[currentQuestionIndex]?.recording;

  const nextButtonDisabled = isNextButtonDisabled(
    isRecording,
    isCurrentQuestionRecorded,
    isLastQuestion,
    assessmentStatus,
  );

  return {
    currentQuestionIndex,
    currentQuestions,
    isRecording,
    assessmentStatus,
    changeQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    isLastQuestion,
    isCurrentQuestionRecorded,
    nextButtonDisabled,
  };
};
