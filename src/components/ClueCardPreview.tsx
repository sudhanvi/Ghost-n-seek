"use client";

import { forwardRef } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ghost, Share2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

const ClueCardPreview = forwardRef<HTMLDivElement, ClueCardPreviewProps>(({ clues, colorPreference, onRemoveClue, onShare, imageUrl }, ref) => {
  const colorSchemes: Record<string, string> = {
    Indigo: "bg-primary text-primary-foreground",
    Lavender: "bg-card-lavender text-card-lavender-foreground",
    Purple: "bg-accent text-accent-foreground",
    Crimson: "bg-card-crimson text-card-crimson-foreground",
    Teal: "bg-card-teal text-card-teal-foreground",
  };

  const cardClass = colorSchemes[colorPreference] || colorSchemes.Indigo;
  const isDark = colorPreference !== 'Lavender';

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
        <Ghost className={cn("absolute -right-12 -top-12 h-48 w-48 opacity-5", isDark ? 'text-white' : 'text-black')} />
      )}
      
      <div className={cn("relative z-20 flex flex-col h-full", imageUrl && "text-white")}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ghost className={cn("h-8 w-8", imageUrl ? "text-white" : "text-accent")} />
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
                  <p className="text-sm">Generate some from the left!</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 mt-auto">
            <Button onClick={onShare} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg" disabled={clues.length === 0}>
              <Share2 className="mr-2 h-4 w-4" />
              Save & Share Card
            </Button>
          </CardFooter>
      </div>
    </Card>
  );
});

ClueCardPreview.displayName = "ClueCardPreview";
export default ClueCardPreview;
