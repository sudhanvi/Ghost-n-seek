import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-8 text-center">
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-full bg-primary/10 p-4">
          <div className="rounded-full bg-primary/20 p-3">
             <Ghost className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary md:text-7xl">
          ClueConnect
        </h1>
        <p className="max-w-md text-lg text-foreground/80 md:text-xl">
          Three minutes of anonymous chat. A lifetime of connection. Can you find your match from just a few clues?
        </p>
        <Button asChild size="lg" className="font-bold bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
          <Link href="/chat">Find a Match</Link>
        </Button>
      </div>
    </main>
  );
}
