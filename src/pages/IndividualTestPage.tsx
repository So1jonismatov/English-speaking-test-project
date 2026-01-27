import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, RotateCcw, ArrowLeft, ArrowRight, Square, SquareCheck } from 'lucide-react';
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';
import useTestStore from '@/stores/testStore';

// Define the NodeJS namespace for TypeScript
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

export default function IndividualTestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const partId = parseInt(id || '1');

  const {
    setCurrentPart,
    setRecording,
    notes,
    setNotes,
    setIsRecording,
    questions
  } = useTestStore();
  
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showSendButtons, setShowSendButtons] = useState(false);
  
  const recorderControls = useVoiceVisualizer({
    onStartRecording: () => {
      setIsRecording(true);
      setIsTimerRunning(true);
    },
    onStopRecording: () => {
      setIsRecording(false);
      setIsTimerRunning(false);
      setShowSendButtons(true);
    }
  });

  const { 
    startRecording, 
    stopRecording, 
    recordedBlob,
    isRecordingInProgress 
  } = recorderControls;

  // Set current part when component mounts
  useEffect(() => {
    setCurrentPart(partId);
    setTimeLeft(120); // Reset to 2 minutes for the part
  }, [partId, setCurrentPart]);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;

    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      if (isRecordingInProgress) {
        stopRecording();
      }
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, isRecordingInProgress, stopRecording]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle recording
  const handleRecord = () => {
    if (!isRecordingInProgress) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  // Handle sending recording
  const handleSend = () => {
    if (recordedBlob) {
      setRecording(partId, recordedBlob);
      setShowSendButtons(false);
    }
  };

  // Handle restart recording
  const handleRestart = () => {
    setShowSendButtons(false);
    // Reset timer to 2 minutes
    setTimeLeft(120);
    setIsTimerRunning(false);
  };

  // Handle navigation between parts
  const goToPreviousPart = () => {
    if (partId > 1) {
      navigate(`/test/${partId - 1}`);
    }
  };

  const goToNextPart = () => {
    if (partId < 3) {
      navigate(`/test/${partId + 1}`);
    } else {
      // If on part 3, finish the test
      navigate('/results'); // We'll create this later
    }
  };

  // Get questions for current part
  const currentQuestions = 
    partId === 1 ? questions.part1 :
    partId === 2 ? questions.part2 :
    questions.part3;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">IELTS Speaking Test - Part {partId}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Card - Questions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {currentQuestions.map((question, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  {question}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Middle Card - Recording Area */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recording</CardTitle>
            <div className="text-2xl font-mono bg-gray-200 px-4 py-2 rounded">
              {formatTime(timeLeft)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <VoiceVisualizer 
                controls={recorderControls} 
                height={200}
                width="100%"
                mainBarColor="#3b82f6"
                secondaryBarColor="#93c5fd"
                barWidth={3}
                gap={2}
              />
              
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {!showSendButtons ? (
                  <>
                    <Button
                      onClick={handleRecord}
                      size="lg"
                      disabled={isRecordingInProgress}
                    >
                      {isRecordingInProgress ? (
                        <>
                          <Square className="mr-2 h-4 w-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Square className="mr-2 h-4 w-4" />
                          Record
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleSend} size="lg" className="bg-green-600 hover:bg-green-700">
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </Button>
                    <Button onClick={handleRestart} size="lg" variant="outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restart
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Card - Notes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes[partId]}
              onChange={(e) => setNotes(partId, e.target.value)}
              placeholder="Take notes here..."
              className="h-80"
            />
          </CardContent>
        </Card>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <Button 
          onClick={goToPreviousPart} 
          disabled={partId === 1}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <Button 
          onClick={goToNextPart}
        >
          {partId === 3 ? (
            <>
              Finish <SquareCheck className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}