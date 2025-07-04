"use client";

import { forwardRef } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Trash2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const GhostIcon = ({className}: {className?: string}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 1 0-8c-2 0-4 1.33-6 4Z"/><path d="M18 11.5a4.5 4.5 0 0 1 0-9 4.5 4.5 0 0 1 0 9Z"/><path d="M6 11.5a4.5 4.5 0 0 1 0-9 4.5 4.5 0 0 1 0 9Z"/></svg>
);


interface Clue {
  text: string;
  emojis: string;
}

interface ClueCardPreviewProps {
  clues: Clue[];
  colorPreference: string;
  onRemoveClue: (index: number) => void;
  onShare: () => void;
  imageUrl?: string | null;
  isInteractive?: boolean;
}

const ClueCardPreview = forwardRef<HTMLDivElement, ClueCardPreviewProps>(({ clues, colorPreference, onRemoveClue, onShare, imageUrl, isInteractive = true }, ref) => {
  const { toast } = useToast();
  
  const handleShareClick = () => {
    if (!isInteractive) {
        toast({
            description: "You can only share their card to find them.",
        });
        return;
    }
    onShare();
  };

  return (
    <Card ref={ref} className="w-full max-w-sm mx-auto flex flex-col overflow-hidden shadow-2xl p-0">
        <div className={cn("aspect-[9/16] w-full relative bg-muted flex items-center justify-center")}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt="An abstract artwork representing the clues from the chat."
                    data-ai-hint="abstract art"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-8">
                    <ImageIcon className="h-16 w-16 opacity-50 text-muted-foreground" />
                    <p className="mt-4 font-semibold text-lg">Your Memento Artwork</p>
                    <p className="text-sm opacity-80">Generate a premium card to create a unique piece of art from your conversation.</p>
                </div>
            )}
        </div>
        <div className="p-4 sm:p-6 flex flex-col flex-grow bg-card text-card-foreground">
            <CardHeader className="p-0 mb-4">
                <div className="flex items-center gap-2">
                    <GhostIcon className="h-8 w-8 text-accent" />
                    <h2 className="font-headline text-2xl font-bold">Ghost n seek</h2>
                </div>
                <p className="text-muted-foreground">Can you find this person?</p>
            </CardHeader>
            <CardContent className="flex-grow p-0 min-h-[150px]">
                {clues.length > 0 ? (
                    <div className="flex h-full flex-col text-base">
                        <p className="mb-3 font-semibold text-card-foreground/90">We talked about:</p>
                        <ol className="flex-grow list-inside list-decimal space-y-2 pl-2">
                            {clues.map((clue, index) => (
                                <li key={index} className="group flex items-center justify-between gap-2 text-card-foreground">
                                    <span className="flex-1">{clue.text}</span>
                                    {isInteractive && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 flex-shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
                                            onClick={() => onRemoveClue(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
                        <p>Your clues will appear here.</p>
                        <p className="text-sm">Generate some to get started!</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="mt-auto p-0 pt-6">
                <Button onClick={handleShareClick} className="w-full bg-accent font-bold text-accent-foreground shadow-lg hover:bg-accent/90" disabled={clues.length === 0 || !isInteractive}>
                    <Share2 className="mr-2 h-4 w-4" />
                    {isInteractive ? 'Save & Share Card' : 'Your Card'}
                </Button>
            </CardFooter>
        </div>
    </Card>
  );
});

ClueCardPreview.displayName = "ClueCardPreview";
export default ClueCardPreview;
