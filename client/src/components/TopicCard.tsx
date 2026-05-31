import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, BookOpen } from "lucide-react";

interface TopicCardProps {
  title: string;
  description: string;
  href: string;
  theme: "oracle" | "amazon" | "cisco";
  image: string;
  learnMore?: string;
  completed?: boolean;
}

export function TopicCard({ title, description, href, theme, image, learnMore = "Дізнатися більше", completed = false }: TopicCardProps) {
  const themeClasses = {
    oracle: "hover:shadow-[0_20px_40px_-15px_rgba(248,0,0,0.15)] hover:border-[hsl(var(--oracle)/0.2)]",
    amazon: "hover:shadow-[0_20px_40px_-15px_rgba(255,153,0,0.15)] hover:border-[hsl(var(--amazon)/0.2)]",
    cisco: "hover:shadow-[0_20px_40px_-15px_rgba(4,159,217,0.15)] hover:border-[hsl(var(--cisco)/0.2)]",
  };

  const buttonThemeClasses = {
    oracle: "group-hover:text-oracle",
    amazon: "group-hover:text-amazon",
    cisco: "group-hover:text-cisco",
  };

  return (
    <Link href={href} className={cn(
      "group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm transition-all duration-300",
      themeClasses[theme]
    )}>
      <div className="aspect-video w-full overflow-hidden relative bg-muted">
        <div className={cn(
          "absolute inset-0 opacity-20 transition-opacity group-hover:opacity-10",
          theme === 'oracle' && 'bg-oracle',
          theme === 'amazon' && 'bg-amazon',
          theme === 'cisco' && 'bg-cisco',
        )} />
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
        />
        {completed && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Пройдено</span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display text-2xl font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground mb-6 flex-1 line-clamp-3 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className={cn(
            "flex items-center text-sm font-semibold transition-colors",
            buttonThemeClasses[theme]
          )}>
            {learnMore} <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
          {completed && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
