"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ghost, Loader2, Share2, Trash2 } from "lucide-react";

interface Clue {
  text: string;
  emojis: string;
}

interface ClueCardPreviewProps {
  clues: Clue[];
  onRemoveClue: (index: number) => void;
  onShare: () => void;
  isGenerating: boolean;
}

export default function ClueCardPreview({ clues, onRemoveClue, onShare, isGenerating }: ClueCardPreviewProps) {

  return (
    <Card className="relative h-full min-h-[500px] w-full flex flex-col overflow-hidden bg-primary text-primary-foreground shadow-2xl">
      <Ghost className="absolute -right-12 -top-12 h-48 w-48 text-white/5 opacity-50" />
      <CardHeader>
        <div className="flex items-center gap-2">
          <Ghost className="h-8 w-8 text-accent" />
          <h2 className="font-headline text-2xl font-bold">Ghost n seek</h2>
        </div>
        <p className="text-primary-foreground/80">Can you find this person?</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
          {clues.length > 0 ? (
            clues.map((clue, index) => (
              <div key={index} className="group flex items-center justify-between gap-2 rounded-md bg-white/10 p-3">
                <p className="flex-1">
                  <span className="mr-2 text-lg">{clue.emojis}</span> &ldquo;{clue.text}&rdquo;
                </p>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-white/20" onClick={() => onRemoveClue(index)}>
                    <Trash2 className="h-4 w-4"/>
                </Button>
              </div>
            ))
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-primary-foreground/60 p-8 border-2 border-dashed border-white/20 rounded-lg">
                <p>Your clues will appear here.</p>
                <p className="text-sm">Add some from the left!</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 mt-auto">
        <Button onClick={onShare} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg" disabled={isGenerating || clues.length === 0}>
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
          {isGenerating ? "Generating Art..." : "Save & Share Card"}
        </Button>
      </CardFooter>
    </Card>
  );
}
