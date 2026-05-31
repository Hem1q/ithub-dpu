import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { api } from "@shared/routes";

const getSession = () => {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
    },
  });
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || user.password !== password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const { firstName, lastName, patronymic, gender, birthYear, phone, email, region, city, faculty, specialty, course, academicGroup } = req.body;

      const user = await storage.createUser({
        username,
        password,
        firstName: firstName || null,
        lastName: lastName || null,
        patronymic: patronymic || null,
        gender: gender || null,
        birthYear: birthYear || null,
        phone: phone || null,
        email: email || null,
        region: region || null,
        city: city || null,
        faculty: faculty || null,
        specialty: specialty || null,
        course: course || null,
        academicGroup: academicGroup || null,
      });

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        req.session.save((err) => {
          if (err) {
            return res.status(500).json({ message: "Session save failed" });
          }
          res.json({ message: "Registration successful", user });
        });
      });
    } catch (error) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Login error" });
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Invalid credentials" });
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        req.session.save((err) => {
          if (err) {
            return res.status(500).json({ message: "Session save failed" });
          }
          res.json({ message: "Login successful", user });
        });
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logOut((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get(api.topics.list.path, async (_req, res) => {
    const topics = await storage.getTopics();
    res.json(topics);
  });

  app.get(api.topics.get.path, async (req, res) => {
    const topic = await storage.getTopicBySlug(req.params.slug);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }
    res.json(topic);
  });
  
  app.get(api.user.get.path, (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).send("Not logged in");
  });

  app.patch("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const { firstName, lastName, email } = req.body;
    const updated = await storage.updateUser((req.user as any).id, { firstName, lastName, email });
    res.json(updated);
  });

  app.get("/api/users/leaderboard", async (_req, res) => {
    const usersWithProgress = await storage.getAllUsersWithProgress();
    res.json(usersWithProgress);
  });

  app.get("/api/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not logged in" });
    const userProgress = await storage.getUserProgress((req.user as any).id);
    res.json(userProgress);
  });

  app.post("/api/quiz/result", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not logged in" });
    const { topicSlug, score, totalQuestions } = req.body;
    if (!topicSlug || score === undefined || !totalQuestions) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const userId = (req.user as any).id;
    const result = await storage.saveQuizResult({
      userId,
      topicSlug,
      score,
      totalQuestions,
      completedAt: new Date().toISOString(),
    });
    if (score >= Math.ceil(totalQuestions * 0.6)) {
      await storage.markProgressCompleted(userId, topicSlug);
    }
    res.json(result);
  });

  app.get("/api/quiz/results", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not logged in" });
    const results = await storage.getUserQuizResults((req.user as any).id);
    res.json(results);
  });

  app.get("/api/polls", async (req, res) => {
    const activePolls = await storage.getActivePolls();
    if (!req.isAuthenticated()) {
      return res.json(activePolls.map(p => ({ ...p, userResponse: null, userResponses: null, results: [] })));
    }
    const userId = (req.user as any).id;
    const enriched = await Promise.all(activePolls.map(async (poll) => {
      const userResponse = await storage.getPollResponse(poll.id, userId);
      const results = await storage.getPollResults(poll.id);
      let userResponses: number[] | null = null;
      if (userResponse?.selectedOptions) {
        try { userResponses = JSON.parse(userResponse.selectedOptions); } catch {}
      } else if (userResponse) {
        userResponses = [userResponse.selectedOption];
      }
      return { ...poll, userResponse: userResponse?.selectedOption ?? null, userResponses, results };
    }));
    res.json(enriched);
  });

  app.post("/api/polls/:id/respond", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not logged in" });
    const pollId = Number(req.params.id);
    const { selectedOption, selectedOptions } = req.body;
    if (selectedOption === undefined && !selectedOptions) {
      return res.status(400).json({ message: "selectedOption or selectedOptions required" });
    }
    const userId = (req.user as any).id;
    const existing = await storage.getPollResponse(pollId, userId);
    if (existing) return res.status(400).json({ message: "Already responded" });
    const mainOption = Array.isArray(selectedOptions) ? selectedOptions[0] : selectedOption;
    const response = await storage.savePollResponse({
      pollId,
      userId,
      selectedOption: mainOption ?? 0,
      selectedOptions: Array.isArray(selectedOptions) ? JSON.stringify(selectedOptions) : null,
      respondedAt: new Date().toISOString(),
    });
    const results = await storage.getPollResults(pollId);
    res.json({ response, results });
  });

  app.get("/api/stats/overview", async (_req, res) => {
    const allUsers = await storage.getAllUsersWithProgress();
    const allTopics = await storage.getTopics();
    const allResponses = await storage.getAllPollResponses();
    const allFeedbacks = await storage.getAllFeedbackResponses();

    const regionDist: Record<string, number> = {};
    const specialtyDist: Record<string, number> = {};
    const courseDist: Record<string, number> = {};

    for (const u of allUsers) {
      if (u.region) regionDist[u.region] = (regionDist[u.region] || 0) + 1;
      if (u.specialty) specialtyDist[u.specialty] = (specialtyDist[u.specialty] || 0) + 1;
      if (u.course) courseDist[u.course] = (courseDist[u.course] || 0) + 1;
    }

    res.json({
      totalUsers: allUsers.length,
      totalTopics: allTopics.length,
      totalCompleted: allUsers.reduce((s, u) => s + u.completedTopics, 0),
      totalPollResponses: allResponses.length,
      totalFeedbacks: allFeedbacks.length,
      regionDist,
      specialtyDist,
      courseDist,
      topPerformers: allUsers
        .sort((a, b) => b.completedTopics - a.completedTopics)
        .slice(0, 10)
        .map(u => ({
          id: u.id,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          region: u.region,
          specialty: u.specialty,
          course: u.course,
          completedTopics: u.completedTopics,
        })),
    });
  });

  app.get("/api/admin/poll-analytics", async (_req, res) => {
    const allPolls = await storage.getActivePolls();
    const allResponses = await storage.getAllPollResponses();
    const allUsers = await storage.getAllUsersWithProgress();
    const userMap = Object.fromEntries(allUsers.map(u => [u.id, u]));

    const polls = allPolls.map(poll => {
      const responses = allResponses.filter(r => r.pollId === poll.id);

      const optionCounts: Record<number, number> = {};
      poll.optionsUk.forEach((_, i) => { optionCounts[i] = 0; });
      responses.forEach(r => { optionCounts[r.selectedOption] = (optionCounts[r.selectedOption] || 0) + 1; });

      const byRegion: Record<string, number> = {};
      const byCourse: Record<string, number> = {};
      const byGender: Record<string, number> = {};
      const bySpecialty: Record<string, number> = {};

      const detailed = responses
        .sort((a, b) => (b.respondedAt || "").localeCompare(a.respondedAt || ""))
        .map(r => {
          const user = userMap[r.userId];
          if (user) {
            if (user.region) byRegion[user.region] = (byRegion[user.region] || 0) + 1;
            if (user.course) byCourse[user.course] = (byCourse[user.course] || 0) + 1;
            if (user.gender) byGender[user.gender] = (byGender[user.gender] || 0) + 1;
            if (user.specialty) bySpecialty[user.specialty] = (bySpecialty[user.specialty] || 0) + 1;
          }
          return {
            responseId: r.id,
            userId: r.userId,
            username: user?.username || `#${r.userId}`,
            firstName: user?.firstName || null,
            lastName: user?.lastName || null,
            region: user?.region || null,
            course: user?.course || null,
            specialty: user?.specialty || null,
            gender: user?.gender || null,
            selectedOption: r.selectedOption,
            selectedOptionTextUk: poll.optionsUk[r.selectedOption] || `#${r.selectedOption}`,
            selectedOptionTextEn: poll.optionsEn[r.selectedOption] || `#${r.selectedOption}`,
            respondedAt: r.respondedAt,
          };
        });

      return {
        id: poll.id,
        questionUk: poll.questionUk,
        questionEn: poll.questionEn,
        optionsUk: poll.optionsUk,
        optionsEn: poll.optionsEn,
        totalResponses: responses.length,
        optionBreakdown: poll.optionsUk.map((_label, i) => ({
          index: i,
          labelUk: poll.optionsUk[i],
          labelEn: poll.optionsEn[i],
          count: optionCounts[i] || 0,
        })),
        byRegion: Object.entries(byRegion).map(([k, v]) => ({ key: k, count: v })).sort((a, b) => b.count - a.count),
        byCourse: Object.entries(byCourse).map(([k, v]) => ({ key: k, count: v })).sort((a, b) => b.count - a.count),
        byGender: Object.entries(byGender).map(([k, v]) => ({ key: k, count: v })).sort((a, b) => b.count - a.count),
        bySpecialty: Object.entries(bySpecialty).map(([k, v]) => ({ key: k, count: v })).sort((a, b) => b.count - a.count),
        detailed,
      };
    });

    res.json({ polls });
  });

  app.get("/api/admin/poll-responses.csv", async (_req, res) => {
    const allPolls = await storage.getActivePolls();
    const pollMap = Object.fromEntries(allPolls.map(p => [p.id, p]));
    const allResponses = await storage.getAllPollResponses();
    const allUsers = await storage.getAllUsersWithProgress();
    const userMap = Object.fromEntries(allUsers.map(u => [u.id, u]));

    const headers = [
      "response_id", "poll_id", "question_uk",
      "user_id", "username", "first_name", "last_name",
      "region", "city", "faculty", "specialty", "course", "academic_group", "gender", "birth_year",
      "selected_option_index", "selected_option_text", "responded_at",
    ];

    const escapeCsv = (v: any) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (/[",\n;]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };

    const lines = [headers.join(",")];
    for (const r of allResponses) {
      const poll = pollMap[r.pollId];
      const user = userMap[r.userId];
      lines.push([
        r.id,
        r.pollId,
        poll?.questionUk || "",
        r.userId,
        user?.username || "",
        user?.firstName || "",
        user?.lastName || "",
        user?.region || "",
        user?.city || "",
        user?.faculty || "",
        user?.specialty || "",
        user?.course || "",
        user?.academicGroup || "",
        user?.gender || "",
        user?.birthYear || "",
        r.selectedOption,
        poll?.optionsUk[r.selectedOption] || "",
        r.respondedAt,
      ].map(escapeCsv).join(","));
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="poll-responses-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send("\uFEFF" + lines.join("\n"));
  });

  app.get("/api/admin/stats", async (_req, res) => {
    const allUsers = await storage.getAllUsersWithProgress();
    const allTopics = await storage.getTopics();
    const totalCompleted = allUsers.reduce((s, u) => s + u.completedTopics, 0);
    res.json({
      totalUsers: allUsers.length,
      totalTopics: allTopics.length,
      totalCompleted,
      users: allUsers.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        isAdmin: u.isAdmin,
        completedTopics: u.completedTopics,
      })),
      topics: allTopics.map(t => ({ id: t.id, slug: t.slug, name: t.name })),
    });
  });

  // Seed polls — always ensure all polls exist
  const existingPolls = await storage.getActivePolls();
  const existingQuestions = existingPolls.map(p => p.questionUk);

  const pollsToSeed = [
    {
      questionUk: "Що б ви хотіли покращити або додати на платформі?",
      questionEn: "What would you like to improve or add to the platform?",
      optionsUk: ["Більше навчальних матеріалів", "Інтерактивні завдання та лабораторні роботи", "Відеолекції та вебінари", "Форум для обговорення та спілкування", "Мобільний додаток"],
      optionsEn: ["More learning materials", "Interactive tasks and lab assignments", "Video lectures and webinars", "Discussion forum and community", "Mobile application"],
      isActive: true,
      multipleChoice: true,
      createdAt: new Date().toISOString(),
    },
    {
      questionUk: "Як ви оцінюєте зручність платформи?",
      questionEn: "How do you rate the platform usability?",
      optionsUk: ["Відмінно – зручно та зрозуміло", "Добре – є незначні незручності", "Задовільно – потребує покращень", "Незадовільно – складно користуватись"],
      optionsEn: ["Excellent – convenient and clear", "Good – minor inconveniences", "Satisfactory – needs improvements", "Unsatisfactory – hard to use"],
      isActive: true,
      multipleChoice: false,
      createdAt: new Date().toISOString(),
    },
    {
      questionUk: "Які академії вас цікавлять найбільше?",
      questionEn: "Which academies interest you the most?",
      optionsUk: ["Oracle Academy", "AWS Academy", "Cisco Networking Academy", "Всі однаково"],
      optionsEn: ["Oracle Academy", "AWS Academy", "Cisco Networking Academy", "All equally"],
      isActive: true,
      multipleChoice: true,
      createdAt: new Date().toISOString(),
    },
    {
      questionUk: "Яка мета вашого навчання на платформі?",
      questionEn: "What is your learning goal on the platform?",
      optionsUk: ["Отримати сертифікат", "Підвищити кваліфікацію", "Знайти роботу", "Загальний розвиток"],
      optionsEn: ["Get a certificate", "Upskill professionally", "Find a job", "General development"],
      isActive: true,
      multipleChoice: false,
      createdAt: new Date().toISOString(),
    },
    {
      questionUk: "Скільки годин на тиждень ви готові присвячувати навчанню?",
      questionEn: "How many hours per week can you dedicate to learning?",
      optionsUk: ["До 2 годин", "2–5 годин", "5–10 годин", "Більше 10 годин"],
      optionsEn: ["Up to 2 hours", "2–5 hours", "5–10 hours", "More than 10 hours"],
      isActive: true,
      multipleChoice: false,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const poll of pollsToSeed) {
    if (!existingQuestions.includes(poll.questionUk)) {
      await storage.createPoll(poll);
    }
  }

  // Seed topics if empty (rich content sourced from official netacad.com / academy.oracle.com / aws.amazon.com)
  const { ciscoSubTopics, oracleSubTopics, awsSubTopics, asStrings, parseSubTopic } = await import("@shared/topic-subtopics");
  const existingTopics = await storage.getTopics();
  if (existingTopics.length === 0) {
    await storage.createTopic({
      slug: "oracle",
      name: "Oracle Academy",
      description: "Глобальна благодійна освітня програма Oracle для викладачів усього світу — Java, бази даних, хмара, управління проєктами. 6,3М+ студентів, 128 країн.",
      content: `Oracle Academy — глобальна благодійна освітня програма корпорації Oracle, відкрита для викладачів усього світу. Розвиває технологічну освіту, навички, інновації, різноманіття та інклюзію.

🌍 ГЛОБАЛЬНА СТАТИСТИКА (за останній рік):
• 6,3 мільйона+ студентів у всьому світі
• 15 000+ освітніх установ-партнерів
• 128 країн світу
• Безкоштовне інституційне членство для ЗВО

📚 НАВЧАЛЬНІ ШЛЯХИ (модульний навчальний план):
• Java — від основ до просунутого об'єктно-орієнтованого програмування
• Database — проєктування БД, SQL та PL/SQL, Oracle Autonomous Database, Oracle APEX
• Cloud — Oracle Cloud Infrastructure (OCI), від концепцій до практики
• Project Management — планування, бюджети, ресурси, графіки та ризики в Oracle Primavera P6
• Hospitality — управління готелями на основі реальних PMS-систем

🏆 СЕРТИФІКАЦІЇ ТА БЕЙДЖІ:
• Підготовка до Oracle Certified Professional (OCP)
• Oracle Database та Oracle Cloud Infrastructure сертифікації
• Java Foundations
• Oracle APEX Badges
• Цифрові сертифікати про завершення курсів
• Акредитація викладачів

💼 КАР'ЄРНІ ПОЗИЦІЇ:
Database Administrator (DBA), Java Developer, SQL Specialist, Data Analyst, Oracle Cloud Architect.

🏛️ В ДПУ:
Партнерство з 2017 року. Безкоштовне інституційне членство Університету. Доступ до Oracle APEX та Oracle Academy Cloud Program.`,
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
      officialUrl: "https://academy.oracle.com",
      subTopics: asStrings(oracleSubTopics),
    });
    await storage.createTopic({
      slug: "amazon",
      name: "AWS Academy",
      description: "Безкоштовний готовий до викладання навчальний план з хмарних обчислень для ЗВО. 1М+ студентів, 6800+ установ, 120+ країн.",
      content: `AWS Academy — програма Amazon Web Services, заснована у 2017 році, що надає закладам вищої освіти безкоштовний готовий до викладання навчальний план з хмарних обчислень. Готує студентів до отримання визнаних у галузі сертифікацій та затребуваних позицій у хмарі.

🌍 ГЛОБАЛЬНА СТАТИСТИКА (станом на 2026 р.):
• 1 мільйон+ студентів навчалися (нещодавно святкували мільйонний випуск)
• 6 800+ закладів вищої освіти-учасників
• 120+ країн світу
• 12 курсів + 4 лабораторні проєкти
• Безкоштовно для установ і студентів

📚 КАТАЛОГ КУРСІВ:
• AWS Academy Cloud Foundations — введення в хмарні обчислення, безпеку, архітектуру
• AWS Academy Cloud Architecting — проєктування масштабованих та стійких хмарних рішень
• AWS Academy Cloud Operations — операційна підтримка хмарних систем
• AWS Academy Cloud Developing — розробка застосунків на AWS
• AWS Academy Cloud Security Foundations — основи безпеки в хмарі
• AWS Academy Data Engineering — обробка та аналіз великих даних
• AWS Academy Machine Learning Foundations — основи ML на інфраструктурі AWS
• AWS Academy Machine Learning for Natural Language Processing
• AWS Academy Cloud Web Application Builder
• AWS Academy Introduction to Cloud
• Лабораторії: AWS Academy Learner Lab, Cloud Captsone Project, Game Builder, Cloud Security Builder

🏆 СЕРТИФІКАЦІЇ:
• AWS Certified Cloud Practitioner
• AWS Certified Solutions Architect – Associate
• AWS Certified Data Engineer – Associate
• AWS Certified Machine Learning – Specialty
• Цифрові бейджі AWS Academy
• Акредитація викладачів

💼 КАР'ЄРНІ ПОЗИЦІЇ:
Cloud Architect, DevOps Engineer, Data Engineer, Machine Learning Specialist, Cloud Security Specialist.

🏛️ В ДПУ:
Партнерство з 2024 року. Доступ до AWS Academy Learner Lab. Ваучери зі 100% знижкою на сертифікацію для викладачів. Університет внесено в каталог установ-учасників AWS Academy.`,
      imageUrl: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=800&auto=format&fit=crop",
      officialUrl: "https://aws.amazon.com/training/awsacademy/",
      subTopics: asStrings(awsSubTopics),
    });
    await storage.createTopic({
      slug: "cisco",
      name: "Cisco Academy",
      description: "Глобальна освітня програма Cisco Systems з 1997 р. — кібербезпека, мережі, AI, аналіз даних та програмування. 28М+ студентів, 195 країн.",
      content: `Cisco Networking Academy (NetAcad) — глобальна освітня програма Cisco Systems, заснована у 1997 році, одна з найдавніших у світі програм підготовки ІТ-кадрів за моделлю «навички-для-роботи».

🌍 ГЛОБАЛЬНА СТАТИСТИКА (станом на 2026 р.):
• 28 мільйонів+ студентів навчались з 1997 року
• 195 країн світу
• 12 100+ академій
• 4,7 млн студентів проходять курси щороку
• 4,8 млн випускників отримали нову роботу за допомогою програми
• 27% жінок серед усіх учнів
• 273 000+ студентів з декларованою інвалідністю (з FY2019)

📚 НАПРЯМИ НАВЧАННЯ:
• Кібербезпека (Cybersecurity)
• Мережі (Networking)
• Штучний інтелект та аналіз даних (AI & Data Science)
• Програмування (Programming)
• Інформаційні технології (Information Technology)

🏆 СЕРТИФІКАЦІЇ:
• CCNA (Cisco Certified Network Associate)
• CCNP (Cisco Certified Network Professional)
• CCST Cybersecurity / Networking / IT Support
• Цифрові бейджі Credly

💼 КАР'ЄРНІ ПОЗИЦІЇ:
Network Administrator, Cybersecurity Analyst, Ethical Hacker, IT Technical Support, Data Analyst, Systems Engineer, Infrastructure Architect.

🏛️ В ДПУ:
Партнерство з 2007 року. У лабораторії В407 встановлено активне обладнання Cisco. Доступ до ресурсів безкоштовний для студентів та регламентується Заключенням МОНУ України від 26.06.2015 №141/12-Г-824.`,
      imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=800&auto=format&fit=crop",
      officialUrl: "https://www.netacad.com",
      subTopics: asStrings(ciscoSubTopics),
    });
  }

  // Backfill: ensure existing topics have the latest full content + rich sub-topics.
  // Runs idempotently on every boot — safe for both dev and prod.
  try {
    const canonical: Record<string, {
      name: string;
      description: string;
      content: string;
      imageUrl: string;
      officialUrl: string;
      subs: typeof ciscoSubTopics;
    }> = {
      oracle: {
        name: "Oracle Academy",
        description: "Глобальна благодійна освітня програма Oracle для викладачів усього світу — Java, бази даних, хмара, управління проєктами. 6,3М+ студентів, 128 країн.",
        content: `Oracle Academy — глобальна благодійна освітня програма корпорації Oracle, відкрита для викладачів усього світу. Розвиває технологічну освіту, навички, інновації, різноманіття та інклюзію.\n\n🌍 ГЛОБАЛЬНА СТАТИСТИКА (за останній рік):\n• 6,3 мільйона+ студентів у всьому світі\n• 15 000+ освітніх установ-партнерів\n• 128 країн світу\n• Безкоштовне інституційне членство для ЗВО\n\n📚 НАВЧАЛЬНІ ШЛЯХИ (модульний навчальний план):\n• Java — від основ до просунутого об'єктно-орієнтованого програмування\n• Database — проєктування БД, SQL та PL/SQL, Oracle Autonomous Database, Oracle APEX\n• Cloud — Oracle Cloud Infrastructure (OCI), від концепцій до практики\n• Project Management — планування, бюджети, ресурси, графіки та ризики в Oracle Primavera P6\n• Hospitality — управління готелями на основі реальних PMS-систем\n\n🏆 СЕРТИФІКАЦІЇ ТА БЕЙДЖІ:\n• Підготовка до Oracle Certified Professional (OCP)\n• Oracle Database та Oracle Cloud Infrastructure сертифікації\n• Java Foundations\n• Oracle APEX Badges\n• Цифрові сертифікати про завершення курсів\n• Акредитація викладачів\n\n💼 КАР'ЄРНІ ПОЗИЦІЇ:\nDatabase Administrator (DBA), Java Developer, SQL Specialist, Data Analyst, Oracle Cloud Architect.\n\n🏛️ В ДПУ:\nПартнерство з 2017 року. Безкоштовне інституційне членство Університету. Доступ до Oracle APEX та Oracle Academy Cloud Program.`,
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
        officialUrl: "https://academy.oracle.com",
        subs: oracleSubTopics,
      },
      amazon: {
        name: "AWS Academy",
        description: "Безкоштовний готовий до викладання навчальний план з хмарних обчислень для ЗВО. 1М+ студентів, 6800+ установ, 120+ країн.",
        content: `AWS Academy — програма Amazon Web Services, заснована у 2017 році, що надає закладам вищої освіти безкоштовний готовий до викладання навчальний план з хмарних обчислень. Готує студентів до отримання визнаних у галузі сертифікацій та затребуваних позицій у хмарі.\n\n🌍 ГЛОБАЛЬНА СТАТИСТИКА (станом на 2026 р.):\n• 1 мільйон+ студентів навчалися (нещодавно святкували мільйонний випуск)\n• 6 800+ закладів вищої освіти-учасників\n• 120+ країн світу\n• 12 курсів + 4 лабораторні проєкти\n• Безкоштовно для установ і студентів\n\n📚 КАТАЛОГ КУРСІВ:\n• AWS Academy Cloud Foundations — введення в хмарні обчислення, безпеку, архітектуру\n• AWS Academy Cloud Architecting — проєктування масштабованих та стійких хмарних рішень\n• AWS Academy Cloud Operations — операційна підтримка хмарних систем\n• AWS Academy Cloud Developing — розробка застосунків на AWS\n• AWS Academy Cloud Security Foundations — основи безпеки в хмарі\n• AWS Academy Data Engineering — обробка та аналіз великих даних\n• AWS Academy Machine Learning Foundations — основи ML на інфраструктурі AWS\n\n🏆 СЕРТИФІКАЦІЇ:\n• AWS Certified Cloud Practitioner\n• AWS Certified Solutions Architect – Associate\n• AWS Certified Data Engineer – Associate\n• Цифрові бейджі AWS Academy\n• Акредитація викладачів\n\n💼 КАР'ЄРНІ ПОЗИЦІЇ:\nCloud Architect, DevOps Engineer, Data Engineer, Machine Learning Specialist, Cloud Security Specialist.\n\n🏛️ В ДПУ:\nПартнерство з 2024 року. Доступ до AWS Academy Learner Lab. Ваучери зі 100% знижкою на сертифікацію для викладачів. Університет внесено в каталог установ-учасників AWS Academy.`,
        imageUrl: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=800&auto=format&fit=crop",
        officialUrl: "https://aws.amazon.com/training/awsacademy/",
        subs: awsSubTopics,
      },
      cisco: {
        name: "Cisco Academy",
        description: "Глобальна освітня програма Cisco Systems з 1997 р. — кібербезпека, мережі, AI, аналіз даних та програмування. 28М+ студентів, 195 країн.",
        content: `Cisco Networking Academy (NetAcad) — глобальна освітня програма Cisco Systems, заснована у 1997 році, одна з найдавніших у світі програм підготовки ІТ-кадрів за моделлю «навички-для-роботи».\n\n🌍 ГЛОБАЛЬНА СТАТИСТИКА (станом на 2026 р.):\n• 28 мільйонів+ студентів навчались з 1997 року\n• 195 країн світу\n• 12 100+ академій\n• 4,7 млн студентів проходять курси щороку\n• 4,8 млн випускників отримали нову роботу за допомогою програми\n• 27% жінок серед усіх учнів\n\n📚 НАПРЯМИ НАВЧАННЯ:\n• Кібербезпека (Cybersecurity)\n• Мережі (Networking)\n• Штучний інтелект та аналіз даних (AI & Data Science)\n• Програмування (Programming)\n• Інформаційні технології (Information Technology)\n\n🏆 СЕРТИФІКАЦІЇ:\n• CCNA (Cisco Certified Network Associate)\n• CCNP (Cisco Certified Network Professional)\n• CCST Cybersecurity / Networking / IT Support\n• Цифрові бейджі Credly\n\n💼 КАР'ЄРНІ ПОЗИЦІЇ:\nNetwork Administrator, Cybersecurity Analyst, Ethical Hacker, IT Technical Support, Data Analyst, Systems Engineer, Infrastructure Architect.\n\n🏛️ В ДПУ:\nПартнерство з 2007 року. У лабораторії В407 встановлено активне обладнання Cisco. Доступ до ресурсів безкоштовний для студентів та регламентується Заключенням МОНУ України від 26.06.2015 №141/12-Г-824.`,
        imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=800&auto=format&fit=crop",
        officialUrl: "https://www.netacad.com",
        subs: ciscoSubTopics,
      },
    };
    const current = await storage.getTopics();
    for (const t of current) {
      const target = canonical[t.slug];
      if (!target) continue;
      const subs = Array.isArray(t.subTopics) ? t.subTopics : [];
      const allRich = subs.length === target.subs.length &&
        subs.every((s) => {
          const parsed = parseSubTopic(s as any);
          return parsed && typeof parsed === "object" && "titleUk" in parsed;
        });
      const needsUpdate = t.name !== target.name || !allRich || !t.officialUrl ||
        t.description !== target.description;
      if (needsUpdate) {
        await storage.updateTopic(t.slug, {
          name: target.name,
          description: target.description,
          content: target.content,
          imageUrl: target.imageUrl,
          officialUrl: target.officialUrl,
          subTopics: asStrings(target.subs),
        });
        console.log(`[seed] Backfilled topic ${t.slug} (full content + ${target.subs.length} sub-topics)`);
      }
    }
  } catch (err) {
    console.error("[seed] Topic backfill failed:", err);
  }

  // ============== DEMO USERS SEED ==============
  try {
    const existingUsers = await storage.getAllUsersWithProgress();
    const existingUsernames = new Set(existingUsers.map(u => u.username));
    const demoUsers = [
      { username: "anna_k", password: "demo", firstName: "Анна", lastName: "Коваленко", gender: "Жіноча", region: "Київська", faculty: "ФФЦТ", specialty: "Кібербезпека", course: "1", isAdmin: false },
      { username: "ivan_p", password: "demo", firstName: "Іван", lastName: "Петренко", gender: "Чоловіча", region: "Київська", faculty: "ФФЦТ", specialty: "Інженерія ПЗ", course: "2", isAdmin: false },
      { username: "petro_s", password: "demo", firstName: "Петро", lastName: "Сидоренко", gender: "Чоловіча", region: "Харківська", faculty: "ФФЦТ", specialty: "Інженерія ПЗ", course: "3", isAdmin: false },
      { username: "maryna_b", password: "demo", firstName: "Марина", lastName: "Бойко", gender: "Жіноча", region: "Київська", faculty: "ФФЦТ", specialty: "Кібербезпека", course: "4", isAdmin: false },
      { username: "kateryna_d", password: "demo", firstName: "Катерина", lastName: "Дяченко", gender: "Жіноча", region: "Київська", faculty: "ФФЦТ", specialty: "Цифровий дизайн", course: "1", isAdmin: false },
      { username: "yuri_h", password: "demo", firstName: "Юрій", lastName: "Гончаренко", gender: "Чоловіча", region: "Дніпропетровська", faculty: "ФФЦТ", specialty: "Кібербезпека", course: "3", isAdmin: false },
      { username: "serhii_o", password: "demo", firstName: "Сергій", lastName: "Олексієнко", gender: "Чоловіча", region: "Київська", faculty: "ФФЦТ", specialty: "Інженерія ПЗ", course: "4", isAdmin: false },
      { username: "tetiana_r", password: "demo", firstName: "Тетяна", lastName: "Радченко", gender: "Жіноча", region: "Полтавська", faculty: "ФФЦТ", specialty: "Цифровий дизайн", course: "1", isAdmin: false },
      { username: "vasyl_z", password: "demo", firstName: "Василь", lastName: "Заєць", gender: "Чоловіча", region: "Київська", faculty: "ФФЦТ", specialty: "Кібербезпека", course: "2", isAdmin: false },
      { username: "iryna_t", password: "demo", firstName: "Ірина", lastName: "Ткаченко", gender: "Жіноча", region: "Київська", faculty: "ФФЦТ", specialty: "Інженерія ПЗ", course: "3", isAdmin: false },
      { username: "mykola_h", password: "demo", firstName: "Микола", lastName: "Гриценко", gender: "Чоловіча", region: "Львівська", faculty: "ФФЦТ", specialty: "Кібербезпека", course: "2", isAdmin: false },
      { username: "oksana_m", password: "demo", firstName: "Оксана", lastName: "Мельник", gender: "Жіноча", region: "Одеська", faculty: "ФФЦТ", specialty: "121 – Інженерія програмного забезпечення", course: "1", isAdmin: false },
      { username: "andriy_v", password: "demo", firstName: "Андрій", lastName: "Волков", gender: "Чоловіча", region: "Запорізька", faculty: "ФФЦТ", specialty: "Цифровий дизайн", course: "4", isAdmin: false },
      { username: "larysa_k", password: "demo", firstName: "Лариса", lastName: "Кравченко", gender: "Жіноча", region: "Дніпропетровська", faculty: "ФФЦТ", specialty: "Інженерія ПЗ", course: "2", isAdmin: false },
      { username: "admin", password: "admin123", firstName: "Адміністратор", lastName: "КІТіС", gender: "Чоловіча", region: "Київська", faculty: "ФФЦТ", specialty: "КІТіС", course: "4", isAdmin: true },
    ];
    let seededCount = 0;
    for (const u of demoUsers) {
      if (!existingUsernames.has(u.username)) {
        await storage.createUser(u as any);
        seededCount++;
      }
    }
    if (seededCount > 0) {
      console.log(`[seed] Added ${seededCount} demo users`);

      // Seed poll responses for demo users
      const polls = await storage.getActivePolls();
      if (polls.length > 0) {
        const allSeeded = await storage.getAllUsersWithProgress();
        const pollResponseData = [
          { pollId: polls[0].id, selectedOption: 0 },
          { pollId: polls[0].id, selectedOption: 2 },
          { pollId: polls[0].id, selectedOption: 1 },
          { pollId: polls[0].id, selectedOption: 3 },
          { pollId: polls[0].id, selectedOption: 2 },
          { pollId: polls[0].id, selectedOption: 0 },
          { pollId: polls[0].id, selectedOption: 1 },
          { pollId: polls[0].id, selectedOption: 4 },
          { pollId: polls[0].id, selectedOption: 2 },
          { pollId: polls[0].id, selectedOption: 3 },
          { pollId: polls[0].id, selectedOption: 1 },
          { pollId: polls[0].id, selectedOption: 0 },
        ];
        for (let i = 0; i < Math.min(pollResponseData.length, allSeeded.length); i++) {
          await storage.savePollResponse({
            pollId: pollResponseData[i].pollId,
            userId: allSeeded[i].id,
            selectedOption: pollResponseData[i].selectedOption,
            respondedAt: new Date().toISOString(),
          });
        }
        if (polls.length > 1) {
          const poll2Resps = [0, 0, 1, 0, 2, 1, 0, 1, 3, 0];
          for (let i = 0; i < Math.min(poll2Resps.length, allSeeded.length); i++) {
            await storage.savePollResponse({
              pollId: polls[1].id,
              userId: allSeeded[i].id,
              selectedOption: poll2Resps[i],
              respondedAt: new Date().toISOString(),
            });
          }
        }
        console.log("[seed] Seeded poll responses");
      }
    }
  } catch (err) {
    console.error("[seed] Demo users seed failed:", err);
  }

  // ============== DEMO FEEDBACK SEED ==============
  try {
    const { feedbackResponses: fbTable } = await import("@shared/schema");
    const { db } = await import("./db");
    const existingFb = await db.select().from(fbTable);
    if (existingFb.length === 0) {
      const now = new Date();
      const demoFeedbacks = [
        { name: "Анна Коваленко", course: "1", specialty: "Кібербезпека", ratingOverall: 5, ratingContent: 5, ratingTeachers: 4, ratingPlatform: 5, npsScore: 10, topic: "cisco", liked: true, positiveAspects: "Практичні лабораторні роботи, доступ до реального обладнання Cisco", negativeAspects: null, feedbackText: "Чудова платформа! Дуже подобається структура курсів Cisco — усе зрозуміло пояснено." },
        { name: "Іван Петренко", course: "2", specialty: "Інженерія ПЗ", ratingOverall: 4, ratingContent: 4, ratingTeachers: 5, ratingPlatform: 4, npsScore: 9, topic: "oracle", liked: true, positiveAspects: "SQL та PL/SQL курси дуже корисні для розробника", negativeAspects: "Хотілося б більше відеоматеріалів", feedbackText: "Oracle Academy дає реальні навички роботи з базами даних. Рекомендую всім студентам напряму ІПЗ." },
        { name: "Петро Сидоренко", course: "3", specialty: "Інженерія ПЗ", ratingOverall: 5, ratingContent: 5, ratingTeachers: 5, ratingPlatform: 4, npsScore: 10, topic: "amazon", liked: true, positiveAspects: "AWS Cloud Foundations — найкраще введення у хмару", negativeAspects: null, feedbackText: "Після завершення курсу AWS відразу знайшов стажування. Сертифікат справді цінується роботодавцями." },
        { name: "Марина Бойко", course: "4", specialty: "Кібербезпека", ratingOverall: 5, ratingContent: 5, ratingTeachers: 4, ratingPlatform: 5, npsScore: 10, topic: "cisco", liked: true, positiveAspects: "Cisco Cybersecurity — актуальний матеріал, реальні кейси", negativeAspects: null, feedbackText: "Обожнюю курс з кібербезпеки! Всі теми відповідають сучасним реаліям ринку праці." },
        { name: "Катерина Дяченко", course: "1", specialty: "Цифровий дизайн", ratingOverall: 4, ratingContent: 4, ratingTeachers: 4, ratingPlatform: 5, npsScore: 8, topic: "oracle", liked: true, positiveAspects: "Безкоштовний доступ до всіх матеріалів", negativeAspects: "Деякі модулі складні для першокурсників", feedbackText: "Гарна можливість вивчити SQL вже з першого курсу. Платформа дуже зручна." },
        { name: "Юрій Гончаренко", course: "3", specialty: "Кібербезпека", ratingOverall: 5, ratingContent: 5, ratingTeachers: 5, ratingPlatform: 4, npsScore: 10, topic: "amazon", liked: true, positiveAspects: "Практичні завдання у хмарній лабораторії AWS", negativeAspects: null, feedbackText: "AWS Academy — це не просто теорія, це реальна практика з хмарними сервісами. Однозначно рекомендую." },
        { name: "Сергій Олексієнко", course: "4", specialty: "Інженерія ПЗ", ratingOverall: 4, ratingContent: 4, ratingTeachers: 4, ratingPlatform: 4, npsScore: 9, topic: "cisco", liked: true, positiveAspects: "CCNA — визнана у всьому світі сертифікація", negativeAspects: "Матеріал доволі об'ємний, потрібно багато часу", feedbackText: "Cisco CCNA дав мені системне розуміння мережевих технологій. Складно, але варто." },
        { name: "Тетяна Радченко", course: "1", specialty: "Цифровий дизайн", ratingOverall: 5, ratingContent: 4, ratingTeachers: 5, ratingPlatform: 5, npsScore: 10, topic: "general", liked: true, positiveAspects: "Дружня спільнота, допомагають одногрупники", negativeAspects: null, feedbackText: "Навіть на першому курсі можна почати вивчення IT — платформа це підтримує. Дякую КІТіС!" },
        { name: "Василь Заєць", course: "2", specialty: "Кібербезпека", ratingOverall: 3, ratingContent: 4, ratingTeachers: 3, ratingPlatform: 3, npsScore: 6, topic: "oracle", liked: false, positiveAspects: "Гарні теоретичні матеріали", negativeAspects: "Не вистачає інтерактивних завдань", feedbackText: "Платформа корисна, але хочеться більше практичних вправ безпосередньо на сайті." },
        { name: "Ірина Ткаченко", course: "3", specialty: "Інженерія ПЗ", ratingOverall: 5, ratingContent: 5, ratingTeachers: 5, ratingPlatform: 5, npsScore: 10, topic: "amazon", liked: true, positiveAspects: "Відмінна структура навчального плану AWS", negativeAspects: null, feedbackText: "Найкраще, що відбулось за три роки навчання — доступ до AWS Academy. Хмарні навички вже затребувані." },
        { name: "Микола Гриценко", course: "2", specialty: "Кібербезпека", ratingOverall: 4, ratingContent: 4, ratingTeachers: 4, ratingPlatform: 4, npsScore: 8, topic: "cisco", liked: true, positiveAspects: "Cisco IT Essentials — ідеально для початківців", negativeAspects: "Інтерфейс академії міг бути сучаснішим", feedbackText: "IT Essentials від Cisco дав базові знання, які я вже використовую на практиці. Задоволений!" },
        { name: "Оксана Мельник", course: "1", specialty: "121 – Інженерія програмного забезпечення", ratingOverall: 5, ratingContent: 5, ratingTeachers: 5, ratingPlatform: 5, npsScore: 10, topic: "oracle", liked: true, positiveAspects: "Java Foundations — найкраще введення у програмування", negativeAspects: null, feedbackText: "Oracle Java Foundations — ідеальний старт для першокурсника-програміста. Все зрозуміло і структуровано." },
        { name: "Андрій Волков", course: "4", specialty: "Цифровий дизайн", ratingOverall: 4, ratingContent: 5, ratingTeachers: 4, ratingPlatform: 3, npsScore: 7, topic: "amazon", liked: true, positiveAspects: "Реальні кейси та лабораторії AWS", negativeAspects: "Хотілося б мобільний застосунок платформи", feedbackText: "AWS курси дуже якісні. Сама IT-Hub платформа ще росте, але вже зараз дуже корисна." },
        { name: "Лариса Кравченко", course: "2", specialty: "Інженерія ПЗ", ratingOverall: 5, ratingContent: 5, ratingTeachers: 5, ratingPlatform: 5, npsScore: 10, topic: "cisco", liked: true, positiveAspects: "Чудові викладачі, завжди готові допомогти", negativeAspects: null, feedbackText: "Кафедра КІТіС зробила неймовірне — безкоштовний доступ до світових IT-академій. Пишаюся своїм університетом!" },
        { name: "Дмитро Павлушенко", course: "4 курс", specialty: "121 – Інженерія програмного забезпечення", ratingOverall: 5, ratingContent: 5, ratingTeachers: 5, ratingPlatform: 5, npsScore: 10, topic: "general", liked: true, positiveAspects: "Повний безкоштовний доступ, сертифікати від провідних компаній", negativeAspects: null, feedbackText: "IT-ХАБ — це найкраща ініціатива кафедри. Три сертифікати за рік навчання, і всі безкоштовно. Рекомендую кожному студенту ДПУ!" },
      ];
      for (const fb of demoFeedbacks) {
        const createdAt = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString();
        await db.insert(fbTable).values({ ...fb, topic: fb.topic as any, createdAt });
      }
      console.log("[seed] Created 15 demo feedback responses");
    }
  } catch (err) {
    console.error("[seed] Demo feedback seed failed:", err);
  }

  // ============== FEEDBACK SURVEY ==============
  const { insertFeedbackResponseSchema } = await import("@shared/schema");

  app.post("/api/feedback", async (req, res) => {
    try {
      const parsed = insertFeedbackResponseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.errors });
      }
      const userId = req.isAuthenticated() ? (req.user as any).id : null;
      const saved = await storage.saveFeedbackResponse({ ...parsed.data, userId });
      res.json(saved);
    } catch (err: any) {
      console.error("POST /api/feedback failed:", err);
      res.status(500).json({ message: "Failed to save feedback" });
    }
  });

  app.get("/api/feedback", async (_req, res) => {
    try {
      const all = await storage.getAllFeedbackResponses();
      res.json(all.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")));
    } catch (err: any) {
      console.error("GET /api/feedback failed:", err);
      res.status(500).json({ message: "Failed to load feedback" });
    }
  });

  // Stop-words for word cloud (Ukrainian + English)
  const STOP_WORDS = new Set([
    "і", "та", "що", "в", "на", "з", "до", "у", "як", "для", "це", "по", "не", "за", "є", "або", "але", "тому", "так", "ще",
    "вже", "усі", "всі", "він", "вона", "воно", "ми", "ви", "вони", "я", "ти", "мені", "нас", "вас", "їх", "було", "був", "були",
    "буде", "своїх", "свого", "себе", "коли", "якщо", "тільки", "дуже", "більше", "менше", "тут", "там", "теж", "однак", "також",
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "and", "or", "but", "if", "of", "to", "in", "on", "at",
    "by", "for", "with", "as", "from", "this", "that", "these", "those", "it", "its", "i", "you", "he", "she", "we", "they",
    "my", "your", "his", "her", "our", "their", "me", "him", "us", "them", "do", "does", "did", "have", "has", "had",
    "так", "вже", "то", "ну", "то", "що", "хоча", "адже", "де", "куди", "звідки", "сюди", "туди", "звідси",
    "свій", "своя", "свою", "своє", "своїм", "своїми", "у", "з", "від", "над", "під", "при", "про", "без", "перед", "поза",
    "усе", "все", "її", "його", "—", "-", "..", "...",
  ]);

  function buildWordCloud(text: string, limit: number): { word: string; count: number }[] {
    const counts: Record<string, number> = {};
    const words = text.toLowerCase()
      .replace(/[.,!?;:()«»\[\]"'\/\\]/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 4 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
    for (const w of words) counts[w] = (counts[w] || 0) + 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word, count]) => ({ word, count }));
  }

  app.get("/api/feedback/analytics", async (req, res) => {
    try {
      const all = await storage.getAllFeedbackResponses();

      // ── Apply filters ──
      const fromParam = req.query.from as string | undefined;
      const toParam = req.query.to as string | undefined;
      const topicParam = req.query.topic as string | undefined;

      let filtered = all;
      if (fromParam) filtered = filtered.filter(r => r.createdAt >= fromParam);
      if (toParam) filtered = filtered.filter(r => r.createdAt <= toParam);
      if (topicParam && topicParam !== "all") filtered = filtered.filter(r => r.topic === topicParam);

      const total = filtered.length;
      const avgRating = total === 0 ? 0 : filtered.reduce((s, r) => s + r.ratingOverall, 0) / total;
      const satisfiedCount = filtered.filter(r => r.ratingOverall >= 4).length;
      const satisfiedPct = total === 0 ? 0 : (satisfiedCount / total) * 100;
      const likedCount = filtered.filter(r => r.liked).length;
      const likedPct = total === 0 ? 0 : (likedCount / total) * 100;

      // ── Distributions ──
      const ratingDist: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
      const courseDist: Record<string, { total: number; sum: number; count4plus: number }> = {};
      const specialtyDist: Record<string, { total: number; sum: number }> = {};
      const topicDist: Record<string, { total: number; sum: number; sumNps: number; npsCount: number }> = {};

      // ── Criteria averages ──
      let cSum = 0, cCount = 0, tSum = 0, tCount = 0, pSum = 0, pCount = 0;

      // ── NPS (0-6 detractors, 7-8 passives, 9-10 promoters) ──
      let detractors = 0, passives = 0, promoters = 0, npsTotal = 0;

      // ── Time series by day ──
      const byDay: Record<string, { sum: number; count: number; nps: number; npsCount: number }> = {};

      // ── Word frequency (positive vs negative buckets) ──
      let positiveText = "";
      let negativeText = "";

      for (const r of filtered) {
        ratingDist[String(r.ratingOverall)] = (ratingDist[String(r.ratingOverall)] || 0) + 1;

        if (!courseDist[r.course]) courseDist[r.course] = { total: 0, sum: 0, count4plus: 0 };
        courseDist[r.course].total += 1;
        courseDist[r.course].sum += r.ratingOverall;
        if (r.ratingOverall >= 4) courseDist[r.course].count4plus += 1;

        if (!specialtyDist[r.specialty]) specialtyDist[r.specialty] = { total: 0, sum: 0 };
        specialtyDist[r.specialty].total += 1;
        specialtyDist[r.specialty].sum += r.ratingOverall;

        const tk = r.topic || "general";
        if (!topicDist[tk]) topicDist[tk] = { total: 0, sum: 0, sumNps: 0, npsCount: 0 };
        topicDist[tk].total += 1;
        topicDist[tk].sum += r.ratingOverall;
        if (r.npsScore !== null && r.npsScore !== undefined) {
          topicDist[tk].sumNps += r.npsScore;
          topicDist[tk].npsCount += 1;
        }

        if (r.ratingContent !== null && r.ratingContent !== undefined) { cSum += r.ratingContent; cCount += 1; }
        if (r.ratingTeachers !== null && r.ratingTeachers !== undefined) { tSum += r.ratingTeachers; tCount += 1; }
        if (r.ratingPlatform !== null && r.ratingPlatform !== undefined) { pSum += r.ratingPlatform; pCount += 1; }

        if (r.npsScore !== null && r.npsScore !== undefined) {
          npsTotal += 1;
          if (r.npsScore <= 6) detractors += 1;
          else if (r.npsScore <= 8) passives += 1;
          else promoters += 1;
        }

        const day = (r.createdAt || "").slice(0, 10);
        if (day) {
          if (!byDay[day]) byDay[day] = { sum: 0, count: 0, nps: 0, npsCount: 0 };
          byDay[day].sum += r.ratingOverall;
          byDay[day].count += 1;
          if (r.npsScore !== null && r.npsScore !== undefined) {
            byDay[day].nps += r.npsScore;
            byDay[day].npsCount += 1;
          }
        }

        if (r.ratingOverall >= 4) {
          if (r.positiveAspects) positiveText += " " + r.positiveAspects;
          positiveText += " " + r.feedbackText;
        } else {
          if (r.negativeAspects) negativeText += " " + r.negativeAspects;
          negativeText += " " + r.feedbackText;
        }
      }

      const npsScore = npsTotal === 0 ? 0 : ((promoters / npsTotal) - (detractors / npsTotal)) * 100;

      // ── Time series sorted ──
      const timeSeries = Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, d]) => ({
          date: day,
          avgRating: Number((d.sum / d.count).toFixed(2)),
          count: d.count,
          avgNps: d.npsCount > 0 ? Number((d.nps / d.npsCount).toFixed(2)) : null,
        }));

      // ── Conclusion ──
      let conclusionUk = "Недостатньо даних для висновків. Потрібно щонайменше 5 відповідей.";
      let conclusionEn = "Not enough data for conclusions. At least 5 responses needed.";
      let conclusionTone: "success" | "warning" | "danger" | "neutral" = "neutral";

      if (total >= 5) {
        if (satisfiedPct > 60) {
          conclusionUk = `Більшість студентів задоволені IT-хабом (${satisfiedPct.toFixed(0)}% поставили оцінку 4+ із 5${npsTotal > 0 ? `, NPS = ${npsScore.toFixed(0)}` : ""}). Платформа виконує свої освітні цілі — продовжуйте розвивати наявні напрями.`;
          conclusionEn = `The majority of students are satisfied with the IT-Hub (${satisfiedPct.toFixed(0)}% rated 4+ out of 5${npsTotal > 0 ? `, NPS = ${npsScore.toFixed(0)}` : ""}). The platform is meeting its educational goals — keep developing the existing directions.`;
          conclusionTone = "success";
        } else if (satisfiedPct < 40) {
          conclusionUk = `Виявлено системні проблеми: лише ${satisfiedPct.toFixed(0)}% студентів поставили високу оцінку${npsTotal > 0 ? ` (NPS = ${npsScore.toFixed(0)})` : ""}. Потрібно проаналізувати негативні відгуки та терміново впровадити покращення.`;
          conclusionEn = `Systemic issues detected: only ${satisfiedPct.toFixed(0)}% of students gave a high rating${npsTotal > 0 ? ` (NPS = ${npsScore.toFixed(0)})` : ""}. Negative feedback needs to be analyzed and improvements urgently implemented.`;
          conclusionTone = "danger";
        } else {
          conclusionUk = `Платформа працює стабільно, але має простір для зростання: ${satisfiedPct.toFixed(0)}% студентів задоволені${npsTotal > 0 ? `, NPS = ${npsScore.toFixed(0)}` : ""}. Зверніть увагу на конструктивну критику для подальшого вдосконалення.`;
          conclusionEn = `The platform works stably but has room to grow: ${satisfiedPct.toFixed(0)}% of students are satisfied${npsTotal > 0 ? `, NPS = ${npsScore.toFixed(0)}` : ""}. Pay attention to constructive criticism for further improvement.`;
          conclusionTone = "warning";
        }
      }

      res.json({
        kpi: {
          total,
          avgRating: Number(avgRating.toFixed(2)),
          satisfiedCount,
          satisfiedPct: Number(satisfiedPct.toFixed(1)),
          likedCount,
          likedPct: Number(likedPct.toFixed(1)),
        },
        nps: {
          score: Number(npsScore.toFixed(1)),
          total: npsTotal,
          promoters,
          passives,
          detractors,
          promoterPct: npsTotal === 0 ? 0 : Number(((promoters / npsTotal) * 100).toFixed(1)),
          passivePct: npsTotal === 0 ? 0 : Number(((passives / npsTotal) * 100).toFixed(1)),
          detractorPct: npsTotal === 0 ? 0 : Number(((detractors / npsTotal) * 100).toFixed(1)),
        },
        criteria: {
          content: cCount === 0 ? null : Number((cSum / cCount).toFixed(2)),
          teachers: tCount === 0 ? null : Number((tSum / tCount).toFixed(2)),
          platform: pCount === 0 ? null : Number((pSum / pCount).toFixed(2)),
          contentCount: cCount,
          teachersCount: tCount,
          platformCount: pCount,
        },
        ratingDist: Object.entries(ratingDist).map(([rating, count]) => ({ rating, count })),
        courseDist: Object.entries(courseDist).map(([course, d]) => ({
          course,
          total: d.total,
          avgRating: Number((d.sum / d.total).toFixed(2)),
          satisfiedPct: Number(((d.count4plus / d.total) * 100).toFixed(1)),
        })),
        specialtyDist: Object.entries(specialtyDist).map(([specialty, d]) => ({
          specialty,
          total: d.total,
          avgRating: Number((d.sum / d.total).toFixed(2)),
        })),
        topicBreakdown: Object.entries(topicDist).map(([topic, d]) => ({
          topic,
          total: d.total,
          avgRating: Number((d.sum / d.total).toFixed(2)),
          avgNps: d.npsCount > 0 ? Number((d.sumNps / d.npsCount).toFixed(2)) : null,
        })),
        timeSeries,
        wordCloud: {
          positive: buildWordCloud(positiveText, 25),
          negative: buildWordCloud(negativeText, 20),
        },
        conclusion: { uk: conclusionUk, en: conclusionEn, tone: conclusionTone },
      });
    } catch (err: any) {
      console.error("GET /api/feedback/analytics failed:", err);
      res.status(500).json({ message: "Failed to compute analytics" });
    }
  });

  // ============== ACHIEVEMENTS (computed) ==============
  app.get("/api/users/me/achievements", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not logged in" });
    try {
      const userId = (req.user as any).id;
      const allUsers = await storage.getAllUsersWithProgress();
      const me = allUsers.find(u => u.id === userId);
      if (!me) return res.status(404).json({ message: "User not found" });

      const quizResults = await storage.getUserQuizResults(userId);
      const allFeedback = await storage.getAllFeedbackResponses();
      const myFeedback = allFeedback.filter(f => f.userId === userId);
      const completed: string[] = (me as any).completedTopicSlugs || [];

      const completedCount = me.completedTopics || 0;
      const perfectQuizzes = quizResults.filter(q => q.score === q.totalQuestions).length;
      const totalQuizzes = quizResults.length;

      const all = [
        {
          id: "first_feedback", icon: "heart",
          labelUk: "Перший відгук", labelEn: "First Feedback",
          descUk: "Ви залишили свій перший відгук", descEn: "You left your first feedback",
          earned: myFeedback.length >= 1,
        },
        {
          id: "first_topic", icon: "star",
          labelUk: "Початок шляху", labelEn: "Journey Begins",
          descUk: "Завершено перший топік", descEn: "Completed first topic",
          earned: completedCount >= 1,
        },
        {
          id: "five_topics", icon: "award",
          labelUk: "П'ять перемог", labelEn: "Five Wins",
          descUk: "Завершено 5 топіків", descEn: "Completed 5 topics",
          earned: completedCount >= 5,
        },
        {
          id: "ten_topics", icon: "trophy",
          labelUk: "Десятка майстра", labelEn: "Master's Ten",
          descUk: "Завершено 10 топіків", descEn: "Completed 10 topics",
          earned: completedCount >= 10,
        },
        {
          id: "cisco_expert", icon: "shield",
          labelUk: "Експерт Cisco", labelEn: "Cisco Expert",
          descUk: "Завершено топік Cisco", descEn: "Completed Cisco topic",
          earned: completed.includes("cisco"),
        },
        {
          id: "oracle_expert", icon: "shield",
          labelUk: "Експерт Oracle", labelEn: "Oracle Expert",
          descUk: "Завершено топік Oracle", descEn: "Completed Oracle topic",
          earned: completed.includes("oracle"),
        },
        {
          id: "aws_expert", icon: "shield",
          labelUk: "Експерт AWS", labelEn: "AWS Expert",
          descUk: "Завершено топік Amazon", descEn: "Completed Amazon topic",
          earned: completed.includes("amazon"),
        },
        {
          id: "perfectionist", icon: "sparkles",
          labelUk: "Перфекціоніст", labelEn: "Perfectionist",
          descUk: "100% правильних відповідей у квізі", descEn: "100% correct in a quiz",
          earned: perfectQuizzes >= 1,
        },
        {
          id: "quiz_master", icon: "crown",
          labelUk: "Майстер квізів", labelEn: "Quiz Master",
          descUk: "Пройдено 5 квізів", descEn: "Completed 5 quizzes",
          earned: totalQuizzes >= 5,
        },
        {
          id: "promoter", icon: "flame",
          labelUk: "Промоутер", labelEn: "Promoter",
          descUk: "Поставили IT-хабу 9-10 в NPS", descEn: "Gave IT-Hub 9-10 NPS score",
          earned: myFeedback.some(f => (f.npsScore ?? 0) >= 9),
        },
      ];

      res.json(all);
    } catch (err: any) {
      console.error("GET /api/users/me/achievements failed:", err);
      res.status(500).json({ message: "Failed to load achievements" });
    }
  });

  // ============== RECOMMENDATIONS ==============
  app.get("/api/users/me/activity", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not logged in" });
    try {
      const userId = (req.user as any).id;
      const days = Math.min(Math.max(parseInt(String(req.query.days || "365"), 10) || 365, 30), 730);
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - days + 1);
      start.setHours(0, 0, 0, 0);

      const [quizResults, allFeedback, allPolls] = await Promise.all([
        storage.getUserQuizResults(userId),
        storage.getAllFeedbackResponses(),
        storage.getAllPollResponses(),
      ]);

      const buckets = new Map<string, { quizzes: number; feedback: number; polls: number; total: number }>();
      const toKey = (d: Date) => d.toISOString().slice(0, 10);

      // Pre-fill all dates with 0 for continuous heatmap
      for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        buckets.set(toKey(d), { quizzes: 0, feedback: 0, polls: 0, total: 0 });
      }

      const bump = (rawDate: any, kind: "quizzes" | "feedback" | "polls") => {
        if (!rawDate) return;
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return;
        if (d < start || d > now) return;
        const k = toKey(d);
        const b = buckets.get(k);
        if (!b) return;
        b[kind] += 1;
        b.total += 1;
      };

      for (const q of quizResults) bump((q as any).completedAt || (q as any).createdAt, "quizzes");
      for (const f of allFeedback) if ((f as any).userId === userId) bump((f as any).createdAt, "feedback");
      for (const p of allPolls) if ((p as any).userId === userId) bump((p as any).respondedAt || (p as any).createdAt, "polls");

      const data = Array.from(buckets.entries())
        .map(([date, v]) => ({ date, ...v }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const totals = data.reduce(
        (acc, d) => ({
          quizzes: acc.quizzes + d.quizzes,
          feedback: acc.feedback + d.feedback,
          polls: acc.polls + d.polls,
          total: acc.total + d.total,
        }),
        { quizzes: 0, feedback: 0, polls: 0, total: 0 },
      );
      const activeDays = data.filter((d) => d.total > 0).length;
      const max = data.reduce((m, d) => Math.max(m, d.total), 0);

      // current streak — consecutive days ending today with activity
      let currentStreak = 0;
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].total > 0) currentStreak++;
        else break;
      }
      // longest streak
      let longestStreak = 0, run = 0;
      for (const d of data) {
        if (d.total > 0) { run++; longestStreak = Math.max(longestStreak, run); }
        else run = 0;
      }

      res.json({ days, data, totals, activeDays, max, currentStreak, longestStreak });
    } catch (err: any) {
      console.error("GET /api/users/me/activity failed:", err);
      res.status(500).json({ message: "Failed to load activity" });
    }
  });

  app.get("/api/users/me/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not logged in" });
    try {
      const userId = (req.user as any).id;
      const allTopics = await storage.getTopics();
      const allUsers = await storage.getAllUsersWithProgress();
      const me = allUsers.find(u => u.id === userId);
      const completed: string[] = (me as any)?.completedTopicSlugs || [];
      const quizResults = await storage.getUserQuizResults(userId);
      const quizzedSlugs = new Set(quizResults.map(q => q.topicSlug));

      const remaining = allTopics.filter(t => !completed.includes(t.slug));

      // Priority: topics with no quiz attempt yet (cold-start) > attempted but not completed
      const recs = remaining
        .map(t => {
          const noQuiz = !quizzedSlugs.has(t.slug);
          return {
            topicSlug: t.slug,
            titleUk: t.name,
            titleEn: t.name,
            descriptionUk: t.description,
            descriptionEn: t.description,
            reasonUk: noQuiz ? "Новий напрям — спробуйте перший раз" : "Завершіть розпочате — у вас вже є прогрес",
            reasonEn: noQuiz ? "New direction — give it a first try" : "Finish what you started — you already have progress",
            priority: noQuiz ? 2 : 1,
          };
        })
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 3);

      res.json(recs);
    } catch (err: any) {
      console.error("GET /api/users/me/recommendations failed:", err);
      res.status(500).json({ message: "Failed to load recommendations" });
    }
  });

  app.delete("/api/admin/feedback", async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const { db } = await import("./db");
    const { feedbackResponses } = await import("@shared/schema");
    await db.delete(feedbackResponses);
    res.json({ message: "All feedback cleared" });
  });

  app.get("/api/admin/feedback.csv", async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const all = await storage.getAllFeedbackResponses();
      const header = ["id", "createdAt", "name", "course", "specialty", "ratingOverall", "liked", "positiveAspects", "negativeAspects", "feedbackText"];
      const rows = all.map(r => [
        r.id, r.createdAt, r.name, r.course, r.specialty, r.ratingOverall,
        r.liked ? "так" : "ні",
        (r.positiveAspects || "").replace(/[\r\n";]/g, " "),
        (r.negativeAspects || "").replace(/[\r\n";]/g, " "),
        (r.feedbackText || "").replace(/[\r\n";]/g, " "),
      ]);
      const csv = "\uFEFF" + [header.join(";"), ...rows.map(r => r.join(";"))].join("\n");
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="feedback-${new Date().toISOString().slice(0, 10)}.csv"`);
      res.send(csv);
    } catch (err: any) {
      console.error("GET /api/admin/feedback.csv failed:", err);
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  return httpServer;
}
