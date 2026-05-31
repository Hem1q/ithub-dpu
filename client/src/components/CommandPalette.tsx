import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/theme-context";
import {
  Home, BookOpen, Trophy, MessageSquare, BarChart3, Rocket,
  GraduationCap, Users, UserCog, LogIn, LogOut, UserPlus, Sun, Moon,
  Languages, ExternalLink, Sparkles, FileText, Search,
} from "lucide-react";

export function CommandPalette({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [, setLocation] = useLocation();
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();

  const t = lang === "uk" ? {
    placeholder: "Введіть команду або шукайте...",
    nav: "Навігація",
    academies: "Академії",
    actions: "Дії",
    settings: "Налаштування",
    external: "Зовнішні ресурси",
    empty: "Нічого не знайдено",
    home: "Головна", lb: "Таблиця лідерів", fb: "Залишити відгук",
    an: "Аналітика", proj: "Проекти здобувачів", st: "Студентам",
    ap: "Абітурієнтам", tch: "Викладачам", profile: "Мій профіль",
    admin: "Адмін-панель", login: "Увійти", reg: "Реєстрація", logout: "Вийти",
    theme: theme === "dark" ? "Перейти у світлий режим" : "Перейти у нічний режим",
    langSwitch: "Переключити на English", lang: "Мова",
    site: "Сайт ДПУ", news: "Новини хабу",
  } : {
    placeholder: "Type a command or search...",
    nav: "Navigation", academies: "Academies", actions: "Actions",
    settings: "Settings", external: "External resources",
    empty: "Nothing found",
    home: "Home", lb: "Leaderboard", fb: "Submit feedback",
    an: "Analytics", proj: "Student Projects", st: "For Students",
    ap: "For Applicants", tch: "For Teachers", profile: "My profile",
    admin: "Admin panel", login: "Sign in", reg: "Sign up", logout: "Sign out",
    theme: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
    langSwitch: "Switch to Українська", lang: "Language",
    site: "DPU website", news: "Hub news",
  };

  const go = (path: string) => { setLocation(path); onOpenChange(false); };
  const ext = (url: string) => { window.open(url, "_blank", "noopener,noreferrer"); onOpenChange(false); };
  const run = (fn: () => void) => { fn(); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 max-w-2xl">
        <DialogTitle className="sr-only">
          {lang === "uk" ? "Командна панель" : "Command palette"}
        </DialogTitle>
        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-muted-foreground">
          <CommandInput placeholder={t.placeholder} data-testid="input-cmdk" />
          <CommandList className="max-h-[60vh]">
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                <Search className="w-8 h-8 opacity-30" />
                <span className="text-sm">{t.empty}</span>
              </div>
            </CommandEmpty>

            <CommandGroup heading={t.nav}>
              <CommandItem onSelect={() => go("/")} data-testid="cmd-home">
                <Home className="mr-2 w-4 h-4" /><span>{t.home}</span>
                <CommandShortcut>G H</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => go("/leaderboard")} data-testid="cmd-leaderboard">
                <Trophy className="mr-2 w-4 h-4 text-amber-500" /><span>{t.lb}</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/feedback")} data-testid="cmd-feedback">
                <MessageSquare className="mr-2 w-4 h-4 text-emerald-500" /><span>{t.fb}</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/analytics")} data-testid="cmd-analytics">
                <BarChart3 className="mr-2 w-4 h-4 text-violet-500" /><span>{t.an}</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/projects")} data-testid="cmd-projects">
                <Rocket className="mr-2 w-4 h-4 text-fuchsia-500" /><span>{t.proj}</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading={t.academies}>
              <CommandItem onSelect={() => go("/topic/oracle")} data-testid="cmd-oracle">
                <BookOpen className="mr-2 w-4 h-4 text-red-500" /><span>Oracle Academy</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/topic/amazon")} data-testid="cmd-amazon">
                <BookOpen className="mr-2 w-4 h-4 text-orange-500" /><span>AWS Academy</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/topic/cisco")} data-testid="cmd-cisco">
                <BookOpen className="mr-2 w-4 h-4 text-blue-500" /><span>Cisco Academy</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading={t.actions}>
              <CommandItem onSelect={() => go("/students")} data-testid="cmd-students">
                <GraduationCap className="mr-2 w-4 h-4 text-emerald-500" /><span>{t.st}</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/applicants")} data-testid="cmd-applicants">
                <Users className="mr-2 w-4 h-4 text-violet-500" /><span>{t.ap}</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/teachers")} data-testid="cmd-teachers">
                <UserCog className="mr-2 w-4 h-4 text-sky-500" /><span>{t.tch}</span>
              </CommandItem>
              {isAuthenticated && (
                <CommandItem onSelect={() => go("/profile")} data-testid="cmd-profile">
                  <Sparkles className="mr-2 w-4 h-4 text-amber-500" /><span>{t.profile}</span>
                </CommandItem>
              )}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading={t.settings}>
              <CommandItem onSelect={() => run(toggleTheme)} data-testid="cmd-theme">
                {theme === "dark" ? <Sun className="mr-2 w-4 h-4" /> : <Moon className="mr-2 w-4 h-4" />}
                <span>{t.theme}</span>
              </CommandItem>
              <CommandItem onSelect={() => run(() => setLang(lang === "uk" ? "en" : "uk"))} data-testid="cmd-lang">
                <Languages className="mr-2 w-4 h-4" /><span>{t.langSwitch}</span>
              </CommandItem>
              {isAuthenticated ? (
                <CommandItem onSelect={() => run(() => logout())} data-testid="cmd-logout">
                  <LogOut className="mr-2 w-4 h-4 text-rose-500" /><span>{t.logout}</span>
                </CommandItem>
              ) : (
                <>
                  <CommandItem onSelect={() => go("/login")} data-testid="cmd-login">
                    <LogIn className="mr-2 w-4 h-4" /><span>{t.login}</span>
                  </CommandItem>
                  <CommandItem onSelect={() => go("/register")} data-testid="cmd-register">
                    <UserPlus className="mr-2 w-4 h-4" /><span>{t.reg}</span>
                  </CommandItem>
                </>
              )}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading={t.external}>
              <CommandItem onSelect={() => ext("https://dpu.edu.ua")} data-testid="cmd-dpu">
                <ExternalLink className="mr-2 w-4 h-4" /><span>{t.site}</span>
              </CommandItem>
              <CommandItem onSelect={() => ext("https://dpu.edu.ua/osvitnii-it-khab")} data-testid="cmd-news">
                <FileText className="mr-2 w-4 h-4" /><span>{t.news}</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isK = e.key === "k" || e.key === "K" || e.code === "KeyK";
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setOpen((o) => !o);
      }
    };
    // Capture phase + both window and document to win the race against
    // browser shortcuts (Chrome's Ctrl+K opens the address bar otherwise)
    window.addEventListener("keydown", handler, { capture: true });
    document.addEventListener("keydown", handler, { capture: true });
    return () => {
      window.removeEventListener("keydown", handler, { capture: true } as any);
      document.removeEventListener("keydown", handler, { capture: true } as any);
    };
  }, []);
  return { open, setOpen };
}
