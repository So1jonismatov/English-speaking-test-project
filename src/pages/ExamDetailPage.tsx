import { useParams } from "react-router";

export default function ExamDetailPage() {
  const { examId } = useParams<{ examId: string }>();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Exam Details</h1>
      <p>Exam ID: {examId}</p>
      <p>This is a sample exam detail page.</p>
    </div>
  );
}