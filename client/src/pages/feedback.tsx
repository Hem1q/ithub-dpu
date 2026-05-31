import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, ThumbsDown, Send, CheckCircle2, BarChart3, ArrowRight, Sparkles, BookText, Users as UsersIcon, Monitor, Heart, MessageSquare, TrendingUp, Clock, Smile, Meh, Frown, Award } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const courses = ["1", "2", "3", "4", "5", "6"];
const specialties = [
  { value: "121", labelUk: "121 — Інженерія програмного забезпечення", labelEn: "121 — Software Engineering" },
  { value: "122", labelUk: "122 — Комп'ютерні науки", labelEn: "122 — Computer Science" },
  { value: "125", labelUk: "125 — Кібербезпека", labelEn: "125 — Cybersecurity" },
  { value: "186", labelUk: "186 — Видавництво та поліграфія", labelEn: "186 — Publishing & Printing" },
  { value: "other", labelUk: "Інша спеціальність", labelEn: "Other specialty" },
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Введіть ваше ім'я (мін. 2 символи)" }),
  course: z.string().min(1, { message: "Оберіть курс" }),
  specialty: z.string().min(1, { message: "Оберіть спеціальність" }),
  topic: z.enum(["general", "oracle", "amazon", "cisco"]),
  ratingOverall: z.number().int().min(1).max(5),
  ratingContent: z.number().int().min(1).max(5),
  ratingTeachers: z.number().int().min(1).max(5),
  ratingPlatform: z.number().int().min(1).max(5),
  npsScore: z.number().int().min(0).max(10),
  liked: z.boolean(),
  positiveAspects: z.string().optional(),
  negativeAspects: z.string().optional(),
  feedbackText: z.string().min(5, { message: "Напишіть відгук (мін. 5 символів)" }),
});

type FormValues = z.infer<typeof formSchema>;

const topicOptions = [
  { value: "general", labelUk: "Загальне враження", labelEn: "Overall experience" },
  { value: "oracle", labelUk: "Oracle Academy", labelEn: "Oracle Academy" },
  { value: "amazon", labelUk: "AWS Educate", labelEn: "AWS Educate" },
  { value: "cisco", labelUk: "Cisco NetAcad", labelEn: "Cisco NetAcad" },
];

export default function FeedbackPage() {
  const { lang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username : "",
      course: user?.course || "",
      specialty: user?.specialty || "",
      topic: "general",
      ratingOverall: 5,
      ratingContent: 5,
      ratingTeachers: 5,
      ratingPlatform: 5,
      npsScore: 9,
      liked: true,
      positiveAspects: "",
      negativeAspects: "",
      feedbackText: "",
    },
  });

  const rating = form.watch("ratingOverall");
  const liked = form.watch("liked");
  const nps = form.watch("npsScore");
  const watched = form.watch();

  // Form completion percentage
  const completionPct = useMemo(() => {
    let filled = 0;
    let total = 6;
    if (watched.name && watched.name.length >= 2) filled++;
    if (watched.course) filled++;
    if (watched.specialty) filled++;
    if (watched.topic) filled++;
    if (watched.feedbackText && watched.feedbackText.length >= 5) filled++;
    if (watched.ratingOverall) filled++;
    return Math.round((filled / total) * 100);
  }, [watched]);

  // Live stats
  const { data: liveStats } = useQuery<{ kpi: { total: number; avgRating: number; satisfiedPct: number }; nps: { score: number } }>({
    queryKey: ["/api/feedback/analytics", {}],
    queryFn: async () => {
      const res = await fetch("/api/feedback/analytics");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  // Recent feedback
  const { data: allFeedback = [] } = useQuery<Array<{
    id: number; name: string | null; ratingOverall: number; topic: string | null;
    feedbackText: string | null; createdAt: string; liked: boolean | null;
  }>>({
    queryKey: ["/api/feedback"],
  });

  const recentFeedback = useMemo(
    () => [...allFeedback]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3),
    [allFeedback]
  );

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return allFeedback.filter(f => new Date(f.createdAt).toDateString() === today).length;
  }, [allFeedback]);

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (lang === "uk") {
      if (mins < 1) return "щойно";
      if (mins < 60) return `${mins} хв тому`;
      if (hours < 24) return `${hours} год тому`;
      return `${days} дн тому`;
    }
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const topicEmoji: Record<string, string> = { oracle: "🟠", amazon: "🟡", cisco: "🔵", general: "⭐" };

  const submitMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        ...data,
        positiveAspects: rating >= 4 ? data.positiveAspects || null : null,
        negativeAspects: rating <= 3 ? data.negativeAspects || null : null,
      };
      return await apiRequest("POST", "/api/feedback", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/analytics"] });
      setSubmitted(true);
      toast({
        title: lang === "uk" ? "Дякуємо за відгук!" : "Thank you for your feedback!",
        description: lang === "uk" ? "Ваш відгук збережено та враховано в аналітиці." : "Your feedback has been saved and added to analytics.",
      });
    },
    onError: (err: any) => {
      toast({
        title: lang === "uk" ? "Помилка" : "Error",
        description: err?.message || (lang === "uk" ? "Не вдалось зберегти відгук" : "Failed to save feedback"),
        variant: "destructive",
      });
    },
  });

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto py-12"
      >
        <Card className="p-12 text-center space-y-6 rounded-2xl border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {lang === "uk" ? "Дякуємо за відгук!" : "Thank you for your feedback!"}
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              {lang === "uk"
                ? "Ваша думка важлива для нас. Перегляньте, як ваш відгук вплинув на загальну аналітику."
                : "Your opinion matters. See how your feedback influenced the overall analytics."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={() => setLocation("/analytics")} className="gap-2" data-testid="button-go-analytics">
              <BarChart3 className="w-4 h-4" />
              {lang === "uk" ? "Переглянути аналітику" : "View Analytics"}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                form.reset();
              }}
              data-testid="button-submit-another"
            >
              {lang === "uk" ? "Залишити ще один" : "Submit another"}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3 h-3" />
          {lang === "uk" ? "Опитування" : "Survey"}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
          {lang === "uk" ? "Залиште свій відгук" : "Leave your feedback"}
        </h1>
        <p className="text-lg text-muted-foreground">
          {lang === "uk"
            ? "Ваш відгук допоможе нам зробити Освітній IT-хаб ДПУ кращим. Усі відповіді зберігаються в БД та використовуються в загальній аналітиці."
            : "Your feedback will help us make the DPU Educational IT-Hub better. All responses are stored in the database and used in overall analytics."}
        </p>
      </motion.div>

      {/* Live stats strip */}
      {liveStats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
          data-testid="live-stats"
        >
          <MiniStat icon={MessageSquare} label={lang === "uk" ? "Усього відгуків" : "Total feedback"}
            value={liveStats.kpi.total} color="blue" testid="ministat-total" />
          <MiniStat icon={Star} label={lang === "uk" ? "Сер. оцінка" : "Avg rating"}
            value={`${liveStats.kpi.avgRating.toFixed(1)} / 5`} color="amber" testid="ministat-avg" />
          <MiniStat icon={TrendingUp} label={lang === "uk" ? "Задоволені" : "Satisfied"}
            value={`${liveStats.kpi.satisfiedPct}%`} color="emerald" testid="ministat-sat" />
          <MiniStat icon={Clock} label={lang === "uk" ? "Сьогодні" : "Today"}
            value={todayCount} color="violet" testid="ministat-today" pulse={todayCount > 0} />
        </motion.div>
      )}

      {/* Recent feedback wall */}
      {recentFeedback.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
          data-testid="recent-feedback-wall"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {lang === "uk" ? "Останні відгуки" : "Recent feedback"}
            </h2>
            <span className="text-xs text-muted-foreground">• {lang === "uk" ? "оновлюється в реальному часі" : "real-time updates"}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <AnimatePresence>
              {recentFeedback.map((fb) => (
                <motion.div
                  key={fb.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all hover:-translate-y-0.5 h-full"
                    data-testid={`recent-feedback-${fb.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{topicEmoji[fb.topic || "general"]}</span>
                        <span className="text-sm font-semibold text-foreground truncate max-w-[100px]">
                          {fb.name || (lang === "uk" ? "Анонім" : "Anon")}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("w-3 h-3", i < fb.ratingOverall ? "fill-current" : "opacity-20")} />
                        ))}
                      </div>
                    </div>
                    {fb.feedbackText && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 italic">
                        "{fb.feedbackText}"
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(fb.createdAt)}
                      </span>
                      {fb.liked !== null && (
                        fb.liked
                          ? <ThumbsUp className="w-3 h-3 text-emerald-500" />
                          : <ThumbsDown className="w-3 h-3 text-rose-500" />
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <Card className="p-6 md:p-8 rounded-2xl shadow-sm">
        {/* Form completion progress */}
        <div className="mb-6 pb-4 border-b border-border" data-testid="form-progress">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className={cn("w-4 h-4", completionPct === 100 ? "text-emerald-500" : "text-muted-foreground")} />
              <span className="text-sm font-medium text-foreground">
                {lang === "uk" ? "Заповнено" : "Completed"}
              </span>
            </div>
            <span className={cn("text-sm font-bold", completionPct === 100 ? "text-emerald-600" : "text-muted-foreground")}>
              {completionPct}%
              {completionPct === 100 && (
                <span className="ml-1.5 text-xs">{lang === "uk" ? "✓ Готово!" : "✓ Done!"}</span>
              )}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full transition-colors",
                completionPct < 50 ? "bg-rose-500" : completionPct < 100 ? "bg-amber-500" : "bg-emerald-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))}
            className="space-y-6"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === "uk" ? "Ваше ім'я" : "Your name"} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={lang === "uk" ? "Іван Петренко" : "John Doe"}
                      {...field}
                      data-testid="input-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Course + Specialty in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "uk" ? "Курс" : "Year of study"} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-course">
                          <SelectValue placeholder={lang === "uk" ? "Оберіть курс" : "Select year"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map(c => (
                          <SelectItem key={c} value={c} data-testid={`option-course-${c}`}>
                            {lang === "uk" ? `${c} курс` : `Year ${c}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "uk" ? "Спеціальність" : "Specialty"} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-specialty">
                          <SelectValue placeholder={lang === "uk" ? "Оберіть спеціальність" : "Select specialty"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specialties.map(s => (
                          <SelectItem key={s.value} value={s.value} data-testid={`option-specialty-${s.value}`}>
                            {lang === "uk" ? s.labelUk : s.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Topic selector */}
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === "uk" ? "Про що відгук?" : "What is the feedback about?"} *</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {topicOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={cn(
                            "p-3 rounded-xl border-2 text-sm font-medium transition-all hover:-translate-y-0.5",
                            field.value === opt.value
                              ? "border-primary bg-primary/10 text-primary shadow-sm"
                              : "border-border hover:border-primary/40"
                          )}
                          data-testid={`button-topic-${opt.value}`}
                        >
                          {lang === "uk" ? opt.labelUk : opt.labelEn}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Rating 1-5 (interactive stars) */}
            <FormField
              control={form.control}
              name="ratingOverall"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === "uk" ? "Загальна оцінка навчання в IT-хабі" : "Overall learning experience rating"} *</FormLabel>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => field.onChange(n)}
                        className={cn(
                          "p-2 rounded-lg transition-all hover:scale-110",
                          n <= field.value
                            ? "text-amber-500"
                            : "text-muted-foreground/30 hover:text-amber-300"
                        )}
                        data-testid={`button-rating-${n}`}
                        aria-label={`${n} ${lang === "uk" ? "зірок" : "stars"}`}
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                    <div className="ml-3 px-3 py-1 rounded-md bg-muted text-sm font-bold">
                      {field.value} / 5
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {field.value <= 2 && (lang === "uk" ? "😞 Незадовільно" : "😞 Unsatisfactory")}
                    {field.value === 3 && (lang === "uk" ? "😐 Задовільно" : "😐 Satisfactory")}
                    {field.value === 4 && (lang === "uk" ? "🙂 Добре" : "🙂 Good")}
                    {field.value === 5 && (lang === "uk" ? "🤩 Відмінно" : "🤩 Excellent")}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Three criteria ratings */}
            <div className="rounded-2xl border-2 border-dashed border-border p-4 space-y-3 bg-muted/20">
              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {lang === "uk" ? "Деталізована оцінка за критеріями" : "Detailed criteria rating"}
              </div>
              {[
                { name: "ratingContent" as const, icon: BookText, labelUk: "Якість контенту", labelEn: "Content quality" },
                { name: "ratingTeachers" as const, icon: UsersIcon, labelUk: "Викладачі / куратори", labelEn: "Teachers / curators" },
                { name: "ratingPlatform" as const, icon: Monitor, labelUk: "Зручність платформи", labelEn: "Platform usability" },
              ].map(({ name, icon: Icon, labelUk, labelEn }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-3">
                        <FormLabel className="flex items-center gap-2 text-sm m-0">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          {lang === "uk" ? labelUk : labelEn}
                        </FormLabel>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => field.onChange(n)}
                              className={cn(
                                "p-1 rounded transition-all hover:scale-110",
                                n <= field.value ? "text-amber-500" : "text-muted-foreground/30"
                              )}
                              data-testid={`button-${name}-${n}`}
                            >
                              <Star className="w-5 h-5 fill-current" />
                            </button>
                          ))}
                          <span className="ml-2 text-xs font-bold text-muted-foreground min-w-[24px]">{field.value}/5</span>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* NPS slider 0-10 */}
            <FormField
              control={form.control}
              name="npsScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    {lang === "uk"
                      ? "Наскільки ймовірно, що ви порекомендуєте IT-хаб друзям? (0-10)"
                      : "How likely are you to recommend the IT-Hub to friends? (0-10)"} *
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="grid grid-cols-11 gap-1">
                        {Array.from({ length: 11 }, (_, n) => n).map(n => {
                          const tone = n <= 6 ? "rose" : n <= 8 ? "amber" : "emerald";
                          const isSelected = field.value === n;
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => field.onChange(n)}
                              className={cn(
                                "py-2 rounded-lg text-sm font-bold border-2 transition-all hover:-translate-y-0.5",
                                isSelected && tone === "rose" && "bg-rose-500 text-white border-rose-500",
                                isSelected && tone === "amber" && "bg-amber-500 text-white border-amber-500",
                                isSelected && tone === "emerald" && "bg-emerald-500 text-white border-emerald-500",
                                !isSelected && "border-border hover:border-primary/50 text-muted-foreground"
                              )}
                              data-testid={`button-nps-${n}`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground px-1">
                        <span>{lang === "uk" ? "Ні в якому разі" : "Not at all likely"}</span>
                        <span className={cn(
                          "font-bold",
                          nps <= 6 && "text-rose-600",
                          nps >= 7 && nps <= 8 && "text-amber-600",
                          nps >= 9 && "text-emerald-600",
                        )}>
                          {nps <= 6 && (lang === "uk" ? "Критик" : "Detractor")}
                          {nps >= 7 && nps <= 8 && (lang === "uk" ? "Нейтральний" : "Passive")}
                          {nps >= 9 && (lang === "uk" ? "Промоутер" : "Promoter")}
                        </span>
                        <span>{lang === "uk" ? "Безумовно так" : "Extremely likely"}</span>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Like / Dislike radio */}
            <FormField
              control={form.control}
              name="liked"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === "uk" ? "Чи подобається вам IT-хаб?" : "Do you like the IT-Hub?"} *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(v) => field.onChange(v === "true")}
                      value={String(field.value)}
                      className="flex gap-3"
                    >
                      <label
                        className={cn(
                          "flex-1 flex items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          field.value === true
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                            : "border-border hover:border-emerald-300"
                        )}
                        data-testid="radio-liked-yes"
                      >
                        <RadioGroupItem value="true" />
                        <ThumbsUp className={cn("w-5 h-5", field.value === true ? "text-emerald-600" : "text-muted-foreground")} />
                        <span className="font-medium">{lang === "uk" ? "Так, подобається" : "Yes, I like it"}</span>
                      </label>
                      <label
                        className={cn(
                          "flex-1 flex items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          field.value === false
                            ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30"
                            : "border-border hover:border-rose-300"
                        )}
                        data-testid="radio-liked-no"
                      >
                        <RadioGroupItem value="false" />
                        <ThumbsDown className={cn("w-5 h-5", field.value === false ? "text-rose-600" : "text-muted-foreground")} />
                        <span className="font-medium">{lang === "uk" ? "Ні, не подобається" : "No, I don't"}</span>
                      </label>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Conditional: rating <=3 → negativeAspects */}
            {rating <= 3 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
              >
                <FormField
                  control={form.control}
                  name="negativeAspects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-rose-700 dark:text-rose-400">
                        {lang === "uk" ? "Що не сподобалось?" : "What did you dislike?"}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={lang === "uk" ? "Опишіть проблеми, з якими ви стикалися..." : "Describe the issues you encountered..."}
                          rows={3}
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-negative"
                          className="border-rose-200 dark:border-rose-800 focus-visible:ring-rose-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </motion.div>
            )}

            {/* Conditional: rating >=4 → positiveAspects */}
            {rating >= 4 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
              >
                <FormField
                  control={form.control}
                  name="positiveAspects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-700 dark:text-emerald-400">
                        {lang === "uk" ? "Що сподобалось найбільше?" : "What did you like most?"}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={lang === "uk" ? "Опишіть, що було особливо корисним..." : "Describe what was particularly useful..."}
                          rows={3}
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-positive"
                          className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </motion.div>
            )}

            {/* General feedback */}
            <FormField
              control={form.control}
              name="feedbackText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === "uk" ? "Загальний відгук" : "General feedback"} *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={lang === "uk" ? "Поділіться своїми думками, пропозиціями, побажаннями..." : "Share your thoughts, suggestions, wishes..."}
                      rows={4}
                      {...field}
                      data-testid="textarea-feedback"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
              <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                {lang === "uk" ? "Переглянути аналітику" : "View analytics"}
              </Link>
              <Button
                type="submit"
                size="lg"
                disabled={submitMutation.isPending}
                className="gap-2"
                data-testid="button-submit-feedback"
              >
                <Send className="w-4 h-4" />
                {submitMutation.isPending
                  ? lang === "uk" ? "Надсилання..." : "Submitting..."
                  : lang === "uk" ? "Надіслати відгук" : "Submit feedback"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color, testid, pulse }: {
  icon: any; label: string; value: string | number;
  color: "blue" | "amber" | "emerald" | "violet"; testid: string; pulse?: boolean;
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
      whileHover={{ y: -2 }}
      className={cn("rounded-xl border p-3 transition-shadow hover:shadow-sm", c.bg, c.border)}
      data-testid={testid}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className={cn("p-1.5 rounded-md text-white relative", c.iconBg)}>
          <Icon className="w-3.5 h-3.5" />
          {pulse && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
        </div>
      </div>
      <div className={cn("text-lg font-extrabold leading-tight", c.text)}>{value}</div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mt-0.5">{label}</p>
    </motion.div>
  );
}
