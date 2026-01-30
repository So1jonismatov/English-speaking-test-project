import useTestStore from "@/stores/testStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  // onSelectQuestion is effectively disabled now as per requirements
  // onSelectQuestion,
}: QuestionsListProps) {
  const { questionRecordings } = useTestStore();

  return (
    <Card className="h-full flex flex-col bg-white border-0 shadow-md overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg font-medium text-gray-700">Questions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-3">
          {currentQuestions.map((question, index) => {
            const hasRecording =
              questionRecordings[partId]?.[index]?.recording;
            return (
              <div
                key={index}
                className={`p-3 rounded-lg transition-all border ${index === currentQuestionIndex
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 shrink-0">
                    {hasRecording ? (
                      <div className="h-4 w-4 text-green-500 flex items-center justify-center">
                        <div className="h-2 w-2 bg-green-500 rounded-full ring-2 ring-green-100"></div>
                      </div>
                    ) : (
                      <div className={`h-4 w-4 rounded-full border-2 ${index === currentQuestionIndex ? "border-blue-400" : "border-gray-300"}`}></div>
                    )}
                  </div>
                  <span className={`text-sm leading-relaxed ${index === currentQuestionIndex ? "text-gray-900 font-medium" : ""}`}>{question}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}