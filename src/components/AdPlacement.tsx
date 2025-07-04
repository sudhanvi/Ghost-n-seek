import { cn } from "@/lib/utils";

export default function AdPlacement({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-full h-24 bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-lg my-8",
        className
      )}
    >
      <p className="text-sm text-muted-foreground font-medium">Ad Placeholder</p>
    </div>
  );
}
