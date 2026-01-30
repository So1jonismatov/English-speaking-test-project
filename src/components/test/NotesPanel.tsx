import useTestStore from "@/stores/testStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface NotesPanelProps {
  partId: number;
  embedded?: boolean;
}

export function NotesPanel({ partId, embedded = false }: NotesPanelProps) {
  const { notes, setNotes } = useTestStore();

  if (embedded) {
    return (
      <Textarea
        value={notes[partId] || ""}
        onChange={(e) => setNotes(partId, e.target.value)}
        placeholder="Take notes here..."
        className="h-full w-full resize-none bg-transparent border-none focus-visible:ring-0"
      />
    );
  }

  return (
    <Card className="h-full flex flex-col bg-white border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-gray-700">Notes</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-[300px]">
        <div className="absolute inset-0 p-3">
          <Textarea
            value={notes[partId] || ""}
            onChange={(e) => setNotes(partId, e.target.value)}
            placeholder="Type your notes here..."
            className="w-full h-full resize-none border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500 bg-gray-50/50 text-base rounded-md p-4 leading-relaxed"
          />
        </div>
      </CardContent>
    </Card>
  );
}