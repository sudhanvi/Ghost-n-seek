"use client";

import { useState, useEffect, useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Ghost, Loader2, Sparkles, Palette, MessageSquareQuote } from "lucide-react";
import {
  generateSuggestions,
  generateCluesFromChatAction
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ClueCardPreview from "@/components/ClueCardPreview";
import ShareDialog from "@/components/ShareDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SubmitButton({ children, ...props }: { children: React.ReactNode; } & React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return (
    <Button {...props} disabled={pending || props.disabled}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  );
}

type Clue = {
  text: string;
  emojis: string;
};

type Message = {
  id: number;
  sender: "me" | "them";
  text: string;
};

export default function ClueCardPage() {
  const [clues, setClues] = useState<Clue[]>([]);
  const [colorPreference, setColorPreference] = useState("Indigo");
  
  const [suggestionState, generateSuggestionsAction] = useActionState(generateSuggestions, null);

  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isGeneratingFromChat, setIsGeneratingFromChat] = useState(false);
  const [chatGenerationResult, setChatGenerationResult] = useState<{suggestions?: {clue: string, emojis: string}[], error?: string} | null>(null);

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const cardPreviewRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const savedChatHistory = sessionStorage.getItem('chatHistory');
    if (savedChatHistory) {
      try {
        const parsedHistory = JSON.parse(savedChatHistory);
        setChatHistory(parsedHistory);
      } catch (e) {
        console.error("Failed to parse chat history:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (suggestionState?.suggestions) {
      setClues(suggestionState.suggestions.map(s => ({text: s.clue, emojis: s.emojis})));
    }
  }, [suggestionState]);
  
  const handleGenerateCluesFromChat = async () => {
    if (chatHistory.length === 0) return;
    setIsGeneratingFromChat(true);
    setChatGenerationResult(null);
    setClues([]);
    const result = await generateCluesFromChatAction(chatHistory);
    setChatGenerationResult(result);
    if (result.suggestions) {
      setClues(result.suggestions.map(s => ({text: s.clue, emojis: s.emojis})));
    }
    setIsGeneratingFromChat(false);
  };

  const handleShare = () => {
    if (clues.length === 0) return;
    setIsShareDialogOpen(true);
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
              <Card className="sm:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <Sparkles className="text-accent" />
                    Generate Your Clues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chatHistory.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">We found your recent chat. Let AI find some interesting clues from it!</p>
                      <Button onClick={handleGenerateCluesFromChat} disabled={isGeneratingFromChat} className="w-full">
                          {isGeneratingFromChat ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageSquareQuote className="mr-2 h-4 w-4"/>}
                          {isGeneratingFromChat ? 'Analyzing Chat...' : 'Generate from Last Chat'}
                      </Button>
                      
                      {chatGenerationResult && !isGeneratingFromChat && (
                        <div className="mt-4">
                            {chatGenerationResult.error ? (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{chatGenerationResult.error}</AlertDescription>
                                </Alert>
                            ) : chatGenerationResult.suggestions && chatGenerationResult.suggestions.length > 0 ? (
                                <Alert>
                                    <Sparkles className="h-4 w-4" />
                                    <AlertTitle>Success!</AlertTitle>
                                    <AlertDescription>Your clues are ready. Check out the preview!</AlertDescription>
                                </Alert>
                            ) : (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>No Clues Found</AlertTitle>
                                    <AlertDescription>We couldn't find any unique topics in the chat. Try generating clues from a topic instead.</AlertDescription>
                                </Alert>
                            )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <form action={generateSuggestionsAction} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="topic">Or, get suggestions for a topic</Label>
                          <Input id="topic" name="topic" placeholder="e.g., Hobbies, Music, Dreams" required/>
                        </div>
                        <SubmitButton>Get Suggestions</SubmitButton>
                      </form>
                      {suggestionState && (
                        <div className="mt-4">
                            {suggestionState.error ? (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{suggestionState.error}</AlertDescription>
                                </Alert>
                            ) : suggestionState.suggestions && suggestionState.suggestions.length > 0 ? (
                               <Alert>
                                    <Sparkles className="h-4 w-4" />
                                    <AlertTitle>Success!</AlertTitle>
                                    <AlertDescription>Your clues are ready. Check out the preview!</AlertDescription>
                                </Alert>
                            ) : (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>No Suggestions Found</AlertTitle>
                                    <AlertDescription>We couldn't find any suggestions for that topic. Please try a different one.</AlertDescription>
                                </Alert>
                            )}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              
               <Card className="sm:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <Palette className="text-accent"/>
                    Choose Your Style
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <Label htmlFor="color-pref">Card Color Theme</Label>
                    <Select value={colorPreference} onValueChange={setColorPreference}>
                        <SelectTrigger id="color-pref" className="w-full">
                            <SelectValue placeholder="Select a color theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Indigo">Indigo</SelectItem>
                            <SelectItem value="Lavender">Lavender</SelectItem>
                            <SelectItem value="Purple">Purple</SelectItem>
                            <SelectItem value="Crimson">Crimson</SelectItem>
                             <SelectItem value="Teal">Teal</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-2">This will influence the colors of your generated card image.</p>
                </CardContent>
              </Card>

            </div>
          </div>
          
          <div className="lg:col-span-1">
            <ClueCardPreview 
              ref={cardPreviewRef}
              clues={clues} 
              colorPreference={colorPreference}
              onRemoveClue={(index) => setClues(clues.filter((_, i) => i !== index))}
              onShare={handleShare}
            />
          </div>
        </div>
      </div>
      
      <ShareDialog
        open={isShareDialogOpen} 
        onOpenChange={setIsShareDialogOpen}
        cardRef={cardPreviewRef}
      />
    </div>
  );
}
