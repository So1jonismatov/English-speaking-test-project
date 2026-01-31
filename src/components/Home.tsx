import { Link } from "react-router";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";

export function Home() {
  return (
    <AuroraBackground>
      <div className="p-6 max-w-6xl mx-auto relative z-20">
        <h1 className="text-4xl font-bold mb-6 text-center">MAAB English Speaking Test Platform</h1>


        <div className="flex justify-center gap-4">
          <Link to="/test">
            <Button size="lg" className="px-8 py-6 text-lg">
              Start Practice Test
            </Button>
          </Link>

          <Link to="/user">
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
              View Profile
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-xl font-semibold mb-3">IELTS Speaking Practice</h3>
            <p>Familiarize yourself with the IELTS speaking test format and improve your performance.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-xl font-semibold mb-3">Real-time Feedback</h3>
            <p>Get immediate feedback on your pronunciation, fluency, and vocabulary.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
            <p>Track your improvement over time with detailed analytics and insights.</p>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}