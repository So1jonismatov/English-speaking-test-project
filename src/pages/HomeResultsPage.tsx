import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { AlertCircle, LoaderCircle, Maximize2, Play, RefreshCcw, RotateCcw, X } from "lucide-react";
import { animate, stagger, spring, waapi } from "animejs";
import { Button } from "@/components/ui/button";
import useTestStore from "@/stores/testStore";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { refreshAssessmentResults, type AssessmentProgressItem } from "@/services/testAssessment.service";
import { retryFailedSubmittedParts } from "@/services/testSubmission.service";

export default function HomeResultsPage() {
  const {
    resultStatus,
    submittedTestIds,
    submittedTestIdsByPart,
    assessmentError,
    resetTest,
    resultMetrics,
    overallScore,
    resultSummary,
    questionRecordings,
    questions,
    setPendingAssessment,
    setCompletedAssessment,
    setFailedAssessment,
  } = useTestStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [progress, setProgress] = useState<AssessmentProgressItem[]>([]);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  const scoreCardRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<(HTMLDivElement | null)[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  const effectiveSubmittedTestIdsByPart = useMemo(() => {
    if (Object.keys(submittedTestIdsByPart).length > 0) {
      return submittedTestIdsByPart;
    }

    return Object.fromEntries(
      submittedTestIds.slice(0, 3).map((testId, index) => [index + 1, [testId]]),
    );
  }, [submittedTestIds, submittedTestIdsByPart]);

  const handleReset = () => {
    resetTest();
  };

  const refreshStatus = async () => {
    if (resultStatus === "completed" || submittedTestIds.length === 0 || isRefreshingStatus) {
      return;
    }

    setIsRefreshingStatus(true);

    try {
      const response = await refreshAssessmentResults(submittedTestIds);

      setProgress(response.progress);

      if (response.state === "completed" && response.assessment) {
        setCompletedAssessment({
          metrics: response.assessment.metrics,
          overallScore: response.assessment.overallScore,
          summary: response.assessment.summary,
          tests: response.assessment.tests,
        });
        return;
      }

      if (response.state === "pending") {
        if (resultStatus !== "pending") {
          setPendingAssessment({
            testIds: submittedTestIds,
            testIdsByPart: effectiveSubmittedTestIdsByPart,
          });
        }
        return;
      }

      const failedTestIds = response.progress
        .filter((item) => item.state === "failed")
        .map((item) => item.testId);

      if (failedTestIds.length > 0) {
        const retryResult = await retryFailedSubmittedParts(
          failedTestIds,
          effectiveSubmittedTestIdsByPart,
          questionRecordings,
          questions,
        );

        if (retryResult.success) {
          const retainedProgress = response.progress.filter((item) => item.state !== "failed");
          const retryProgress: AssessmentProgressItem[] = retryResult.retriedParts.flatMap((part) =>
            (retryResult.testIdsByPart[part] || []).map((testId) => ({
              testId,
              status: `Re-submitted part ${part}`,
              state: "pending" as const,
            })),
          );

          setProgress([...retainedProgress, ...retryProgress]);
          setPendingAssessment({
            testIds: retryResult.testIds,
            testIdsByPart: retryResult.testIdsByPart,
          });
          return;
        }
      }

      setFailedAssessment(response.message || "Failed to refresh assessment status.");
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  useEffect(() => {
    if (resultStatus === "completed") {
      if (scoreCardRef.current) {
        animate(scoreCardRef.current, {
          opacity: [0, 1],
          translateY: [-20, 0],
          duration: 500,
          easing: "easeOutQuad",
        });
      }

      if (metricsRef.current.length > 0) {
        animate(metricsRef.current, {
          opacity: [0, 1],
          translateY: [20, 0],
          delay: stagger(100),
          duration: 500,
          easing: "easeOutQuad",
        });
      }
    }
  }, [resultStatus]);

  useEffect(() => {
    if (selectedId && modalRef.current) {
      waapi.animate(modalRef.current, {
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 500,
        ease: spring({
          bounce: 0.4,
          duration: 300
        })
      });
    }
  }, [selectedId]);

  if (resultStatus === "pending") {
    return (
      <div className="h-screen w-screen overflow-y-auto relative">
        <AuroraBackground className="absolute inset-0 z-0">
          <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
            <div className="pointer-events-auto w-full max-w-2xl rounded-[2rem] border border-white/50 bg-white/85 p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <LoaderCircle className="h-8 w-8 animate-spin" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Assessment in progress
                </h1>
                <p className="max-w-xl text-base text-gray-600">
                  Your recordings have been submitted. Use refresh to check the current status. If a submitted part fails, refresh will automatically re-submit only that failed part.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                {progress.length > 0 ? (
                  progress.map((item) => (
                    <div key={item.testId} className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Submitted Test</p>
                        <p className="font-semibold text-gray-900">{item.testId}</p>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-sm font-medium ${item.state === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {item.status}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed bg-white/60 px-4 py-6 text-center text-gray-500">
                    Waiting for the first status update from the backend.
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={() => void refreshStatus()} disabled={isRefreshingStatus || submittedTestIds.length === 0}>
                    <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshingStatus ? "animate-spin" : ""}`} /> Refresh Status
                  </Button>
                  <Button variant="outline" onClick={handleReset} disabled={isRefreshingStatus}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AuroraBackground>
      </div>
    );
  }

  if (resultStatus === "failed") {
    return (
      <div className="h-screen w-screen overflow-y-auto relative">
        <AuroraBackground className="absolute inset-0 z-0">
          <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
            <div className="pointer-events-auto w-full max-w-xl rounded-[2rem] border border-white/50 bg-white/85 p-8 shadow-2xl backdrop-blur-xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h1 className="mt-4 text-3xl font-bold text-gray-900">Assessment failed</h1>
              <p className="mt-3 text-gray-600">{assessmentError || "The backend could not finish grading this submission."}</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button onClick={() => void refreshStatus()} disabled={isRefreshingStatus || submittedTestIds.length === 0}>
                  <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshingStatus ? "animate-spin" : ""}`} /> Refresh Status
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </div>
          </div>
        </AuroraBackground>
      </div>
    );
  }

  if (resultStatus !== "completed") {
    return (
      <div className="h-screen w-screen overflow-y-auto relative">
        <AuroraBackground className="absolute inset-0 z-0">
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none">
            {/* Content Container - Pointer events auto for interactivity */}
            <div className="p-6 max-w-xl mx-auto flex flex-col items-center justify-center text-center pointer-events-auto">
              <h1 className="text-5xl font-bold mb-4 bg-clip-text ">
                <span className="text-red-500">IELTS</span> Speaking Test
              </h1>
              <p className="text-xl mb-8 max-w-md mx-auto text-[#e26020]">
                You can only start once
              </p>

              <div className="space-y-4 w-full max-w-xs">
                <Link to="/test/1" className="w-full block">
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg font-semibold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-105"
                    onClick={() => {
                      document.documentElement
                        .requestFullscreen()
                        .catch((err) => {
                          console.log("Fullscreen request failed", err);
                        });
                    }}
                  >
                    Start Full Mock Test{" "}
                    <Play className="ml-2 h-5 w-5 fill-current" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </AuroraBackground>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col relative overflow-hidden">
      <Button
        onClick={() => {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch((err) => console.log(err));
          }
          handleReset();
        }}
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur"
      >
        <RotateCcw className="h-4 w-4" /> Reset Test
      </Button>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:grid md:grid-cols-4 md:grid-rows-[3fr_2fr] gap-4 h-full pt-20 pb-6 px-6">

        <div
          ref={scoreCardRef}
          className="flex-2 md:col-span-4 bg-white rounded-2xl shadow-sm border p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden shrink-0 min-h-0 opacity-0"
        >
          <AuroraBackground className="absolute inset-0 opacity-20 pointer-events-none">

            {null}
          </AuroraBackground>
          <div className="relative z-10 text-center">
            <h2 className="text-sm md:text-2xl font-medium text-gray-500 mb-1 md:mb-2">
              Overall Band Score
            </h2>
            <div className="text-6xl md:text-8xl font-bold text-gray-900 tracking-tighter">
              {overallScore}
            </div>
            {resultSummary && (
              <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-gray-500">
                {resultSummary}
              </p>
            )}
          </div>
        </div>

        {resultMetrics.map((metric, index) => (
          <div
            key={metric.id}
            ref={(el) => { metricsRef.current[index] = el }}
            onClick={() => setSelectedId(metric.id)}
            className={`flex-1 cursor-pointer rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-row md:flex-col items-center md:items-start justify-between shadow-sm border bg-white hover:shadow-md transition-shadow relative overflow-hidden group min-h-0 opacity-0 transform hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200`}
          >
            <div
              className={`absolute top-0 left-0 bottom-0 md:bottom-auto w-1 md:w-1 md:h-full ${metric.color}`}
            />
            <div className="flex-1 ml-3 md:ml-0">
              <h3 className="text-gray-500 font-medium text-xs md:text-sm uppercase tracking-wide mb-0 md:mb-1">
                {metric.title}
              </h3>
              <div className="text-2xl md:text-4xl font-bold text-gray-800">
                {metric.score}
              </div>
            </div>
            <div className="md:mt-4 flex justify-end opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {selectedId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 backdrop-blur-sm p-4">

          <div
            className="absolute inset-0"
            onClick={() => setSelectedId(null)}
          />

          {resultMetrics.map(
            (metric) =>
              metric.id === selectedId && (
                <div
                  key={metric.id}
                  ref={modalRef}
                  className="w-full max-w-5xl h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-50 opacity-0"
                >
                  <div className={`h-2 w-full ${metric.color}`} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(null);
                    }}
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>

                  <div className="p-8 md:p-12 flex flex-col h-full">
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {metric.title}
                      </h2>
                      <div className="text-6xl font-bold text-gray-800">
                        {metric.score}
                      </div>
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-xl p-6 md:p-8 overflow-y-auto">
                      <h4 className="font-semibold text-lg mb-4 text-gray-700">
                        Detailed Analysis
                      </h4>
                      <p className="text-xl leading-relaxed text-gray-600">
                        {metric.detail}
                      </p>

                      <div className="mt-8 space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
}
