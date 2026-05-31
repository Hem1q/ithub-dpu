import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { Link } from "wouter";
import { StatCounter } from "@/components/StatCounter";
import {
  School,
  BookOpen,
  Award,
  Network,
  Database,
  Cloud,
  ChevronRight,
  CheckCircle2,
  FileBadge,
  Briefcase,
  Lightbulb,
  Users,
  Linkedin,
  Sparkles,
  GraduationCap,
  Mail,
  PhoneCall,
  Target,
  Rocket,
  Globe,
  Zap,
} from "lucide-react";

const opportunitiesUk = [
  { icon: FileBadge, title: "Акредитація інструктора", desc: "Безкоштовна акредитація як інструктор Cisco, Oracle або AWS Academy.", tone: "from-sky-500 to-blue-500" },
  { icon: BookOpen, title: "Готові навчальні матеріали", desc: "Лекції, лабораторні, тести, презентації — повністю готові курси від міжнародних академій.", tone: "from-indigo-500 to-violet-500" },
  { icon: Cloud, title: "Хмарні ресурси для занять", desc: "AWS Academy Learner Lab, Oracle APEX, Cisco Packet Tracer для проведення лабораторних робіт.", tone: "from-cyan-500 to-blue-500" },
  { icon: Award, title: "Сертифікаційні ваучери", desc: "100% знижка на сертифікаційні іспити для активних викладачів-інструкторів.", tone: "from-amber-500 to-orange-500" },
  { icon: Briefcase, title: "Професійний розвиток", desc: "Регулярні воркшопи, тренінги та онлайн-конференції від Cisco, Oracle, AWS.", tone: "from-emerald-500 to-teal-500" },
  { icon: Lightbulb, title: "Інтеграція в дисципліни", desc: "Готові схеми інтеграції матеріалів академій у робочі програми.", tone: "from-rose-500 to-pink-500" },
];

const opportunitiesEn = [
  { icon: FileBadge, title: "Instructor accreditation", desc: "Free accreditation as a Cisco, Oracle or AWS Academy instructor.", tone: "from-sky-500 to-blue-500" },
  { icon: BookOpen, title: "Ready-made materials", desc: "Lectures, labs, tests, presentations — full courses from international academies.", tone: "from-indigo-500 to-violet-500" },
  { icon: Cloud, title: "Cloud resources for classes", desc: "AWS Academy Learner Lab, Oracle APEX, Cisco Packet Tracer for hands-on labs.", tone: "from-cyan-500 to-blue-500" },
  { icon: Award, title: "Certification vouchers", desc: "100% discount on certification exams for active instructors.", tone: "from-amber-500 to-orange-500" },
  { icon: Briefcase, title: "Professional development", desc: "Regular workshops, training and online conferences from Cisco, Oracle, AWS.", tone: "from-emerald-500 to-teal-500" },
  { icon: Lightbulb, title: "Course integration", desc: "Ready-made schemes for integrating academy materials into syllabi.", tone: "from-rose-500 to-pink-500" },
];

const integratedCoursesUk = [
  { name: "Cisco", icon: Network, accent: "blue", count: 3, courses: ["Комп'ютерні мережі", "Мультисервісні технології інформаційних систем", "Операційні системи"] },
  { name: "Oracle", icon: Database, accent: "rose", count: 4, courses: ["Організація баз даних та знань", "Веб-програмування", "Програмування нейронних мереж", "Машинне навчання та інтелектуальні технології у фінансах"] },
  { name: "AWS", icon: Cloud, accent: "amber", count: 2, courses: ["Великі дані та машинне навчання", "Технології баз даних та Big Data"] },
];

const integratedCoursesEn = [
  { name: "Cisco", icon: Network, accent: "blue", count: 3, courses: ["Computer Networks", "Multi-service Information System Technologies", "Operating Systems"] },
  { name: "Oracle", icon: Database, accent: "rose", count: 4, courses: ["Database and Knowledge Organisation", "Web Programming", "Neural Network Programming", "Machine Learning and Intelligent Tech in Finance"] },
  { name: "AWS", icon: Cloud, accent: "amber", count: 2, courses: ["Big Data and Machine Learning", "Database Technologies and Big Data"] },
];

const integratedTone: Record<string, { ring: string; bg: string; text: string; gradient: string; check: string }> = {
  blue: {
    ring: "ring-blue-500/30 hover:ring-blue-500/60",
    bg: "from-blue-500/10 via-blue-500/5 to-transparent",
    text: "text-blue-700 dark:text-blue-400",
    gradient: "from-blue-500 to-cyan-500",
    check: "text-blue-500",
  },
  rose: {
    ring: "ring-rose-500/30 hover:ring-rose-500/60",
    bg: "from-rose-500/10 via-rose-500/5 to-transparent",
    text: "text-rose-700 dark:text-rose-400",
    gradient: "from-rose-500 to-red-500",
    check: "text-rose-500",
  },
  amber: {
    ring: "ring-amber-500/30 hover:ring-amber-500/60",
    bg: "from-amber-500/10 via-amber-500/5 to-transparent",
    text: "text-amber-700 dark:text-amber-400",
    gradient: "from-amber-500 to-orange-500",
    check: "text-amber-500",
  },
};

const stepsUk = [
  { step: "1", title: "Зв'яжіться з координатором", desc: "Звертайтесь до координатора IT-хабу для отримання інструкцій щодо доступу до академій.", icon: PhoneCall },
  { step: "2", title: "Реєстрація в академії", desc: "Координатор допоможе зареєструватись як інструктор у відповідній академії.", icon: Sparkles },
  { step: "3", title: "Проходження вступних курсів", desc: "Online-курси від академії для підготовки до викладання.", icon: GraduationCap },
  { step: "4", title: "Інтеграція в робочу програму", desc: "Внесення матеріалів академії у робочу програму навчальної дисципліни.", icon: Target },
];

const stepsEn = [
  { step: "1", title: "Contact the coordinator", desc: "Reach out to the IT-Hub coordinator for academy onboarding instructions.", icon: PhoneCall },
  { step: "2", title: "Register at the academy", desc: "The coordinator will help you register as an instructor at the relevant academy.", icon: Sparkles },
  { step: "3", title: "Take onboarding courses", desc: "Online courses from the academy to prepare for teaching.", icon: GraduationCap },
  { step: "4", title: "Integrate into your syllabus", desc: "Add academy materials to the working program of your discipline.", icon: Target },
];

export default function Teachers() {
  const { lang } = useLanguage();
  const opportunities = lang === "uk" ? opportunitiesUk : opportunitiesEn;
  const integrated = lang === "uk" ? integratedCoursesUk : integratedCoursesEn;
  const steps = lang === "uk" ? stepsUk : stepsEn;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

  const totalDisciplines = integrated.reduce((s, g) => s + g.count, 0);

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-blue-800 to-indigo-900 text-white px-6 md:px-10 pt-14 pb-12 shadow-2xl">
        <div className="absolute inset-0 -z-0 opacity-50">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-sky-400/30 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-indigo-400/30 blur-3xl" />
        </div>
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
                <School className="w-3 h-3" />
                {lang === "uk" ? "Розділ" : "Section"}
              </span>
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-sky-300/20 border border-sky-300/30 text-sky-100 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                <Award className="w-3 h-3" />
                {lang === "uk" ? "Для НПП" : "For Faculty"}
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-[1.05] bg-gradient-to-br from-white via-white to-sky-100 bg-clip-text text-transparent"
              data-testid="heading-teachers"
            >
              {lang === "uk" ? "Викладачам" : "For Teachers"}
            </h1>
            <p className="text-white/85 max-w-2xl text-base md:text-lg leading-relaxed mb-6">
              {lang === "uk"
                ? "Освітній IT-ХАБ дає НПП кафедри КІТС безкоштовний доступ до методичних матеріалів, хмарних сервісів та програм професійного розвитку від Cisco, Oracle та AWS."
                : "The Educational IT-HUB gives DCITS faculty free access to methodological materials, cloud services and professional development programs from Cisco, Oracle and AWS."}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.linkedin.com/in/redych/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold bg-white text-sky-700 px-5 py-3 rounded-xl hover:bg-sky-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 no-underline"
                data-testid="button-coordinator-hero"
              >
                <Rocket className="w-4 h-4" />
                {lang === "uk" ? "Стати інструктором" : "Become an instructor"}
              </a>
              <Link
                href="/hub"
                className="inline-flex items-center gap-2 text-sm font-bold bg-white/10 backdrop-blur-md border border-white/30 text-white px-5 py-3 rounded-xl hover:bg-white/20 transition-all no-underline"
                data-testid="button-hub-hero"
              >
                {lang === "uk" ? "Про IT-ХАБ" : "About IT-HUB"}
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
              { name: "Cisco", icon: Network, color: "from-blue-500 to-cyan-500", count: "3", label: lang === "uk" ? "дисципліни" : "courses" },
              { name: "Oracle", icon: Database, color: "from-rose-500 to-red-500", count: "4", label: lang === "uk" ? "дисципліни" : "courses" },
              { name: "AWS", icon: Cloud, color: "from-amber-500 to-orange-500", count: "2", label: lang === "uk" ? "дисципліни" : "courses" },
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
                  <div className="text-xs text-white/70">{a.count} {a.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCounter value={3} label={lang === "uk" ? "Світові академії" : "Global academies"} icon={Globe} accent="sky" testId="stat-academies" />
          <StatCounter value={totalDisciplines} label={lang === "uk" ? "Інтегровані дисципліни" : "Integrated disciplines"} icon={BookOpen} accent="blue" testId="stat-disciplines" />
          <StatCounter value={100} suffix="%" label={lang === "uk" ? "Знижка на ваучери" : "Voucher discount"} icon={Award} accent="amber" testId="stat-vouchers" />
          <StatCounter value={24} suffix="/7" label={lang === "uk" ? "Доступ до ресурсів" : "Resource access"} icon={Zap} accent="violet" testId="stat-247" />
        </div>
      </section>

      {/* OPPORTUNITIES */}
      <section>
        <div className="mb-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 mb-1.5">
            {lang === "uk" ? "Можливості" : "Opportunities"}
          </h2>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground">
            {lang === "uk" ? "Можливості для викладачів" : "Opportunities for teachers"}
          </p>
        </div>
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((o) => (
            <motion.div
              key={o.title}
              variants={item}
              className="group relative overflow-hidden bg-card border rounded-2xl p-6 hover:shadow-xl hover:border-sky-500/40 transition-all hover:-translate-y-1"
              data-testid={`opportunity-${o.title}`}
            >
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${o.tone} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity`} />
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${o.tone} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <o.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-1.5 text-lg">{o.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{o.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* INTEGRATED COURSES */}
      <section>
        <div className="mb-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 mb-1.5">
            {lang === "uk" ? "Інтеграція" : "Integration"}
          </h2>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">
            {lang === "uk" ? "Дисципліни з інтегрованими ресурсами академій" : "Disciplines with integrated academy resources"}
          </p>
          <p className="text-sm text-muted-foreground">
            {lang === "uk" ? `${totalDisciplines} активних дисциплін інтегрують матеріали світових ІТ-академій` : `${totalDisciplines} active disciplines integrate materials from global IT academies`}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {integrated.map((g) => {
            const Icon = g.icon;
            const tone = integratedTone[g.accent];
            return (
              <div
                key={g.name}
                className={`group relative overflow-hidden bg-card border rounded-3xl p-6 ring-1 ${tone.ring} transition-all hover:-translate-y-1 hover:shadow-2xl h-full`}
                data-testid={`integrated-${g.name}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tone.bg}`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tone.gradient} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-extrabold ${tone.text} leading-none`}>{g.count}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                        {lang === "uk" ? "дисциплін" : "courses"}
                      </div>
                    </div>
                  </div>
                  <h3 className={`font-extrabold text-xl mb-3 ${tone.text}`}>{g.name}</h3>
                  <ul className="space-y-2.5">
                    {g.courses.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-foreground/85">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tone.check}`} />
                        <span className="leading-snug">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW TO START */}
      <section className="relative overflow-hidden bg-card border rounded-3xl p-6 md:p-10 shadow-sm">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center shadow-lg">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {lang === "uk" ? "Як стати інструктором академії" : "How to become an academy instructor"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {lang === "uk" ? "Чотири кроки до акредитації" : "Four steps to accreditation"}
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-sky-500/0 via-sky-500/40 to-sky-500/0 -z-0" />
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
                  <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-xl" />
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-xl border-4 border-card">
                    {s.step}
                  </div>
                </div>
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 mb-2">
                  <s.icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-foreground mb-1.5">{s.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COORDINATOR */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 rounded-3xl p-8 md:p-10 text-white shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-sky-300/20 blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative grid md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-center">
          {/* Avatar circle with initials */}
          <div className="flex flex-col items-center md:items-start">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-sky-300/40 via-white/20 to-transparent blur-xl" />
              <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 border-4 border-white/30 shadow-2xl flex items-center justify-center">
                <GraduationCap className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-sky-600" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sky-200 text-xs font-bold uppercase tracking-widest mb-2 inline-flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              {lang === "uk" ? "Координатор IT-хабу" : "IT-Hub Coordinator"}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight">
              {lang === "uk" ? "Підтримка для викладачів" : "Faculty Support"}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/15 border border-white/20 text-white/95 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                <FileBadge className="w-3 h-3" />
                {lang === "uk" ? "Акредитація академій" : "Academy accreditation"}
              </span>
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/15 border border-white/20 text-white/95 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                {lang === "uk" ? "Безкоштовно" : "Free of charge"}
              </span>
            </div>
            <p className="text-white/90 text-sm md:text-base leading-relaxed mb-5 max-w-2xl">
              {lang === "uk"
                ? "Зверніться до координатора IT-хабу з питань акредитації, доступу до ресурсів та інтеграції матеріалів академій у вашу дисципліну. Допомога безкоштовна для всіх НПП кафедри КІТС."
                : "Reach out to the IT-Hub coordinator regarding accreditation, resource access and integration of academy materials into your course. Help is free for all DCITS faculty."}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.linkedin.com/in/redych/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold bg-white text-sky-700 hover:bg-sky-50 transition-all px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                data-testid="link-coordinator-linkedin"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
              <Link
                href="/hub#coordinator"
                className="inline-flex items-center gap-2 text-sm font-bold bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/25 transition-colors px-5 py-2.5 rounded-xl no-underline"
                data-testid="button-coordinator-info"
              >
                <Mail className="w-4 h-4" />
                {lang === "uk" ? "Контакти" : "Contacts"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
