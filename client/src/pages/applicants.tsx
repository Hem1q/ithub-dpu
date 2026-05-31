import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { Link } from "wouter";
import { StatCounter } from "@/components/StatCounter";
import {
  Users,
  GraduationCap,
  Briefcase,
  Building2,
  TrendingUp,
  Globe,
  ChevronRight,
  FileBadge,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Lightbulb,
  Code2,
  Database,
  Shield,
  Palette,
  Brain,
  Rocket,
  Award,
  Calendar,
  Sparkles,
} from "lucide-react";

const programIcons: Record<string, { icon: typeof Code2; tone: string }> = {
  "121": { icon: Code2, tone: "from-violet-500 to-purple-500" },
  "122": { icon: Brain, tone: "from-fuchsia-500 to-pink-500" },
  "125": { icon: Shield, tone: "from-rose-500 to-red-500" },
  "186": { icon: Palette, tone: "from-amber-500 to-orange-500" },
  "122-master": { icon: Database, tone: "from-indigo-500 to-violet-500" },
};

const programsUk = [
  { level: "Бакалавр", code: "121", iconKey: "121", name: "Інженерія програмного забезпечення", duration: "3 р. 10 міс.", desc: "Розробка ПЗ, веб- та мобільні додатки, тестування, DevOps." },
  { level: "Бакалавр", code: "122", iconKey: "122", name: "Комп'ютерні науки", duration: "3 р. 10 міс.", desc: "Інформаційні управляючі системи і технології, штучний інтелект, аналітика даних." },
  { level: "Бакалавр", code: "125", iconKey: "125", name: "Кібербезпека", duration: "3 р. 10 міс.", desc: "Захист інформації, мережева безпека, аудит та реагування на інциденти." },
  { level: "Бакалавр", code: "186", iconKey: "186", name: "Технології цифрового дизайну", duration: "3 р. 10 міс.", desc: "UI/UX, веб-дизайн, 3D-графіка, цифрові медіа." },
  { level: "Магістр", code: "122", iconKey: "122-master", name: "Комп'ютерні інтелектуальні технології", duration: "1 р. 4 міс.", desc: "Big Data, машинне навчання, нейронні мережі, інтелектуальні системи у фінансах." },
];

const programsEn = [
  { level: "Bachelor", code: "121", iconKey: "121", name: "Software Engineering", duration: "3 yrs 10 mo", desc: "Software development, web/mobile apps, QA, DevOps." },
  { level: "Bachelor", code: "122", iconKey: "122", name: "Computer Science", duration: "3 yrs 10 mo", desc: "Information management systems, AI, data analytics." },
  { level: "Bachelor", code: "125", iconKey: "125", name: "Cybersecurity", duration: "3 yrs 10 mo", desc: "Information protection, network security, incident response." },
  { level: "Bachelor", code: "186", iconKey: "186", name: "Digital Design Technologies", duration: "3 yrs 10 mo", desc: "UI/UX, web design, 3D graphics, digital media." },
  { level: "Master", code: "122", iconKey: "122-master", name: "Computer Intelligent Technologies", duration: "1 yr 4 mo", desc: "Big Data, machine learning, neural nets, intelligent systems in finance." },
];

const reasonsUk = [
  { icon: Globe, title: "Міжнародні партнерства", desc: "Cisco (з 2007), Oracle (з 2017), AWS (з 2024) — навчання за програмами провідних ІТ-корпорацій.", tone: "from-violet-500 to-purple-500" },
  { icon: FileBadge, title: "Сертифікати під час навчання", desc: "Отримуйте міжнародно визнані сертифікати ще будучи студентом.", tone: "from-fuchsia-500 to-pink-500" },
  { icon: Briefcase, title: "Працевлаштування", desc: "Випускники працюють у державному секторі, банках, ІТ-компаніях України та світу.", tone: "from-rose-500 to-red-500" },
  { icon: TrendingUp, title: "Сучасний стек", desc: "Cloud, AI/ML, кібербезпека, бази даних — технології, на які зростає попит.", tone: "from-amber-500 to-orange-500" },
  { icon: Building2, title: "Лабораторії на кампусі", desc: "Лабораторія комп'ютерних мереж В407, лабораторія цифрових проєктів та інші.", tone: "from-cyan-500 to-blue-500" },
  { icon: Lightbulb, title: "Підтримка стартапів", desc: "Можливості для розвитку власних ІТ-проєктів та наукової діяльності.", tone: "from-indigo-500 to-violet-500" },
];

const reasonsEn = [
  { icon: Globe, title: "International Partnerships", desc: "Cisco (since 2007), Oracle (since 2017), AWS (since 2024) — learn from leading IT corporations.", tone: "from-violet-500 to-purple-500" },
  { icon: FileBadge, title: "Certificates while studying", desc: "Earn internationally recognized certificates as a student.", tone: "from-fuchsia-500 to-pink-500" },
  { icon: Briefcase, title: "Employment", desc: "Graduates work in the public sector, banks, IT companies in Ukraine and abroad.", tone: "from-rose-500 to-red-500" },
  { icon: TrendingUp, title: "Modern stack", desc: "Cloud, AI/ML, cybersecurity, databases — high-demand technologies.", tone: "from-amber-500 to-orange-500" },
  { icon: Building2, title: "On-campus labs", desc: "Computer Networks Lab B407, Digital Projects Lab and more.", tone: "from-cyan-500 to-blue-500" },
  { icon: Lightbulb, title: "Startup support", desc: "Opportunities to develop your own IT projects and research.", tone: "from-indigo-500 to-violet-500" },
];

const partnerships = [
  { name: "Cisco", year: 2007, color: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
  { name: "Oracle", year: 2017, color: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
  { name: "AWS", year: 2024, color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
];

export default function Applicants() {
  const { lang } = useLanguage();
  const programs = lang === "uk" ? programsUk : programsEn;
  const reasons = lang === "uk" ? reasonsUk : reasonsEn;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

  const currentYear = 2026;
  const yearsCisco = currentYear - 2007;

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-800 to-fuchsia-900 text-white px-6 md:px-10 pt-14 pb-12 shadow-2xl">
        <div className="absolute inset-0 -z-0 opacity-50">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-violet-400/30 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-pink-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-fuchsia-400/30 blur-3xl" />
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
                <Users className="w-3 h-3" />
                {lang === "uk" ? "Розділ" : "Section"}
              </span>
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-fuchsia-300/20 border border-fuchsia-300/30 text-fuchsia-100 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                <Award className="w-3 h-3" />
                {lang === "uk" ? "Вступ 2026" : "Admission 2026"}
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-[1.05] bg-gradient-to-br from-white via-white to-fuchsia-100 bg-clip-text text-transparent"
              data-testid="heading-applicants"
            >
              {lang === "uk" ? "Абітурієнтам" : "For Applicants"}
            </h1>
            <p className="text-white/85 max-w-2xl text-base md:text-lg leading-relaxed mb-6">
              {lang === "uk"
                ? "Кафедра комп'ютерних та інформаційних технологій і систем (КІТС) ФФЦТ Державного податкового університету готує ІТ-фахівців з реальними компетенціями та міжнародними сертифікатами."
                : "The Department of Computer and Information Technologies and Systems (DCITS) of FFDT at State Tax University prepares IT specialists with real competencies and international certifications."}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://dpu.edu.ua/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold bg-white text-violet-700 px-5 py-3 rounded-xl hover:bg-violet-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 no-underline"
                data-testid="button-apply-hero"
              >
                <Rocket className="w-4 h-4" />
                {lang === "uk" ? "Подати заявку" : "Apply now"}
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

          {/* Floating program chips */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden md:grid grid-cols-2 gap-3"
          >
            {[
              { code: "121", icon: Code2, tone: "from-violet-400 to-purple-500" },
              { code: "122", icon: Brain, tone: "from-fuchsia-400 to-pink-500" },
              { code: "125", icon: Shield, tone: "from-rose-400 to-red-500" },
              { code: "186", icon: Palette, tone: "from-amber-400 to-orange-500" },
            ].map((p, i) => (
              <motion.div
                key={p.code}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg w-32"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.tone} flex items-center justify-center shadow-lg mb-2`}>
                  <p.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-bold text-white">{p.code}</div>
                <div className="text-[10px] text-white/70 uppercase tracking-wider">{lang === "uk" ? "Спец-сть" : "Specialty"}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCounter value={5} label={lang === "uk" ? "Освітніх програм" : "Educational programs"} icon={GraduationCap} accent="violet" testId="stat-programs" />
          <StatCounter value={3} label={lang === "uk" ? "Світові партнери" : "Global partners"} icon={Globe} accent="rose" testId="stat-partners" />
          <StatCounter value={yearsCisco} suffix="+" label={lang === "uk" ? "Років з Cisco" : "Years with Cisco"} icon={Calendar} accent="blue" testId="stat-years-cisco" />
          <StatCounter value={30} suffix="+" label={lang === "uk" ? "Сертифікаційних модулів" : "Certification modules"} icon={Award} accent="amber" testId="stat-modules" />
        </div>
      </section>

      {/* WHY US */}
      <section>
        <div className="mb-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400 mb-1.5">
            {lang === "uk" ? "Переваги" : "Advantages"}
          </h2>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground">
            {lang === "uk" ? "Чому варто обрати кафедру КІТС" : "Why choose DCITS"}
          </p>
        </div>
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reasons.map((r) => (
            <motion.div
              key={r.title}
              variants={item}
              className="group relative overflow-hidden bg-card border rounded-2xl p-6 hover:shadow-xl hover:border-violet-500/40 transition-all hover:-translate-y-1"
              data-testid={`reason-${r.title}`}
            >
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${r.tone} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity`} />
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${r.tone} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <r.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-1.5 text-lg">{r.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* PARTNERSHIP TIMELINE */}
      <section className="relative overflow-hidden bg-card border rounded-3xl p-6 md:p-10 shadow-sm">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />
        <div className="relative mb-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400 mb-1.5">
            {lang === "uk" ? "Хроніка" : "Timeline"}
          </h2>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">
            {lang === "uk" ? "Партнерство зі світовими IT-корпораціями" : "Partnerships with global IT corporations"}
          </p>
          <p className="text-sm text-muted-foreground">
            {lang === "uk" ? "Наш досвід — це сила нашої освіти" : "Our experience is the power of our education"}
          </p>
        </div>

        <div className="relative pt-6">
          {/* timeline line */}
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-rose-500 to-amber-500 rounded-full" />
          <div className="grid grid-cols-3 gap-4 relative">
            {partnerships.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
                data-testid={`timeline-${p.name}`}
              >
                <div className="relative mx-auto w-12 h-12 mb-4">
                  <div className={`absolute inset-0 rounded-full ${p.color} blur-lg opacity-50`} />
                  <div className={`relative w-12 h-12 rounded-full ${p.color} text-white flex items-center justify-center font-bold shadow-xl border-4 border-card`}>
                    <span className="text-xs">{p.year}</span>
                  </div>
                </div>
                <div className={`text-2xl font-extrabold ${p.text}`}>{p.name}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                  {currentYear - p.year} {lang === "uk" ? "років співпраці" : "years of cooperation"}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section>
        <div className="mb-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400 mb-1.5">
            {lang === "uk" ? "Спеціальності" : "Specialties"}
          </h2>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">
            {lang === "uk" ? "Освітні програми" : "Educational Programs"}
          </p>
          <p className="text-sm text-muted-foreground">
            {lang === "uk" ? "Бакалаврат і магістратура за актуальними IT-спеціальностями" : "Bachelor's and Master's programs in modern IT specialties"}
          </p>
        </div>
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.map((p) => {
            const meta = programIcons[p.iconKey] ?? programIcons["121"];
            const Icon = meta.icon;
            return (
              <motion.div
                key={`${p.code}-${p.level}`}
                variants={item}
                className="group relative overflow-hidden bg-card border rounded-2xl p-6 hover:shadow-xl hover:border-violet-500/40 transition-all hover:-translate-y-0.5"
                data-testid={`program-${p.code}-${p.level}`}
              >
                <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${meta.tone} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity`} />
                <div className="relative flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.tone} text-white flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
                        {p.level}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 bg-muted rounded">{p.code}</span>
                      <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {p.duration}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground mb-1.5 text-base leading-tight">{p.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* HUB BENEFIT FOR APPLICANTS */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-700 to-fuchsia-700 rounded-3xl p-8 md:p-10 text-white shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-fuchsia-300/20 blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <p className="text-fuchsia-200 text-xs font-bold uppercase tracking-widest mb-2">
              {lang === "uk" ? "Унікальна перевага" : "Unique advantage"}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
              {lang === "uk" ? "Освітній IT-ХАБ — навчайтесь з 1 курсу" : "Educational IT-HUB — learn from year 1"}
            </h2>
            <p className="text-white/90 text-sm md:text-base leading-relaxed mb-5 max-w-2xl">
              {lang === "uk"
                ? "З першого року навчання ви отримуєте безкоштовний доступ до програм Cisco, Oracle та AWS. Це означає реальні навички, актуальні технології та сертифікати — ще до випуску."
                : "From your first year of studies, you get free access to Cisco, Oracle and AWS programs. That means real skills, current technologies and certificates — before graduation."}
            </p>
            <Link
              href="/hub"
              className="inline-flex items-center gap-2 text-sm font-bold bg-white text-violet-700 px-5 py-3 rounded-xl hover:bg-violet-50 transition-all shadow-xl hover:-translate-y-0.5 no-underline"
              data-testid="button-learn-hub"
            >
              <Sparkles className="w-4 h-4" />
              {lang === "uk" ? "Дізнатись про IT-ХАБ" : "Learn about IT-HUB"}
            </Link>
          </div>
          <div className="hidden md:flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold">3</span>
                <span className="text-[10px] uppercase tracking-widest text-white/80 mt-1">
                  {lang === "uk" ? "Академії" : "Academies"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADMISSION CONTACTS */}
      <section className="relative overflow-hidden bg-card border rounded-3xl p-6 md:p-10 shadow-sm">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-violet-500/5 blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shadow-lg">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {lang === "uk" ? "Приймальна комісія" : "Admissions Office"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {lang === "uk" ? "Зв'яжіться з нами для деталей про вступ" : "Contact us for admission details"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border bg-background p-5 hover:shadow-md hover:border-violet-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              {lang === "uk" ? "Адреса" : "Address"}
            </p>
            <p className="text-sm text-foreground leading-snug font-medium">
              {lang === "uk" ? "вул. Університетська, 31, м. Ірпінь, 08205" : "31 Universytetska St., Irpin, 08205"}
            </p>
          </div>
          <div className="rounded-2xl border bg-background p-5 hover:shadow-md hover:border-violet-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              {lang === "uk" ? "Телефон" : "Phone"}
            </p>
            <a href="tel:+380686193131" className="text-sm text-foreground hover:text-violet-600 dark:hover:text-violet-400 block font-medium" data-testid="link-admissions-phone">
              +38 (068) 619-31-31
            </a>
          </div>
          <div className="rounded-2xl border bg-background p-5 hover:shadow-md hover:border-violet-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Email</p>
            <a href="mailto:pr.usfsu@dpu.edu.ua" className="text-sm text-foreground hover:text-violet-600 dark:hover:text-violet-400 block break-all font-medium" data-testid="link-admissions-email">
              pr.usfsu@dpu.edu.ua
            </a>
          </div>
        </div>
        <a
          href="https://dpu.edu.ua/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-violet-600 dark:text-violet-400 hover:underline"
          data-testid="link-dpu-main"
        >
          <ExternalLink className="w-4 h-4" />
          {lang === "uk" ? "Перейти на офіційний сайт ДПУ" : "Open the official DPU website"}
        </a>
      </section>
    </div>
  );
}
