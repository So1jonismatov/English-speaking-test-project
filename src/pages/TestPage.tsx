// TestPage.tsx
import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useTestStore from "@/stores/testStore";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function TestPage() {
  const { questions, fetchQuestions } = useTestStore();
  const [hasFetched, setHasFetched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetQuestions = async () => {
    setLoading(true);
    await fetchQuestions();
    setHasFetched(true);
    setLoading(false);
  };

  return (
    <AuroraBackground>
      <div className="p-6 max-w-6xl mx-auto relative z-20">
        <h1 className="text-3xl font-bold mb-8 text-center">
          IELTS Speaking Test
        </h1>

        {!hasFetched ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Button
              size="lg"
              onClick={handleGetQuestions}
              disabled={loading}
              className="text-lg px-8 py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading Questions...
                </>
              ) : (
                "Get Questions"
              )}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Part 1 Card */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Part 1: Introduction & Interview</span>
                  <Link to="/test/1">
                    <Play className="h-5 w-5 text-blue-500 hover:text-blue-700 cursor-pointer" />
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {questions.part1.map((question, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-100 rounded mb-2 text-sm"
                    >
                      {index + 1}. {question}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Part 2 Card */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Part 2: Long Turn</span>
                  <Link to="/test/2">
                    <Play className="h-5 w-5 text-blue-500 hover:text-blue-700 cursor-pointer" />
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {questions.part2.map((question, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-100 rounded mb-2 text-sm"
                    >
                      {index + 1}. {question}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Part 3 Card */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Part 3: Discussion</span>
                  <Link to="/test/3">
                    <Play className="h-5 w-5 text-blue-500 hover:text-blue-700 cursor-pointer" />
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {questions.part3.map((question, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-100 rounded mb-2 text-sm"
                    >
                      {index + 1}. {question}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}
