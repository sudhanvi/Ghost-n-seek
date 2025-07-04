import { Button } from "@/components/ui/button";
import Link from "next/link";
import AdPlacement from "@/components/AdPlacement";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-8 text-center">
      <div className="flex flex-col items-center gap-6 max-w-md">
        <div className="rounded-full bg-primary/10 p-4">
          <div className="rounded-full bg-primary/20 p-3">
             <svg className="h-16 w-16 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 1 0-8c-2 0-4 1.33-6 4Z"/><path d="M18 11.5a4.5 4.5 0 0 1 0-9 4.5 4.5 0 0 1 0 9Z"/><path d="M6 11.5a4.5 4.5 0 0 1 0-9 4.5 4.5 0 0 1 0 9Z"/></svg>
          </div>
        </div>
        <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary md:text-7xl">
          Ghost n seek
        </h1>
        <p className="text-lg text-foreground/80 md:text-xl">
          Three minutes of anonymous chat. A lifetime of connection. Can you find your match from just a few clues?
        </p>
        <Button asChild size="lg" className="font-bold bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
          <Link href="/chat">Find a Match</Link>
        </Button>
      </div>
       <AdPlacement className="mt-12 w-full max-w-lg"/>
    </main>
  );
}
