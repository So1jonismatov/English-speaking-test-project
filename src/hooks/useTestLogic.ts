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

  const {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    questions,
    getTimeLimitForQuestion,
    questionRecordings,
    setTimer,
    setIsRecording,
    isPartComplete,
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

  const goToNextPart = async () => {
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
  };

  const submitTestResults = async () => {
    setIsRecording(false);
    setTestCompleted(true);
    navigate("/");
  };

  const goToNextQuestion = useCallback(async () => {
    await handleNextQuestion(
      partId,
      currentQuestionIndex,
      currentQuestions,
      questionRecordings,
      navigate,
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
