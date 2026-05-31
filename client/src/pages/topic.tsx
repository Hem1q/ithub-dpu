import { useTopic } from "@/hooks/use-topics";
import { useAuth } from "@/hooks/use-auth";
import { useRoute } from "wouter";
import { Loader2, Lock, BookOpen, AlertCircle, ExternalLink, ChevronRight, Home, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { parseSubTopic } from "@shared/topic-subtopics";

const topicLabels = {
  uk: {
    notFound: "Тему не знайдено",
    notFoundDesc: "Запитуваний ресурс не знайдено. Будь ласка, перевірте URL або повертайтесь на головну сторінку.",
    home: "Головна",
    backHome: "На головну",
    module: "Загальна інформація",
    officialSite: "Офіційний сайт",
    yourProgress: "Ваш прогрес",
    loggedAs: "Ви увійшли як",
    progressNote: "Ваша активність в цьому модулі відстежується автоматично. Продовжуйте вчитися!",
    sections: "Курси освітньої програми",
    loginRequired: "Вхід потрібен",
    loginRequiredDesc: "Будь ласка, увійдіть у свій акаунт, щоб отримати доступ до повного змісту цього модуля.",
    loginBtn: "Увійти в акаунт",
    takeQuiz: "Пройти тест",
    quizDesc: "Перевірте свої знання та отримайте залік за цю тему",
  },
  en: {
    notFound: "Topic not found",
    notFoundDesc: "The requested resource was not found. Please check the URL or return to the home page.",
    home: "Home",
    backHome: "Back to Home",
    module: "General Information",
    officialSite: "Official Website",
    yourProgress: "Your Progress",
    loggedAs: "Logged in as",
    progressNote: "Your activity in this module is tracked automatically. Keep learning!",
    sections: "Courses of the Educational Program",
    loginRequired: "Login Required",
    loginRequiredDesc: "Please log in to your account to access the full content of this module.",
    loginBtn: "Log In",
    takeQuiz: "Take Quiz",
    quizDesc: "Test your knowledge and complete this topic",
  },
};

export default function Topic() {
  const [match, params] = useRoute("/topic/:slug");
  const slug = params?.slug || "";
  const { data: topic, isLoading, error } = useTopic(slug);
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { lang } = useLanguage();
  const tl = topicLabels[lang];

  const themeColors = {
    oracle: {
      text: "text-oracle",
      bg: "bg-oracle/5",
      border: "border-oracle/20",
      gradient: "from-oracle/20 to-transparent"
    },
    amazon: {
      text: "text-amazon",
      bg: "bg-amazon/5",
      border: "border-amazon/20",
      gradient: "from-amazon/20 to-transparent"
    },
    cisco: {
      text: "text-cisco",
      bg: "bg-cisco/5",
      border: "border-cisco/20",
      gradient: "from-cisco/20 to-transparent"
    },
    default: {
      text: "text-primary",
      bg: "bg-primary/5",
      border: "border-primary/20",
      gradient: "from-primary/20 to-transparent"
    },
  };

  const getTheme = (s: string) => {
    if (s === 'oracle' || s === 'amazon' || s === 'cisco') return s;
    return 'default';
  };

  const theme = getTheme(slug);
  const currentTheme = themeColors[theme];

  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{tl.notFound}</h2>
          <p className="text-muted-foreground max-w-md">
            {tl.notFoundDesc}
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" className="rounded-lg">
            <Home className="w-4 h-4 mr-2" />
            {tl.backHome}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
      >
        <Link href="/" className="hover:text-foreground transition-colors">{tl.home}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">{topic.name}</span>
      </motion.div>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("mb-12 pb-12 border-b border-border/30 bg-gradient-to-b", currentTheme.gradient)}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border", currentTheme.bg, currentTheme.text, currentTheme.border)}
          >
            <BookOpen className="w-4 h-4" />
            {tl.module}
          </motion.div>

          {topic.officialUrl && (
            <motion.a
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              href={topic.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 font-medium group"
              data-testid="button-official-link"
            >
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              {tl.officialSite}
            </motion.a>
          )}
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-bold text-foreground mb-6"
        >
          {topic.name}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-muted-foreground leading-relaxed"
        >
          {topic.description}
        </motion.p>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-12"
      >
        <>
            {/* Content Card */}
            <Card className="rounded-2xl overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className={cn("h-1 w-full bg-gradient-to-r", currentTheme.gradient)} />
              <div className="p-8 md:p-10">
                <div className="prose prose-slate dark:prose-invert max-w-none leading-relaxed">
                  <div className="whitespace-pre-wrap text-base md:text-lg text-foreground/90 font-medium">
                    {topic.content}
                  </div>
                </div>
              </div>
            </Card>


            {/* Quiz CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-border/60 bg-gradient-to-r from-primary/5 to-transparent p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base">{tl.takeQuiz}</h3>
                  <p className="text-sm text-muted-foreground">{tl.quizDesc}</p>
                </div>
              </div>
              <Link href={`/quiz/${slug}`}>
                <Button size="lg" className="shrink-0 gap-2" data-testid="button-take-quiz">
                  <ClipboardList className="w-4 h-4" />
                  {tl.takeQuiz}
                </Button>
              </Link>
            </motion.div>

            {/* Subtopics Section */}
            {topic.subTopics && Array.isArray(topic.subTopics) && topic.subTopics.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <h2 className="text-2xl font-bold text-foreground">{tl.sections} {topic.name}</h2>
                  <span className="text-sm text-muted-foreground">
                    {(topic.subTopics as any[]).length} {lang === "uk" ? "напрямів" : "tracks"}
                  </span>
                </div>
                <div className="grid gap-3">
                  {(topic.subTopics as any[]).map((raw, idx) => {
                    // sub_topics is a text[]; each entry is either a JSON-encoded
                    // SubTopic object or (legacy) a plain title string.
                    const sub: any = parseSubTopic(raw);
                    const isObj = sub && typeof sub === "object";
                    const title = isObj
                      ? ((lang === "uk" ? sub.titleUk : sub.titleEn) ?? sub.titleUk ?? sub.titleEn)
                      : String(sub ?? "");
                    const desc = isObj ? (lang === "uk" ? sub.descUk : sub.descEn) : "";
                    const url = isObj ? sub.url : undefined;
                    const CardWrapper = url
                      ? ({ children }: { children: React.ReactNode }) => (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="block" data-testid={`link-subtopic-${idx}`}>
                            {children}
                          </a>
                        )
                      : ({ children }: { children: React.ReactNode }) => <>{children}</>;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        data-testid={`subtopic-${idx}`}
                      >
                        <CardWrapper>
                          <div className={cn(
                            "rounded-xl border p-5 transition-all hover:shadow-md hover-elevate active-elevate-2",
                            url && "cursor-pointer",
                            currentTheme.border, currentTheme.bg
                          )}>
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm",
                                currentTheme.text, "bg-background border", currentTheme.border
                              )}>
                                {String(idx + 1).padStart(2, "0")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                                  <h3 className={cn("font-bold text-base leading-snug", currentTheme.text)}>
                                    {title}
                                  </h3>
                                  {url && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                      <ExternalLink className="w-3 h-3" />
                                      {lang === "uk" ? "Деталі" : "Details"}
                                    </span>
                                  )}
                                </div>
                                {desc && (
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {desc}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardWrapper>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
      </motion.div>
    </div>
  );
}
