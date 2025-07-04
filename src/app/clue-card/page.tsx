"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle, Ghost, Loader2, Sparkles, Wand2 } from "lucide-react";
import {
  analyzeClue,
  generateSuggestions,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ClueCardPreview from "@/components/ClueCardPreview";

function SubmitButton({ children, ...props }: { children: React.ReactNode } & React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return (
    <Button {...props} disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : props.startIcon}
      {children}
    </Button>
  );
}

export default function ClueCardPage() {
  const [clues, setClues] = useState<string[]>([]);
  const [currentClue, setCurrentClue] = useState("");

  const [analysisState, analyzeClueAction] = useFormState(analyzeClue, null);
  const [suggestionState, generateSuggestionsAction] = useFormState(generateSuggestions, null);

  const handleAddClue = () => {
    if (currentClue.trim() && !analysisState?.hasIdentifyingInformation) {
      setClues((prev) => [...prev, currentClue.trim()]);
      setCurrentClue("");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">Craft Your Clue Card</h1>
          <p className="mt-2 text-lg text-foreground/80">Leave a trail of breadcrumbs for your connection to follow.</p>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <Wand2 className="text-accent"/>
                    Add Your Clues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={analyzeClueAction} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clue">Enter a clue about yourself</Label>
                      <Textarea
                        id="clue"
                        name="clue"
                        placeholder="e.g., 'I have a secret talent for juggling.'"
                        value={currentClue}
                        onChange={(e) => setCurrentClue(e.target.value)}
                        rows={3}
                        required
                      />
                    </div>
                    <SubmitButton startIcon={<Sparkles className="mr-2 h-4 w-4" />}>Check Clue for Safety</SubmitButton>
                  </form>
                  {analysisState && (
                    <Alert variant={analysisState.hasIdentifyingInformation ? "destructive" : "default"} className="mt-4 animate-in fade-in-50">
                       {analysisState.hasIdentifyingInformation ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4 text-green-500"/>}
                      <AlertTitle>{analysisState.hasIdentifyingInformation ? "Warning!" : "Looks Good!"}</AlertTitle>
                      <AlertDescription>{analysisState.explanation}</AlertDescription>
                    </Alert>
                  )}
                  <Button onClick={handleAddClue} className="mt-4 w-full" disabled={!currentClue || analysisState?.hasIdentifyingInformation}>Add Clue to Card</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <Sparkles className="text-accent" />
                    Need Inspiration?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={generateSuggestionsAction} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Topic</Label>
                      <Input id="topic" name="topic" placeholder="e.g., Hobbies, Music, Dreams" required/>
                    </div>
                    <SubmitButton startIcon={<Sparkles className="mr-2 h-4 w-4" />}>Get Suggestions</SubmitButton>
                  </form>
                  {suggestionState?.suggestions && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold">Here are some ideas:</h4>
                      <div className="space-y-2">
                        {suggestionState.suggestions.map((s, i) => (
                          <button key={i} onClick={() => setClues(prev => [...prev, s])} className="block w-full text-left p-2 rounded-md bg-muted hover:bg-accent/10 transition-colors text-sm">
                            &quot;{s}&quot;
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestionState?.error && (
                     <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{suggestionState.error}</AlertDescription>
                      </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <ClueCardPreview clues={clues} onRemoveClue={(index) => setClues(clues.filter((_, i) => i !== index))} />
          </div>
        </div>
      </div>
    </div>
  );
}
