import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router';

export default function ResultsPage() {
  const navigate = useNavigate();

  const handleRetakeTest = () => {
    navigate('/test');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Test Completed!</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your IELTS Speaking Test is Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">
            Thank you for completing the IELTS speaking test. Your responses have been recorded and will be evaluated.
          </p>
          <p className="text-lg">
            Our AI will analyze your pronunciation, fluency, vocabulary, and grammar to provide detailed feedback.
          </p>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={handleRetakeTest} size="lg">
          Retake Test
        </Button>
        <Button onClick={handleGoHome} size="lg" variant="outline">
          Go to Home
        </Button>
      </div>
    </div>
  );
}