"use client";

import { useState, RefObject, useEffect } from "react";
import { toBlob } from "html-to-image";
import { Download, Loader2, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardRef: RefObject<HTMLDivElement>;
  imageUrl: string | null;
}

export default function ShareDialog({ open, onOpenChange, cardRef, imageUrl }: ShareDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!navigator.share) {
      setCanShare(true);
    }
  }, []);

  const getFinalImageBlob = async (): Promise<Blob | null> => {
    // If a premium image URL is provided, fetch it and return as a blob.
    if (imageUrl) {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error("Failed to fetch image data.");
            return await response.blob();
        } catch (err) {
            console.error("Oops, something went wrong fetching the image!", err);
            toast({
                variant: "destructive",
                title: "Image Download Failed",
                description: "Could not retrieve the generated artwork. Please try again.",
            });
            return null;
        }
    }

    // Otherwise, generate an image of the text-based card.
    if (!cardRef.current) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not find card element to generate image.",
      });
      return null;
    }

    try {
      const blob = await toBlob(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      if (!blob) throw new Error("Image blob is null");
      return blob;
    } catch (err) {
      console.error("Oops, something went wrong!", err);
      toast({
        variant: "destructive",
        title: "Image Generation Failed",
        description: "Could not create an image of the card. Please try again.",
      });
      return null;
    }
  };


  const handleDownload = async () => {
    setIsProcessing(true);
    const blob = await getFinalImageBlob();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'clue-card.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    setIsProcessing(false);
  };

  const handleShare = async () => {
    setIsProcessing(true);
    const blob = await getFinalImageBlob();
    
    if (blob) {
      const file = new File([blob], "clue-card.png", { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "My Ghost n seek Clue Card",
            text: "Can you guess who I am based on these clues?",
          });
        } catch (error) {
          // This error is often triggered when the user cancels the share dialog.
          console.log("Share action was cancelled or failed.", error);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Cannot Share",
          description: "Your browser does not support sharing files directly. Please download the image.",
        });
      }
    }
    setIsProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Clue Card</DialogTitle>
          <DialogDescription>
            Download an image of your card or share it directly to your apps.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
           <Button onClick={handleDownload} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isProcessing ? 'Generating...' : 'Download Image'}
           </Button>
           {canShare && (
               <Button onClick={handleShare} disabled={isProcessing} variant="secondary">
                 {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share className="mr-2 h-4 w-4" />}
                 {isProcessing ? 'Preparing...' : 'Share…'}
               </Button>
           )}
        </div>
         <DialogFooter>
            <p className="text-xs text-muted-foreground text-center w-full">For apps like Instagram, download the image and post from the app.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
