import { Link } from "@tanstack/react-router";
import { Music2 } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neon/40 bg-neon/10 text-neon glow-cyan">
        <Music2 className="h-4 w-4" />
      </span>
      {!compact && (
        <span className="eyebrow text-foreground">Music Match</span>
      )}
    </Link>
  );
}

export function Soundwave({ bars = 16, className = "" }: { bars?: number; className?: string }) {
  return (
    <div className={`flex items-end gap-1.5 ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-2 origin-bottom rounded-full bg-neon"
          style={{
            height: `${18 + ((i * 37) % 46)}px`,
            animation: `bar ${1 + ((i % 5) * 0.18)}s ease-in-out ${i * 0.07}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
