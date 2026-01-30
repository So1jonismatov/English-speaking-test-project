
import { Loader2 } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";

export function AssessmentLoading() {
    return (
        <AuroraBackground>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center z-10">
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-6" />
                <h2 className="text-2xl font-bold mb-2">Assessing Your Performance</h2>
                <p className="text-muted-foreground max-w-md">
                    Please wait while our AI analyzes your responses from Part 2 to tailor the discussion in Part 3.
                </p>
            </div>
        </AuroraBackground>
    );
}
