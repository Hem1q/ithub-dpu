import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
  icon?: LucideIcon;
  accent?: "emerald" | "violet" | "sky" | "amber" | "rose" | "blue";
  duration?: number;
  decimals?: number;
  testId?: string;
}

const accentMap = {
  emerald: {
    icon: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    glow: "from-emerald-500/20",
  },
  violet: {
    icon: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-600 dark:text-violet-400",
    glow: "from-violet-500/20",
  },
  sky: {
    icon: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    text: "text-sky-600 dark:text-sky-400",
    glow: "from-sky-500/20",
  },
  amber: {
    icon: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    glow: "from-amber-500/20",
  },
  rose: {
    icon: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
    glow: "from-rose-500/20",
  },
  blue: {
    icon: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    glow: "from-blue-500/20",
  },
};

function formatNum(n: number, decimals: number) {
  if (decimals > 0) return n.toFixed(decimals).replace(/\.?0+$/, "") || "0";
  return Math.round(n).toLocaleString("uk-UA").replace(/\u00A0/g, " ");
}

export function StatCounter({
  value,
  suffix = "",
  prefix = "",
  label,
  sublabel,
  icon: Icon,
  accent = "emerald",
  duration = 1.4,
  decimals = 0,
  testId,
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);
  const a = accentMap[accent];

  useEffect(() => {
    if (!inView) return;
    const startedAt = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-sm p-5",
        "hover:shadow-lg transition-all hover:-translate-y-0.5",
        a.border,
      )}
      data-testid={testId}
    >
      <div className={cn("absolute inset-0 -z-10 bg-gradient-to-br to-transparent opacity-60", a.glow)} />
      <div className="flex items-start justify-between gap-3 mb-3">
        {Icon && (
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", a.bg)}>
            <Icon className={cn("w-5 h-5", a.icon)} />
          </div>
        )}
        {sublabel && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mt-1">
            {sublabel}
          </span>
        )}
      </div>
      <div className={cn("text-3xl md:text-4xl font-extrabold tabular-nums leading-none mb-1", a.text)}>
        {prefix}
        {formatNum(display, decimals)}
        {suffix}
      </div>
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}
