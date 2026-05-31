import { TopicCard } from "@/components/TopicCard";
import { StatCounter } from "@/components/StatCounter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Topic } from "@shared/schema";
import { useLanguage, topicTranslations } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import {
  CheckCircle2,
  Circle,
  GraduationCap,
  UserPlus,
  Users,
  Sparkles,
  ShieldCheck,
  Globe,
  Cloud,
  Award,
  Clock,
  BookOpen,
  Compass,
  Trophy,
  Crown,
  Medal,
  Vote,
  Rocket,
  ChevronRight,
  MessageSquare,
  Building2,
  Network,
  Database,
  Zap,
  HelpCircle,
  CalendarDays,
  Calendar,
  Video,
  AlarmClock,
  School,
  MapPin,
} from "lucide-react";
import { SiCisco, SiOracle, SiAmazon } from "react-icons/si";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface OverviewStats {
  totalUsers: number;
  totalTopics: number;
  totalCompleted: number;
  totalPollResponses: number;
  totalFeedbacks: number;
}

interface LeaderboardUser {
  id: number;
  username: string;
  fullName?: string | null;
  completedTopics: number;
}

interface PollOption {
  option: number;
  count: number;
}

interface PollData {
  id: number;
  questionUk: string;
  questionEn: string;
  optionsUk: string[];
  optionsEn: string[];
  isActive: boolean;
  userResponse: number | null;
  results: PollOption[];
}

async function fetchTopics(): Promise<Topic[]> {
  const response = await fetch("/api/topics");
  if (!response.ok) throw new Error("Failed to fetch topics");
  return response.json();
}

async function fetchProgress() {
  const response = await fetch("/api/progress");
  if (!response.ok) return [];
  return response.json();
}

export default function Home() {
  const { t, lang } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [pendingPollOption, setPendingPollOption] = useState<number | null>(null);

  const { data: topicsData = [] } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
    queryFn: fetchTopics,
  });

  const { data: progressData = [] } = useQuery<{ topicSlug: string; completedAt: string | null }[]>({
    queryKey: ["/api/progress"],
    queryFn: fetchProgress,
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery<OverviewStats>({
    queryKey: ["/api/stats/overview"],
  });

  const { data: leaderboard = [] } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/users/leaderboard"],
  });

  const { data: polls = [] } = useQuery<PollData[]>({
    queryKey: ["/api/polls"],
  });

  const completedSlugs = progressData.filter((p) => p.completedAt).map((p) => p.topicSlug);
  const completedCount = completedSlugs.length;
  const totalTopics = topicsData.length;
  const progressPct =
    totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const totalSubModules = topicsData.reduce(
    (sum, t) => sum + (Array.isArray(t.subTopics) ? t.subTopics.length : 0),
    0,
  );

  const activePoll = polls.find((p) => p.isActive) ?? null;
  const pollResults = activePoll?.results ?? [];
  const pollTotal = pollResults.reduce((s, r) => s + r.count, 0);
  const topFive = [...leaderboard]
    .sort((a, b) => b.completedTopics - a.completedTopics)
    .slice(0, 5);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const getTopicTranslation = (slug: string) => topicTranslations[lang][slug] ?? null;

  const handlePollVote = async (optionIndex: number) => {
    if (!activePoll) return;
    if (!isAuthenticated) {
      toast({
        title: lang === "uk" ? "Потрібно увійти" : "Login required",
        description:
          lang === "uk"
            ? "Авторизуйтесь, щоб взяти участь в опитуванні."
            : "Please log in to participate in the poll.",
      });
      return;
    }
    try {
      setPendingPollOption(optionIndex);
      await apiRequest("POST", `/api/polls/${activePoll.id}/respond`, {
        selectedOption: optionIndex,
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: lang === "uk" ? "Дякуємо!" : "Thanks!",
        description:
          lang === "uk" ? "Ваш голос враховано." : "Your response has been recorded.",
      });
    } catch (e: any) {
      toast({
        title: lang === "uk" ? "Помилка" : "Error",
        description: e?.message ?? "Failed to submit",
        variant: "destructive",
      });
    } finally {
      setPendingPollOption(null);
    }
  };

  const audiences = [
    {
      href: "/students",
      icon: GraduationCap,
      title: lang === "uk" ? "Студентам" : "For Students",
      desc:
        lang === "uk"
          ? "Безкоштовний доступ до 30+ модулів Cisco, Oracle та AWS."
          : "Free access to 30+ Cisco, Oracle and AWS modules.",
      stat: lang === "uk" ? "30+ модулів" : "30+ modules",
      tone: "from-emerald-500 to-teal-600",
      ring: "ring-emerald-500/30",
      tag: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
      testId: "card-audience-students",
    },
    {
      href: "/applicants",
      icon: UserPlus,
      title: lang === "uk" ? "Абітурієнтам" : "For Applicants",
      desc:
        lang === "uk"
          ? "5 ІТ-спеціальностей та сертифікати міжнародних академій."
          : "5 IT specialties and international academy certificates.",
      stat: lang === "uk" ? "5 спеціальностей" : "5 specialties",
      tone: "from-violet-500 to-fuchsia-600",
      ring: "ring-violet-500/30",
      tag: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
      testId: "card-audience-applicants",
    },
    {
      href: "/teachers",
      icon: Users,
      title: lang === "uk" ? "Викладачам" : "For Teachers",
      desc:
        lang === "uk"
          ? "Інтеграція курсів академій у навчальні дисципліни кафедри."
          : "Integration of academy courses into department disciplines.",
      stat: lang === "uk" ? "9 інтеграцій" : "9 integrations",
      tone: "from-sky-500 to-indigo-600",
      ring: "ring-sky-500/30",
      tag: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
      testId: "card-audience-teachers",
    },
  ];

  const benefits = [
    {
      icon: ShieldCheck,
      title: lang === "uk" ? "100% безкоштовно" : "100% Free",
      desc:
        lang === "uk"
          ? "Всі курси доступні студентам ДПУ без оплат і прихованих умов."
          : "All courses are free for STU students with no hidden costs.",
      tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
    {
      icon: Award,
      title: lang === "uk" ? "Міжнар. сертифікати" : "Intl. Certificates",
      desc:
        lang === "uk"
          ? "Здобувайте сертифікати, які визнаються у всьому світі."
          : "Earn globally recognized certificates from leading vendors.",
      tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    },
    {
      icon: Network,
      title: "Cisco · Oracle · AWS",
      desc:
        lang === "uk"
          ? "Програми трьох провідних ІТ-корпорацій світу під одним дахом."
          : "Programs from three leading global IT corporations under one roof.",
      tone: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
    },
    {
      icon: Globe,
      title: lang === "uk" ? "Дві мови" : "Two languages",
      desc:
        lang === "uk"
          ? "Контент і сертифікаційні іспити доступні українською й англійською."
          : "Content and certification exams available in Ukrainian and English.",
      tone: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
    },
    {
      icon: Clock,
      title: lang === "uk" ? "Доступ 24/7" : "24/7 Access",
      desc:
        lang === "uk"
          ? "Навчайтесь у власному темпі: матеріали відкриті цілодобово."
          : "Learn at your own pace — materials are open around the clock.",
      tone: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    },
    {
      icon: Cloud,
      title: lang === "uk" ? "Хмарні лабораторії" : "Cloud Labs",
      desc:
        lang === "uk"
          ? "Реальна практика на платформах Cisco Packet Tracer, AWS Skill Builder, Oracle LiveLabs."
          : "Real practice on Cisco Packet Tracer, AWS Skill Builder, Oracle LiveLabs.",
      tone: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
    },
  ];

  const steps = [
    {
      icon: UserPlus,
      title: lang === "uk" ? "Реєстрація" : "Register",
      desc: lang === "uk" ? "Створіть акаунт за 1 хвилину." : "Create your account in 1 minute.",
    },
    {
      icon: Compass,
      title: lang === "uk" ? "Виберіть напрям" : "Choose a track",
      desc:
        lang === "uk"
          ? "Cisco, Oracle або AWS — на ваш вибір."
          : "Cisco, Oracle or AWS — your choice.",
    },
    {
      icon: BookOpen,
      title: lang === "uk" ? "Пройдіть модулі" : "Complete modules",
      desc: lang === "uk" ? "Теорія + хмарні лабораторії." : "Theory + cloud labs.",
    },
    {
      icon: Trophy,
      title: lang === "uk" ? "Тест і сертифікат" : "Test & certificate",
      desc:
        lang === "uk"
          ? "Складіть тест і отримайте підтвердження."
          : "Pass the quiz and earn your certificate.",
    },
  ];

  const partners = [
    { name: "Cisco Networking Academy", icon: SiCisco, color: "text-sky-600 dark:text-sky-400" },
    { name: "Oracle Academy", icon: SiOracle, color: "text-rose-600 dark:text-rose-400" },
    { name: "AWS Academy", icon: SiAmazon, color: "text-amber-600 dark:text-amber-400" },
    {
      name: lang === "uk" ? "ДПУ" : "STU",
      icon: Building2,
      color: "text-blue-700 dark:text-blue-400",
    },
    {
      name: lang === "uk" ? "ФФЦТ" : "FFDT",
      icon: Database,
      color: "text-indigo-700 dark:text-indigo-400",
    },
    {
      name: lang === "uk" ? "КІТС" : "DCITS",
      icon: Zap,
      color: "text-violet-700 dark:text-violet-400",
    },
  ];

  const faqItems = [
    {
      q:
        lang === "uk"
          ? "Скільки коштує навчання в IT-ХАБі?"
          : "How much does IT-HUB cost?",
      a:
        lang === "uk"
          ? "Усі курси Cisco Networking Academy, Oracle Academy та AWS Academy доступні студентам ДПУ повністю безкоштовно. Платформа фінансується за рахунок партнерських угод між університетом і вендорами — ви не сплачуєте ні за навчальні матеріали, ні за хмарні лабораторії, ні за іспити."
          : "All Cisco Networking Academy, Oracle Academy and AWS Academy courses are 100% free for STU students. The platform is funded through partnership agreements between the university and the vendors — you pay nothing for materials, cloud labs or exams.",
    },
    {
      q:
        lang === "uk"
          ? "Чи отримаю я реальний сертифікат після проходження?"
          : "Will I receive an actual certificate after completion?",
      a:
        lang === "uk"
          ? "Так. Після успішного складання модулів і фінального іспиту ви отримуєте офіційний цифровий сертифікат від Cisco / Oracle / AWS — його можна додати до LinkedIn, резюме та портфоліо. Сертифікати визнаються в усьому світі та посилюють CV для працевлаштування."
          : "Yes. After completing modules and passing the final exam you receive an official digital certificate from Cisco / Oracle / AWS — it can be added to your LinkedIn profile, CV and portfolio. Certificates are recognized worldwide and strengthen your CV for job applications.",
    },
    {
      q:
        lang === "uk"
          ? "Хто може зареєструватись на платформі?"
          : "Who can register on the platform?",
      a:
        lang === "uk"
          ? "Платформа відкрита для всіх студентів ДПУ (передусім ФФЦТ, кафедри КІТС), абітурієнтів, які розглядають вступ на ІТ-спеціальності 121/122/125/186, та для НПП кафедри. Доступ також надається учасникам літніх шкіл і слухачам курсів підвищення кваліфікації."
          : "The platform is open to all STU students (primarily FFDT, DCITS), prospective applicants considering IT specialties 121/122/125/186, and DCITS faculty. Access is also provided to summer-school participants and continuing-education enrollees.",
    },
    {
      q:
        lang === "uk"
          ? "Скільки часу потрібно, щоб пройти один курс?"
          : "How long does one course take?",
      a:
        lang === "uk"
          ? "Залежить від курсу: модулі Cisco IT Essentials розраховані на ~70 годин, Oracle Database Design — ~54 години, AWS Cloud Foundations — ~20 годин. Ви навчаєтесь у власному темпі — більшість студентів закривають курс за 2–4 місяці, поєднуючи навчання з основним розкладом."
          : "It depends on the course: Cisco IT Essentials is ~70 hours, Oracle Database Design is ~54 hours, AWS Cloud Foundations is ~20 hours. You learn at your own pace — most students complete a course in 2–4 months alongside their regular schedule.",
    },
    {
      q:
        lang === "uk"
          ? "Якою мовою викладається матеріал?"
          : "What language is the content in?",
      a:
        lang === "uk"
          ? "Інтерфейс платформи — українською та англійською (перемикач у шапці). Контент академій доступний англійською, а українські переклади ключових модулів готують викладачі кафедри КІТС. Іспити можна складати англійською, а Cisco — також українською."
          : "The platform UI is bilingual Ukrainian / English (switcher in the header). Academy content is available in English, with Ukrainian translations of key modules prepared by DCITS faculty. Exams can be taken in English, and Cisco exams in Ukrainian as well.",
    },
    {
      q:
        lang === "uk"
          ? "Чи зараховуються курси у навчальний план кафедри?"
          : "Are the courses recognized in the official curriculum?",
      a:
        lang === "uk"
          ? "Так. 9 дисциплін кафедри КІТС інтегрують модулі з академій Cisco, Oracle та AWS — успішне проходження може зараховуватись як практична частина курсу або як вибірковий компонент. Деталі — у виклáдача дисципліни або в координатора програми."
          : "Yes. 9 DCITS disciplines integrate modules from Cisco, Oracle and AWS academies — successful completion can count toward the practical component of a course or as an elective. Details — with the course instructor or the program coordinator.",
    },
    {
      q:
        lang === "uk"
          ? "Як отримати допомогу, якщо щось не виходить?"
          : "How do I get help if I get stuck?",
      a:
        lang === "uk"
          ? "Координатор програми доступний у LinkedIn та через офіційну пошту кафедри. Також у системі є форма «Залишити відгук», де можна повідомити про технічні проблеми чи запропонувати покращення — усі звернення розглядаються адміністрацією."
          : "The program coordinator is reachable via LinkedIn and the department's official email. There is also a Feedback form where you can report technical issues or suggest improvements — all submissions are reviewed by the administration.",
    },
  ];

  const monthShort = (m: number) =>
    lang === "uk"
      ? ["СІЧ", "ЛЮТ", "БЕР", "КВІ", "ТРА", "ЧЕР", "ЛИП", "СЕР", "ВЕР", "ЖОВ", "ЛИС", "ГРУ"][m]
      : ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][m];

  const events = [
    {
      date: new Date(2026, 4, 4),
      kind: "event" as const,
      kindLabel: lang === "uk" ? "Подія кафедри" : "Department event",
      title: lang === "uk" ? "День відкритих дверей ФФЦТ" : "FFDT Open Day",
      desc:
        lang === "uk"
          ? "Презентація факультету, кафедри КІТС та можливостей IT-ХАБу для абітурієнтів."
          : "Faculty, DCITS department and IT-HUB opportunities showcase for prospective students.",
      location: lang === "uk" ? "ДПУ · ауд. КІТС" : "STU · DCITS room",
      time: "10:00",
      icon: School,
      tone: "from-blue-500 to-indigo-600",
      tag: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    },
    {
      date: new Date(2026, 4, 12),
      kind: "course" as const,
      kindLabel: lang === "uk" ? "Старт курсу" : "Course launch",
      title: "Cisco CCNA · Spring 2026",
      desc:
        lang === "uk"
          ? "Старт весняного потоку курсу з основ мережевих технологій."
          : "Spring intake of the foundational networking course begins.",
      location: lang === "uk" ? "Онлайн + лабораторія" : "Online + lab",
      time: lang === "uk" ? "Реєстрація відкрита" : "Registration open",
      icon: SiCisco,
      tone: "from-sky-500 to-blue-600",
      tag: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    },
    {
      date: new Date(2026, 4, 20),
      kind: "deadline" as const,
      kindLabel: lang === "uk" ? "Дедлайн" : "Deadline",
      title: "AWS Cloud Practitioner · Registration",
      desc:
        lang === "uk"
          ? "Останній день реєстрації на іспит сертифікації AWS Cloud Practitioner."
          : "Last day to register for the AWS Cloud Practitioner certification exam.",
      location: lang === "uk" ? "Онлайн" : "Online",
      time: "23:59",
      icon: AlarmClock,
      tone: "from-amber-500 to-orange-600",
      tag: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    },
    {
      date: new Date(2026, 5, 5),
      kind: "webinar" as const,
      kindLabel: lang === "uk" ? "Вебінар" : "Webinar",
      title: "Oracle Database 21c — Highlights",
      desc:
        lang === "uk"
          ? "Огляд ключових нововведень Oracle Database 21c і кейси застосування."
          : "Walkthrough of Oracle Database 21c key features and applied cases.",
      location: "Zoom",
      time: "18:00",
      icon: Video,
      tone: "from-rose-500 to-pink-600",
      tag: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    },
    {
      date: new Date(2026, 5, 15),
      kind: "event" as const,
      kindLabel: lang === "uk" ? "Літня школа" : "Summer school",
      title: lang === "uk" ? "Літня IT-школа КІТС" : "DCITS Summer IT School",
      desc:
        lang === "uk"
          ? "Тиждень інтенсивних воркшопів з кібербезпеки, ШІ та хмарних технологій."
          : "A week of intensive workshops on cybersecurity, AI and cloud.",
      location: lang === "uk" ? "ДПУ · ФФЦТ" : "STU · FFDT",
      time: lang === "uk" ? "5 днів" : "5 days",
      icon: CalendarDays,
      tone: "from-violet-500 to-fuchsia-600",
      tag: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
    },
    {
      date: new Date(2026, 6, 1),
      kind: "course" as const,
      kindLabel: lang === "uk" ? "Старт курсу" : "Course launch",
      title: "Cisco IT Essentials · New cohort",
      desc:
        lang === "uk"
          ? "Стартує літній потік для абітурієнтів та студентів 1-го курсу."
          : "Summer cohort opens for applicants and 1st-year students.",
      location: lang === "uk" ? "Онлайн" : "Online",
      time: lang === "uk" ? "Реєстрація відкрита" : "Registration open",
      icon: SiCisco,
      tone: "from-emerald-500 to-teal-600",
      tag: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-14">
      {/* ============ HERO ============ */}
      <section
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white px-6 py-12 md:px-10 md:py-16 shadow-2xl"
        data-testid="section-hero"
      >
        {/* Decorative dot grid */}
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                {t.hubLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-white text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                {lang === "uk" ? "100% безкоштовно" : "100% Free"}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white mb-3 tracking-tight drop-shadow leading-[1.05]">
              {t.hubTitle}
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-extrabold text-white/85 mb-5 tracking-tight">
              {t.hubSubtitle}
            </h2>

            <p className="text-base md:text-lg text-white/85 leading-relaxed max-w-2xl mb-7">
              {t.hubDescription}
            </p>

            <div className="flex flex-wrap gap-3">
              {!isAuthenticated && (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-sm font-bold bg-white text-blue-700 px-5 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 no-underline"
                  data-testid="button-hero-register"
                >
                  <Rocket className="w-4 h-4" />
                  {lang === "uk" ? "Почати безкоштовно" : "Start for free"}
                </Link>
              )}
              <Link
                href="/hub"
                className="inline-flex items-center gap-2 text-sm font-bold bg-white/10 backdrop-blur-md border border-white/30 text-white px-5 py-3 rounded-xl hover:bg-white/20 transition-all no-underline"
                data-testid="button-hero-hub"
              >
                {lang === "uk" ? "Дізнатись про IT-ХАБ" : "About IT-HUB"}
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 text-sm font-bold bg-white/10 backdrop-blur-md border border-white/30 text-white px-5 py-3 rounded-xl hover:bg-white/20 transition-all no-underline"
                data-testid="button-hero-leaderboard"
              >
                <Trophy className="w-4 h-4" />
                {lang === "uk" ? "Лідери" : "Leaders"}
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-2 text-white/60 text-sm">
              <span className={lang === "uk" ? "font-bold text-white" : ""}>{t.hubBannerUk}</span>
              <span>·</span>
              <span className={lang === "en" ? "font-bold text-white" : ""}>{t.hubBannerEn}</span>
            </div>
          </motion.div>

          {/* Floating academy chips on the right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:block relative h-[300px]"
          >
            {[
              {
                Icon: SiCisco,
                label: "Cisco",
                count: lang === "uk" ? "10 модулів" : "10 modules",
                top: "10%",
                left: "15%",
                bg: "bg-sky-500",
              },
              {
                Icon: SiOracle,
                label: "Oracle",
                count: lang === "uk" ? "9 модулів" : "9 modules",
                top: "45%",
                left: "55%",
                bg: "bg-rose-500",
              },
              {
                Icon: SiAmazon,
                label: "AWS",
                count: lang === "uk" ? "11 модулів" : "11 modules",
                top: "8%",
                left: "60%",
                bg: "bg-amber-500",
              },
            ].map((chip, idx) => (
              <motion.div
                key={chip.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.15, duration: 0.5 }}
                className="absolute"
                style={{ top: chip.top, left: chip.left }}
              >
                <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-2xl">
                  <div
                    className={`w-9 h-9 rounded-lg ${chip.bg} flex items-center justify-center`}
                  >
                    <chip.Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">
                      {chip.label}
                    </div>
                    <div className="text-[10px] text-gray-500 leading-tight">{chip.count}</div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Central pulse */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ delay: 0.6, repeat: Infinity, duration: 2.5 }}
              className="absolute top-[55%] left-[20%] w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center"
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ AUDIENCE CARDS ============ */}
      <section data-testid="section-audience">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          {lang === "uk" ? "Для кого IT-ХАБ" : "Who is the IT-HUB for"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {audiences.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all no-underline"
              data-testid={a.testId}
            >
              <div
                className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${a.tone} opacity-10 group-hover:opacity-20 transition-opacity`}
              />
              <div
                className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${a.tone} text-white flex items-center justify-center mb-4 ring-4 ${a.ring} shadow-lg`}
              >
                <a.icon className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-2">{a.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{a.desc}</p>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${a.tag}`}
                >
                  {a.stat}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ LIVE STATS ============ */}
      <section data-testid="section-stats">
        <div className="flex items-end justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {lang === "uk" ? "Платформа в цифрах" : "Platform in numbers"}
          </h3>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
            {lang === "uk" ? "оновлюється в реальному часі" : "updates in real time"}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCounter
            value={stats?.totalUsers ?? 0}
            label={lang === "uk" ? "Зареєстровано" : "Registered"}
            sublabel={lang === "uk" ? "користувачів" : "users"}
            icon={Users}
            accent="emerald"
            testId="stat-users"
          />
          <StatCounter
            value={stats?.totalFeedbacks ?? 0}
            suffix="+"
            label={lang === "uk" ? "Відгуків студентів" : "Student reviews"}
            sublabel={lang === "uk" ? "залишено" : "submitted"}
            icon={MessageSquare}
            accent="sky"
            testId="stat-feedbacks"
          />
          <StatCounter
            value={Math.max(stats?.totalCompleted ?? 0, totalSubModules)}
            suffix="+"
            label={lang === "uk" ? "Модулів та уроків" : "Modules & lessons"}
            sublabel={lang === "uk" ? "доступно" : "available"}
            icon={BookOpen}
            accent="violet"
            testId="stat-modules"
          />
          <StatCounter
            value={100}
            suffix="%"
            label={lang === "uk" ? "Безкоштовний доступ" : "Free access"}
            sublabel={lang === "uk" ? "для студентів" : "for students"}
            icon={ShieldCheck}
            accent="amber"
            testId="stat-free"
          />
        </div>
      </section>

      {/* ============ PROGRESS (logged-in) ============ */}
      {isAuthenticated && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-sm"
          data-testid="section-progress"
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">
                  {lang === "uk" ? "Ваш прогрес" : "Your Progress"}
                  {user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {lang === "uk"
                    ? `Пройдено ${completedCount} з ${totalTopics} тем`
                    : `Completed ${completedCount} of ${totalTopics} topics`}
                </p>
              </div>
            </div>
            <span
              className="text-3xl font-extrabold text-primary tabular-nums"
              data-testid="text-progress-pct"
            >
              {progressPct}%
            </span>
          </div>
          <Progress value={progressPct} className="h-3 mb-4" />
          <div className="flex gap-2 flex-wrap">
            {topicsData.map((topic) => {
              const done = completedSlugs.includes(topic.slug);
              const tr = getTopicTranslation(topic.slug);
              return (
                <div
                  key={topic.slug}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                    done
                      ? "bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                  data-testid={`chip-progress-${topic.slug}`}
                >
                  {done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 opacity-50" />
                  )}
                  <span>{tr ? tr.name : topic.name}</span>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* ============ TOPIC CARDS ============ */}
      <section data-testid="section-topics">
        <div className="flex items-end justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t.topicsTitle}
          </h3>
          <Link
            href="/leaderboard"
            className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
            data-testid="link-all-tracks"
          >
            {lang === "uk" ? "Усі учасники" : "All participants"} →
          </Link>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {topicsData.map((topic) => {
            const tr = getTopicTranslation(topic.slug);
            return (
              <motion.div key={topic.id} variants={item}>
                <TopicCard
                  title={tr ? tr.name : topic.name}
                  description={tr ? tr.description : topic.description}
                  href={`/topic/${topic.slug}`}
                  theme={topic.slug as "oracle" | "amazon" | "cisco"}
                  image={
                    topic.imageUrl ||
                    "https://images.unsplash.com/photo-1662947036644-ec8decc60d4b?q=80&w=800&auto=format&fit=crop"
                  }
                  learnMore={t.learnMore}
                  completed={completedSlugs.includes(topic.slug)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ============ WHY IT-HUB ============ */}
      <section data-testid="section-why">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            {lang === "uk" ? "Переваги" : "Benefits"}
          </h3>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground tracking-tight mb-3">
            {lang === "uk" ? "Чому саме кафедра КІТС ДПУ?" : "Why DCITS DPU?"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {lang === "uk"
              ? "Сертифіковане навчання від лідерів галузі, доступ до хмарних лабораторій і реальний практичний досвід — у форматі, який зручний саме вам."
              : "Certified learning from industry leaders, cloud labs and real practical experience — in a format that suits you."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.07 }}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              data-testid={`card-benefit-${i}`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${b.tone} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <b.icon className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-foreground mb-2">{b.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section data-testid="section-how">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            {lang === "uk" ? "Старт" : "Getting started"}
          </h3>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground tracking-tight">
            {lang === "uk" ? "Як почати навчання на курсах Академій" : "How to start learning at the Academies"}
          </h2>
        </div>

        <div className="relative">
          {/* connecting line */}
          <div className="hidden md:block absolute top-7 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 opacity-50" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="text-center relative"
                data-testid={`step-${i + 1}`}
              >
                <div className="relative inline-flex">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 blur-xl" />
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center mx-auto shadow-xl ring-4 ring-background">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 text-foreground border text-[11px] font-bold flex items-center justify-center shadow">
                    {i + 1}
                  </div>
                </div>
                <h4 className="font-bold text-foreground mt-4 mb-1">{s.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section data-testid="section-faq">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-start">
          {/* Left side intro */}
          <div className="lg:sticky lg:top-24">
            <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider mb-4">
              <HelpCircle className="w-3 h-3" />
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground tracking-tight mb-3">
              {lang === "uk" ? "Поширені запитання" : "Frequently asked questions"}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              {lang === "uk"
                ? "Тут — відповіді на питання, які ми чуємо найчастіше від студентів, абітурієнтів і викладачів. Якщо вашого питання тут немає — напишіть координатору."
                : "Answers to questions we hear most often from students, applicants and faculty. Don't see your question? Reach out to the coordinator."}
            </p>
            <Link
              href="/feedback"
              className="inline-flex items-center gap-2 text-sm font-bold bg-primary text-primary-foreground px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity no-underline"
              data-testid="button-faq-ask"
            >
              <MessageSquare className="w-4 h-4" />
              {lang === "uk" ? "Поставити питання" : "Ask a question"}
            </Link>
          </div>

          {/* Accordion */}
          <Accordion
            type="single"
            collapsible
            defaultValue="faq-0"
            className="rounded-2xl border bg-card divide-y"
            data-testid="accordion-faq"
          >
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-b-0 px-5"
                data-testid={`faq-item-${i}`}
              >
                <AccordionTrigger
                  className="text-left font-semibold text-foreground py-5 hover:no-underline"
                  data-testid={`faq-trigger-${i}`}
                >
                  <span className="flex items-start gap-3 text-base pr-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary font-extrabold text-xs flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {item.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent
                  className="text-sm text-muted-foreground leading-relaxed pb-5 pl-10 pr-2"
                  data-testid={`faq-content-${i}`}
                >
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ============ COMMUNITY (Poll + Leaderboard) ============ */}
      <section data-testid="section-community" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active poll */}
        <div
          className="rounded-2xl border bg-card p-6 flex flex-col"
          data-testid="card-poll"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">
                {lang === "uk" ? "Активне опитування" : "Active poll"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {lang === "uk"
                  ? "Ваша думка важлива для розвитку платформи"
                  : "Your opinion matters for the platform"}
              </p>
            </div>
          </div>

          {activePoll ? (
            <div className="flex flex-col flex-1">
              <p className="font-medium text-foreground mb-4">
                {lang === "uk" ? activePoll.questionUk : activePoll.questionEn}
              </p>
              <div className="space-y-2 flex-1">
                {(lang === "uk" ? activePoll.optionsUk : activePoll.optionsEn).map((opt, idx) => {
                  const count = pollResults.find((r) => r.option === idx)?.count ?? 0;
                  const pct = pollTotal > 0 ? Math.round((count / pollTotal) * 100) : 0;
                  const voted = activePoll.userResponse !== null;
                  const mine = activePoll.userResponse === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={voted || pendingPollOption !== null}
                      onClick={() => handlePollVote(idx)}
                      className={`w-full text-left relative overflow-hidden rounded-xl border px-4 py-2.5 transition-all ${
                        voted
                          ? mine
                            ? "border-violet-500 bg-violet-500/5"
                            : "border-border bg-card"
                          : "border-border hover:border-violet-400 hover:bg-violet-500/5 cursor-pointer"
                      } ${pendingPollOption === idx ? "opacity-60" : ""}`}
                      data-testid={`button-poll-option-${idx}`}
                    >
                      {voted && (
                        <div
                          className="absolute inset-y-0 left-0 bg-violet-500/10"
                          style={{ width: `${pct}%` }}
                        />
                      )}
                      <div className="relative flex items-center justify-between gap-3">
                        <span className="text-sm text-foreground font-medium flex-1">
                          {opt}
                          {mine && (
                            <CheckCircle2 className="inline-block w-4 h-4 ml-1.5 text-violet-600" />
                          )}
                        </span>
                        {voted && (
                          <span className="text-xs font-bold text-violet-700 dark:text-violet-400 tabular-nums">
                            {pct}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {activePoll.userResponse !== null && (
                <p className="text-[11px] text-muted-foreground mt-3 text-center">
                  {lang === "uk"
                    ? `Усього голосів: ${pollTotal}`
                    : `Total votes: ${pollTotal}`}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {lang === "uk"
                ? "Наразі немає активних опитувань."
                : "No active polls at the moment."}
            </p>
          )}
        </div>

        {/* Top-5 leaderboard */}
        <div
          className="rounded-2xl border bg-card p-6 flex flex-col"
          data-testid="card-leaderboard"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  {lang === "uk" ? "Топ-5 студентів" : "Top-5 Students"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {lang === "uk"
                    ? "За кількістю пройдених тем"
                    : "By topics completed"}
                </p>
              </div>
            </div>
            <Link
              href="/leaderboard"
              className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
              data-testid="link-leaderboard-full"
            >
              {lang === "uk" ? "Усі" : "All"} →
            </Link>
          </div>

          {topFive.length > 0 ? (
            <div className="space-y-2 flex-1">
              {topFive.map((u, idx) => {
                const medalColor =
                  idx === 0
                    ? "bg-amber-400 text-amber-950"
                    : idx === 1
                      ? "bg-gray-300 text-gray-800"
                      : idx === 2
                        ? "bg-orange-400 text-orange-950"
                        : "bg-muted text-muted-foreground";
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                    data-testid={`row-leader-${u.id}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${medalColor}`}
                    >
                      {idx < 3 ? <Medal className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate text-sm">
                        {u.fullName || u.username}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        @{u.username}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-sm">
                      <Trophy className="w-3.5 h-3.5" />
                      <span className="tabular-nums">{u.completedTopics}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {lang === "uk"
                ? "Поки що немає лідерів. Будьте першим!"
                : "No leaders yet. Be the first!"}
            </p>
          )}
        </div>
      </section>

      {/* ============ EVENTS CALENDAR ============ */}
      <section data-testid="section-events">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-3">
              <CalendarDays className="w-3 h-3" />
              {lang === "uk" ? "Календар" : "Calendar"}
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground tracking-tight">
              {lang === "uk" ? "Найближчі події" : "Upcoming events"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {lang === "uk"
                ? "Вебінари, дедлайни сертифікацій та події кафедри КІТС."
                : "Webinars, certification deadlines and DCITS department events."}
            </p>
          </div>
          <Link
            href="/news"
            className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
            data-testid="link-events-all"
          >
            {lang === "uk" ? "Усі новини" : "All news"} →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev, i) => {
            const Icon = ev.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.06 }}
                className="group relative overflow-hidden rounded-2xl border bg-card hover:shadow-xl hover:-translate-y-0.5 transition-all"
                data-testid={`event-card-${i}`}
              >
                <div className="flex">
                  {/* Date tile */}
                  <div
                    className={`relative w-24 flex-shrink-0 bg-gradient-to-br ${ev.tone} text-white flex flex-col items-center justify-center py-5`}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-widest opacity-90">
                      {monthShort(ev.date.getMonth())}
                    </div>
                    <div
                      className="text-3xl font-extrabold tabular-nums leading-none my-1"
                      data-testid={`event-day-${i}`}
                    >
                      {ev.date.getDate()}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider opacity-75">
                      {ev.date.getFullYear()}
                    </div>
                    <div
                      className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br ${ev.tone} text-white shadow-lg flex items-center justify-center border-2 border-card`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 min-w-0">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${ev.tag} mb-2`}
                    >
                      {ev.kindLabel}
                    </span>
                    <h4 className="font-bold text-foreground mb-1.5 leading-snug">
                      {ev.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                      {ev.desc}
                    </p>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-foreground flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {ev.time}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============ PARTNERS ============ */}
      <section data-testid="section-partners">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center mb-6">
          {lang === "uk"
            ? "Партнери та інституції"
            : "Partners & institutions"}
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {partners.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card/60 hover:bg-card hover:border-primary/30 transition-colors"
              data-testid={`partner-${p.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <p.icon className={`w-7 h-7 ${p.color}`} />
              <span className="text-[11px] font-bold text-foreground text-center leading-tight">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-600 text-white p-8 md:p-12 shadow-2xl"
        data-testid="section-cta"
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-cyan-300/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid md:grid-cols-[1.4fr_1fr] gap-6 items-center">
          <div>
            <h2 className="text-2xl md:text-4xl font-display font-extrabold text-white mb-3 tracking-tight">
              {lang === "uk"
                ? "Долучайтесь до нашої спільноти"
                : "Join our community"}
            </h2>
            <p className="text-white/85 leading-relaxed mb-6 max-w-xl">
              {lang === "uk"
                ? "Реєструйтесь безкоштовно, обирайте напрям і починайте опановувати технології Cisco, Oracle та AWS під керівництвом викладачів кафедри КІТС."
                : "Register for free, choose your track and start mastering Cisco, Oracle and AWS technologies guided by DCITS faculty."}
            </p>
            <div className="flex flex-wrap gap-3">
              {!isAuthenticated && (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-sm font-bold bg-white text-blue-700 px-5 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-0.5 no-underline"
                  data-testid="button-cta-register"
                >
                  <Rocket className="w-4 h-4" />
                  {lang === "uk" ? "Зареєструватись" : "Register now"}
                </Link>
              )}
              <Link
                href="/feedback"
                className="inline-flex items-center gap-2 text-sm font-bold bg-white/15 backdrop-blur-md border border-white/30 text-white px-5 py-3 rounded-xl hover:bg-white/25 transition-all no-underline"
                data-testid="button-cta-feedback"
              >
                <MessageSquare className="w-4 h-4" />
                {lang === "uk" ? "Залишити відгук" : "Leave feedback"}
              </Link>
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-3">
            {[
              { icon: ShieldCheck, label: lang === "uk" ? "Без оплат" : "No payments" },
              { icon: Award, label: lang === "uk" ? "Сертифікати" : "Certificates" },
              { icon: Clock, label: lang === "uk" ? "Доступ 24/7" : "24/7 access" },
            ].map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3"
              >
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <b.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-sm">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
