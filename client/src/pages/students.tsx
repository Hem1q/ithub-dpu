import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { Link } from "wouter";
import { StatCounter } from "@/components/StatCounter";
import {
  GraduationCap,
  Award,
  Cloud,
  Database,
  Network,
  ChevronRight,
  Trophy,
  Code2,
  FileBadge,
  Target,
  Users,
  Sparkles,
  Rocket,
  PlayCircle,
  Zap,
  TrendingUp,
  Globe,
} from "lucide-react";

const benefitsUk = [
  { icon: Award, title: "Міжнародні сертифікати", desc: "Безкоштовний доступ до підготовки та отримання сертифікатів Cisco, Oracle та AWS.", tone: "from-emerald-500 to-teal-500" },
  { icon: Cloud, title: "Хмарні лабораторії", desc: "AWS Academy Learner Lab, Oracle APEX, Cisco Packet Tracer — практика без обмежень.", tone: "from-cyan-500 to-blue-500" },
  { icon: Code2, title: "Реальні проєкти", desc: "Робота над завданнями з індустрії під керівництвом акредитованих інструкторів.", tone: "from-indigo-500 to-violet-500" },
  { icon: Trophy, title: "Конкурси та хакатони", desc: "Участь у всеукраїнських та міжнародних змаганнях з ІТ та аналітики даних.", tone: "from-amber-500 to-orange-500" },
  { icon: FileBadge, title: "Цифрові бейджі", desc: "Підтверджуйте свої компетенції цифровими бейджами Credly та LinkedIn.", tone: "from-rose-500 to-pink-500" },
  { icon: Users, title: "Спільнота", desc: "Спілкування зі студентами, випускниками та представниками ІТ-компаній.", tone: "from-emerald-500 to-lime-500" },
];

const benefitsEn = [
  { icon: Award, title: "International Certificates", desc: "Free access to Cisco, Oracle and AWS certification prep and exams.", tone: "from-emerald-500 to-teal-500" },
  { icon: Cloud, title: "Cloud Labs", desc: "AWS Academy Learner Lab, Oracle APEX, Cisco Packet Tracer — unlimited practice.", tone: "from-cyan-500 to-blue-500" },
  { icon: Code2, title: "Real Projects", desc: "Industry-grade tasks under guidance of accredited instructors.", tone: "from-indigo-500 to-violet-500" },
  { icon: Trophy, title: "Contests & Hackathons", desc: "Participate in national and international IT and data analytics competitions.", tone: "from-amber-500 to-orange-500" },
  { icon: FileBadge, title: "Digital Badges", desc: "Confirm your skills with Credly and LinkedIn digital badges.", tone: "from-rose-500 to-pink-500" },
  { icon: Users, title: "Community", desc: "Connect with peers, alumni and IT industry representatives.", tone: "from-emerald-500 to-lime-500" },
];

const tracksUk = [
  {
    icon: Network,
    name: "Cisco NetAcad",
    href: "/topic/cisco",
    short: "Мережі та кібербезпека",
    accent: "blue",
    modules: 10,
    badge: "З 2007 року",
    courses: ["IT Essentials", "CCNA Introduction to Networks", "CCNA Switching, Routing & Wireless", "Cybersecurity Essentials"],
  },
  {
    icon: Database,
    name: "Oracle Academy",
    href: "/topic/oracle",
    short: "Бази даних, Java, AI",
    accent: "rose",
    modules: 9,
    badge: "З 2017 року",
    courses: ["Database Foundations", "Database Programming with SQL", "Java Foundations", "APEX Application Development"],
  },
  {
    icon: Cloud,
    name: "AWS Academy",
    href: "/topic/amazon",
    short: "Хмари та машинне навчання",
    accent: "amber",
    modules: 11,
    badge: "З 2024 року",
    courses: ["Cloud Foundations", "Cloud Architecting", "Machine Learning Foundations", "Data Engineering"],
  },
];

const tracksEn = [
  { icon: Network, name: "Cisco NetAcad", href: "/topic/cisco", short: "Networking & cybersecurity", accent: "blue", modules: 10, badge: "Since 2007",
    courses: ["IT Essentials", "CCNA Introduction to Networks", "CCNA Switching, Routing & Wireless", "Cybersecurity Essentials"] },
  { icon: Database, name: "Oracle Academy", href: "/topic/oracle", short: "Databases, Java, AI", accent: "rose", modules: 9, badge: "Since 2017",
    courses: ["Database Foundations", "Database Programming with SQL", "Java Foundations", "APEX Application Development"] },
  { icon: Cloud, name: "AWS Academy", href: "/topic/amazon", short: "Cloud & machine learning", accent: "amber", modules: 11, badge: "Since 2024",
    courses: ["Cloud Foundations", "Cloud Architecting", "Machine Learning Foundations", "Data Engineering"] },
];

const trackTone: Record<string, { ring: string; bg: string; text: string; chip: string; btn: string; gradient: string }> = {
  blue: {
    ring: "ring-blue-500/30 hover:ring-blue-500/60",
    bg: "from-blue-500/10 via-blue-500/5 to-transparent",
    text: "text-blue-700 dark:text-blue-400",
    chip: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    btn: "bg-blue-600 hover:bg-blue-700 text-white",
    gradient: "from-blue-500 to-cyan-500",
  },
  rose: {
    ring: "ring-rose-500/30 hover:ring-rose-500/60",
    bg: "from-rose-500/10 via-rose-500/5 to-transparent",
    text: "text-rose-700 dark:text-rose-400",
    chip: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    btn: "bg-rose-600 hover:bg-rose-700 text-white",
    gradient: "from-rose-500 to-red-500",
  },
  amber: {
    ring: "ring-amber-500/30 hover:ring-amber-500/60",
    bg: "from-amber-500/10 via-amber-500/5 to-transparent",
    text: "text-amber-700 dark:text-amber-400",
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    btn: "bg-amber-600 hover:bg-amber-700 text-white",
    gradient: "from-amber-500 to-orange-500",
  },
};

const stepsUk = [
  { step: "1", title: "Зареєструйтесь", desc: "Створіть обліковий запис на порталі IT-хабу — безкоштовно для студентів ДПУ.", icon: Sparkles },
  { step: "2", title: "Оберіть напрям", desc: "Cisco, Oracle або AWS — або всі три. Кожен модуль має покрокові матеріали.", icon: Target },
  { step: "3", title: "Проходьте курси", desc: "Лекції, лабораторні, тести. Можна навчатись у власному темпі 24/7.", icon: PlayCircle },
  { step: "4", title: "Отримайте сертифікат", desc: "Здавайте іспити та отримуйте офіційні сертифікати від міжнародних академій.", icon: FileBadge },
];

const stepsEn = [
  { step: "1", title: "Register", desc: "Create an account on the IT-Hub portal — free for STU students.", icon: Sparkles },
  { step: "2", title: "Choose a track", desc: "Cisco, Oracle or AWS — or all three. Each module has step-by-step materials.", icon: Target },
  { step: "3", title: "Take the courses", desc: "Lectures, labs, tests. Learn at your own pace 24/7.", icon: PlayCircle },
  { step: "4", title: "Get certified", desc: "Take exams and earn official certificates from international academies.", icon: FileBadge },
];

export default function Students() {
  const { lang } = useLanguage();
  const benefits = lang === "uk" ? benefitsUk : benefitsEn;
  const tracks = lang === "uk" ? tracksUk : tracksEn;
  const steps = lang === "uk" ? stepsUk : stepsEn;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white px-6 md:px-10 pt-14 pb-12 shadow-2xl">
        {/* Animated mesh background */}
        <div className="absolute inset-0 -z-0 opacity-50">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-emerald-400/30 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-teal-400/30 blur-3xl" />
        </div>
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 -z-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/15 border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                <GraduationCap className="w-3 h-3" />
                {lang === "uk" ? "Розділ" : "Section"}
              </span>
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-300/20 border border-emerald-300/30 text-emerald-100 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                {lang === "uk" ? "Безкоштовно" : "Free"}
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-[1.05] bg-gradient-to-br from-white via-white to-emerald-100 bg-clip-text text-transparent"
              data-testid="heading-students"
            >
              {lang === "uk" ? "Студентам" : "For Students"}
            </h1>
            <p className="text-white/85 max-w-2xl text-base md:text-lg leading-relaxed mb-6">
              {lang === "uk"
                ? "Освітній IT-ХАБ ДПУ дає вам безкоштовний доступ до навчальних ресурсів, хмарних лабораторій та сертифікаційних програм Cisco, Oracle та AWS — провідних ІТ-корпорацій світу."
                : "STU's Educational IT-HUB gives you free access to learning materials, cloud labs and certification programs from Cisco, Oracle and AWS — the world's leading IT corporations."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-sm font-bold bg-white text-emerald-700 px-5 py-3 rounded-xl hover:bg-emerald-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 no-underline"
                data-testid="button-register-hero"
              >
                <Rocket className="w-4 h-4" />
                {lang === "uk" ? "Почати навчання" : "Start learning"}
              </Link>
              <Link
                href="/hub"
                className="inline-flex items-center gap-2 text-sm font-bold bg-white/10 backdrop-blur-md border border-white/30 text-white px-5 py-3 rounded-xl hover:bg-white/20 transition-all no-underline"
                data-testid="button-hub-hero"
              >
                {lang === "uk" ? "Дізнатись більше" : "Learn more"}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Floating academy chips */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden md:flex flex-col gap-3 pr-2"
          >
            {[
              { name: "Cisco", icon: Network, color: "from-blue-500 to-cyan-500", count: "10" },
              { name: "Oracle", icon: Database, color: "from-rose-500 to-red-500", count: "9" },
              { name: "AWS", icon: Cloud, color: "from-amber-500 to-orange-500", count: "11" },
            ].map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 pr-5 shadow-lg"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-lg`}>
                  <a.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{a.name}</div>
                  <div className="text-xs text-white/70">{a.count} {lang === "uk" ? "модулів" : "modules"}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCounter value={30} suffix="+" label={lang === "uk" ? "Курсів та модулів" : "Courses & modules"} icon={Award} accent="emerald" testId="stat-courses" />
          <StatCounter value={3} label={lang === "uk" ? "Світові академії" : "Global academies"} icon={Globe} accent="sky" testId="stat-academies" />
          <StatCounter value={100} suffix="%" label={lang === "uk" ? "Безкоштовно для студентів" : "Free for students"} icon={Sparkles} accent="violet" testId="stat-free" />
          <StatCounter value={24} suffix="/7" label={lang === "uk" ? "Доступ до лабораторій" : "Lab access"} icon={Zap} accent="amber" testId="stat-247" />
        </div>
      </section>

      {/* BENEFITS */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-1.5">
              {lang === "uk" ? "Переваги" : "Benefits"}
            </h2>
            <p className="text-2xl md:text-3xl font-extrabold text-foreground">
              {lang === "uk" ? "Що ви отримуєте" : "What you get"}
            </p>
          </div>
        </div>
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b) => (
            <motion.div
              key={b.title}
              variants={item}
              className="group relative overflow-hidden bg-card border rounded-2xl p-6 hover:shadow-xl hover:border-emerald-500/40 transition-all hover:-translate-y-1"
              data-testid={`benefit-${b.title}`}
            >
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${b.tone} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity`} />
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${b.tone} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <b.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-1.5 text-lg">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TRACKS */}
      <section>
        <div className="mb-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-1.5">
            {lang === "uk" ? "Напрями" : "Tracks"}
          </h2>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground">
            {lang === "uk" ? "Доступні напрями навчання" : "Available learning tracks"}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {tracks.map((t) => {
            const Icon = t.icon;
            const tone = trackTone[t.accent];
            return (
              <Link key={t.name} href={t.href}>
                <div
                  className={`group relative overflow-hidden bg-card border rounded-3xl p-6 ring-1 ${tone.ring} transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer h-full`}
                  data-testid={`track-${t.name}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tone.bg} opacity-100`} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tone.gradient} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${tone.chip}`}>
                        {t.badge}
                      </span>
                    </div>
                    <h3 className={`font-extrabold text-xl mb-1 ${tone.text}`}>{t.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t.short}</p>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className={`text-4xl font-extrabold ${tone.text}`}>{t.modules}</span>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        {lang === "uk" ? "модулів" : "modules"}
                      </span>
                    </div>

                    <ul className="space-y-1.5 mb-5">
                      {t.courses.slice(0, 4).map((c) => (
                        <li key={c} className="flex items-start gap-2 text-xs text-foreground/80">
                          <span className={`w-1.5 h-1.5 mt-1.5 rounded-full ${tone.gradient.replace("from-", "bg-").split(" ")[0]} flex-shrink-0`} />
                          <span className="leading-snug">{c}</span>
                        </li>
                      ))}
                    </ul>

                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold ${tone.text} group-hover:gap-3 transition-all`}>
                      {lang === "uk" ? "Перейти до модуля" : "Go to module"}
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOW TO START */}
      <section className="relative overflow-hidden bg-card border rounded-3xl p-6 md:p-10 shadow-sm">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {lang === "uk" ? "Як почати" : "How to start"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {lang === "uk" ? "Чотири простих кроки до сертифіката" : "Four simple steps to a certificate"}
            </p>
          </div>
        </div>

        <div className="relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0 -z-0" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
                data-testid={`step-${s.step}`}
              >
                <div className="relative mx-auto w-14 h-14 mb-4">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl" />
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-extrabold text-xl shadow-xl border-4 border-card">
                    {s.step}
                  </div>
                </div>
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
                  <s.icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-foreground mb-1.5">{s.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t flex flex-wrap gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all hover:-translate-y-0.5 no-underline"
            data-testid="button-register"
          >
            <Rocket className="w-4 h-4" />
            {lang === "uk" ? "Зареєструватись" : "Register"}
          </Link>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-2 text-sm font-bold bg-muted text-foreground px-6 py-3 rounded-xl hover:bg-muted/70 transition-colors no-underline"
            data-testid="button-feedback"
          >
            <TrendingUp className="w-4 h-4" />
            {lang === "uk" ? "Залишити відгук" : "Leave feedback"}
          </Link>
        </div>
      </section>
    </div>
  );
}
