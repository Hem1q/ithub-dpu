import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

const allNewsUk = [
  { id: 1, title: "Нові курси Oracle Database 21c доступні", date: "20 березня 2026", category: "oracle", text: "Oracle Academy відкрила доступ до нових навчальних матеріалів з Oracle Database 21c. Курс охоплює роботу з автономними базами даних, JSON-документами та покращеними механізмами безпеки.", href: "/topic/oracle" },
  { id: 2, title: "AWS Cloud Practitioner – набір відкрито", date: "18 березня 2026", category: "aws", text: "AWS Educate оголосила про відкриття набору на безкоштовну сертифікацію Cloud Practitioner для студентів університетів-партнерів. Реєстрація через портал AWS Educate.", href: "/topic/amazon" },
  { id: 3, title: "Cisco CCNA – весняний семестр", date: "15 березня 2026", category: "cisco", text: "Cisco NetAcad розпочинає весняний семестр CCNA. Студенти КІТС мають пріоритетний доступ. Курс охоплює основи мереж, маршрутизацію та базову безпеку.", href: "/topic/cisco" },
  { id: 4, title: "Оновлення платформи Oracle Cloud Infrastructure", date: "12 березня 2026", category: "oracle", text: "Oracle оновила документацію та навчальні матеріали OCI. Новий розділ присвячений Kubernetes та контейнеризації в хмарному середовищі.", href: "/topic/oracle" },
  { id: 5, title: "AWS re:Invent 2026 – ключові анонси", date: "10 березня 2026", category: "aws", text: "Amazon Web Services представила нові сервіси на конференції re:Invent. Серед ключових новинок – оновлений AWS Bedrock та покращені інструменти безпеки.", href: "/topic/amazon" },
  { id: 6, title: "Cisco DevNet: нові курси по автоматизації мереж", date: "8 березня 2026", category: "cisco", text: "Cisco DevNet розширив навчальний каталог новими модулями з автоматизації мереж, API-програмування та Python для мережевих інженерів.", href: "/topic/cisco" },
  { id: 7, title: "Oracle Java SE 21 – оновлення сертифікації", date: "5 березня 2026", category: "oracle", text: "Oracle оновила програму сертифікації Java SE до версії 21. Нові екзамени включають модулі з virtual threads, sealed classes та pattern matching.", href: "/topic/oracle" },
  { id: 8, title: "AWS Scholarship Program для студентів 2026", date: "3 березня 2026", category: "aws", text: "Amazon Web Services оголошує стипендіальну програму для студентів технічних спеціальностей. Переможці отримають безкоштовні сертифікації та доступ до AWS Credits.", href: "/topic/amazon" },
  { id: 9, title: "Cisco CyberOps – захист від кіберзагроз", date: "28 лютого 2026", category: "cisco", text: "Cisco NetAcad запустила оновлений курс CyberOps Associate. Матеріал охоплює аналіз інцидентів, моніторинг мережі та реагування на загрози.", href: "/topic/cisco" },
  { id: 10, title: "КІТС: результати зимової сесії та нагороди", date: "25 лютого 2026", category: "general", text: "Кафедра комп'ютерних та інформаційних технологій підвела підсумки зимової сесії. Студентам-відмінникам вручено сертифікати Oracle Academy та Cisco NetAcad.", href: "/hub" },
  { id: 11, title: "Oracle APEX: розробка без коду", date: "22 лютого 2026", category: "oracle", text: "Новий міні-курс Oracle APEX доступний для студентів. Платформа дозволяє створювати бізнес-додатки без написання коду, використовуючи візуальний конструктор.", href: "/topic/oracle" },
  { id: 12, title: "AWS SageMaker: машинне навчання в хмарі", date: "18 лютого 2026", category: "aws", text: "AWS Educate додала нові лабораторні роботи з Amazon SageMaker. Студенти зможуть тренувати та розгортати ML-моделі в середовищі AWS.", href: "/topic/amazon" },
];

const allNewsEn = [
  { id: 1, title: "New Oracle Database 21c courses available", date: "March 20, 2026", category: "oracle", text: "Oracle Academy has opened access to new learning materials for Oracle Database 21c covering autonomous databases, JSON documents, and enhanced security mechanisms.", href: "/topic/oracle" },
  { id: 2, title: "AWS Cloud Practitioner – enrollment open", date: "March 18, 2026", category: "aws", text: "AWS Educate announced free Cloud Practitioner certification enrollment for students of partner universities. Register through the AWS Educate portal.", href: "/topic/amazon" },
  { id: 3, title: "Cisco CCNA – spring semester", date: "March 15, 2026", category: "cisco", text: "Cisco NetAcad begins the spring CCNA semester. KITiS students have priority access. The course covers network fundamentals, routing, and basic security.", href: "/topic/cisco" },
  { id: 4, title: "Oracle Cloud Infrastructure platform update", date: "March 12, 2026", category: "oracle", text: "Oracle updated OCI documentation and learning materials. A new section is dedicated to Kubernetes and containerization in cloud environments.", href: "/topic/oracle" },
  { id: 5, title: "AWS re:Invent 2026 – key announcements", date: "March 10, 2026", category: "aws", text: "Amazon Web Services presented new services at re:Invent. Key highlights include updated AWS Bedrock and improved security tools.", href: "/topic/amazon" },
  { id: 6, title: "Cisco DevNet: new network automation courses", date: "March 8, 2026", category: "cisco", text: "Cisco DevNet expanded its catalog with new modules on network automation, API programming, and Python for network engineers.", href: "/topic/cisco" },
  { id: 7, title: "Oracle Java SE 21 – certification update", date: "March 5, 2026", category: "oracle", text: "Oracle updated the Java SE certification program to version 21. New exams include modules on virtual threads, sealed classes, and pattern matching.", href: "/topic/oracle" },
  { id: 8, title: "AWS Scholarship Program for students 2026", date: "March 3, 2026", category: "aws", text: "Amazon Web Services announces a scholarship program for technical students. Winners receive free certifications and AWS Credits access.", href: "/topic/amazon" },
  { id: 9, title: "Cisco CyberOps – cyber threat protection", date: "February 28, 2026", category: "cisco", text: "Cisco NetAcad launched an updated CyberOps Associate course covering incident analysis, network monitoring, and threat response.", href: "/topic/cisco" },
  { id: 10, title: "KITiS: winter session results and awards", date: "February 25, 2026", category: "general", text: "The Department of Computer and Information Technologies summarized winter session results. Top students received Oracle Academy and Cisco NetAcad certificates.", href: "/hub" },
  { id: 11, title: "Oracle APEX: no-code application development", date: "February 22, 2026", category: "oracle", text: "A new Oracle APEX mini-course is available for students. The platform allows building business apps without writing code using a visual designer.", href: "/topic/oracle" },
  { id: 12, title: "AWS SageMaker: machine learning in the cloud", date: "February 18, 2026", category: "aws", text: "AWS Educate added new SageMaker lab exercises. Students can train and deploy ML models in the AWS environment.", href: "/topic/amazon" },
];

const ITEMS_PER_PAGE = 6;

const categoryColors: Record<string, string> = {
  oracle: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  aws: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  cisco: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  general: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const categoryLabelsUk: Record<string, string> = { oracle: "Oracle", aws: "AWS", cisco: "Cisco", general: "Загальне" };
const categoryLabelsEn: Record<string, string> = { oracle: "Oracle", aws: "AWS", cisco: "Cisco", general: "General" };

export default function NewsPage() {
  const { lang } = useLanguage();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>("all");

  const allNews = lang === "uk" ? allNewsUk : allNewsEn;
  const filtered = filter === "all" ? allNews : allNews.filter(n => n.category === filter);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const labels = {
    uk: { title: "Новини", subtitle: "Останні події та оголошення", all: "Усі", readMore: "Читати", page: "Сторінка" },
    en: { title: "News", subtitle: "Latest events and announcements", all: "All", readMore: "Read", page: "Page" },
  }[lang];

  const categoryLabels = lang === "uk" ? categoryLabelsUk : categoryLabelsEn;

  const handleFilter = (f: string) => {
    setFilter(f);
    setPage(1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Newspaper className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{labels.title}</h1>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "oracle", "aws", "cisco", "general"].map(cat => (
          <button key={cat} onClick={() => handleFilter(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
              filter === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}>
            {cat === "all" ? labels.all : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* News list */}
      <div className="space-y-4">
        {paged.map(n => (
          <div key={n.id} className="bg-white dark:bg-card rounded-xl border border-border/60 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={cn("text-xs font-medium border-0", categoryColors[n.category])}>
                    {categoryLabels[n.category]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{n.date}</span>
                </div>
                <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                  {n.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{n.text}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/40">
              <Link href={n.href}>
                <button className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors" data-testid={`link-news-${n.id}`}>
                  <span>{labels.readMore}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            data-testid="button-prev-page">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {labels.page} {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            data-testid="button-next-page">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
