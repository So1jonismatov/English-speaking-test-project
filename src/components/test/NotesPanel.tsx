import useTestStore from "@/stores/testStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface NotesPanelProps {
  partId: number;
}

export function NotesPanel({ partId }: NotesPanelProps) {
  const { notes, setNotes } = useTestStore();

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes[partId] || ""}
          onChange={(e) => setNotes(partId, e.target.value)}
          placeholder="Take notes here..."
          className="h-80"
        />
      </CardContent>
    </Card>
  );
}