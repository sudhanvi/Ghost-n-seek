"use client";

import { forwardRef } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Trash2 } from "lucide-react";
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
  const colorSchemes: Record<string, string> = {
    Indigo: "bg-primary text-primary-foreground",
    Lavender: "bg-card-lavender text-card-lavender-foreground",
    Purple: "bg-accent text-accent-foreground",
    Crimson: "bg-card-crimson text-card-crimson-foreground",
    Teal: "bg-card-teal text-card-teal-foreground",
  };

  const cardClass = colorSchemes[colorPreference] || colorSchemes.Indigo;
  const isDark = colorPreference !== 'Lavender';

  const handleShareClick = () => {
    if (!isInteractive) {
        toast({
            description: "You can only share your own card.",
        });
        return;
    }
    onShare();
  };

  return (
    <Card ref={ref} className={cn(
      "relative h-full min-h-[500px] w-full flex flex-col overflow-hidden shadow-2xl transition-colors duration-300", 
      !imageUrl && cardClass
    )}
    style={imageUrl ? {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : {}}>
      {imageUrl && (
        <div className="absolute inset-0 bg-black/50 z-10" /> 
      )}
      {!imageUrl && (
        <GhostIcon className={cn("absolute -right-12 -top-12 h-48 w-48 opacity-5", isDark ? 'text-white' : 'text-black')} />
      )}
      
      <div className={cn("relative z-20 flex flex-col h-full", imageUrl && "text-white")}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GhostIcon className={cn("h-8 w-8", imageUrl ? "text-white" : "text-accent-foreground")} />
              <h2 className="font-headline text-2xl font-bold">Ghost n seek</h2>
            </div>
            <p className={cn("opacity-80", imageUrl && "opacity-90")}>Can you find this person?</p>
          </CardHeader>
          <CardContent className="flex-grow p-4">
            <div className="h-full">
              {clues.length > 0 ? (
                <div className={cn("p-4 rounded-lg flex flex-col h-full text-base", 
                  imageUrl ? 'bg-white/20 backdrop-blur-sm' : (isDark ? 'bg-white/10' : 'bg-black/5')
                )}>
                  <p className="mb-3 font-semibold">We talked about:</p>
                  <ol className="space-y-2 list-decimal list-inside pl-2 flex-grow">
                    {clues.map((clue, index) => (
                      <li key={index} className="group flex items-center justify-between gap-2">
                        <span className="flex-1">{clue.text}</span>
                        {isInteractive && (
                            <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex-shrink-0", 
                                imageUrl || isDark ? "hover:bg-white/20" : "hover:bg-black/10"
                            )}
                            onClick={() => onRemoveClue(index)}
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                      </li>
                    ))}
                  </ol>
                  <p className={cn("mt-4 pt-4 border-t text-center italic text-sm", 
                    imageUrl ? 'border-white/20' : (isDark ? 'border-white/10' : 'border-black/10')
                  )}>Now find me on social media ;)</p>
                </div>
              ) : (
                 <div className={cn("flex h-full flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg", 
                    imageUrl ? 'border-white/50 opacity-80' : `opacity-60 ${isDark ? 'border-white/20' : 'border-black/20'}`
                )}>
                  <p>Your clues will appear here.</p>
                  <p className="text-sm">Generate some to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 mt-auto">
            <Button onClick={handleShareClick} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg" disabled={clues.length === 0 || !isInteractive}>
              <Share2 className="mr-2 h-4 w-4" />
              {isInteractive ? 'Save & Share Card' : 'Partner Card'}
            </Button>
          </CardFooter>
      </div>
    </Card>
  );
});

ClueCardPreview.displayName = "ClueCardPreview";
export default ClueCardPreview;
