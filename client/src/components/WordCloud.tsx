import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface WordCloudProps {
  words: { word: string; count: number }[];
  variant?: "positive" | "negative";
  className?: string;
}

export default function WordCloud({ words, variant = "positive", className }: WordCloudProps) {
  const sized = useMemo(() => {
    if (words.length === 0) return [];
    const maxCount = Math.max(...words.map(w => w.count));
    const minCount = Math.min(...words.map(w => w.count));
    const range = Math.max(1, maxCount - minCount);

    return words.map(w => {
      const t = (w.count - minCount) / range;
      const size = 0.85 + t * 1.65; // rem, 0.85-2.5rem
      const weight = t > 0.66 ? 800 : t > 0.33 ? 700 : 500;
      const opacity = 0.55 + t * 0.45;
      const rotate = ((w.word.charCodeAt(0) + w.count) % 5) - 2; // -2..2 deg gentle rotation
      return { ...w, size, weight, opacity, rotate };
    });
  }, [words]);

  const palette = variant === "positive"
    ? ["text-emerald-700 dark:text-emerald-400", "text-teal-600 dark:text-teal-400", "text-sky-600 dark:text-sky-400", "text-blue-600 dark:text-blue-400", "text-violet-600 dark:text-violet-400"]
    : ["text-rose-700 dark:text-rose-400", "text-red-600 dark:text-red-400", "text-orange-600 dark:text-orange-400", "text-amber-600 dark:text-amber-400", "text-pink-600 dark:text-pink-400"];

  if (sized.length === 0) {
    return (
      <div className={cn("min-h-[200px] flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl", className)}>
        Поки немає слів для відображення
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-x-3 gap-y-2 p-4 min-h-[200px]", className)}>
      {sized.map((w, i) => (
        <span
          key={w.word}
          className={cn(
            "inline-block transition-transform hover:scale-110 cursor-default leading-tight",
            palette[i % palette.length]
          )}
          style={{
            fontSize: `${w.size}rem`,
            fontWeight: w.weight,
            opacity: w.opacity,
            transform: `rotate(${w.rotate}deg)`,
          }}
          title={`${w.word} — ${w.count}`}
          data-testid={`word-${variant}-${w.word}`}
        >
          {w.word}
        </span>
      ))}
    </div>
  );
}
