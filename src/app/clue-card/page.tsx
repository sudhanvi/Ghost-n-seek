"use client";

import { useState, useEffect, useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Ghost, Loader2, Sparkles, Palette, MessageSquareQuote, Gem, Coffee, Users } from "lucide-react";
import {
  generateSuggestions,
  generateCluesFromChatAction,
  generateImageForCard
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ClueCardPreview from "@/components/ClueCardPreview";
import ShareDialog from "@/components/ShareDialog";
import AdPlacement from "@/components/AdPlacement";
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

const colorOptions = ["Indigo", "Lavender", "Purple", "Crimson", "Teal"];

export default function ClueCardPage() {
  const [userClues, setUserClues] = useState<Clue[]>([]);
  const [partnerClues, setPartnerClues] = useState<Clue[]>([]);
  
  const [colorPreference, setColorPreference] = useState("Indigo");
  const [partnerColorPreference, setPartnerColorPreference] = useState("Indigo");
  
  const [suggestionState, generateSuggestionsAction] = useActionState(generateSuggestions, null);

  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isGeneratingFromChat, setIsGeneratingFromChat] = useState(false);
  const [chatGenerationResult, setChatGenerationResult] = useState<{userSuggestions?: Clue[], partnerSuggestions?: Clue[], error?: string} | null>(null);

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const cardPreviewRef = useRef<HTMLDivElement>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageGenerationError, setImageGenerationError] = useState<string | null>(null);


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

  const handleCluesChange = (newClues: Clue[]) => {
    setUserClues(newClues);
    setGeneratedImage(null); // Reset image if clues change
    setImageGenerationError(null);
  }

  useEffect(() => {
    if (suggestionState?.suggestions) {
      handleCluesChange(suggestionState.suggestions.map(s => ({text: s.clue, emojis: s.emojis})));
      setPartnerClues([]); // Clear partner clues when generating from topic
    }
  }, [suggestionState]);
  
  const handleGenerateCluesFromChat = async () => {
    if (chatHistory.length === 0) return;
    setIsGeneratingFromChat(true);
    setChatGenerationResult(null);
    handleCluesChange([]);
    setPartnerClues([]);

    const result = await generateCluesFromChatAction(chatHistory);
    setChatGenerationResult(result);
    if (result.userSuggestions) {
      handleCluesChange(result.userSuggestions.map(s => ({text: s.clue, emojis: s.emojis})));
    }
    if (result.partnerSuggestions) {
      setPartnerClues(result.partnerSuggestions.map(s => ({text: s.clue, emojis: s.emojis})));
      // Set a random color for the partner card that is different from the user's
      const availableColors = colorOptions.filter(c => c !== colorPreference);
      setPartnerColorPreference(availableColors[Math.floor(Math.random() * availableColors.length)]);
    }
    setIsGeneratingFromChat(false);
  };

  const handleGenerateImage = async () => {
    if (userClues.length === 0) {
        setImageGenerationError("Please generate some clues first.");
        return;
    }
    setIsGeneratingImage(true);
    setImageGenerationError(null);
    
    const result = await generateImageForCard({
        clues: userClues.map(c => c.text),
        colorPreference
    });

    if (result.error) {
        setImageGenerationError(result.error);
    } else {
        setGeneratedImage(result.imageUrl!);
    }
    setIsGeneratingImage(false);
  };

  const handleShare = () => {
    if (userClues.length === 0) return;
    setIsShareDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-screen-2xl">
        <header className="mb-8 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">Craft Your Clue Card</h1>
          <p className="mt-2 text-lg text-foreground/80">Generate clues from your chat to see if you can find each other again!</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline">
                            <Sparkles className="text-accent" />
                            1. Generate Your Clues
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6">
                        {chatHistory.length > 0 ? (
                            <div className="space-y-4 p-4 rounded-lg border bg-card-foreground/5">
                                <h3 className="font-semibold text-lg flex items-center gap-2"><Users className="h-5 w-5"/>From Your Chat</h3>
                                <p className="text-sm text-muted-foreground">The best way to find your connection! We'll analyze your chat and generate cards for both of you.</p>
                                <Button onClick={handleGenerateCluesFromChat} disabled={isGeneratingFromChat} className="w-full">
                                    {isGeneratingFromChat ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageSquareQuote className="mr-2 h-4 w-4"/>}
                                    {isGeneratingFromChat ? 'Analyzing Chat...' : 'Generate Clue Cards'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 p-4 rounded-lg border bg-card-foreground/5">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Ghost className="h-5 w-5"/>No Chat Found</h3>
                            <p className="text-sm text-muted-foreground">Complete a chat session to generate cards from your conversation. For now, you can generate suggestions based on a topic.</p>
                            </div>
                        )}
                        <div className="space-y-4 p-4 rounded-lg border bg-card-foreground/5">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Sparkles className="h-5 w-5"/>From a Topic</h3>
                            <form action={generateSuggestionsAction} className="space-y-4">
                                <p className="text-sm text-muted-foreground">Get some ideas for your own card based on a topic. Note: This will not generate a card for your partner.</p>
                                <div className="space-y-2">
                                <Label htmlFor="topic">Enter a topic</Label>
                                <Input id="topic" name="topic" placeholder="e.g., Hobbies, Music, Dreams" required/>
                                </div>
                                <SubmitButton>Get Suggestions</SubmitButton>
                            </form>
                        </div>
                    </CardContent>
                    <CardContent>
                        {chatGenerationResult && !isGeneratingFromChat && (
                            <div className="mt-4">
                                {chatGenerationResult.error ? ( <Alert variant="destructive"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{chatGenerationResult.error}</AlertDescription> </Alert> ) : 
                                (chatGenerationResult.userSuggestions && chatGenerationResult.userSuggestions.length > 0) || (chatGenerationResult.partnerSuggestions && chatGenerationResult.partnerSuggestions.length > 0) ? ( <Alert> <Sparkles className="h-4 w-4" /> <AlertTitle>Success!</AlertTitle> <AlertDescription>Your clue cards are ready on the right! You can now customize your card's look.</AlertDescription> </Alert> ) : ( <Alert variant="destructive"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Not much to go on...</AlertTitle> <AlertDescription>We couldn't find enough unique topics in the chat. Try chatting a bit more next time, or generate clues from a topic.</AlertDescription> </Alert> )}
                            </div>
                        )}
                        {suggestionState && (
                            <div className="mt-4">
                                {suggestionState.error ? ( <Alert variant="destructive"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{suggestionState.error}</AlertDescription> </Alert> ) : suggestionState.suggestions && suggestionState.suggestions.length > 0 ? ( <Alert> <Sparkles className="h-4 w-4" /> <AlertTitle>Success!</AlertTitle> <AlertDescription>Your clues are ready. Check out your card preview on the right!</AlertDescription> </Alert> ) : ( <Alert variant="destructive"> <AlertCircle className="h-4 w-4" /> <AlertTitle>No Suggestions Found</AlertTitle> <AlertDescription>We couldn't find any suggestions for that topic. Please try a different one.</AlertDescription> </Alert> )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Palette className="text-accent"/>
                        2. Style Your Card
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                    <Label htmlFor="color-pref">Card Color Theme</Label>
                        <Select value={colorPreference} onValueChange={setColorPreference}>
                            <SelectTrigger id="color-pref" className="w-full">
                                <SelectValue placeholder="Select a color theme" />
                            </SelectTrigger>
                            <SelectContent>
                                {colorOptions.map(color => (
                                    <SelectItem key={color} value={color}>{color}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground mt-2">This will influence the colors of your generated card image.</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Gem className="text-accent" />
                        3. Go Premium
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Make your card unforgettable with a unique, AI-generated artwork.</p>
                        <Button onClick={handleGenerateImage} disabled={isGeneratingImage || userClues.length === 0} className="w-full">
                            {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                            {isGeneratingImage ? 'Generating Artwork...' : 'Generate Premium Artwork'}
                        </Button>
                        {imageGenerationError && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Image Generation Failed</AlertTitle>
                                <AlertDescription>{imageGenerationError}</AlertDescription>
                            </Alert>
                        )}
                        {generatedImage && !isGeneratingImage && (
                            <Alert className="mt-4">
                                <Sparkles className="h-4 w-4" />
                                <AlertTitle>Artwork Ready!</AlertTitle>
                                <AlertDescription>Your premium card is ready to be shared.</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline">
                            <Coffee className="text-accent" />
                            Support the Creator
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">If you enjoy this app, consider buying me a coffee! It helps keep the servers running.</p>
                        <Button asChild className="w-full bg-[#FFDC00] text-black hover:bg-[#FFDC00]/90">
                            <a href="https://paypal.me/sidphotos" target="_blank" rel="noopener noreferrer">
                                Buy me a coffee
                            </a>
                        </Button>
                    </CardContent>
                </Card>
                <AdPlacement />
            </div>
            
            <div className="lg:col-span-3 space-y-8">
                <div>
                    <h2 className="text-2xl font-headline font-bold text-center mb-4 text-primary">Your Card (for them to find you)</h2>
                    <ClueCardPreview 
                        ref={cardPreviewRef}
                        clues={userClues} 
                        colorPreference={colorPreference}
                        onRemoveClue={(index) => handleCluesChange(userClues.filter((_, i) => i !== index))}
                        onShare={handleShare}
                        imageUrl={generatedImage}
                        isInteractive={true}
                    />
                </div>
                <div>
                    <h2 className="text-2xl font-headline font-bold text-center mb-4 text-primary">Their Card (for you to find them)</h2>
                    <ClueCardPreview 
                        clues={partnerClues} 
                        colorPreference={partnerColorPreference}
                        onRemoveClue={() => {}}
                        onShare={() => {}}
                        isInteractive={false}
                    />
                </div>
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
