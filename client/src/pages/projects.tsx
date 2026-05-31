import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  ExternalLink,
  Calendar,
  GraduationCap,
  User,
  Search,
  Code2,
  Database,
  Globe,
  Sparkles,
  Trophy,
  TrendingUp,
  Layers,
  Network,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  titleUk: string;
  titleEn: string;
  descUk: string;
  descEn: string;
  author: string;
  group: string;
  year: number;
  url: string;
  status: "live" | "test" | "archived";
  tagsUk: string[];
  tagsEn: string[];
  techStack: string[];
  icon: typeof Rocket;
  gradient: string;
  category: "blockchain" | "analytics" | "web";
};

const PROJECTS: Project[] = [
  {
    id: "blockchain-rewards",
    titleUk: "Децентралізована система взаємодії та винагород на базі блокчейну",
    titleEn: "Decentralized blockchain-based interaction and rewards system",
    descUk:
      "Інноваційна платформа з прозорою системою винагород для учасників екосистеми. Використовує смарт-контракти для автоматичного нарахування токенів за активність та внесок користувачів. Працює у тестовому режимі — можна відчути реальну роботу blockchain-додатку.",
    descEn:
      "An innovative platform with a transparent reward system for ecosystem participants. Uses smart contracts to automatically issue tokens for activity and user contribution. Currently in test mode — feel a real blockchain application in action.",
    author: "Мілінтєєв Д.",
    group: "КМІ-24-1",
    year: 2026,
    url: "https://it-hub.tech/frontend/",
    status: "test",
    tagsUk: ["Blockchain", "Web3", "Смарт-контракти", "DeFi"],
    tagsEn: ["Blockchain", "Web3", "Smart Contracts", "DeFi"],
    techStack: ["Solidity", "Web3.js", "React", "Ethereum"],
    icon: Network,
    gradient: "from-violet-600 via-purple-600 to-indigo-700",
    category: "blockchain",
  },
  {
    id: "tax-data-analytics",
    titleUk: "Web-додаток для аналізу відкритих даних податкових надходжень",
    titleEn: "Web application for analyzing open tax revenue data",
    descUk:
      "Інтерактивний інструмент для дослідження та візуалізації відкритих даних щодо податкових надходжень в Україні. Дозволяє будувати динамічні дашборди, фільтрувати дані за регіонами та періодами, виявляти тенденції та формувати аналітичні висновки.",
    descEn:
      "An interactive tool for exploring and visualizing open data on tax revenues in Ukraine. Allows building dynamic dashboards, filtering data by region and period, detecting trends, and producing analytical conclusions.",
    author: "Мандрик В.",
    group: "КМІЗ-21-1",
    year: 2023,
    url: "https://lawlie7.github.io/graduate-work-mvv/",
    status: "live",
    tagsUk: ["Аналітика даних", "Open Data", "Візуалізація", "Податки"],
    tagsEn: ["Data Analytics", "Open Data", "Visualization", "Tax"],
    techStack: ["JavaScript", "Chart.js", "HTML/CSS", "GitHub Pages"],
    icon: Database,
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    category: "analytics",
  },
];

const STATUS_LABELS = {
  live: { uk: "Працює", en: "Live", color: "bg-emerald-500" },
  test: { uk: "Тестовий режим", en: "Test mode", color: "bg-amber-500" },
  archived: { uk: "Архів", en: "Archived", color: "bg-slate-500" },
};

const CATEGORY_LABELS = {
  all: { uk: "Усі", en: "All" },
  blockchain: { uk: "Блокчейн", en: "Blockchain" },
  analytics: { uk: "Аналітика", en: "Analytics" },
  web: { uk: "Web-додатки", en: "Web apps" },
};

export default function ProjectsPage() {
  const { lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | "blockchain" | "analytics" | "web">("all");

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [p.titleUk, p.titleEn, p.author, p.group, ...p.tagsUk, ...p.tagsEn, ...p.techStack]
          .join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [search, category]);

  const stats = useMemo(() => {
    const years = PROJECTS.map((p) => p.year);
    return {
      total: PROJECTS.length,
      latest: Math.max(...years),
      categories: new Set(PROJECTS.map((p) => p.category)).size,
      live: PROJECTS.filter((p) => p.status === "live").length,
    };
  }, []);

  const l = {
    uk: {
      badge: "ПРОЕКТИ ЗДОБУВАЧІВ",
      title: "Проекти наших здобувачів",
      subtitle: "Реальні дипломні та курсові проекти випускників і студентів КІТС — приклад того, що можна створити, навчаючись на нашій кафедрі.",
      search: "Пошук за назвою, автором або технологією...",
      total: "Усього проектів",
      latest: "Найновіший",
      categories: "Напрямів",
      live: "Активних",
      visit: "Відкрити проект",
      tech: "Технології",
      author: "Автор",
      group: "Група",
      year: "Рік",
      empty: "Нічого не знайдено за вашим запитом",
      cta: "Хочеш зробити свій проект?",
      ctaDesc: "Долучайся до КІТС, опануй сучасні технології та створи власний проект, який буде представлений тут.",
      ctaBtn: "Дізнатись більше",
    },
    en: {
      badge: "STUDENT PROJECTS",
      title: "Our students' projects",
      subtitle: "Real bachelor and course projects by KITiS graduates and students — an example of what you can create while studying at our department.",
      search: "Search by title, author, or technology...",
      total: "Total projects",
      latest: "Latest",
      categories: "Categories",
      live: "Active",
      visit: "Open project",
      tech: "Tech stack",
      author: "Author",
      group: "Group",
      year: "Year",
      empty: "Nothing found for your query",
      cta: "Want to build your own project?",
      ctaDesc: "Join KITiS, master modern technologies, and create your own project to be featured here.",
      ctaBtn: "Learn more",
    },
  }[lang];

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 md:p-12 text-white shadow-2xl"
        data-testid="projects-hero"
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-indigo-400/30 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold mb-4 border border-white/20">
            <Rocket className="w-3.5 h-3.5" />
            {l.badge}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
            {l.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl">
            {l.subtitle}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        data-testid="projects-stats"
      >
        <StatCard icon={Layers} label={l.total} value={stats.total} color="indigo" />
        <StatCard icon={TrendingUp} label={l.latest} value={stats.latest} color="violet" />
        <StatCard icon={Tag} label={l.categories} value={stats.categories} color="fuchsia" />
        <StatCard icon={Trophy} label={l.live} value={stats.live} color="emerald" />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="p-4 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={l.search}
                className="pl-9"
                data-testid="input-projects-search"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "blockchain", "analytics", "web"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-lg border transition-all",
                    category === c
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border bg-background hover:border-primary/40"
                  )}
                  data-testid={`button-cat-${c}`}
                >
                  {CATEGORY_LABELS[c][lang]}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Projects grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground" data-testid="projects-empty">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{l.empty}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((p, i) => {
            const Icon = p.icon;
            const status = STATUS_LABELS[p.status];
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                whileHover={{ y: -4 }}
                data-testid={`project-card-${p.id}`}
              >
                <Card className="overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-shadow h-full flex flex-col">
                  {/* Cover */}
                  <div className={cn("relative h-40 bg-gradient-to-br p-6 text-white overflow-hidden", p.gradient)}>
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                    <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
                    <div className="relative flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30")}>
                          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", status.color)} />
                          {status[lang]}
                        </span>
                        <span className="text-xs font-medium bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/20">
                          {p.year}
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-4 text-[10px] uppercase tracking-widest opacity-60 font-bold">
                      #{String(i + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg md:text-xl font-extrabold text-foreground mb-2 leading-snug" data-testid={`project-title-${p.id}`}>
                      {lang === "uk" ? p.titleUk : p.titleEn}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
                      {lang === "uk" ? p.descUk : p.descEn}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
                      <span className="inline-flex items-center gap-1.5" data-testid={`project-author-${p.id}`}>
                        <User className="w-3.5 h-3.5" />
                        <span className="font-semibold text-foreground">{p.author}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {p.group}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {p.year}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(lang === "uk" ? p.tagsUk : p.tagsEn).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] font-semibold">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Tech */}
                    <div className="mb-5">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5">
                        <Code2 className="w-3 h-3" />
                        {l.tech}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {p.techStack.map((t) => (
                          <span key={t} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-foreground/80">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-r",
                        p.gradient
                      )}
                      data-testid={`link-project-${p.id}`}
                    >
                      <Globe className="w-4 h-4" />
                      {l.visit}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-8 md:p-10 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 text-white border-none overflow-hidden relative" data-testid="projects-cta">
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold mb-1">{l.cta}</h3>
                <p className="text-white/80 text-sm max-w-xl">{l.ctaDesc}</p>
              </div>
            </div>
            <a
              href="https://dpu.edu.ua"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-900 font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap"
              data-testid="link-cta-more"
            >
              {l.ctaBtn}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: string | number;
  color: "indigo" | "violet" | "fuchsia" | "emerald";
}) {
  const colors = {
    indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-900", text: "text-indigo-700 dark:text-indigo-400", iconBg: "bg-indigo-500" },
    violet: { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-900", text: "text-violet-700 dark:text-violet-400", iconBg: "bg-violet-500" },
    fuchsia: { bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30", border: "border-fuchsia-200 dark:border-fuchsia-900", text: "text-fuchsia-700 dark:text-fuchsia-400", iconBg: "bg-fuchsia-500" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-900", text: "text-emerald-700 dark:text-emerald-400", iconBg: "bg-emerald-500" },
  };
  const c = colors[color];
  return (
    <motion.div whileHover={{ y: -2 }} className={cn("rounded-2xl border p-5 transition-shadow hover:shadow-md", c.bg, c.border)}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3", c.iconBg)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className={cn("text-3xl font-extrabold leading-tight mb-1", c.text)}>{value}</div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{label}</p>
    </motion.div>
  );
}
