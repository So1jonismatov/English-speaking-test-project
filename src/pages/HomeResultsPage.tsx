import { useState } from "react";
import { Link } from "react-router";
import { Play, RotateCcw, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import useTestStore from "@/stores/testStore";
import { AuroraBackground } from "@/components/ui/aurora-background";

// Mock data for results - in a real app this would come from the store or API
const resultMetrics = [
    { id: "fluency", title: "Fluency & Coherence", score: 7.5, color: "bg-blue-500", detail: "You spoke at length without noticeable effort or loss of coherence. You demonstrated a good range of connectives and discourse markers." },
    { id: "lexical", title: "Lexical Resource", score: 8.0, color: "bg-green-500", detail: "You used a wide range of vocabulary with very natural and sophisticated control of lexical features." },
    { id: "grammar", title: "Grammar & Accuracy", score: 7.0, color: "bg-purple-500", detail: "You used a mix of simple and complex sentence forms. There were some minor errors but they did not impede communication." },
    { id: "pronunciation", title: "Pronunciation", score: 7.5, color: "bg-orange-500", detail: "Your pronunciation was generally clear with effective use of intonation and stress." },
];

export default function HomeResultsPage() {
    const { testCompleted, setTestCompleted, resetTest } = useTestStore();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleReset = () => {
        resetTest();
        setTestCompleted(false);
    };

    if (!testCompleted) {
        // Start Test View (Aurora Background from original TestPage)
        return (
            <AuroraBackground>
                <div className="p-6 max-w-xl mx-auto relative z-20 flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-violet-600">
                        IELTS Speaking Test
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                        Experience a realistic IELTS Speaking simulation with instant AI feedback.
                    </p>

                    <div className="space-y-4 w-full max-w-xs">
                        <Link to="/test/1" className="w-full block">
                            <Button
                                size="lg"
                                className="w-full h-14 text-lg font-semibold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-105"
                                onClick={() => {
                                    document.documentElement.requestFullscreen().catch((err) => {
                                        console.log("Fullscreen request failed", err);
                                    });
                                }}
                            >
                                Start Full Mock Test <Play className="ml-2 h-5 w-5 fill-current" />
                            </Button>
                        </Link>

                        <p className="text-xs text-red-500 font-medium bg-red-50 py-2 px-3 rounded-md border border-red-100">
                            Warning: Once started, you cannot undo or go back.
                        </p>
                    </div>
                </div>
            </AuroraBackground>
        );
    }

    // Results Grid View
    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col relative h-screen overflow-hidden">
            <Button
                onClick={() => {
                    if (document.fullscreenElement) {
                        document.exitFullscreen().catch(err => console.log(err));
                    }
                    handleReset();
                }}
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur"
            >
                <RotateCcw className="h-4 w-4" /> Reset Test
            </Button>

            <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 grid-rows-[3fr_2fr] gap-4 h-full pt-16">

                {/* Top Row: Overall Score - Spans all 4 columns */}
                <motion.div
                    className="md:col-span-4 bg-white rounded-2xl shadow-sm border p-8 flex flex-col items-center justify-center relative overflow-hidden"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <AuroraBackground className="absolute inset-0 opacity-20 pointer-events-none">
                        {/* Empty children to satisfy required prop */}
                        {null}
                    </AuroraBackground>
                    <div className="relative z-10 text-center">
                        <h2 className="text-2xl font-medium text-gray-500 mb-2">Overall Band Score</h2>
                        <div className="text-8xl font-bold text-gray-900 tracking-tighter">7.5</div>
                        <p className="text-gray-400 mt-2">Good User (C1)</p>
                    </div>
                </motion.div>

                {/* Bottom Row: 4 Metric Cards */}
                {resultMetrics.map((metric) => (
                    <motion.div
                        key={metric.id}
                        layoutId={metric.id}
                        onClick={() => setSelectedId(metric.id)}
                        className={`cursor-pointer rounded-2xl p-6 flex flex-col justify-between shadow-sm border bg-white hover:shadow-md transition-shadow relative overflow-hidden group`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className={`absolute top-0 left-0 w-1 h-full ${metric.color}`} />
                        <div>
                            <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wide mb-1">{metric.title}</h3>
                            <div className="text-4xl font-bold text-gray-800">{metric.score}</div>
                        </div>
                        <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 className="h-5 w-5 text-gray-400" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Expanded Card Overlay */}
            <AnimatePresence>
                {selectedId && (
                    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 backdrop-blur-sm p-4">
                        {/* Backdrop click to close */}
                        <div className="absolute inset-0" onClick={() => setSelectedId(null)} />

                        {resultMetrics.map(metric => (
                            metric.id === selectedId && (
                                <motion.div
                                    key={metric.id}
                                    layoutId={metric.id}
                                    className="w-full max-w-5xl h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-50"
                                >
                                    <div className={`h-2 w-full ${metric.color}`} />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                                        className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-600" />
                                    </button>

                                    <div className="p-8 md:p-12 flex flex-col h-full">
                                        <div className="mb-8">
                                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{metric.title}</h2>
                                            <div className="text-6xl font-bold text-gray-800">{metric.score}</div>
                                        </div>

                                        <div className="flex-1 bg-gray-50 rounded-xl p-6 md:p-8 overflow-y-auto">
                                            <h4 className="font-semibold text-lg mb-4 text-gray-700">Detailed Analysis</h4>
                                            <p className="text-xl leading-relaxed text-gray-600">{metric.detail}</p>

                                            {/* Placeholder for more content */}
                                            <div className="mt-8 space-y-4">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
