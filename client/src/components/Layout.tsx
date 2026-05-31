import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User as UserIcon, Menu, X, LogIn, BookOpen, Award, Moon, Sun, ChevronRight, GraduationCap, Users, School, Settings, ArrowRight, MessageSquare, BarChart3, ExternalLink, Search } from "lucide-react";
import { PollWidget } from "@/components/PollWidget";
import { CommandPalette, useCommandPalette } from "@/components/CommandPalette";
import { AIAssistant } from "@/components/AIAssistant";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "@/contexts/theme-context";
import stuLogo from "@assets/new_stu_logo.png";
import facultyLogo from "@assets/faculty_logo_nobg.png";
import kitsLogo from "@assets/kits_logo_nobg.png";
import bannerBg from "@/assets/banner-bg.png";

const academyBanners = [
  { id: 1, name: "Oracle Academy", color: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800", textColor: "text-red-700 dark:text-red-400", letter: "O", accent: "bg-red-600", href: "/topic/oracle", siteUrl: "https://academy.oracle.com" },
  { id: 2, name: "AWS Academy", color: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800", textColor: "text-orange-700 dark:text-orange-400", letter: "A", accent: "bg-orange-500", href: "/topic/amazon", siteUrl: "https://www.awsacademy.com/" },
  { id: 3, name: "Cisco Academy", color: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800", textColor: "text-blue-700 dark:text-blue-400", letter: "C", accent: "bg-blue-600", href: "/topic/cisco", siteUrl: "https://www.netacad.com/" },
];

const subTopics = [
  { id: 1, icon: GraduationCap, labelUk: "Студентам", labelEn: "Students", href: "/students", color: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800", textColor: "text-emerald-700 dark:text-emerald-400", accent: "bg-emerald-600" },
  { id: 2, icon: Users, labelUk: "Абітурієнтам", labelEn: "Applicants", href: "/applicants", color: "bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800", textColor: "text-violet-700 dark:text-violet-400", accent: "bg-violet-600" },
  { id: 3, icon: School, labelUk: "Викладачам", labelEn: "Teachers", href: "/teachers", color: "bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-800", textColor: "text-sky-700 dark:text-sky-400", accent: "bg-sky-600" },
];


export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { open: cmdkOpen, setOpen: setCmdkOpen } = useCommandPalette();

  const navLinks = [
    { name: t.homeNav, path: "/" },
    { name: "Oracle", path: "/topic/oracle", color: "text-oracle" },
    { name: "Amazon", path: "/topic/amazon", color: "text-amazon" },
    { name: "Cisco", path: "/topic/cisco", color: "text-cisco" },
    { name: lang === "uk" ? "Новини" : "News", path: "/news", external: "https://dpu.edu.ua/osvitnii-it-khab" },
    { name: t.leaderboard, path: "/leaderboard", color: "text-primary" },
    { name: lang === "uk" ? "Відгук" : "Feedback", path: "/feedback", color: "text-emerald-600 dark:text-emerald-400" },
    { name: lang === "uk" ? "Аналітика" : "Analytics", path: "/analytics", color: "text-violet-600 dark:text-violet-400" },
    { name: lang === "uk" ? "Проекти здобувачів" : "Student Projects", path: "/projects", color: "text-fuchsia-600 dark:text-fuchsia-400" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-background">

      {/* ════════════════════════════════════════════════════════════════
          FULL-WIDTH VOLUMETRIC HEADER BANNER
      ════════════════════════════════════════════════════════════════ */}
      <div className="w-full relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse at top, #112247 0%, #0a1730 35%, #050b1a 100%)" }}>

        {/* AI-generated background image overlay — clearer */}
        <img src={bannerBg} alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none select-none"
          style={{ filter: "saturate(1.15) brightness(0.95)", objectPosition: "center" }} />
        {/* Soft vignette for overlay text legibility */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(5,11,26,0.45) 0%, rgba(5,11,26,0.20) 50%, rgba(5,11,26,0.45) 100%)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050b1a]/15 via-transparent to-[#050b1a]/40 pointer-events-none" />

        {/* Layered decorative bg */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(147,197,253,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,0.5) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)" }} />
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />

        {/* Soft aurora glows */}
        <div className="absolute -top-20 left-1/4 w-[36rem] h-48 rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute -top-10 right-1/4 w-[28rem] h-40 rounded-full bg-indigo-500/15 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-[32rem] h-36 rounded-full bg-cyan-400/10 blur-[80px] pointer-events-none" />

        {/* Animated top accent — shimmer */}
        <div className="relative w-full h-[3px] overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, #1e40af 15%, #3b82f6 30%, #06b6d4 50%, #6366f1 70%, #1e40af 85%, transparent)" }} />
          <div className="absolute inset-0 animate-[shimmer_4s_linear_infinite]"
            style={{ background: "linear-gradient(90deg, transparent 0%, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%, transparent 100%)", backgroundSize: "200% 100%" }} />
        </div>

        {/* Main content — symmetric flex with equal sides */}
        <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-10 py-14 sm:py-20 flex items-center gap-6 lg:gap-10 relative z-10">

          {/* LEFT: University (ДПУ) */}
          <a href="https://www.dpu.edu.ua/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 group hover:scale-[1.02] transition-transform flex-shrink-0 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-blue-400/30 via-cyan-400/20 to-indigo-500/30 blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl bg-white/[0.08] border border-white/20 backdrop-blur-sm flex items-center justify-center p-2 shadow-2xl">
                <img src={stuLogo} alt="ДПУ" className="w-full h-full object-contain drop-shadow-lg" />
              </div>
            </div>
            <div className="hidden xl:block leading-tight w-[200px] flex-shrink-0">
              <p className="text-[15px] lg:text-base font-bold text-white leading-snug">
                {lang === "uk" ? "Державний податковий університет" : "State Tax University"}
              </p>
            </div>
          </a>

          {/* CENTER: IT-HUB title */}
          <Link href="/" className="flex-1 min-w-0">
            <div className="flex flex-col items-center justify-center cursor-pointer group relative">

              {/* Main title with gradient text */}
              <div className="relative text-center max-w-full">
                <div className="absolute inset-0 -inset-x-16 -inset-y-4 bg-gradient-to-r from-blue-500/0 via-cyan-400/20 to-indigo-500/0 blur-3xl pointer-events-none" />
                <h1 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-wide uppercase whitespace-nowrap leading-none"
                  style={{
                    backgroundImage: "linear-gradient(180deg, #ffffff 0%, #dbeafe 55%, #93c5fd 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 28px rgba(96,165,250,0.45)) drop-shadow(0 4px 8px rgba(0,0,0,0.55))",
                  }}>
                  {lang === "uk" ? "Освітній IT-ХАБ" : "Educational IT-HUB"}
                </h1>
              </div>

            </div>
          </Link>

          {/* RIGHT: Faculty (ФФЦТ) + Department (КІТС) stacked */}
          <div className="flex flex-col gap-2.5 items-end justify-center flex-shrink-0 min-w-0">
            {/* Faculty */}
            <a href="https://www.dpu.edu.ua/index.php/facultet-fin-tsuf" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-2 py-1 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/15 transition-all group">
              <div className="hidden xl:block leading-tight text-right w-[210px] flex-shrink-0">
                <p className="text-[14px] lg:text-[15px] font-bold text-white leading-snug">
                  {lang === "uk" ? "Факультет фінансів та цифрових технологій" : "Faculty of Finance & Digital Technologies"}
                </p>
              </div>
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-500/30 blur-lg group-hover:blur-xl transition-all" />
                <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] lg:w-20 lg:h-20 rounded-full bg-white/[0.08] border border-white/20 backdrop-blur-sm flex items-center justify-center p-1.5 shadow-xl">
                  <img src={facultyLogo} alt="ФФЦТ" className="w-full h-full object-contain drop-shadow-md" />
                </div>
              </div>
            </a>

            {/* Department */}
            <a href="https://www.dpu.edu.ua/kaf-kompnayk-inform" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-2 py-1 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/15 transition-all group">
              <div className="hidden xl:block leading-tight text-right w-[210px] flex-shrink-0">
                <p className="text-[14px] lg:text-[15px] font-bold text-white leading-snug">
                  {lang === "uk" ? "Кафедра комп'ютерних інформаційних технологій і систем" : "Department of Computer Information Technologies & Systems"}
                </p>
              </div>
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 blur-lg group-hover:blur-xl transition-all" />
                <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] lg:w-20 lg:h-20 rounded-full bg-white/[0.08] border border-white/20 backdrop-blur-sm flex items-center justify-center p-1.5 shadow-xl">
                  <img src={kitsLogo} alt="КІТС" className="w-full h-full object-contain drop-shadow-md" />
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* CHIPS BAND — glassmorphism */}
        <div className="w-full border-t border-white/[0.06] relative z-10 backdrop-blur-md"
          style={{ background: "linear-gradient(180deg, rgba(8,15,32,0.4) 0%, rgba(5,11,26,0.7) 100%)" }}>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Audience label */}
            <span className="text-[9px] text-cyan-300/50 uppercase tracking-[0.2em] font-bold mr-1 hidden sm:inline-flex items-center gap-1">
              <span className="w-3 h-px bg-cyan-300/40" />
              {lang === "uk" ? "Для кого" : "For"}
            </span>
            {subTopics.map((s) => {
              const Icon = s.icon;
              return (
                <Link key={s.id} href={s.href}>
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all",
                    "bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)]",
                    "text-blue-100/80 hover:text-white cursor-pointer"
                  )}>
                    <Icon className="w-3 h-3 flex-shrink-0" />
                    <span>{lang === "uk" ? s.labelUk : s.labelEn}</span>
                  </div>
                </Link>
              );
            })}

            {/* Vertical separator */}
            <div className="hidden sm:block h-5 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1" />

            {/* Academy quick links */}
            <span className="text-[9px] text-cyan-300/50 uppercase tracking-[0.2em] font-bold mr-1 hidden md:inline-flex items-center gap-1">
              <span className="w-3 h-px bg-cyan-300/40" />
              {lang === "uk" ? "Офіційні сайти академій" : "Official academy sites"}
            </span>
            {[
              { label: "Oracle Academy", url: "https://academy.oracle.com", dot: "bg-red-500", glow: "hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] hover:border-red-400/50" },
              { label: "AWS Academy", url: "https://www.awsacademy.com/", dot: "bg-orange-400", glow: "hover:shadow-[0_0_12px_rgba(251,146,60,0.3)] hover:border-orange-400/50" },
              { label: "Cisco Academy", url: "https://www.netacad.com/", dot: "bg-blue-400", glow: "hover:shadow-[0_0_12px_rgba(96,165,250,0.3)] hover:border-blue-400/50" },
            ].map(l => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 transition-all",
                  "text-[11px] font-semibold text-blue-100/80 hover:text-white hover:bg-white/[0.08]", l.glow)}>
                <span className={cn("w-1.5 h-1.5 rounded-full shadow-sm", l.dot)} style={{ boxShadow: `0 0 6px currentColor` }} />
                <span>{l.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.6), rgba(34,211,238,0.8), rgba(99,102,241,0.6), transparent)" }} />
      </div>

      {/* Navigation bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 dark:bg-background/90 backdrop-blur-md border-border">
        <div className="max-w-screen-2xl mx-auto px-4 h-12 flex items-center justify-between">

          <nav className="hidden md:flex items-center gap-5">
            {navLinks.map((link) =>
              (link as any).external ? (
                <a key={link.path} href={(link as any).external} target="_blank" rel="noopener noreferrer"
                  className="text-[15px] font-medium transition-colors hover:text-foreground/80 text-muted-foreground">
                  {link.name}
                </a>
              ) : (
                <Link key={link.path} href={link.path}
                  className={cn(
                    "text-[15px] font-medium transition-colors hover:text-foreground/80",
                    location === link.path ? "text-foreground font-semibold" : "text-muted-foreground",
                    link.color && location === link.path ? link.color : ""
                  )}>
                  {link.name}
                </Link>
              )
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3 ml-auto">
            <button
              onClick={() => setCmdkOpen(true)}
              data-testid="button-cmdk-trigger"
              className="hidden lg:inline-flex items-center gap-2 h-8 px-3 rounded-full border border-slate-200 dark:border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label={lang === "uk" ? "Відкрити командну панель" : "Open command palette"}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{lang === "uk" ? "Пошук..." : "Search..."}</span>
              <kbd className="ml-2 hidden xl:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted border border-border">
                <span>⌘</span>K
              </kbd>
            </button>
            <button onClick={toggleTheme} data-testid="button-theme-toggle"
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center rounded-full border border-slate-200 dark:border-border overflow-hidden text-xs font-semibold">
              <button onClick={() => setLang("uk")} data-testid="button-lang-uk"
                className={cn("px-3 py-1 transition-colors", lang === "uk" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground")}>
                UA
              </button>
              <button onClick={() => setLang("en")} data-testid="button-lang-en"
                className={cn("px-3 py-1 transition-colors", lang === "en" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground")}>
                EN
              </button>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer" data-testid="link-profile">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user?.profileImageUrl || ""} />
                      <AvatarFallback>{user?.username?.charAt(0) || <UserIcon className="w-3 h-3" />}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">{user?.username}</span>
                    <Settings className="w-3 h-3 text-muted-foreground" />
                  </div>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()}
                  className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                  <LogOut className="w-4 h-4" /> {t.logout}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" data-testid="button-login">
                    <LogIn className="w-4 h-4" /> {t.login}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" data-testid="button-register">{t.register}</Button>
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2 text-foreground ml-auto" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b z-40">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={toggleTheme}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  {theme === "dark" ? (lang === "uk" ? "Світлий" : "Light") : (lang === "uk" ? "Нічний" : "Dark")}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{lang === "uk" ? "Мова" : "Language"}:</span>
                  <button onClick={() => setLang("uk")} className={cn("px-2 py-0.5 rounded text-xs font-semibold border", lang === "uk" ? "bg-primary text-primary-foreground border-primary" : "border-slate-300")}>UA</button>
                  <button onClick={() => setLang("en")} className={cn("px-2 py-0.5 rounded text-xs font-semibold border", lang === "en" ? "bg-primary text-primary-foreground border-primary" : "border-slate-300")}>EN</button>
                </div>
              </div>
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path} onClick={() => setMobileMenuOpen(false)}
                  className={cn("text-lg font-medium py-2", location === link.path ? "text-foreground" : "text-muted-foreground")}>
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || ""} />
                        <AvatarFallback>{user?.username?.charAt(0) || <UserIcon />}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user?.username}</span>
                    </div>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> {t.logout}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full" data-testid="button-login-mobile">{t.login}</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full font-bold" data-testid="button-register-mobile">{t.register}</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-Column Layout */}
      <div className="flex flex-1 w-full max-w-screen-2xl mx-auto px-2 gap-4 py-6">

        {/* LEFT SIDEBAR */}
        <aside className="hidden xl:flex flex-col gap-4 w-52 flex-shrink-0">
          <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-3">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.academyBanners}</h3>
            </div>
            <div className="flex flex-col gap-2">
              {academyBanners.map((b) => (
                <Link key={b.id} href={b.href}
                  className={cn("rounded-lg border p-3 flex items-center gap-2.5 hover:shadow-md transition-all hover:scale-[1.02] active:scale-100", b.color)}>
                  <div className={cn("w-9 h-9 rounded-md flex items-center justify-center text-white font-bold text-base flex-shrink-0", b.accent)}>{b.letter}</div>
                  <span className={cn("text-[13px] font-semibold leading-tight", b.textColor)}>{b.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Sub-topics Widget */}
          <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-3">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {lang === "uk" ? "Розділи" : "Sections"}
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {subTopics.map((s) => {
                const Icon = s.icon;
                return (
                  <Link key={s.id} href={s.href} className={cn("rounded-lg border p-3 flex items-center gap-2 hover:shadow-md transition-all hover:scale-[1.02] active:scale-100", s.color)}>
                    <div className={cn("w-8 h-8 rounded-md flex items-center justify-center text-white flex-shrink-0", s.accent)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={cn("text-xs font-semibold leading-tight", s.textColor)}>
                      {lang === "uk" ? s.labelUk : s.labelEn}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0">
          <motion.div key={location} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
            {children}
          </motion.div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:flex flex-col gap-4 w-52 flex-shrink-0">

          {/* News Widget */}
          <div className="rounded-xl border bg-card shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-foreground">
                  {lang === "uk" ? "Новини" : "News"}
                </h3>
              </div>
              <Link href="/news" className="text-[11px] font-bold uppercase tracking-wider text-primary hover:underline" data-testid="link-news-all-sidebar">
                {lang === "uk" ? "Усі" : "All"}
              </Link>
            </div>
            <ul className="space-y-2.5">
              {[
                {
                  href: "https://www.dpu.edu.ua/osvitnii-it-khab",
                  title: lang === "uk" ? "Освітній IT-ХАБ ДПУ — офіційна сторінка" : "Educational IT-HUB STU — official page",
                  meta: "dpu.edu.ua",
                  tone: "bg-blue-500",
                },
                {
                  href: "https://www.dpu.edu.ua/osvitnii-it-khab?view=article&id=11433:studenty-hrupy-kb-23-1-tsdb-23-1-otrymaly-sertyfikaty-kursu-introduction-to-network-vstup-do-merezh-vid-mizhnarodnoi-osvitnoi-prohramy-sisco-netwoking-academy&catid=265",
                  title: lang === "uk"
                    ? "Студенти груп КБ-23-1 та ЦСДБ-23-1 отримали сертифікати курсу «Introduction to Networks» від Cisco Networking Academy"
                    : "Students of groups CS-23-1 and DSDB-23-1 received Cisco Networking Academy «Introduction to Networks» certificates",
                  meta: "dpu.edu.ua",
                  tone: "bg-cyan-500",
                },
                {
                  href: "https://www.dpu.edu.ua/osvitnii-it-khab?view=article&id=10748:derzhavnyi-podatkovyi-universytet-vziav-uchast-u-dni-oracle-academy-v-ukraini-i-doluchyvsia-do-konsortsiumu-ievropeiskykh-universytetiv-u-podanni-proektu-za-prohramoiu-erasmus&catid=265",
                  title: lang === "uk"
                    ? "ДПУ взяв участь у Дні Oracle Academy в Україні та долучився до консорціуму європейських університетів за програмою Erasmus"
                    : "STU took part in Oracle Academy Day in Ukraine and joined a consortium of European universities under the Erasmus programme",
                  meta: "dpu.edu.ua",
                  tone: "bg-red-500",
                },
                {
                  href: "https://www.dpu.edu.ua/osvitnii-it-khab?view=article&id=10516:vykladach-kafedry-kompiuternykh-ta-informatsiinykh-tekhnolohii-i-system-pryiniav-uchast-u-mizhnarodnomu-it-forumi-navkolo-khmary-navkolo-danykh-navkolo-iot-navkolo-bezpeky-navkolo-kabeliu-navkolo-ip-smart-building&catid=265",
                  title: lang === "uk"
                    ? "Викладач кафедри КІТіС взяв участь у міжнародному IT-форумі «Навколо хмари, даних, IoT, безпеки, кабелю, IP, Smart Building»"
                    : "DCITS faculty member took part in the international IT forum «Around Cloud, Data, IoT, Security, Cable, IP, Smart Building»",
                  meta: "dpu.edu.ua",
                  tone: "bg-emerald-500",
                },
              ].map((n, i) => (
                <li key={i}>
                  <a href={n.href} target="_blank" rel="noopener noreferrer"
                    className="block group rounded-lg p-2 -mx-2 hover:bg-accent/60 transition-colors"
                    data-testid={`link-news-sidebar-${i}`}>
                    <div className="flex items-start gap-2">
                      <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", n.tone)} />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium leading-snug text-foreground group-hover:text-primary line-clamp-2">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{n.meta}</p>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Poll Widget */}
          <PollWidget />

          {/* IT-HUB widget */}
          <Link href="/hub">
            <div className="relative overflow-hidden rounded-xl shadow-lg border border-white/10 p-4 text-center cursor-pointer group hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #060f1e 0%, #0d2040 50%, #060f1e 100%)" }}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <img src={stuLogo} alt="ДПУ" className="w-7 h-7 object-contain rounded-full bg-white/10 p-0.5" />
                  <img src={facultyLogo} alt="Факультет" className="w-7 h-7 object-contain rounded-full bg-white/10 p-0.5" />
                  <img src={kitsLogo} alt="КІТС" className="w-7 h-7 object-contain rounded-full bg-white/10 p-0.5" />
                </div>
                <p className="text-base font-extrabold text-white tracking-widest leading-tight">IT-HUB</p>
                <p className="text-[10px] text-blue-300 mt-1 uppercase tracking-wide">
                  {lang === "uk" ? "Освітній портал" : "Educational portal"}
                </p>
                <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-white/60 group-hover:text-white/90 transition-colors">
                  <span>{lang === "uk" ? "Дізнатись більше" : "Learn more"}</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </Link>
        </aside>
      </div>

      {/* Command palette + AI assistant */}
      <CommandPalette open={cmdkOpen} onOpenChange={setCmdkOpen} />
      <AIAssistant />

      {/* Footer */}
      <footer className="border-t py-6 bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>{t.footerRights}</p>
          <p className="text-xs mt-1 text-muted-foreground/70">{t.footerShort}</p>
        </div>
      </footer>
    </div>
  );
}
