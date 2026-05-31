import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Bot, X, Send, Sparkles, MessageCircle, ChevronRight, Lightbulb, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "bot"; text: string; suggestions?: { label: string; action: () => void }[]; ts: number };

type Recommendation = {
  topicSlug: string;
  titleUk: string; titleEn: string;
  reasonUk: string; reasonEn: string;
  priority: number;
};

type Topic = { id: number; slug: string; name: string; description: string };

type LeaderboardItem = {
  id: number; firstName: string | null; lastName: string | null;
  username: string; completedTopics?: number;
};

export function AIAssistant() {
  const { lang } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel any pending bot reply on unmount or when panel closes
  useEffect(() => {
    return () => {
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    };
  }, []);
  useEffect(() => {
    if (!open && pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
      setThinking(false);
    }
  }, [open]);

  const { data: recs = [] } = useQuery<Recommendation[]>({
    queryKey: ["/api/users/me/recommendations"],
    enabled: isAuthenticated && open,
  });
  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
    enabled: open,
  });
  const { data: leaderboard = [] } = useQuery<LeaderboardItem[]>({
    queryKey: ["/api/users/leaderboard"],
    enabled: open,
  });

  const t = lang === "uk" ? {
    title: "AI-помічник",
    subtitle: "Питайте про навчання",
    placeholder: "Напишіть питання...",
    welcome: `Вітаю${user?.firstName ? ", " + user.firstName : ""}! Я допоможу вам зорієнтуватись в IT-Хабі. Що цікавить?`,
    quickActions: "Швидкі дії",
    send: "Надіслати",
    thinking: "Думаю...",
    menu: "Меню",
    menuTitle: "Повернутись до меню категорій",
    close: "Закрити",
    quick: [
      { label: "📚 Як почати навчання на курсах Академій?", q: "як почати навчання" },
      { label: "🏆 Як отримати сертифікат?", q: "сертифікат" },
      { label: "🎯 Покажи мій прогрес", q: "прогрес" },
      { label: "📊 Хто лідер?", q: "лідер" },
      { label: "💡 Як зареєструватись?", q: "реєстрація" },
      { label: "🤝 Як зв'язатись?", q: "контакт" },
    ],
  } : {
    title: "AI Assistant",
    subtitle: "Ask about studying",
    placeholder: "Type your question...",
    welcome: `Hi${user?.firstName ? ", " + user.firstName : ""}! I'll help you navigate the IT-Hub. What interests you?`,
    quickActions: "Quick actions",
    send: "Send",
    thinking: "Thinking...",
    menu: "Menu",
    menuTitle: "Back to category menu",
    close: "Close",
    quick: [
      { label: "📚 How to start learning at the Academies?", q: "how to start learning" },
      { label: "🏆 How to get certificate?", q: "certificate" },
      { label: "🎯 Show my progress", q: "progress" },
      { label: "📊 Who is leading?", q: "leader" },
      { label: "💡 How to register?", q: "register" },
      { label: "🤝 How to contact?", q: "contact" },
    ],
  };

  // Initialize welcome msg
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "bot", text: t.welcome, ts: Date.now() }]);
    }
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const respond = (q: string): Msg => {
    const text = q.toLowerCase();
    const ts = Date.now();
    const go = (path: string) => () => { setLocation(path); setOpen(false); };

    // Recommendations / what to learn
    if (/(вивч|що мені|почати|почат|навч|recommend|learn|start|study)/i.test(text)) {
      if (!isAuthenticated) {
        return {
          role: "bot", ts,
          text: lang === "uk"
            ? "Щоб отримати персональні рекомендації — увійдіть в обліковий запис. А поки що рекомендую почати з Cisco IT Essentials або Oracle Database Foundations — вони найкраще підходять для початківців."
            : "Sign in to get personal recommendations. Meanwhile, I'd suggest starting with Cisco IT Essentials or Oracle Database Foundations — they're great for beginners.",
          suggestions: [
            { label: lang === "uk" ? "🚀 Зареєструватись" : "🚀 Register", action: go("/register") },
            { label: "Cisco Academy", action: go("/topic/cisco") },
          ],
        };
      }
      if (recs.length === 0) {
        return {
          role: "bot", ts,
          text: lang === "uk"
            ? "Чудово, ви вже все пройшли! 🎉 Спробуйте поглибити знання — пройдіть квізи знову, перевірте, що змінилось."
            : "Great, you've completed everything! 🎉 Try deepening your knowledge — retake quizzes to see what's new.",
          suggestions: [{ label: lang === "uk" ? "🏆 Таблиця лідерів" : "🏆 Leaderboard", action: go("/leaderboard") }],
        };
      }
      const top = recs[0];
      return {
        role: "bot", ts,
        text: lang === "uk"
          ? `Рекомендую почати з **${top.titleUk}**. ${top.reasonUk}.`
          : `I recommend starting with **${top.titleEn}**. ${top.reasonEn}.`,
        suggestions: recs.slice(0, 3).map(r => ({
          label: lang === "uk" ? r.titleUk : r.titleEn,
          action: go(`/topic/${r.topicSlug}`),
        })),
      };
    }

    // Certificate
    if (/(сертифікат|certificate|cert|диплом)/i.test(text)) {
      return {
        role: "bot", ts,
        text: lang === "uk"
          ? "Сертифікати безкоштовні та видаються офіційно: **Cisco NetAcad**, **Oracle Academy** і **AWS Academy**. Щоб отримати: оберіть курс → пройдіть матеріали → складіть фінальний іспит на платформі академії. Інструктори КІТС вас підтримають."
          : "Certificates are free and officially issued by: **Cisco NetAcad**, **Oracle Academy**, and **AWS Academy**. To get one: pick a course → complete materials → pass the final exam on the academy's platform. KITiS instructors will support you.",
        suggestions: [
          { label: "Cisco", action: go("/topic/cisco") },
          { label: "Oracle", action: go("/topic/oracle") },
          { label: "AWS", action: go("/topic/amazon") },
        ],
      };
    }

    // Progress
    if (/(прогрес|progress|статус|status|мій|my)/i.test(text)) {
      if (!isAuthenticated) {
        return {
          role: "bot", ts,
          text: lang === "uk" ? "Спочатку потрібно увійти в обліковий запис." : "You need to sign in first.",
          suggestions: [{ label: lang === "uk" ? "Увійти" : "Sign in", action: go("/login") }],
        };
      }
      return {
        role: "bot", ts,
        text: lang === "uk"
          ? "Ваш повний прогрес, досягнення та карта активності — у профілі. Там же видно рекомендації від мене 🤖"
          : "Your full progress, achievements, and activity heatmap are in your profile. You'll also see my recommendations there 🤖",
        suggestions: [{ label: lang === "uk" ? "👤 Відкрити профіль" : "👤 Open profile", action: go("/profile") }],
      };
    }

    // Leader
    if (/(лідер|leader|топ|top|рейтинг|rank)/i.test(text)) {
      const top = leaderboard.slice().sort((a, b) => (b.completedTopics || 0) - (a.completedTopics || 0))[0];
      const name = top ? `${top.firstName || ""} ${top.lastName || ""}`.trim() || top.username : null;
      return {
        role: "bot", ts,
        text: name
          ? (lang === "uk"
              ? `Зараз лідирує **${name}** з ${top!.completedTopics || 0} пройденими темами. Дивіться повну таблицю — є шанс обігнати!`
              : `Currently **${name}** is leading with ${top!.completedTopics || 0} completed topics. Check the full leaderboard — there's a chance to overtake!`)
          : (lang === "uk" ? "Поки що рейтинг порожній — будь першим!" : "Leaderboard is empty — be the first!"),
        suggestions: [{ label: lang === "uk" ? "🏆 Дивитись таблицю" : "🏆 View leaderboard", action: go("/leaderboard") }],
      };
    }

    // Register
    if (/(реєстр|регистр|register|sign\s*up|signup|join|долучи)/i.test(text)) {
      return {
        role: "bot", ts,
        text: lang === "uk"
          ? "Реєстрація безкоштовна і займає менше хвилини. Потрібен лише email і базові дані про вас (курс, спеціальність)."
          : "Registration is free and takes less than a minute. You only need an email and basic info (course, specialty).",
        suggestions: [{ label: lang === "uk" ? "🚀 Зареєструватись" : "🚀 Register", action: go("/register") }],
      };
    }

    // Contact / feedback
    if (/(контакт|contact|зв'?яз|зворотн|відгук|feedback|питан|question|допомог|help|support)/i.test(text)) {
      return {
        role: "bot", ts,
        text: lang === "uk"
          ? "Залиште питання чи відгук на сторінці зворотного зв'язку — викладачі КІТС читають кожне повідомлення."
          : "Leave your question or feedback on the feedback page — KITiS instructors read every message.",
        suggestions: [{ label: lang === "uk" ? "💬 Залишити відгук" : "💬 Submit feedback", action: go("/feedback") }],
      };
    }

    // Topics specific
    if (/oracle/i.test(text)) {
      return { role: "bot", ts, text: lang === "uk" ? "Oracle Academy — це бази даних, SQL, APEX, Java і Cloud. Підходить тим, хто хоче працювати з backend та аналітикою." : "Oracle Academy covers databases, SQL, APEX, Java and Cloud. Great for backend and analytics.", suggestions: [{ label: "Oracle Academy", action: go("/topic/oracle") }] };
    }
    if (/aws|amazon/i.test(text)) {
      return { role: "bot", ts, text: lang === "uk" ? "AWS Academy — хмарні технології Amazon. Cloud Practitioner — найкращий старт для всіх, хто хоче в Cloud." : "AWS Academy is Amazon's cloud track. Cloud Practitioner is the best start for everyone going into Cloud.", suggestions: [{ label: "AWS Academy", action: go("/topic/amazon") }] };
    }
    if (/cisco|мережа|network|кібер|cyber|безпек|security/i.test(text)) {
      return { role: "bot", ts, text: lang === "uk" ? "Cisco Academy — мережі, кібербезпека, IT Essentials. Найпопулярніша академія для початківців у IT." : "Cisco Academy: networking, cybersecurity, IT Essentials. The most popular academy for IT beginners.", suggestions: [{ label: "Cisco Academy", action: go("/topic/cisco") }] };
    }

    if (/проект|project|здобув/i.test(text)) {
      return { role: "bot", ts, text: lang === "uk" ? "У нас є реальні дипломні проекти від випускників — переходьте і дивіться, що створили інші студенти КІТС." : "We have real graduation projects from alumni — see what other KITiS students built.", suggestions: [{ label: lang === "uk" ? "🚀 Проекти здобувачів" : "🚀 Student Projects", action: go("/projects") }] };
    }

    // Fallback
    return {
      role: "bot", ts,
      text: lang === "uk"
        ? "Гарне питання! Я ще навчаюсь, але можу допомогти з: рекомендаціями курсів, інформацією про сертифікати, навігацією по сайту або статистикою. Спробуйте натиснути швидку дію нижче 👇"
        : "Good question! I'm still learning, but I can help with: course recommendations, certificate info, site navigation, or statistics. Try a quick action below 👇",
    };
  };

  const send = useCallback((q: string) => {
    if (!q.trim()) return;
    if (thinking || pendingTimerRef.current) return; // re-entrancy guard
    const userMsg: Msg = { role: "user", text: q, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    pendingTimerRef.current = setTimeout(() => {
      const reply = respond(q);
      setMessages((m) => [...m, reply]);
      setThinking(false);
      pendingTimerRef.current = null;
    }, 500 + Math.random() * 400);
  }, [thinking, isAuthenticated, recs, leaderboard, lang]);

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white shadow-xl shadow-violet-500/30 flex items-center justify-center group"
            data-testid="button-ai-toggle"
            aria-label={lang === "uk" ? "Відкрити AI-помічника" : "Open AI assistant"}
          >
            <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-foreground text-background whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 h-[600px] max-h-[calc(100vh-2.5rem)] rounded-2xl bg-background border border-border shadow-2xl flex flex-col overflow-hidden"
            data-testid="ai-panel"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white p-4 shrink-0">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm flex items-center gap-1.5">
                      {t.title}
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    </div>
                    <div className="text-[11px] text-white/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      {t.subtitle}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (pendingTimerRef.current) {
                        clearTimeout(pendingTimerRef.current);
                        pendingTimerRef.current = null;
                      }
                      setThinking(false);
                      setMessages([{ role: "bot", text: t.welcome, ts: Date.now() }]);
                    }}
                    className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-bold transition-colors"
                    data-testid="button-ai-menu"
                    aria-label={t.menuTitle}
                    title={t.menuTitle}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.menu}</span>
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                    data-testid="button-ai-close"
                    aria-label={lang === "uk" ? "Закрити AI-помічника" : "Close AI assistant"}
                    title={t.close}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}
                  data-testid={`ai-msg-${m.role}-${i}`}
                >
                  {m.role === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={cn("max-w-[80%]")}>
                    <div className={cn(
                      "rounded-2xl px-3 py-2 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm"
                    )}>
                      {formatText(m.text)}
                    </div>
                    {m.suggestions && m.suggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.suggestions.map((s, si) => (
                          <button
                            key={si}
                            onClick={s.action}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900 hover:bg-violet-200 dark:hover:bg-violet-900/60 transition-colors"
                            data-testid={`ai-suggestion-${i}-${si}`}
                          >
                            {s.label}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {thinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}

              {/* Quick actions */}
              {messages.length <= 1 && !thinking && (
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">
                    <Lightbulb className="w-3 h-3" />
                    {t.quickActions}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {t.quick.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => send(q.q)}
                        className="text-left text-[11px] font-medium px-2.5 py-2 rounded-lg bg-card border border-border hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all"
                        data-testid={`ai-quick-${i}`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-background shrink-0">
              <form
                onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex items-center gap-2"
              >
                <div className="flex-1 relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                    data-testid="input-ai"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || thinking}
                  className="bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
                  data-testid="button-ai-send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function formatText(text: string) {
  // Convert **bold** to <strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} className="font-bold">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}
