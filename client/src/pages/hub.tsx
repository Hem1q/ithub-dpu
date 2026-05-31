import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import {
  BookOpen,
  Users,
  Globe,
  Award,
  ChevronRight,
  GraduationCap,
  Building2,
  Cpu,
  Target,
  Lightbulb,
  Network,
  Database,
  Cloud,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  ExternalLink,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Link } from "wouter";
import stuLogo from "@assets/stu_logo_nobg.png";
import facultyLogo from "@assets/faculty_logo_nobg.png";
import kitsLogo from "@assets/kits_logo_nobg.png";

const stats = [
  { value: "3+", labelUk: "Технологічні напрями", labelEn: "Technology Tracks", icon: Cpu },
  { value: "100%", labelUk: "Безкоштовно для студентів", labelEn: "Free for Students", icon: Award },
  { value: "24/7", labelUk: "Доступ до матеріалів", labelEn: "Resource Access", icon: Globe },
  { value: "1000+", labelUk: "Студентів щороку", labelEn: "Students per Year", icon: Users },
];

const academies = [
  {
    name: "Cisco Academy",
    short: "Cisco Academy",
    since: "2007",
    hq: "San Francisco, California, USA",
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
    accent: "bg-blue-600",
    icon: Network,
    href: "/topic/cisco",
    websites: [
      { label: "cisco.com", url: "https://www.cisco.com" },
      { label: "netacad.com", url: "https://netacad.com" },
    ],
    taglineUk: "Програма «навички-для-роботи», що формує майбутню ІТ-кваліфіковану робочу силу",
    taglineEn: "Skills-to-jobs program shaping the future workforce",
    globalStats: [
      { value: "28М+", label: "учнів з 1997" },
      { value: "195", label: "країн світу" },
      { value: "12 100+", label: "академій" },
      { value: "4,7М", label: "учнів за рік" },
    ],
    globalStatsEn: [
      { value: "28M+", label: "learners since 1997" },
      { value: "195", label: "countries worldwide" },
      { value: "12,100+", label: "academies" },
      { value: "4.7M", label: "students per year" },
    ],
    certifications: ["CCNA", "CCNP", "CCST Cybersecurity", "CCST Networking", "CCST IT Support"],
    descUk:
      "Мережева академія Cisco — глобальна освітня програма Cisco Systems, одна з найдавніших у світі програм підготовки ІТ-кадрів. Спеціалізується на кібербезпеці, мережах, штучному інтелекті, аналізі даних та програмуванні. Використання ресурсів регламентується Заключенням МОНУ України від 26.06.2015 №141/12-Г-824.",
    descEn:
      "Cisco Networking Academy is Cisco's global educational program — one of the world's longest-running IT skills-to-jobs programs. It focuses on cybersecurity, networking, AI, data science and programming. Use of its resources is regulated by the Ukrainian Ministry of Education ruling of 26.06.2015 №141/12-G-824.",
    benefitsUk: [
      "У 2009 р. за сприяння Cisco за пільговими цінами придбано активне обладнання для лабораторії комп'ютерних мереж (В407)",
      "Постійний розвиток каталогу курсів для актуальних практичних навичок",
      "Глибокі знання нових технологій для участі у швидкозмінній світовій економіці",
    ],
    benefitsEn: [
      "In 2009, with Cisco's support, active equipment was purchased at preferential prices for the computer networks laboratory (B407)",
      "Continuous development of the course catalogue for current practical skills",
      "Deep knowledge of new technologies for participation in the rapidly changing global economy",
    ],
    coursesUk: ["Комп'ютерні мережі", "Мультисервісні технології інформаційних систем", "Операційні системи"],
    coursesEn: ["Computer Networks", "Multi-service Technologies of Information Systems", "Operating Systems"],
  },
  {
    name: "Oracle Academy",
    short: "Oracle Academy",
    since: "2017",
    hq: "Austin, Texas, USA",
    color: "from-red-500 to-red-700",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
    accent: "bg-red-600",
    icon: Database,
    href: "/topic/oracle",
    websites: [
      { label: "oracle.com", url: "https://oracle.com" },
      { label: "academy.oracle.com", url: "https://academy.oracle.com" },
    ],
    taglineUk: "Глобальна благодійна освітня програма Oracle",
    taglineEn: "Oracle's global philanthropic educational program",
    globalStats: [
      { value: "6,3М+", label: "студентів у світі" },
      { value: "15 000+", label: "освітніх установ" },
      { value: "128", label: "країн світу" },
      { value: "Безкоштовно", label: "членство для ЗВО" },
    ],
    globalStatsEn: [
      { value: "6.3M+", label: "students worldwide" },
      { value: "15,000+", label: "educational institutions" },
      { value: "128", label: "countries reached" },
      { value: "Free", label: "institutional membership" },
    ],
    certifications: ["Oracle Certified Professional (OCP)", "Oracle Database Certifications", "Oracle Cloud Infrastructure", "Java Foundations", "Oracle APEX Badges"],
    descUk:
      "Oracle Academy — глобальна благодійна освітня програма Oracle, відкрита для викладачів усього світу. Розвиває технологічну освіту, навички, інновації, різноманіття та інклюзію. Навчальні шляхи: Java, бази даних, хмара, управління проєктами, гостинність.",
    descEn:
      "Oracle Academy is Oracle's global philanthropic educational program, open to educators worldwide. It advances technology education, skills, innovation, diversity and inclusion. Learning pathways cover Java, database, cloud, project management and hospitality.",
    benefitsUk: [
      "Безкоштовне інституційне членство Університету",
      "Доступ до технологій світового класу та експертних навчальних планів",
      "Матеріали для підготовки до сертифікації Oracle Certification",
      "Ліцензії на ПЗ, робочі простори Oracle APEX та Oracle Academy Cloud Program",
    ],
    benefitsEn: [
      "Free institutional membership of the University",
      "Access to world-class technologies and expert learning paths",
      "Materials for Oracle Certification preparation",
      "Software licences, Oracle APEX workspaces and Oracle Academy Cloud Program",
    ],
    coursesUk: [
      "Організація баз даних та знань",
      "Веб-програмування",
      "Програмування нейронних мереж",
      "Машинне навчання та інтелектуальні технології у фінансах",
    ],
    coursesEn: [
      "Database and Knowledge Organisation",
      "Web Programming",
      "Neural Network Programming",
      "Machine Learning and Intelligent Technologies in Finance",
    ],
  },
  {
    name: "Amazon Web Services Academy",
    short: "AWS Academy",
    since: "2024",
    hq: "Seattle, Washington, USA",
    color: "from-orange-400 to-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-400",
    accent: "bg-orange-500",
    icon: Cloud,
    href: "/topic/amazon",
    websites: [
      { label: "aws.amazon.com", url: "https://aws.amazon.com" },
      { label: "awsacademy.com", url: "https://www.awsacademy.com/vforcesite/LMS_Login" },
    ],
    taglineUk: "Безкоштовний готовий до викладання навчальний план з хмарних обчислень",
    taglineEn: "Free, ready-to-teach cloud computing curriculum",
    globalStats: [
      { value: "1М+", label: "студентів у світі" },
      { value: "6 800+", label: "ЗВО-учасників" },
      { value: "120+", label: "країн світу" },
      { value: "12 + 4", label: "курси та лабораторії" },
    ],
    globalStatsEn: [
      { value: "1M+", label: "students reached" },
      { value: "6,800+", label: "member institutions" },
      { value: "120+", label: "countries globally" },
      { value: "12 + 4", label: "courses & labs" },
    ],
    certifications: ["AWS Certified Cloud Practitioner", "AWS Certified Solutions Architect – Associate", "AWS Certified Data Engineer", "AWS Certified Machine Learning"],
    descUk:
      "AWS Academy — програма Amazon Web Services, заснована у 2017 р., що надає закладам вищої освіти безкоштовний готовий до викладання навчальний план з хмарних обчислень. Готує студентів до отримання визнаних у галузі сертифікацій та затребуваних позицій у хмарі.",
    descEn:
      "AWS Academy is an Amazon Web Services program launched in 2017 that provides higher-education institutions with a free, ready-to-teach cloud-computing curriculum. It prepares students for industry-recognised certifications and in-demand cloud careers.",
    benefitsUk: [
      "Доступ до контенту AWS Academy та середовища AWS Academy Learner Lab",
      "Постійне оновлення контенту відповідно до нових сервісів AWS",
      "Розміщення Університету в каталозі установ-учасників AWS Academy",
      "Ваучери зі 100% знижкою на сертифікацію для викладачів",
    ],
    benefitsEn: [
      "Access to AWS Academy content and AWS Academy Learner Lab environment",
      "Continuous content updates reflecting new AWS services",
      "University listed in AWS Academy member catalogue",
      "100% discount certification vouchers for instructors",
    ],
    coursesUk: ["Великі дані та машинне навчання", "Технології баз даних та Big Data"],
    coursesEn: ["Big Data and Machine Learning", "Database Technologies and Big Data"],
  },
];

const educationalProgramsUk = [
  { level: "Бакалавр", name: "Інформаційні управляючі системи і технології" },
  { level: "Бакалавр", name: "Технології цифрового дизайну" },
  { level: "Магістр", name: "Комп'ютерні інтелектуальні технології" },
];

const educationalProgramsEn = [
  { level: "Bachelor", name: "Information Management Systems and Technologies" },
  { level: "Bachelor", name: "Digital Design Technologies" },
  { level: "Master", name: "Computer Intelligent Technologies" },
];

const facultyDepartmentsUk = [
  { name: "Кафедра публічних фінансів" },
  { name: "Кафедра фінансових ринків та технологій" },
  { name: "Кафедра вищої та прикладної математики" },
  { name: "Кафедра комп'ютерних та інформаційних технологій і систем", isHub: true },
  { name: "Навчальна лабораторія фінансових та інформаційних технологій" },
  { name: "Навчальна лабораторія цифрових проєктів", isHub: true },
];

const facultyDepartmentsEn = [
  { name: "Department of Public Finance" },
  { name: "Department of Financial Markets and Technologies" },
  { name: "Department of Higher and Applied Mathematics" },
  { name: "Department of Computer and Information Technologies and Systems", isHub: true },
  { name: "Educational Laboratory of Financial and Information Technologies" },
  { name: "Educational Laboratory of Digital Projects", isHub: true },
];

export default function Hub() {
  const { lang } = useLanguage();
  const programs = lang === "uk" ? educationalProgramsUk : educationalProgramsEn;
  const departments = lang === "uk" ? facultyDepartmentsUk : facultyDepartmentsEn;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-10">

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white px-8 py-14 shadow-2xl">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl p-3">
              <img src={stuLogo} alt="ДПУ" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <span className="inline-block py-1 px-4 rounded-full bg-white/15 text-white/90 text-xs font-semibold uppercase tracking-wider mb-4" data-testid="badge-university">
              {lang === "uk" ? "Державний податковий університет" : "State Tax University"}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight" data-testid="heading-hub-title">
              {lang === "uk" ? "Освітній IT-ХАБ" : "Educational IT-HUB"}
            </h1>
            <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-xl">
              {lang === "uk"
                ? "Інтегральне освітнє ІТ середовище кафедри КІТС факультету фінансів та цифрових технологій. Партнерство з Cisco (з 2007), Oracle (з 2017), AWS (з 2024)."
                : "An integrated educational IT environment of the DCITS department, Faculty of Finance and Digital Technologies. Partnerships with Cisco (since 2007), Oracle (since 2017), AWS (since 2024)."}
            </p>
            <a
              href="https://dpu.edu.ua/osvitnii-it-khab"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-xs text-blue-200/80 hover:text-blue-100 transition-colors"
              data-testid="link-official-page"
            >
              <ExternalLink className="w-3 h-3" />
              {lang === "uk" ? "Офіційна сторінка на dpu.edu.ua" : "Official page on dpu.edu.ua"}
            </a>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.labelUk}
            variants={item}
            className="bg-card border rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow"
            data-testid={`stat-${stat.value}`}
          >
            <stat.icon className="w-6 h-6 text-primary mx-auto mb-2 opacity-70" />
            <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide leading-snug">
              {lang === "uk" ? stat.labelUk : stat.labelEn}
            </p>
          </motion.div>
        ))}
      </motion.section>

      {/* MISSION */}
      <section className="bg-card border rounded-2xl p-8 shadow-sm" id="mission">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground" data-testid="heading-mission">
            {lang === "uk" ? "Місія Освітнього IT-хабу" : "Mission of the Educational IT-Hub"}
          </h2>
        </div>
        <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
          {lang === "uk" ? (
            <>
              <p>
                <strong className="text-foreground">Державний податковий університет</strong> є учасником
                міжнародних програм освітнього партнерства <strong>Cisco Academy</strong> (з 2007 р.),{" "}
                <strong>Oracle Academy</strong> (з 2017 р.) та <strong>AWS Academy</strong> (з 2024 р.).
              </p>
              <p>
                Вченою радою факультету фінансів та цифрових технологій підтримана ініціатива кафедри
                комп'ютерних та інформаційних технологій і систем створити на основі вказаних освітніх платформ
                інтегральне освітнє ІТ середовище — Освітній IT-хаб, який інформаційно та організаційно
                об'єднає вказані та інші освітні платформи (Microsoft, Google, IBM та ін.) для надання
                здобувачам освіти та НПП зручного доступу до інноваційного ресурсу для професійного зростання.
              </p>
              <p className="text-foreground font-medium border-l-4 border-primary pl-4 py-1 italic">
                Місія Освітнього IT-хабу — розширення можливостей академічної спільноти університету на основі
                інтеграції у навчально-наукові процеси методичних та обчислювальних ресурсів і сервісів
                провідних ІТ-корпорацій, формування практико-орієнтованого освітнього середовища, мотивації
                розвитку професійних цифрових компетенцій, виконання наукових досліджень та проєктів.
              </p>
              <p>
                Методично-навчальні, хмарні обчислювальні ресурси і сервіси зазначених освітніх програм
                надаються Університету корпораціями <strong>Cisco</strong>, <strong>Oracle</strong>,{" "}
                <strong>AWS</strong> на безкоштовній основі в рамках соціального партнерства.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong className="text-foreground">State Tax University</strong> participates in the
                international educational-partnership programs <strong>Cisco Academy</strong> (since 2007),{" "}
                <strong>Oracle Academy</strong> (since 2017) and <strong>AWS Academy</strong> (since 2024).
              </p>
              <p>
                The Academic Council of the Faculty of Finance and Digital Technologies supported the
                initiative of the Department of Computer and Information Technologies and Systems to create,
                based on these educational platforms, an integrated IT educational environment — the
                Educational IT-Hub, which will connect these and other platforms (Microsoft, Google, IBM, etc.)
                to provide students and faculty with convenient access to innovative resources for professional
                growth.
              </p>
              <p className="text-foreground font-medium border-l-4 border-primary pl-4 py-1 italic">
                The mission of the Educational IT-Hub is to expand the capabilities of the academic community
                through the integration of methodological and computing resources of leading IT corporations,
                build a practice-oriented learning environment, motivate the development of professional digital
                competencies, and support research and projects.
              </p>
              <p>
                Methodological materials and cloud computing resources of these programs are provided to the
                University by <strong>Cisco</strong>, <strong>Oracle</strong> and <strong>AWS</strong> free of
                charge as part of social partnership.
              </p>
            </>
          )}
        </div>
      </section>

      {/* EDUCATIONAL PROGRAMS */}
      <section className="bg-card border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {lang === "uk" ? "Освітні програми, у які інтегровано ресурси академій" : "Educational Programs Integrating Academy Resources"}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          {lang === "uk"
            ? "Інтеграція інноваційних навчальних матеріалів здійснюється у предметах циклу професійної підготовки за такими освітніми програмами:"
            : "Innovative learning materials are integrated into professional training courses of the following programs:"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {programs.map((p) => (
            <div key={p.name} className="rounded-xl border bg-background p-4" data-testid={`program-${p.name}`}>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded mb-2">
                {p.level}
              </span>
              <p className="text-sm font-semibold text-foreground leading-snug">{p.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS OF INTEGRATION */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground" data-testid="heading-benefits">
            {lang === "uk" ? "Переваги інтеграції міжнародних освітніх програм" : "Benefits of Integrating International Educational Programs"}
          </h2>
        </div>

        <div className="space-y-6">
          {academies.map((ac) => {
            const Icon = ac.icon;
            const benefits = lang === "uk" ? ac.benefitsUk : ac.benefitsEn;
            const courses = lang === "uk" ? ac.coursesUk : ac.coursesEn;
            const desc = lang === "uk" ? ac.descUk : ac.descEn;
            const tagline = lang === "uk" ? ac.taglineUk : ac.taglineEn;
            const stats = lang === "uk" ? ac.globalStats : ac.globalStatsEn;
            return (
              <div
                key={ac.name}
                className={`rounded-2xl border p-6 md:p-8 ${ac.bg} ${ac.border}`}
                data-testid={`academy-${ac.short}`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Header */}
                  <div className="md:w-1/3 flex flex-col gap-3">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${ac.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className={`font-bold text-lg ${ac.text}`}>{ac.name}</h3>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-start gap-1.5 text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>{lang === "uk" ? `Партнерство з ${ac.since} р.` : `Partnership since ${ac.since}`}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>{ac.hq}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ac.websites.map((w) => (
                          <a
                            key={w.url}
                            href={w.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${ac.text} hover:underline`}
                            data-testid={`link-${w.label}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            {w.label}
                          </a>
                        ))}
                      </div>
                    </div>
                    <Link href={ac.href}>
                      <button
                        className={`mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-lg ${ac.accent} hover:opacity-90 transition-opacity w-full`}
                        data-testid={`button-go-${ac.short}`}
                      >
                        {lang === "uk" ? "Перейти до модуля" : "Go to module"}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="md:w-2/3 space-y-4">
                    <p className={`text-xs italic ${ac.text} font-semibold`} data-testid={`tagline-${ac.short}`}>
                      «{tagline}»
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>

                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${ac.text} mb-2`}>
                        {lang === "uk" ? "Глобальна статистика програми" : "Global program stats"}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {stats.map((s) => (
                          <div
                            key={s.label}
                            className={`rounded-lg border p-2.5 bg-background ${ac.border}`}
                            data-testid={`stat-${ac.short}-${s.label}`}
                          >
                            <div className={`text-base font-bold ${ac.text} leading-tight`}>{s.value}</div>
                            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${ac.text} mb-2`}>
                        {lang === "uk" ? "Сертифікації" : "Certifications"}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {ac.certifications.map((c) => (
                          <span
                            key={c}
                            className={`text-[11px] px-2 py-0.5 rounded ${ac.accent} text-white font-medium`}
                            data-testid={`cert-${ac.short}-${c}`}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${ac.text} mb-2`}>
                        {lang === "uk" ? "Переваги участі" : "Benefits"}
                      </h4>
                      <ul className="space-y-1.5">
                        {benefits.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ac.text}`} />
                            <span className="leading-snug">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${ac.text} mb-2`}>
                        {lang === "uk" ? "Використовується у дисциплінах" : "Used in courses"}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {courses.map((c) => (
                          <span
                            key={c}
                            className={`text-xs px-2.5 py-1 rounded-md bg-background border ${ac.border} text-foreground/80`}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FACULTY DEPARTMENTS */}
      <section className="bg-card border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <img src={facultyLogo} alt="ФФЦТ" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {lang === "uk" ? "Факультет" : "Faculty"}
            </p>
            <h2 className="text-xl font-bold text-foreground">
              {lang === "uk" ? "Фінансів та цифрових технологій" : "Finance and Digital Technologies"}
            </h2>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3 mb-5">
          {lang === "uk"
            ? "Освітній IT-хаб функціонує на базі кафедри КІТС та лабораторії цифрових проєктів ФФЦТ. Положення про Освітній IT-хаб затверджено Вченою радою ФФЦТ 10.02.2026 р."
            : "The Educational IT-Hub operates on the basis of the DCITS department and the Digital Projects Laboratory of FFDT. The Hub statute was approved by the Academic Council of FFDT on 10.02.2026."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {departments.map((d) => (
            <div
              key={d.name}
              className={`rounded-lg border p-3 flex items-start gap-3 ${
                d.isHub
                  ? "bg-primary/5 border-primary/30"
                  : "bg-background"
              }`}
              data-testid={`dept-${d.name}`}
            >
              <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${d.isHub ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug">{d.name}</p>
                {d.isHub && (
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {lang === "uk" ? "База IT-хабу" : "IT-Hub base"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTS */}
      <section className="bg-card border rounded-2xl p-8 shadow-sm" id="coordinator">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {lang === "uk" ? "Контакти" : "Contacts"}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border p-4 bg-background">
            <MapPin className="w-5 h-5 text-primary mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              {lang === "uk" ? "Адреса" : "Address"}
            </p>
            <p className="text-sm text-foreground leading-snug">
              {lang === "uk"
                ? "вул. Університетська, 31, м. Ірпінь, 08205, Київська область"
                : "31 Universytetska St., Irpin, 08205, Kyiv Region"}
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-background">
            <Phone className="w-5 h-5 text-primary mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              {lang === "uk" ? "Телефон" : "Phone"}
            </p>
            <a href="tel:+380443632711" className="text-sm text-foreground hover:text-primary block" data-testid="link-phone-1">
              (044) 363 27 11
            </a>
            <a href="tel:+380686193131" className="text-sm text-foreground hover:text-primary block mt-1" data-testid="link-phone-2">
              +38 (068) 619-31-31
            </a>
          </div>
          <div className="rounded-lg border p-4 bg-background">
            <Mail className="w-5 h-5 text-primary mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Email</p>
            <a href="mailto:pr.usfsu@dpu.edu.ua" className="text-sm text-foreground hover:text-primary block break-all" data-testid="link-email-1">
              pr.usfsu@dpu.edu.ua
            </a>
            <a href="mailto:11.02@dpu.edu.ua" className="text-sm text-foreground hover:text-primary block mt-1 break-all" data-testid="link-email-2">
              11.02@dpu.edu.ua
            </a>
          </div>
          <div className="rounded-lg border p-4 bg-background md:col-span-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  {lang === "uk" ? "Координатор IT-хабу" : "IT-Hub Coordinator"}
                </p>
                <p className="text-sm text-foreground leading-snug mb-2">
                  {lang === "uk"
                    ? "Запитання щодо реєстрації, інструкторства або співпраці з академіями — пишіть координатору."
                    : "For questions about registration, instructorship or academy partnerships — contact the coordinator."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href="https://www.linkedin.com/in/redych/" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg transition-colors"
                    data-testid="link-coordinator-linkedin">
                    <Linkedin className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                  <a href="mailto:11.02@dpu.edu.ua"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg transition-colors"
                    data-testid="link-coordinator-email">
                    <Mail className="w-3.5 h-3.5" />
                    {lang === "uk" ? "Написати" : "Write"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
