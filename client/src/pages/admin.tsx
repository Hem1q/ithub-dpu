import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
import { Users, BookOpen, CheckCircle, Shield, Database, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PollAnalytics } from "@/components/PollAnalytics";

interface AdminStats {
  totalUsers: number;
  totalTopics: number;
  totalCompleted: number;
  users: {
    id: number;
    username: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    isAdmin: boolean | null;
    completedTopics: number;
  }[];
  topics: { id: number; slug: string; name: string }[];
}

async function fetchStats(): Promise<AdminStats> {
  const res = await fetch("/api/admin/stats", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export default function Admin() {
  const { lang } = useLanguage();
  const { data, isLoading, refetch, isFetching } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: fetchStats,
  });

  const t = {
    uk: {
      title: "Адмін-панель",
      subtitle: "Перегляд бази даних у реальному часі",
      refresh: "Оновити",
      loading: "Завантаження...",
      totalUsers: "Зареєстровано",
      totalTopics: "Курсів",
      totalCompleted: "Пройдено тем",
      usersTable: "Користувачі",
      id: "ID",
      username: "Логін",
      name: "Ім'я",
      email: "Email",
      progress: "Прогрес",
      admin: "Адмін",
      noName: "—",
      topicsSection: "Теми в базі",
      dbInfo: "База даних",
      dbDesc: "PostgreSQL · Replit · Постійна",
    },
    en: {
      title: "Admin Panel",
      subtitle: "Live database overview",
      refresh: "Refresh",
      loading: "Loading...",
      totalUsers: "Registered",
      totalTopics: "Courses",
      totalCompleted: "Topics Done",
      usersTable: "Users",
      id: "ID",
      username: "Login",
      name: "Name",
      email: "Email",
      progress: "Progress",
      admin: "Admin",
      noName: "—",
      topicsSection: "Topics in DB",
      dbInfo: "Database",
      dbDesc: "PostgreSQL · Replit · Persistent",
    },
  }[lang];

  const statCards = data
    ? [
        { icon: Users, label: t.totalUsers, value: data.totalUsers, color: "text-blue-500" },
        { icon: BookOpen, label: t.totalTopics, value: data.totalTopics, color: "text-indigo-500" },
        { icon: CheckCircle, label: t.totalCompleted, value: data.totalCompleted, color: "text-green-500" },
      ]
    : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-foreground">{t.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh-stats"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          {t.refresh}
        </Button>
      </div>

      {/* DB Info Banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
        <Database className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">{t.dbInfo}</p>
          <p className="text-xs text-green-600 dark:text-green-500">{t.dbDesc}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">{t.loading}</div>
      ) : data ? (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4">
            {statCards.map((s) => (
              <Card key={s.label} className="shadow-sm">
                <CardContent className="p-5 text-center">
                  <s.icon className={`w-7 h-7 mx-auto mb-2 ${s.color}`} />
                  <p className="text-3xl font-extrabold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Users Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {t.usersTable}
                <Badge variant="secondary" className="ml-auto">{data.totalUsers}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t.id}</th>
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t.username}</th>
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t.name}</th>
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t.email}</th>
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t.progress}</th>
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t.admin}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((u, i) => (
                      <tr
                        key={u.id}
                        data-testid={`row-user-${u.id}`}
                        className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">#{u.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {u.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{u.username}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {u.firstName || u.lastName
                            ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                            : t.noName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email ?? t.noName}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-1.5 max-w-[60px]">
                              <div
                                className="bg-primary rounded-full h-1.5 transition-all"
                                style={{ width: `${Math.min((u.completedTopics / 3) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{u.completedTopics}/3</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {u.isAdmin
                            ? <Badge variant="default" className="text-xs">Admin</Badge>
                            : <Badge variant="outline" className="text-xs">User</Badge>}
                        </td>
                      </tr>
                    ))}
                    {data.users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                          {lang === "uk" ? "Немає користувачів" : "No users found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Poll Analytics */}
          <PollAnalytics />

          {/* Topics Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                {t.topicsSection}
                <Badge variant="secondary" className="ml-auto">{data.totalTopics}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t.id}</th>
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Slug</th>
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{lang === "uk" ? "Назва" : "Name"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topics.map((topic) => (
                      <tr key={topic.id} data-testid={`row-topic-${topic.id}`} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">#{topic.id}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="font-mono text-xs">{topic.slug}</Badge>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{topic.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
