import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import useTestStore from "@/stores/testStore";
import { AuroraBackground } from "@/components/ui/aurora-background";
import useAuthStore from "../stores/authStore";

export default function HomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const fetchQuestions = useTestStore((state) => state.fetchQuestions);

  const handleStartTest = async () => {
    await fetchQuestions(); // Fetch questions before starting the test
    navigate("/test");
  };

  return (
    <AuroraBackground>
      <div className="p-8 max-w-4xl mx-auto text-center relative z-20">
        <h1 className="text-4xl font-bold mb-6">Welcome {user?.name}!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Ready to take your IELTS speaking test? Click the button below to
          begin.
        </p>
        <div className="flex justify-center">
          <Button
            size="lg"
            className="px-8 py-4 text-lg shadow-xs shadow-primary/10 border-none"
            onClick={handleStartTest}
          >
            Start Test
          </Button>
        </div>
      </div>
    </AuroraBackground>
  );
}
