"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { AlertCircle, Ghost, Loader2, Sparkles, Palette, MessageSquareQuote } from "lucide-react";
import {
  generateSuggestions,
  generateCardImage,
  generateCluesFromChatAction
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ClueCardPreview from "@/components/ClueCardPreview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function SubmitButton({ children, ...props }: { children: React.ReactNode; startIcon?: React.ReactNode } & React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return (
    <Button {...props} disabled={pending || props.disabled}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : props.startIcon}
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
  
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{url: string, error?: string} | null>(null);

  const [suggestionState, generateSuggestionsAction] = useActionState(generateSuggestions, null);

  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isGeneratingFromChat, setIsGeneratingFromChat] = useState(false);
  const [chatGenerationResult, setChatGenerationResult] = useState<{suggestions?: Clue[], error?: string} | null>(null);

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
      setClues(suggestionState.suggestions);
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
      setClues(result.suggestions);
    }
    setIsGeneratingFromChat(false);
  };

  const handleGenerateImage = async () => {
    if (clues.length === 0) return;
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    const result = await generateCardImage(clues.map(c => c.text), colorPreference);
    setGeneratedImage({ url: result.imageUrl, error: result.error });
    if (!result.error) {
        // Keep dialog open on success
    } else {
        setIsGeneratingImage(false);
    }
  };
  
  const closeImageDialog = () => {
    setGeneratedImage(null);
    setIsGeneratingImage(false);
  }

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
                            ) : (
                                <Alert>
                                    <Sparkles className="h-4 w-4" />
                                    <AlertTitle>Success!</AlertTitle>
                                    <AlertDescription>Your clues are ready. Check out the preview!</AlertDescription>
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
                        <SubmitButton startIcon={<Sparkles className="mr-2 h-4 w-4" />}>Get Suggestions</SubmitButton>
                      </form>
                      {suggestionState && (
                        <div className="mt-4">
                            {suggestionState.error ? (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{suggestionState.error}</AlertDescription>
                                </Alert>
                            ) : (
                               <Alert>
                                    <Sparkles className="h-4 w-4" />
                                    <AlertTitle>Success!</AlertTitle>
                                    <AlertDescription>Your clues are ready. Check out the preview!</AlertDescription>
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
              clues={clues} 
              onRemoveClue={(index) => setClues(clues.filter((_, i) => i !== index))}
              onShare={handleGenerateImage}
              isGenerating={isGeneratingImage}
            />
          </div>
        </div>
      </div>
      
      <Dialog open={!!generatedImage} onOpenChange={(open) => !open && closeImageDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Your Clue Card is Ready!</DialogTitle>
            <DialogDescription>
              {generatedImage?.error ? 'There was an error generating your card.' : 'Save this image and share it to see who can find you!'}
            </DialogDescription>
          </DialogHeader>
          {generatedImage?.url && (
            <div className="mt-4 rounded-lg overflow-hidden border">
                <Image src={generatedImage.url} alt="Generated Clue Card" width={450} height={800} className="w-full h-auto" />
            </div>
          )}
          {generatedImage?.error && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Generation Failed</AlertTitle>
                <AlertDescription>{generatedImage.error}</AlertDescription>
              </Alert>
          )}
          <Button onClick={() => {
              if (generatedImage?.url) {
                  const link = document.createElement('a');
                  link.href = generatedImage.url;
                  link.download = 'clue-card.png';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
              }
          }} disabled={!generatedImage?.url}>Download Image</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
