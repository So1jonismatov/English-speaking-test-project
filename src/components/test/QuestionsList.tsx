import useTestStore from "@/stores/testStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

interface QuestionsListProps {
  partId: number;
  currentQuestions: string[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
}

export function QuestionsList({
  partId,
  currentQuestions,
  currentQuestionIndex,
  onSelectQuestion,
}: QuestionsListProps) {
  const { questionRecordings } = useTestStore();

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {currentQuestions.map((question, index) => {
            const hasRecording =
              questionRecordings[partId]?.[index]?.recording;
            return (
              <div
                key={index}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  index === currentQuestionIndex
                    ? "bg-blue-100 border border-blue-300"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
                onClick={() => onSelectQuestion(index)}
              >
                <div className="flex items-center">
                  {hasRecording ? (
                    <div className="h-4 w-4 mr-2 text-green-500 flex items-center justify-center">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                  ) : (
                    <Play className="h-4 w-4 mr-2 text-blue-500" />
                  )}
                  <span className="text-sm">{question}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}