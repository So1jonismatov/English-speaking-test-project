import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { Play, RotateCcw, Maximize2, X } from "lucide-react";
import { animate, stagger, spring, waapi } from "animejs";
import { Button } from "@/components/ui/button";
import useTestStore from "@/stores/testStore";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function HomeResultsPage() {
  const {
    testCompleted,
    setTestCompleted,
    resetTest,
    resultMetrics,
    overallScore,
  } = useTestStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const scoreCardRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<(HTMLDivElement | null)[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    resetTest();
    setTestCompleted(false);
  };

  useEffect(() => {
    if (testCompleted) {
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
  }, [testCompleted]);

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

  if (!testCompleted) {
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
            <p className="text-xs md:text-base text-gray-400 mt-1 md:mt-2">
              Good User (C1)
            </p>
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
