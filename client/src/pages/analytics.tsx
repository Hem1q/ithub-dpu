import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import {
  Star, ThumbsUp, MessageSquare, TrendingUp, AlertTriangle, CheckCircle2,
  AlertCircle, Info, BarChart3, Sparkles, ArrowRight, Heart, FileDown,
  Calendar, Filter, Printer, Loader2, ArrowUpDown, LineChart as LineIcon,
  PieChart as PieIcon, BarChart2, AreaChart as AreaIcon
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import FeedbackTable from "@/components/FeedbackTable";
import WordCloud from "@/components/WordCloud";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  kpi: {
    total: number;
    avgRating: number;
    satisfiedCount: number;
    satisfiedPct: number;
    likedCount: number;
    likedPct: number;
  };
  nps: {
    score: number;
    promoters: number;
    passives: number;
    detractors: number;
    total: number;
  };
  criteria: {
    content: number | null;
    teachers: number | null;
    platform: number | null;
    contentCount: number;
    teachersCount: number;
    platformCount: number;
  };
  ratingDist: { rating: string; count: number }[];
  courseDist: { course: string; total: number; avgRating: number; satisfiedPct: number }[];
  specialtyDist: { specialty: string; total: number; avgRating: number }[];
  topicBreakdown: { topic: string; total: number; avgRating: number; avgNps: number | null }[];
  timeSeries: { date: string; count: number; avgRating: number; avgNps: number | null }[];
  wordCloud: {
    positive: { word: string; count: number }[];
    negative: { word: string; count: number }[];
  };
  conclusion: { uk: string; en: string; tone: "success" | "warning" | "danger" | "neutral" };
}

const RATING_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#10b981"];
const SAT_COLORS = ["#10b981", "#f43f5e"];
const NPS_COLORS = { promoter: "#10b981", passive: "#f59e0b", detractor: "#ef4444" };

const TOPIC_LABELS: Record<string, { uk: string; en: string }> = {
  general: { uk: "Загальне", en: "Overall" },
  oracle: { uk: "Oracle", en: "Oracle" },
  amazon: { uk: "AWS", en: "AWS" },
  cisco: { uk: "Cisco", en: "Cisco" },
};

type PeriodFilter = "7d" | "30d" | "all";

export default function AnalyticsPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [exporting, setExporting] = useState(false);

  // Per-chart filter states
  const [tsChartType, setTsChartType] = useState<"line" | "area" | "bar">("line");
  const [tsMetric, setTsMetric] = useState<"both" | "count" | "rating">("both");
  const [ratingSort, setRatingSort] = useState<"asc" | "desc">("asc");
  const [ratingMode, setRatingMode] = useState<"count" | "percent">("count");
  const [topicMetric, setTopicMetric] = useState<"all" | "rating" | "nps" | "count">("all");
  const [courseSort, setCourseSort] = useState<"course" | "rating" | "count">("course");
  const [specialtySort, setSpecialtySort] = useState<"count" | "rating" | "name">("count");
  const [satView, setSatView] = useState<"pie" | "bar">("pie");

  const { fromIso, toIso } = useMemo(() => {
    if (period === "all") return { fromIso: undefined, toIso: undefined };
    const days = period === "7d" ? 7 : 30;
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    return { fromIso: from.toISOString(), toIso: to.toISOString() };
  }, [period]);

  const queryKey = useMemo(() => {
    const params: Record<string, string> = {};
    if (fromIso) params.from = fromIso;
    if (toIso) params.to = toIso;
    if (topicFilter !== "all") params.topic = topicFilter;
    return ["/api/feedback/analytics", params] as const;
  }, [fromIso, toIso, topicFilter]);

  const { data, isLoading, isFetching, dataUpdatedAt } = useQuery<AnalyticsData>({
    queryKey,
    queryFn: async () => {
      const url = new URL("/api/feedback/analytics", window.location.origin);
      if (fromIso) url.searchParams.set("from", fromIso);
      if (toIso) url.searchParams.set("to", toIso);
      if (topicFilter !== "all") url.searchParams.set("topic", topicFilter);
      const res = await fetch(url.toString().replace(window.location.origin, ""));
      if (!res.ok) throw new Error("Failed to load analytics");
      return res.json();
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, jspdfModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const jsPDF = (jspdfModule as any).default || (jspdfModule as any).jsPDF;

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--background").trim()
          ? `hsl(${getComputedStyle(document.documentElement).getPropertyValue("--background")})`
          : "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 10;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 5;

      pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 10;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 5;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 10;
      }

      const fileName = `IT-Hub-Analytics-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
      toast({
        title: lang === "uk" ? "PDF створено" : "PDF created",
        description: fileName,
      });
    } catch (e) {
      console.error("PDF export failed:", e);
      toast({
        title: lang === "uk" ? "Помилка експорту" : "Export error",
        description: lang === "uk" ? "Не вдалося створити PDF" : "Failed to create PDF",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          {lang === "uk" ? "Завантаження аналітики..." : "Loading analytics..."}
        </div>
      </div>
    );
  }

  const { kpi, nps, criteria, ratingDist, courseDist, specialtyDist, topicBreakdown, timeSeries, wordCloud, conclusion } = data;

  const satisfactionPie = [
    { name: lang === "uk" ? "Задоволені (4-5★)" : "Satisfied (4-5★)", value: kpi.satisfiedCount },
    { name: lang === "uk" ? "Незадоволені (1-3★)" : "Dissatisfied (1-3★)", value: Math.max(0, kpi.total - kpi.satisfiedCount) },
  ];

  const npsPie = [
    { name: lang === "uk" ? "Промоутери (9-10)" : "Promoters (9-10)", value: nps.promoters, color: NPS_COLORS.promoter },
    { name: lang === "uk" ? "Нейтральні (7-8)" : "Passives (7-8)", value: nps.passives, color: NPS_COLORS.passive },
    { name: lang === "uk" ? "Критики (0-6)" : "Detractors (0-6)", value: nps.detractors, color: NPS_COLORS.detractor },
  ];

  const radarData = [
    { criterion: lang === "uk" ? "Загальне" : "Overall", value: kpi.avgRating, fullMark: 5 },
    { criterion: lang === "uk" ? "Контент" : "Content", value: criteria.content ?? 0, fullMark: 5 },
    { criterion: lang === "uk" ? "Викладачі" : "Teachers", value: criteria.teachers ?? 0, fullMark: 5 },
    { criterion: lang === "uk" ? "Платформа" : "Platform", value: criteria.platform ?? 0, fullMark: 5 },
  ];

  const tsData = timeSeries.map(p => ({
    ...p,
    label: new Date(p.date).toLocaleDateString(lang === "uk" ? "uk-UA" : "en-US", { day: "numeric", month: "short" }),
  }));

  const topicData = topicBreakdown.map(t => ({
    ...t,
    label: TOPIC_LABELS[t.topic]?.[lang] || t.topic,
  }));

  // Per-chart processed data
  const ratingDistDisplay = (() => {
    const total = ratingDist.reduce((s, d) => s + d.count, 0);
    let arr = ratingDist.map(d => ({
      rating: d.rating,
      count: d.count,
      pct: total > 0 ? Math.round((d.count / total) * 100) : 0,
    }));
    arr = ratingSort === "desc" ? arr.sort((a, b) => Number(b.rating) - Number(a.rating)) : arr.sort((a, b) => Number(a.rating) - Number(b.rating));
    return arr;
  })();

  const courseDistDisplay = (() => {
    const arr = [...courseDist];
    if (courseSort === "rating") arr.sort((a, b) => b.avgRating - a.avgRating);
    else if (courseSort === "count") arr.sort((a, b) => b.total - a.total);
    else arr.sort((a, b) => a.course.localeCompare(b.course));
    return arr;
  })();

  const specialtyDistDisplay = (() => {
    const arr = [...specialtyDist];
    if (specialtySort === "rating") arr.sort((a, b) => b.avgRating - a.avgRating);
    else if (specialtySort === "name") arr.sort((a, b) => a.specialty.localeCompare(b.specialty));
    else arr.sort((a, b) => b.total - a.total);
    return arr;
  })();

  const conclusionStyles = {
    success: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-300 dark:border-emerald-700", text: "text-emerald-800 dark:text-emerald-300", Icon: CheckCircle2 },
    warning: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-300 dark:border-amber-700", text: "text-amber-800 dark:text-amber-300", Icon: AlertTriangle },
    danger: { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-300 dark:border-rose-700", text: "text-rose-800 dark:text-rose-300", Icon: AlertCircle },
    neutral: { bg: "bg-muted/50", border: "border-border", text: "text-muted-foreground", Icon: Info },
  };
  const cs = conclusionStyles[conclusion.tone];

  const npsTone = nps.score >= 50 ? "emerald" : nps.score >= 0 ? "amber" : "rose";

  return (
    <div className="space-y-8">
      {/* Print-friendly stylesheet */}
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-break { page-break-after: always; }
          .print-card { box-shadow: none !important; border: 1px solid #ddd !important; break-inside: avoid; }
          header, nav, footer, [data-sidebar], aside { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <BarChart3 className="w-3 h-3" />
            {lang === "uk" ? "Аналітика" : "Analytics"}
            {isFetching && <Loader2 className="w-3 h-3 animate-spin" />}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2" data-testid="text-analytics-title">
            {lang === "uk" ? "Дашборд відгуків" : "Feedback Dashboard"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {lang === "uk"
              ? "Інтерактивний аналіз відгуків студентів про IT-хаб ДПУ в реальному часі."
              : "Real-time interactive analysis of student feedback about the DPU IT-Hub."}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {lang === "uk" ? "Оновлено: " : "Updated: "}
            <span data-testid="text-updated-at">
              {new Date(dataUpdatedAt).toLocaleTimeString(lang === "uk" ? "uk-UA" : "en-US")}
            </span>
            {" · "}
            {lang === "uk" ? "автооновлення кожні 30 с" : "auto-refresh every 30 s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportPDF}
            disabled={exporting}
            className="gap-2"
            data-testid="button-export-pdf"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {lang === "uk" ? "Експорт PDF" : "Export PDF"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
            data-testid="button-print"
          >
            <Printer className="w-4 h-4" />
            {lang === "uk" ? "Друк" : "Print"}
          </Button>
          <Link href="/feedback">
            <Button size="sm" className="gap-2" data-testid="button-go-feedback">
              <Sparkles className="w-4 h-4" />
              {lang === "uk" ? "Залишити відгук" : "Leave feedback"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Filters */}
      <Card className="p-4 rounded-2xl shadow-sm no-print sticky top-14 z-30 bg-background/90 backdrop-blur-md border-border/80 supports-[backdrop-filter]:bg-background/75">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="w-4 h-4" />
            {lang === "uk" ? "Фільтри:" : "Filters:"}
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {([
              { v: "7d", l: lang === "uk" ? "7 днів" : "7 days" },
              { v: "30d", l: lang === "uk" ? "30 днів" : "30 days" },
              { v: "all", l: lang === "uk" ? "Весь час" : "All time" },
            ] as const).map(opt => (
              <button
                key={opt.v}
                onClick={() => setPeriod(opt.v)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg border transition-all",
                  period === opt.v
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border bg-background hover:border-primary/40"
                )}
                data-testid={`button-period-${opt.v}`}
              >
                {opt.l}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs text-muted-foreground">{lang === "uk" ? "Топік:" : "Topic:"}</span>
            {(["all", "general", "oracle", "amazon", "cisco"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTopicFilter(t)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg border transition-all",
                  topicFilter === t
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border bg-background hover:border-primary/40"
                )}
                data-testid={`button-topic-${t}`}
              >
                {t === "all" ? (lang === "uk" ? "Усі" : "All") : (TOPIC_LABELS[t]?.[lang] || t)}
              </button>
            ))}
          </div>

          {(period !== "all" || topicFilter !== "all") && (
            <button
              onClick={() => { setPeriod("all"); setTopicFilter("all"); }}
              className="ml-auto text-xs text-primary hover:underline font-medium"
              data-testid="button-reset-filters"
            >
              {lang === "uk" ? "Скинути" : "Reset"}
            </button>
          )}
        </div>
      </Card>

      {/* Dashboard zone for PDF */}
      <div ref={dashboardRef} className="space-y-8 bg-background">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            icon={MessageSquare}
            label={lang === "uk" ? "Усього" : "Total"}
            value={kpi.total}
            color="blue"
            testid="kpi-total"
          />
          <KpiCard
            icon={Star}
            label={lang === "uk" ? "Сер. оцінка" : "Avg rating"}
            value={`${kpi.avgRating} / 5`}
            subValue={"★".repeat(Math.round(kpi.avgRating))}
            color="amber"
            testid="kpi-avg"
          />
          <KpiCard
            icon={TrendingUp}
            label={lang === "uk" ? "Задоволені" : "Satisfied"}
            value={`${kpi.satisfiedPct}%`}
            subValue={`${kpi.satisfiedCount} ${lang === "uk" ? "осіб" : "ppl"}`}
            color="emerald"
            testid="kpi-satisfied"
          />
          <KpiCard
            icon={ThumbsUp}
            label={lang === "uk" ? "Подобається" : "Liked"}
            value={`${kpi.likedPct}%`}
            subValue={`${kpi.likedCount} ${lang === "uk" ? "осіб" : "ppl"}`}
            color="violet"
            testid="kpi-liked"
          />
          <KpiCard
            icon={Heart}
            label={lang === "uk" ? "NPS" : "NPS"}
            value={nps.score >= 0 ? `+${nps.score}` : `${nps.score}`}
            subValue={lang === "uk"
              ? `${nps.promoters} пром · ${nps.detractors} крит`
              : `${nps.promoters} pro · ${nps.detractors} det`}
            color={npsTone as any}
            testid="kpi-nps"
          />
        </div>

        {/* Conclusion */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("rounded-2xl border-2 p-6 print-card", cs.bg, cs.border)}
          data-testid="conclusion-block"
        >
          <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-xl bg-background", cs.text)}>
              <cs.Icon className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className={cn("text-xl font-bold mb-2", cs.text)}>
                {lang === "uk" ? "Автоматичний висновок" : "Automatic conclusion"}
              </h2>
              <p className={cn("text-base leading-relaxed", cs.text)}>
                {lang === "uk" ? conclusion.uk : conclusion.en}
              </p>
            </div>
          </div>
        </motion.div>

        {/* NPS + Criteria Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl shadow-sm print-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Net Promoter Score
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "uk" ? "Готовність рекомендувати IT-хаб" : "Willingness to recommend IT-Hub"}
                </p>
              </div>
              <div className={cn(
                "text-3xl font-bold px-4 py-1.5 rounded-xl",
                npsTone === "emerald" && "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
                npsTone === "amber" && "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
                npsTone === "rose" && "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
              )} data-testid="text-nps-score">
                {nps.score >= 0 ? "+" : ""}{nps.score}
              </div>
            </div>
            {nps.total === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                {lang === "uk" ? "Поки немає даних" : "No data yet"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={npsPie} cx="50%" cy="50%" outerRadius={85} innerRadius={50} dataKey="value"
                    label={(e: any) => nps.total > 0 ? `${((e.value / nps.total) * 100).toFixed(0)}%` : ""}>
                    {npsPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-6 rounded-2xl shadow-sm print-card">
            <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {lang === "uk" ? "Профіль за критеріями" : "Criteria profile"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === "uk" ? "Багатовимірна оцінка від 1 до 5" : "Multi-dimensional rating 1 to 5"}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="criterion" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Radar name={lang === "uk" ? "Оцінка" : "Score"} dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number) => [`${v.toFixed(2)} / 5`, lang === "uk" ? "Сер. оцінка" : "Avg score"]} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Time Series */}
        <Card className="p-6 rounded-2xl shadow-sm print-card">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {lang === "uk" ? "Динаміка відгуків у часі" : "Feedback trend over time"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lang === "uk" ? "Кількість відповідей і середня оцінка по днях" : "Daily response count and average rating"}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 no-print">
              <ChartToggleGroup
                value={tsChartType}
                onChange={(v) => setTsChartType(v as any)}
                options={[
                  { v: "line", icon: LineIcon, label: lang === "uk" ? "Лінія" : "Line" },
                  { v: "area", icon: AreaIcon, label: lang === "uk" ? "Зона" : "Area" },
                  { v: "bar", icon: BarChart2, label: lang === "uk" ? "Стовпці" : "Bars" },
                ]}
                testid="ts-type"
              />
              <ChartToggleGroup
                value={tsMetric}
                onChange={(v) => setTsMetric(v as any)}
                options={[
                  { v: "both", label: lang === "uk" ? "Обидва" : "Both" },
                  { v: "count", label: lang === "uk" ? "К-сть" : "Count" },
                  { v: "rating", label: lang === "uk" ? "Оцінка" : "Rating" },
                ]}
                testid="ts-metric"
              />
            </div>
          </div>
          {tsData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
              {lang === "uk" ? "Поки немає даних" : "No data yet"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              {tsChartType === "line" ? (
                <LineChart data={tsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" allowDecimals={false} fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {(tsMetric === "both" || tsMetric === "count") && (
                    <Line yAxisId="left" type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }}
                      name={lang === "uk" ? "Кількість" : "Count"} />
                  )}
                  {(tsMetric === "both" || tsMetric === "rating") && (
                    <Line yAxisId="right" type="monotone" dataKey="avgRating" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }}
                      name={lang === "uk" ? "Сер. оцінка" : "Avg rating"} />
                  )}
                </LineChart>
              ) : tsChartType === "area" ? (
                <AreaChart data={tsData}>
                  <defs>
                    <linearGradient id="cntFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="rtFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" allowDecimals={false} fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {(tsMetric === "both" || tsMetric === "count") && (
                    <Area yAxisId="left" type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fill="url(#cntFill)"
                      name={lang === "uk" ? "Кількість" : "Count"} />
                  )}
                  {(tsMetric === "both" || tsMetric === "rating") && (
                    <Area yAxisId="right" type="monotone" dataKey="avgRating" stroke="#10b981" strokeWidth={2} fill="url(#rtFill)"
                      name={lang === "uk" ? "Сер. оцінка" : "Avg rating"} />
                  )}
                </AreaChart>
              ) : (
                <BarChart data={tsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" allowDecimals={false} fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {(tsMetric === "both" || tsMetric === "count") && (
                    <Bar yAxisId="left" dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]}
                      name={lang === "uk" ? "Кількість" : "Count"} />
                  )}
                  {(tsMetric === "both" || tsMetric === "rating") && (
                    <Bar yAxisId="right" dataKey="avgRating" fill="#10b981" radius={[6, 6, 0, 0]}
                      name={lang === "uk" ? "Сер. оцінка" : "Avg rating"} />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </Card>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl shadow-sm print-card">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {lang === "uk" ? "Розподіл оцінок" : "Rating distribution"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "uk" ? "Скільки людей поставили кожну оцінку" : "How many people gave each rating"}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 no-print">
                <ChartToggleGroup
                  value={ratingMode}
                  onChange={(v) => setRatingMode(v as any)}
                  options={[
                    { v: "count", label: lang === "uk" ? "К-сть" : "Count" },
                    { v: "percent", label: "%" },
                  ]}
                  testid="rating-mode"
                />
                <button onClick={() => setRatingSort(s => s === "asc" ? "desc" : "asc")}
                  className="text-xs px-2 py-1 rounded-lg border border-border hover:border-primary/40 inline-flex items-center gap-1 font-medium"
                  data-testid="button-rating-sort">
                  <ArrowUpDown className="w-3 h-3" />
                  {ratingSort === "asc" ? "1★ → 5★" : "5★ → 1★"}
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingDistDisplay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="rating" tickFormatter={(v) => `${v}★`} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => ratingMode === "percent" ? `${v}%` : `${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number) => [
                    ratingMode === "percent" ? `${v}%` : v,
                    lang === "uk" ? (ratingMode === "percent" ? "Відсоток" : "Відповідей") : (ratingMode === "percent" ? "Percent" : "Responses")
                  ]}
                  labelFormatter={(v) => `${v}★`}
                />
                <Bar dataKey={ratingMode === "percent" ? "pct" : "count"} radius={[8, 8, 0, 0]}>
                  {ratingDistDisplay.map((d) => (
                    <Cell key={d.rating} fill={RATING_COLORS[Number(d.rating) - 1] || "#888"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 rounded-2xl shadow-sm print-card">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {lang === "uk" ? "% задоволеності" : "% satisfaction"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "uk" ? "Співвідношення задоволених та незадоволених" : "Ratio of satisfied to dissatisfied"}
                </p>
              </div>
              <div className="no-print">
                <ChartToggleGroup
                  value={satView}
                  onChange={(v) => setSatView(v as any)}
                  options={[
                    { v: "pie", icon: PieIcon, label: lang === "uk" ? "Кільце" : "Donut" },
                    { v: "bar", icon: BarChart2, label: lang === "uk" ? "Стовпці" : "Bars" },
                  ]}
                  testid="sat-view"
                />
              </div>
            </div>
            {kpi.total === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                {lang === "uk" ? "Поки немає даних" : "No data yet"}
              </div>
            ) : satView === "pie" ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={satisfactionPie}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    dataKey="value"
                    label={(e: any) => kpi.total > 0 ? `${((e.value / kpi.total) * 100).toFixed(0)}%` : ""}
                  >
                    {satisfactionPie.map((_, i) => <Cell key={i} fill={SAT_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={satisfactionPie} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={140} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {satisfactionPie.map((_, i) => <Cell key={i} fill={SAT_COLORS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Topic breakdown */}
        {topicData.length > 0 && (
          <Card className="p-6 rounded-2xl shadow-sm print-card">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {lang === "uk" ? "Порівняння за топіками (Oracle / AWS / Cisco / Загальне)" : "Topic comparison (Oracle / AWS / Cisco / Overall)"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "uk" ? "Сер. оцінка та NPS у розрізі компаній-партнерів" : "Avg rating and NPS by partner company"}
                </p>
              </div>
              <div className="no-print">
                <ChartToggleGroup
                  value={topicMetric}
                  onChange={(v) => setTopicMetric(v as any)}
                  options={[
                    { v: "all", label: lang === "uk" ? "Усі" : "All" },
                    { v: "count", label: lang === "uk" ? "К-сть" : "Count" },
                    { v: "rating", label: lang === "uk" ? "Оцінка" : "Rating" },
                    { v: "nps", label: "NPS" },
                  ]}
                  testid="topic-metric"
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(220, topicData.length * 70)}>
              <BarChart data={topicData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="label" type="category" stroke="hsl(var(--muted-foreground))" width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {(topicMetric === "all" || topicMetric === "count") && (
                  <Bar dataKey="total" fill="#8b5cf6" name={lang === "uk" ? "Кількість" : "Count"} radius={[0, 6, 6, 0]} />
                )}
                {(topicMetric === "all" || topicMetric === "rating") && (
                  <Bar dataKey="avgRating" fill="#06b6d4" name={lang === "uk" ? "Сер. оцінка" : "Avg rating"} radius={[0, 6, 6, 0]} />
                )}
                {(topicMetric === "all" || topicMetric === "nps") && (
                  <Bar dataKey="avgNps" fill="#f43f5e" name={lang === "uk" ? "Сер. NPS (0-10)" : "Avg NPS (0-10)"} radius={[0, 6, 6, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Word clouds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl shadow-sm print-card">
            <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-emerald-600" />
              {lang === "uk" ? "Що найбільше подобається" : "What students love"}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {lang === "uk" ? "Найчастіші слова з позитивних відгуків" : "Top words from positive feedback"}
            </p>
            <WordCloud words={wordCloud.positive} variant="positive" />
          </Card>

          <Card className="p-6 rounded-2xl shadow-sm print-card">
            <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              {lang === "uk" ? "Що варто покращити" : "What needs improvement"}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {lang === "uk" ? "Найчастіші слова з критики" : "Top words from critical feedback"}
            </p>
            <WordCloud words={wordCloud.negative} variant="negative" />
          </Card>
        </div>

        {/* Charts row 2 - course */}
        <Card className="p-6 rounded-2xl shadow-sm print-card">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                {lang === "uk" ? "Середня оцінка по курсам" : "Average rating by year"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lang === "uk" ? "Як оцінюють хаб студенти різних курсів" : "How students of different years rate the hub"}
              </p>
            </div>
            <div className="no-print">
              <ChartToggleGroup
                value={courseSort}
                onChange={(v) => setCourseSort(v as any)}
                options={[
                  { v: "course", label: lang === "uk" ? "Курс" : "Year" },
                  { v: "rating", label: lang === "uk" ? "Оцінка" : "Rating" },
                  { v: "count", label: lang === "uk" ? "К-сть" : "Count" },
                ]}
                testid="course-sort"
              />
            </div>
          </div>
          {courseDistDisplay.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              {lang === "uk" ? "Поки немає даних" : "No data yet"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={courseDistDisplay} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis xAxisId="rating" type="number" domain={[0, 5]} stroke="#3b82f6" fontSize={11} orientation="top" />
                <XAxis xAxisId="count" type="number" stroke="#a78bfa" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="course" type="category" tickFormatter={(v) => lang === "uk" ? `${v} курс` : `Year ${v}`} stroke="hsl(var(--muted-foreground))" width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number, name: string) => [
                    name === (lang === "uk" ? "Сер. оцінка" : "Avg rating") ? `${v} / 5` : v,
                    name
                  ]}
                  labelFormatter={(v) => lang === "uk" ? `${v} курс` : `Year ${v}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar xAxisId="rating" dataKey="avgRating" fill="#3b82f6" radius={[0, 8, 8, 0]} name={lang === "uk" ? "Сер. оцінка" : "Avg rating"} />
                <Bar xAxisId="count" dataKey="total" fill="#a78bfa" radius={[0, 8, 8, 0]} name={lang === "uk" ? "Кількість" : "Count"} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Specialty distribution */}
        {specialtyDistDisplay.length > 0 && (
          <Card className="p-6 rounded-2xl shadow-sm print-card">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {lang === "uk" ? "Розподіл за спеціальностями" : "Distribution by specialty"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "uk" ? "Кількість відповідей та середня оцінка по спеціальностях" : "Response count and average rating per specialty"}
                </p>
              </div>
              <div className="no-print">
                <ChartToggleGroup
                  value={specialtySort}
                  onChange={(v) => setSpecialtySort(v as any)}
                  options={[
                    { v: "count", label: lang === "uk" ? "К-сть" : "Count" },
                    { v: "rating", label: lang === "uk" ? "Оцінка" : "Rating" },
                    { v: "name", label: lang === "uk" ? "Назва" : "Name" },
                  ]}
                  testid="specialty-sort"
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(200, specialtyDistDisplay.length * 50)}>
              <BarChart data={specialtyDistDisplay} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="specialty" type="category" stroke="hsl(var(--muted-foreground))" width={140} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total" fill="#8b5cf6" name={lang === "uk" ? "Кількість" : "Count"} radius={[0, 6, 6, 0]} />
                <Bar dataKey="avgRating" fill="#06b6d4" name={lang === "uk" ? "Сер. оцінка" : "Avg rating"} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Table (outside PDF zone) */}
      <div className="no-print">
        <FeedbackTable showAdminControls={user?.isAdmin === true} />
      </div>
    </div>
  );
}

function ChartToggleGroup({
  value, onChange, options, testid,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; label: string; icon?: any }[];
  testid: string;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5" data-testid={`toggle-${testid}`}>
      {options.map(opt => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.v}
            onClick={() => onChange(opt.v)}
            className={cn(
              "px-2 py-1 text-[11px] font-bold rounded-md transition-all inline-flex items-center gap-1",
              value === opt.v
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            data-testid={`toggle-${testid}-${opt.v}`}
          >
            {Icon && <Icon className="w-3 h-3" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, subValue, color, testid,
}: {
  icon: any; label: string; value: string | number; subValue?: string;
  color: "blue" | "amber" | "emerald" | "violet" | "rose"; testid: string;
}) {
  const colors = {
    blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400", iconBg: "bg-blue-500" },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400", iconBg: "bg-amber-500" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400", iconBg: "bg-emerald-500" },
    violet: { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-400", iconBg: "bg-violet-500" },
    rose: { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400", iconBg: "bg-rose-500" },
  };
  const c = colors[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn("rounded-2xl border-2 p-5 transition-shadow hover:shadow-md print-card", c.bg, c.border)}
      data-testid={testid}
    >
      <div className="flex items-start justify-between mb-3">
        <p className={cn("text-xs font-bold uppercase tracking-wider", c.text)}>{label}</p>
        <div className={cn("p-2 rounded-lg text-white", c.iconBg)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className={cn("text-2xl md:text-3xl font-bold", c.text)} data-testid={`${testid}-value`}>
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-muted-foreground mt-1">{subValue}</div>
      )}
    </motion.div>
  );
}
