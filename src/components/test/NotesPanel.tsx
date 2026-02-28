import { memo } from "react";
import useTestStore from "@/stores/testStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface NotesPanelProps {
  partId: number;
  embedded?: boolean;
}

export const NotesPanel = memo(({ partId, embedded = false }: NotesPanelProps) => {
  const notesForPart = useTestStore((state) => state.notes[partId]);
  const setNotes = useTestStore((state) => state.setNotes);

  if (embedded) {
    return (
      <Textarea
        value={notesForPart || ""}
        onChange={(e) => setNotes(partId, e.target.value)}
        placeholder="Take notes here..."
        className="h-full w-full resize-none border-0 bg-transparent focus-visible:ring-0 p-0"
      />
    );
  }

  return (
    <Card className="h-full flex flex-col border-0 shadow-none bg-yellow-50">
      <CardHeader className="pb-3 border-0">
        <CardTitle className="text-lg sm:text-2xl font-medium text-amber-900/80">Notes</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-[300px]">
        <div className="absolute inset-0">
          <Textarea
            value={notesForPart || ""}
            onChange={(e) => setNotes(partId, e.target.value)}
            placeholder="Type your notes here..."
            className="w-full h-full resize-none border-0 focus-visible:ring-0 bg-yellow-50 text-base p-0 md:p-4 leading-relaxed text-amber-900"
          />
        </div>
      </CardContent>
    </Card>
  );
});