import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Trophy, Medal, Crown, Search, Users, GraduationCap, MapPin, Sparkles,
  TrendingUp, Award, Target, Flame, Star, Filter, X, BookOpen, ChevronUp
} from "lucide-react";
import type { User } from "@shared/schema";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface UserWithProgress extends User {
  completedTopics: number;
}

type SortMode = "topics" | "name" | "course";

export default function Leaderboard() {
  const { lang } = useLanguage();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("topics");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const { data: leaderboard = [], isLoading } = useQuery<UserWithProgress[]>({
    queryKey: ["/api/users/leaderboard"],
  });

  const labels = {
    uk: {
      title: "Таблиця лідерів",
      subtitle: "Найактивніші учасники Освітнього IT-ХАБу ДПУ",
      loading: "Завантаження...",
      anon: "Анонім",
      empty: "Користувачів за цими фільтрами не знайдено",
      topic1: "тема", topic2: "теми", topicMany: "тем",
      podium: "Наші лідери",
      podiumDesc: "Топ-3 найактивніших учнів",
      registered: "Зареєстровано",
      completed: "Пройдено тем",
      courses: "Доступних курсів",
      avgRate: "Сер. активність",
      yourRank: "Ваше місце", yourPlace: "ваше місце",
      youDesc: "Ви входите в",
      topPct: "топ",
      keepGoing: "Продовжуйте навчання, щоб піднятись вище!",
      search: "Пошук за ім'ям, прізвищем, нікнеймом...",
      sortBy: "Сортувати:",
      byTopics: "За темами", byName: "За іменем", byCourse: "За курсом",
      filters: "Фільтри:",
      allSpecialties: "Усі спеціальності", allCourses: "Усі курси",
      reset: "Скинути",
      showing: "Показано", of: "з",
      activity: "Активність",
      noProgress: "Без прогресу",
      partial: "Початківець",
      good: "Ентузіаст",
      hot: "В топі!",
      member: "Учасник",
      champion: "Чемпіон",
      groupBy: "Розподіл по спеціальностях",
      topSpec: "Найпопулярніша спеціальність",
      total: "учасників",
    },
    en: {
      title: "Leaderboard",
      subtitle: "The most active members of DPU Educational IT-HUB",
      loading: "Loading...",
      anon: "Anonymous",
      empty: "No users match these filters",
      topic1: "topic", topic2: "topics", topicMany: "topics",
      podium: "Winners' Podium",
      podiumDesc: "Top-3 most active learners",
      registered: "Registered",
      completed: "Topics done",
      courses: "Available courses",
      avgRate: "Avg activity",
      yourRank: "Your rank", yourPlace: "your place",
      youDesc: "You are in",
      topPct: "top",
      keepGoing: "Keep learning to climb higher!",
      search: "Search by name, surname, username...",
      sortBy: "Sort:",
      byTopics: "By topics", byName: "By name", byCourse: "By year",
      filters: "Filters:",
      allSpecialties: "All specialties", allCourses: "All years",
      reset: "Reset",
      showing: "Showing", of: "of",
      activity: "Activity",
      noProgress: "No progress",
      partial: "Beginner",
      good: "Enthusiast",
      hot: "On fire!",
      member: "Member",
      champion: "Champion",
      groupBy: "Distribution by specialty",
      topSpec: "Most popular specialty",
      total: "members",
    },
  };
  const l = labels[lang];

  const topicLabel = (count: number) => {
    if (lang === "uk") {
      if (count === 1) return l.topic1;
      if (count >= 2 && count <= 4) return l.topic2;
      return l.topicMany;
    }
    return count === 1 ? l.topic1 : l.topicMany;
  };

  const allUsers = useMemo(() => [...leaderboard], [leaderboard]);

  // Top performers (always sorted by topics, ignoring filters)
  const top3 = useMemo(
    () => [...allUsers].sort((a, b) => b.completedTopics - a.completedTopics).slice(0, 3),
    [allUsers]
  );

  // Specialty options
  const specialtyOptions = useMemo(() => {
    const s = new Set<string>();
    allUsers.forEach(u => u.specialty && s.add(u.specialty));
    return Array.from(s).sort();
  }, [allUsers]);

  const courseOptions = useMemo(() => {
    const s = new Set<string>();
    allUsers.forEach(u => u.course && s.add(u.course));
    return Array.from(s).sort();
  }, [allUsers]);

  // Filtered + sorted list
  const filtered = useMemo(() => {
    let list = [...allUsers];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(u =>
        (u.username || "").toLowerCase().includes(q) ||
        (u.firstName || "").toLowerCase().includes(q) ||
        (u.lastName || "").toLowerCase().includes(q)
      );
    }
    if (specialtyFilter !== "all") {
      list = list.filter(u => u.specialty === specialtyFilter);
    }
    if (courseFilter !== "all") {
      list = list.filter(u => u.course === courseFilter);
    }
    if (sortMode === "topics") {
      list.sort((a, b) => b.completedTopics - a.completedTopics);
    } else if (sortMode === "name") {
      list.sort((a, b) => (a.username || "").localeCompare(b.username || ""));
    } else if (sortMode === "course") {
      list.sort((a, b) => (b.course || "").localeCompare(a.course || ""));
    }
    return list;
  }, [allUsers, search, specialtyFilter, courseFilter, sortMode]);

  // Stats
  const stats = useMemo(() => {
    const totalCompleted = allUsers.reduce((s, u) => s + u.completedTopics, 0);
    const avgActivity = allUsers.length > 0
      ? (totalCompleted / allUsers.length).toFixed(1)
      : "0";
    const specCount: Record<string, number> = {};
    allUsers.forEach(u => {
      if (u.specialty) specCount[u.specialty] = (specCount[u.specialty] || 0) + 1;
    });
    const topSpec = Object.entries(specCount).sort((a, b) => b[1] - a[1])[0];
    return { totalCompleted, avgActivity, topSpec, specCount };
  }, [allUsers]);

  // Personal rank
  const personalRank = useMemo(() => {
    if (!currentUser) return null;
    const sorted = [...allUsers].sort((a, b) => b.completedTopics - a.completedTopics);
    const idx = sorted.findIndex(u => u.id === currentUser.id);
    if (idx === -1) return null;
    const me = sorted[idx];
    const pct = sorted.length > 0 ? Math.round(((idx + 1) / sorted.length) * 100) : 100;
    return { rank: idx + 1, total: sorted.length, pct, completed: me.completedTopics };
  }, [allUsers, currentUser]);

  const filtersActive = search || specialtyFilter !== "all" || courseFilter !== "all" || sortMode !== "topics";

  const resetFilters = () => {
    setSearch("");
    setSpecialtyFilter("all");
    setCourseFilter("all");
    setSortMode("topics");
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{l.loading}</div>
      </div>
    );
  }

  // Activity badge by completedTopics
  const getActivityBadge = (count: number) => {
    if (count === 0) return { label: l.noProgress, color: "bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:text-slate-400", icon: BookOpen };
    if (count === 1) return { label: l.partial, color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", icon: TrendingUp };
    if (count === 2) return { label: l.good, color: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400", icon: Star };
    return { label: l.hot, color: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400", icon: Flame };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-8 md:p-12 text-white"
        data-testid="leaderboard-hero"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-300/20 rounded-full blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Trophy className="w-3.5 h-3.5" />
            {l.title}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{l.title}</h1>
          <p className="text-white/90 text-lg max-w-2xl">{l.subtitle}</p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} value={allUsers.length} label={l.registered} color="blue" testid="stat-registered" />
        <StatCard icon={Trophy} value={stats.totalCompleted} label={l.completed} color="amber" testid="stat-completed" />
        <StatCard icon={GraduationCap} value="3" label={l.courses} color="emerald" testid="stat-courses" />
        <StatCard icon={Target} value={stats.avgActivity} label={l.avgRate} color="violet" testid="stat-activity" />
      </div>

      {/* Personal rank card */}
      {personalRank && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 flex flex-wrap items-center gap-4"
          data-testid="personal-rank-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-xl shadow-lg">
              #{personalRank.rank}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{l.yourRank}</p>
              <p className="text-base font-semibold text-foreground">
                {l.youDesc} {l.topPct} {personalRank.pct}% • {personalRank.completed} {topicLabel(personalRank.completed)}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground ml-auto flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            {l.keepGoing}
          </p>
        </motion.div>
      )}

      {/* Podium for top-3 */}
      {top3.length >= 3 && (
        <div className="space-y-4" data-testid="podium-section">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              <Crown className="w-7 h-7 text-amber-500" />
              {l.podium}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">{l.podiumDesc}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-3xl mx-auto pt-8">
            {/* 2nd place */}
            <PodiumCard user={top3[1]} place={2} l={l} topicLabel={topicLabel} />
            {/* 1st place */}
            <PodiumCard user={top3[0]} place={1} l={l} topicLabel={topicLabel} />
            {/* 3rd place */}
            <PodiumCard user={top3[2]} place={3} l={l} topicLabel={topicLabel} />
          </div>
        </div>
      )}

      {/* Filters bar */}
      <Card className="p-4 rounded-2xl shadow-sm" data-testid="filters-card">
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={l.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="button-clear-search"
                aria-label="Clear search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort + filters */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{l.sortBy}</span>
              {([
                { v: "topics" as const, label: l.byTopics },
                { v: "name" as const, label: l.byName },
                { v: "course" as const, label: l.byCourse },
              ]).map(opt => (
                <button key={opt.v} onClick={() => setSortMode(opt.v)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-lg border transition-all",
                    sortMode === opt.v
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border bg-background hover:border-primary/40"
                  )}
                  data-testid={`button-sort-${opt.v}`}>
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="text-xs rounded-lg border border-border bg-background px-2 py-1.5 font-medium hover:border-primary/40 transition-colors max-w-[180px]"
                data-testid="select-specialty-filter">
                <option value="all">{l.allSpecialties}</option>
                {specialtyOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}
                className="text-xs rounded-lg border border-border bg-background px-2 py-1.5 font-medium hover:border-primary/40 transition-colors"
                data-testid="select-course-filter">
                <option value="all">{l.allCourses}</option>
                {courseOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {filtersActive && (
                <Button variant="ghost" size="sm" onClick={resetFilters}
                  className="h-8 text-xs text-primary hover:text-primary"
                  data-testid="button-reset">
                  <X className="w-3 h-3 mr-1" /> {l.reset}
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
            <span>
              {l.showing} <strong className="text-foreground">{filtered.length}</strong> {l.of}{" "}
              <strong className="text-foreground">{allUsers.length}</strong> {l.total}
            </span>
            {stats.topSpec && (
              <span className="hidden sm:inline">
                {l.topSpec}: <strong className="text-foreground">{stats.topSpec[0]}</strong> ({stats.topSpec[1]})
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Full ranked list */}
      <div className="space-y-2" data-testid="leaderboard-list">
        <AnimatePresence mode="popLayout">
          {filtered.map((user, index) => {
            const originalRank = [...allUsers].sort((a, b) => b.completedTopics - a.completedTopics)
              .findIndex(u => u.id === user.id) + 1;
            const isYou = currentUser?.id === user.id;
            const activity = getActivityBadge(user.completedTopics);
            const ActivityIcon = activity.icon;

            return (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
              >
                <Card
                  className={cn(
                    "p-4 transition-all hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden",
                    isYou && "ring-2 ring-primary border-primary/40 bg-primary/5"
                  )}
                  data-testid={`leaderboard-row-${user.id}`}
                >
                  {isYou && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                      {lang === "uk" ? "Це ви" : "You"}
                    </div>
                  )}
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Rank badge */}
                    <div className={cn(
                      "shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-base",
                      originalRank === 1 && "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md",
                      originalRank === 2 && "bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-md",
                      originalRank === 3 && "bg-gradient-to-br from-orange-400 to-orange-700 text-white shadow-md",
                      originalRank > 3 && "bg-muted text-muted-foreground"
                    )}>
                      {originalRank <= 3 ? <Medal className="w-6 h-6" /> : `#${originalRank}`}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm">
                      <AvatarImage src={user.profileImageUrl || ""} />
                      <AvatarFallback className="text-sm font-bold">
                        {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-foreground truncate" data-testid={`user-name-${user.id}`}>
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                        </p>
                        {user.username && (user.firstName || user.lastName) && (
                          <span className="text-xs text-muted-foreground">@{user.username}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {user.course && <span className="inline-flex items-center gap-1"><GraduationCap className="w-3 h-3" />{lang === "uk" ? `${user.course} курс` : `Year ${user.course}`}</span>}
                        {user.specialty && <span className="truncate max-w-[180px]">• {user.specialty}</span>}
                        {user.region && <span className="hidden sm:inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{user.region}</span>}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge className={cn("font-bold gap-1 border-0", activity.color)} data-testid={`badge-activity-${user.id}`}>
                        <ActivityIcon className="w-3 h-3" />
                        {user.completedTopics}
                      </Badge>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:block">
                        {topicLabel(user.completedTopics)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <Card className="p-12 text-center text-muted-foreground" data-testid="empty-state">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{l.empty}</p>
            {filtersActive && (
              <Button variant="ghost" onClick={resetFilters} className="mt-2 text-primary hover:text-primary" data-testid="button-reset-empty">
                {l.reset}
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Scroll to top */}
      {filtered.length > 10 && (
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="gap-1.5" data-testid="button-scroll-top">
            <ChevronUp className="w-4 h-4" />
            {lang === "uk" ? "Нагору" : "To top"}
          </Button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color, testid }: {
  icon: any; value: string | number; label: string;
  color: "blue" | "amber" | "emerald" | "violet"; testid: string;
}) {
  const colors = {
    blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-900", text: "text-blue-700 dark:text-blue-400", iconBg: "bg-blue-500" },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-900", text: "text-amber-700 dark:text-amber-400", iconBg: "bg-amber-500" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-900", text: "text-emerald-700 dark:text-emerald-400", iconBg: "bg-emerald-500" },
    violet: { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-900", text: "text-violet-700 dark:text-violet-400", iconBg: "bg-violet-500" },
  };
  const c = colors[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -2 }}
      className={cn("rounded-2xl border-2 p-4 transition-shadow hover:shadow-md", c.bg, c.border)}
      data-testid={testid}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={cn("p-2 rounded-lg text-white", c.iconBg)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className={cn("text-2xl md:text-3xl font-extrabold", c.text)}>{value}</div>
      <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide font-medium">{label}</p>
    </motion.div>
  );
}

function PodiumCard({ user, place, l, topicLabel }: {
  user: UserWithProgress; place: 1 | 2 | 3;
  l: any; topicLabel: (n: number) => string;
}) {
  const config = {
    1: { height: "h-44", gradient: "from-amber-400 to-amber-600", icon: Crown, ring: "ring-amber-400", scale: 1.1, delay: 0.3 },
    2: { height: "h-36", gradient: "from-slate-300 to-slate-500", icon: Medal, ring: "ring-slate-400", scale: 1, delay: 0.1 },
    3: { height: "h-32", gradient: "from-orange-400 to-orange-700", icon: Medal, ring: "ring-orange-500", scale: 0.95, delay: 0.5 },
  }[place];
  const Icon = config.icon;
  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.username || l.anon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: config.delay, type: "spring", stiffness: 100 }}
      className="flex flex-col items-center gap-3"
      data-testid={`podium-place-${place}`}
    >
      <div className="flex flex-col items-center">
        <div className={cn("relative", place === 1 && "scale-110")}>
          <Avatar className={cn("h-16 w-16 md:h-20 md:w-20 ring-4 shadow-xl", config.ring)}>
            <AvatarImage src={user.profileImageUrl || ""} />
            <AvatarFallback className="text-xl font-extrabold">
              {user.firstName?.charAt(0) || user.username?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -top-3 -right-2 w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
            config.gradient
          )}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <p className="font-bold text-sm text-foreground mt-3 text-center max-w-[120px] truncate" title={displayName}>
          {displayName}
        </p>
        <p className="text-xs text-muted-foreground">@{user.username}</p>
      </div>
      <div className={cn(
        "w-full rounded-t-2xl bg-gradient-to-b text-white p-4 flex flex-col items-center justify-end gap-1 shadow-lg",
        config.gradient, config.height
      )}>
        <div className="text-3xl md:text-4xl font-extrabold">#{place}</div>
        <div className="text-2xl font-extrabold">{user.completedTopics}</div>
        <div className="text-[10px] uppercase tracking-wider opacity-90 font-medium">
          {topicLabel(user.completedTopics)}
        </div>
      </div>
    </motion.div>
  );
}
