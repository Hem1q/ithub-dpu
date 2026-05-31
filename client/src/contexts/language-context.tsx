import { createContext, useContext, useState } from "react";

type Language = "uk" | "en";

interface Translations {
  // Navigation
  homeNav: string;
  leaderboard: string;
  login: string;
  register: string;
  logout: string;
  // Hero
  hubLabel: string;
  hubTitle: string;
  hubSubtitle: string;
  hubDescription: string;
  // Stats
  statTech: string;
  statStudents: string;
  statAccess: string;
  statFree: string;
  statFreeValue: string;
  // Sidebar
  academyBanners: string;
  latestNews: string;
  newsComingSoon: string;
  bannerPlaceholder: string;
  // Institution
  universityLabel: string;
  universityName: string;
  universityShort: string;
  facultyLabel: string;
  facultyName: string;
  facultyShort: string;
  departmentLabel: string;
  departmentName: string;
  departmentShort: string;
  // Nav brand
  portalWord: string;
  // Footer
  footerRights: string;
  footerShort: string;
  // Topics section
  topicsTitle: string;
  learnMore: string;
  // Hub label in banner subtitle line
  hubBannerUk: string;
  hubBannerEn: string;
  hubBannerLabel: string;
  // University info widget
  universityInfoTitle: string;
  universityInfoHeading: string;
  universityInfoDesc: string;
}

export interface TopicTranslation {
  name: string;
  description: string;
}

export const topicTranslations: Record<Language, Record<string, TopicTranslation>> = {
  uk: {
    oracle: {
      name: "Oracle",
      description: "Хмарна інфраструктура та технології баз даних.",
    },
    amazon: {
      name: "Amazon Web Services",
      description: "Хмарні платформи обчислень та API за попитом.",
    },
    cisco: {
      name: "Cisco Systems",
      description: "Мережеве обладнання, програмне забезпечення та телекомунікаційне устаткування.",
    },
  },
  en: {
    oracle: {
      name: "Oracle",
      description: "Cloud infrastructure and database technologies.",
    },
    amazon: {
      name: "Amazon Web Services",
      description: "On-demand cloud computing platforms and APIs.",
    },
    cisco: {
      name: "Cisco Systems",
      description: "Networking hardware, software and telecommunications equipment.",
    },
  },
};

const uk: Translations = {
  homeNav: "Головна",
  leaderboard: "Таблиця лідерів",
  login: "Увійти",
  register: "Реєстрація",
  logout: "Вийти",
  hubLabel: "Освітній ІТ хаб",
  hubTitle: "Опануйте технології",
  hubSubtitle: "майбутнього",
  hubDescription: "Ваш централізований ресурс для вивчення технологій Oracle, Amazon та Cisco. Приєднуйтесь до студентської спільноти та відстежуйте свій прогрес.",
  statTech: "Основні технології",
  statStudents: "Зосереджено на студентів",
  statAccess: "Доступ до ресурсів",
  statFree: "Безкоштовно для студентів",
  statFreeValue: "Безпл.",
  academyBanners: "Академії при ДПУ",
  latestNews: "Останні новини",
  newsComingSoon: "Новини незабаром...",
  bannerPlaceholder: "Банер академії",
  universityLabel: "Університет",
  universityName: "Державний податковий університет",
  universityShort: "ДПУ",
  facultyLabel: "Факультет",
  facultyName: "Факультет фінансів та цифрових технологій",
  facultyShort: "ФФЦТ",
  departmentLabel: "Кафедра",
  departmentName: "Кафедра комп'ютерних та інформаційних технологій і систем",
  departmentShort: "КІТС",
  portalWord: "Портал",
  footerRights: "© 2024 Освітній ІТ хаб. Усі права захищені.",
  footerShort: "ДПУ · ФФЦТ · КІТС",
  topicsTitle: "Технологічні напрями",
  learnMore: "Дізнатися більше",
  hubBannerUk: "Освітній ІТ Хаб",
  hubBannerEn: "Educational IT Hub",
  hubBannerLabel: "Освітній",
  universityInfoTitle: "Цікава інформація",
  universityInfoHeading: "IT-HUB",
  universityInfoDesc: "Інформація від університету",
};

const en: Translations = {
  homeNav: "Home",
  leaderboard: "Leaderboard",
  login: "Log In",
  register: "Register",
  logout: "Log Out",
  hubLabel: "Educational IT Hub",
  hubTitle: "Master the Technologies",
  hubSubtitle: "of the Future",
  hubDescription: "Your centralized resource for learning Oracle, Amazon, and Cisco technologies. Join the student community and track your progress.",
  statTech: "Core Technologies",
  statStudents: "Student Focused",
  statAccess: "Resource Access",
  statFree: "Free for Students",
  statFreeValue: "Free",
  academyBanners: "Academies at STU",
  latestNews: "Latest News",
  newsComingSoon: "News coming soon...",
  bannerPlaceholder: "Academy Banner",
  universityLabel: "University",
  universityName: "State Tax University",
  universityShort: "STU",
  facultyLabel: "Faculty",
  facultyName: "Faculty of Finance and Digital Technologies",
  facultyShort: "FFDT",
  departmentLabel: "Department",
  departmentName: "Department of Computer and Information Technologies and Systems",
  departmentShort: "DCITS",
  portalWord: "Portal",
  footerRights: "© 2024 Educational IT Hub. All rights reserved.",
  footerShort: "STU · FFDT · DCITS",
  topicsTitle: "Technology Tracks",
  learnMore: "Learn more",
  hubBannerUk: "Освітній ІТ Хаб",
  hubBannerEn: "Educational IT Hub",
  hubBannerLabel: "Educational",
  universityInfoTitle: "Interesting Info",
  universityInfoHeading: "IT-HUB",
  universityInfoDesc: "Information from the university",
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "uk",
  setLang: () => {},
  t: uk,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("uk");
  const t = lang === "uk" ? uk : en;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
