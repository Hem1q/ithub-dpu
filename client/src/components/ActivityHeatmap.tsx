import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import { Flame, TrendingUp, Calendar as CalIcon, Target, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityResponse = {
  days: number;
  data: { date: string; quizzes: number; feedback: number; polls: number; total: number }[];
  totals: { quizzes: number; feedback: number; polls: number; total: number };
  activeDays: number;
  max: number;
  currentStreak: number;
  longestStreak: number;
};

const MONTHS_UK = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS_UK = ["Пн", "", "Ср", "", "Пт", "", ""];
const WEEKDAYS_EN = ["Mon", "", "Wed", "", "Fri", "", ""];

export function ActivityHeatmap() {
  const { lang } = useLanguage();
  const [hovered, setHovered] = useState<{ date: string; total: number; q: number; f: number; p: number } | null>(null);

  const { data, isLoading } = useQuery<ActivityResponse>({
    queryKey: ["/api/users/me/activity"],
  });

  const weeks = useMemo(() => {
    if (!data) return [];
    // Group days into weeks (each week = column of 7 days, Mon..Sun)
    // Pad start so first week aligns by weekday
    const items = data.data;
    if (!items.length) return [];
    const first = new Date(items[0].date);
    // weekday: 0=Sun..6=Sat. We want Mon..Sun (Mon=0)
    const monIdx = (first.getDay() + 6) % 7;
    const padded: ((typeof items)[number] | null)[] = [];
    for (let i = 0; i < monIdx; i++) padded.push(null);
    padded.push(...items);
    const cols: ((typeof items)[number] | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      cols.push(padded.slice(i, i + 7));
    }
    return cols;
  }, [data]);

  // Month labels — find the first column that contains the first day of each month
  const monthLabels = useMemo(() => {
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((col, i) => {
      const firstReal = col.find((c) => c !== null);
      if (!firstReal) return;
      const d = new Date(firstReal.date);
      if (d.getMonth() !== lastMonth) {
        lastMonth = d.getMonth();
        labels.push({ col: i, label: (lang === "uk" ? MONTHS_UK : MONTHS_EN)[d.getMonth()] });
      }
    });
    return labels;
  }, [weeks, lang]);

  const intensity = (count: number, max: number): string => {
    if (count === 0) return "bg-muted/40 dark:bg-slate-800/60";
    if (max <= 0) return "bg-emerald-300";
    const r = count / Math.max(max, 1);
    if (r > 0.75) return "bg-emerald-600 dark:bg-emerald-500";
    if (r > 0.5) return "bg-emerald-500 dark:bg-emerald-500/90";
    if (r > 0.25) return "bg-emerald-400 dark:bg-emerald-600/70";
    return "bg-emerald-300 dark:bg-emerald-700/60";
  };

  const t = lang === "uk" ? {
    title: "Карта активності",
    subtitle: "Ваша щоденна активність за останній рік",
    activeDays: "Активних днів",
    streak: "Поточна серія",
    longest: "Найдовша серія",
    total: "Усього дій",
    days: "днів",
    less: "Менше",
    more: "Більше",
    empty: "Поки що немає активності — пройдіть свій перший квіз!",
    quizzes: "квізи",
    feedback: "відгуки",
    polls: "опитування",
    loading: "Завантаження...",
  } : {
    title: "Activity heatmap",
    subtitle: "Your daily activity over the past year",
    activeDays: "Active days",
    streak: "Current streak",
    longest: "Longest streak",
    total: "Total actions",
    days: "days",
    less: "Less",
    more: "More",
    empty: "No activity yet — take your first quiz!",
    quizzes: "quizzes",
    feedback: "feedback",
    polls: "polls",
    loading: "Loading...",
  };

  const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getDate()} ${(lang === "uk" ? MONTHS_UK : MONTHS_EN)[d.getMonth()]} ${d.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <Card className="p-6 rounded-2xl">
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">{t.loading}</div>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="p-6 rounded-2xl shadow-sm" data-testid="activity-heatmap">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground">{t.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground ml-11">{t.subtitle}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <MiniMetric icon={CalIcon} label={t.activeDays} value={data.activeDays} suffix={` ${t.days}`} color="emerald" />
        <MiniMetric icon={Flame} label={t.streak} value={data.currentStreak} suffix={` ${t.days}`} color="orange" pulse={data.currentStreak > 0} />
        <MiniMetric icon={Target} label={t.longest} value={data.longestStreak} suffix={` ${t.days}`} color="violet" />
        <MiniMetric icon={TrendingUp} label={t.total} value={data.totals.total} color="blue" />
      </div>

      {data.totals.total === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground border border-dashed rounded-xl" data-testid="heatmap-empty">
          <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>{t.empty}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto pb-2">
            <div className="inline-block min-w-full">
              {/* Month labels */}
              <div className="flex gap-[3px] ml-7 mb-1 text-[10px] text-muted-foreground font-medium">
                {weeks.map((_, i) => {
                  const lbl = monthLabels.find((m) => m.col === i);
                  return (
                    <div key={i} className="w-[12px] flex-shrink-0">
                      {lbl && <span>{lbl.label}</span>}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-[3px]">
                {/* Weekday labels */}
                <div className="flex flex-col gap-[3px] mr-1 text-[10px] text-muted-foreground font-medium">
                  {(lang === "uk" ? WEEKDAYS_UK : WEEKDAYS_EN).map((d, i) => (
                    <div key={i} className="h-[12px] flex items-center w-5">{d}</div>
                  ))}
                </div>
                {/* Grid */}
                {weeks.map((col, ci) => (
                  <div key={ci} className="flex flex-col gap-[3px]">
                    {col.map((cell, ri) => {
                      if (!cell) {
                        return <div key={ri} className="w-[12px] h-[12px] rounded-[3px] bg-transparent" aria-hidden="true" />;
                      }
                      const ariaLabel = `${formatDate(cell.date)}: ${cell.total} ${lang === "uk" ? (cell.total === 1 ? "дія" : "дій") : "actions"}`;
                      const setHover = () => setHovered({ date: cell.date, total: cell.total, q: cell.quizzes, f: cell.feedback, p: cell.polls });
                      const clearHover = () => setHovered(null);
                      return (
                        <button
                          type="button"
                          key={ri}
                          className={cn(
                            "w-[12px] h-[12px] rounded-[3px] transition-all",
                            intensity(cell.total, data.max),
                            cell.total > 0 && "hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1 hover:ring-offset-background cursor-pointer",
                            "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 focus:ring-offset-background"
                          )}
                          onMouseEnter={setHover}
                          onMouseLeave={clearHover}
                          onFocus={setHover}
                          onBlur={clearHover}
                          aria-label={ariaLabel}
                          data-testid={`heatmap-cell-${cell.date}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tooltip */}
          <div className="min-h-[36px] mt-3 text-xs">
            {hovered ? (
              <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted border border-border" data-testid="heatmap-tooltip">
                <span className="font-bold text-foreground">{formatDate(hovered.date)}</span>
                <span className="text-muted-foreground">•</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {hovered.total} {lang === "uk" ? (hovered.total === 1 ? "дія" : "дій") : "actions"}
                </span>
                {hovered.q > 0 && <span className="text-muted-foreground">{hovered.q} {t.quizzes}</span>}
                {hovered.f > 0 && <span className="text-muted-foreground">{hovered.f} {t.feedback}</span>}
                {hovered.p > 0 && <span className="text-muted-foreground">{hovered.p} {t.polls}</span>}
              </div>
            ) : (
              <span className="text-muted-foreground italic">
                {lang === "uk" ? "Наведіть на квадратик щоб побачити деталі" : "Hover any square for details"}
              </span>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 justify-end mt-3 text-[10px] text-muted-foreground font-medium">
            <span>{t.less}</span>
            <div className="w-[12px] h-[12px] rounded-[3px] bg-muted/40 dark:bg-slate-800/60" />
            <div className="w-[12px] h-[12px] rounded-[3px] bg-emerald-300 dark:bg-emerald-700/60" />
            <div className="w-[12px] h-[12px] rounded-[3px] bg-emerald-400 dark:bg-emerald-600/70" />
            <div className="w-[12px] h-[12px] rounded-[3px] bg-emerald-500 dark:bg-emerald-500/90" />
            <div className="w-[12px] h-[12px] rounded-[3px] bg-emerald-600 dark:bg-emerald-500" />
            <span>{t.more}</span>
          </div>
        </>
      )}
    </Card>
  );
}

function MiniMetric({ icon: Icon, label, value, suffix, color, pulse }: {
  icon: any; label: string; value: number; suffix?: string;
  color: "emerald" | "orange" | "violet" | "blue"; pulse?: boolean;
}) {
  const colors = {
    emerald: "bg-emerald-500",
    orange: "bg-orange-500",
    violet: "bg-violet-500",
    blue: "bg-blue-500",
  };
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white relative shrink-0", colors[color])}>
        <Icon className="w-4 h-4" />
        {pulse && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />}
      </div>
      <div className="min-w-0">
        <div className="text-base font-extrabold text-foreground leading-tight truncate">
          {value}{suffix && <span className="text-xs text-muted-foreground font-medium">{suffix}</span>}
        </div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold truncate">{label}</div>
      </div>
    </div>
  );
}
