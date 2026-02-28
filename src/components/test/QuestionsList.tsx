import { memo } from "react";
import useTestStore from "@/stores/testStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuestionsListProps {
  partId: number;
  currentQuestions: string[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
}

export const QuestionsList = memo(({
  partId,
  currentQuestions,
  currentQuestionIndex,
}: QuestionsListProps) => {
  const partRecordings = useTestStore((state) => state.questionRecordings[partId]);

  return (
    <Card className="h-full flex flex-col border-0 shadow-none">
      <CardHeader className="">
        <CardTitle className="text-md sm:text-2xl font-medium">Questions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-3">
          {currentQuestions.map((question, index) => {
            const hasRecording =
              partRecordings?.[index]?.recording;
            return (
              <div
                key={index}
                className={`p-3 hover:cursor-not-allowed rounded-lg transition-all border ${index === currentQuestionIndex
                  ? "bg-[#F3F5F6] border-[#5D737E] shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 shrink-0">
                    {hasRecording ? (
                      <div className="h-4 w-4 text-[#87BBA2] flex items-center justify-center">
                        <div className="h-2 w-2 bg-[#87BBA2] rounded-full ring-2 ring-[#87BBA2]"></div>
                      </div>
                    ) : (
                      <div className={`h-4 w-4 rounded-full border-2 ${index === currentQuestionIndex ? "border-[#5D737E]" : "border-gray-300"}`}></div>
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
});