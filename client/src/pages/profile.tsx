import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  User as UserIcon, Save, ArrowLeft, Trophy, Star, Award, Zap, Target,
  Shield, Heart, Sparkles, BookOpen, Crown, Flame, ArrowRight, Lightbulb
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { apiRequest } from "@/lib/queryClient";
import type { QuizResult } from "@shared/schema";
import { cn } from "@/lib/utils";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";

interface Achievement {
  id: string;
  earned: boolean;
  labelUk: string;
  labelEn: string;
  descUk: string;
  descEn: string;
  icon: string;
}

interface Recommendation {
  topicSlug: string;
  titleUk: string;
  titleEn: string;
  descriptionUk: string;
  descriptionEn: string;
  reasonUk: string;
  reasonEn: string;
  priority: number;
}

const BADGE_ICONS: Record<string, { icon: any; color: string }> = {
  star: { icon: Star, color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" },
  flame: { icon: Flame, color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800" },
  trophy: { icon: Trophy, color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800" },
  crown: { icon: Crown, color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800" },
  shield: { icon: Shield, color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" },
  target: { icon: Target, color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800" },
  award: { icon: Award, color: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800" },
  sparkles: { icon: Sparkles, color: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800" },
  zap: { icon: Zap, color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" },
  heart: { icon: Heart, color: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800" },
};

const TOPIC_NAMES: Record<string, { uk: string; en: string; color: string }> = {
  oracle: { uk: "Oracle", en: "Oracle", color: "text-red-600 dark:text-red-400" },
  amazon: { uk: "Amazon Web Services", en: "Amazon Web Services", color: "text-orange-500 dark:text-orange-400" },
  cisco: { uk: "Cisco Systems", en: "Cisco Systems", color: "text-blue-600 dark:text-blue-400" },
};

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { lang } = useLanguage();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const { data: quizResults = [] } = useQuery<QuizResult[]>({
    queryKey: ["/api/quiz/results"],
    enabled: isAuthenticated,
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/users/me/achievements"],
    enabled: isAuthenticated,
  });

  const { data: recommendations = [] } = useQuery<Recommendation[]>({
    queryKey: ["/api/users/me/recommendations"],
    enabled: isAuthenticated,
  });

  const earnedCount = achievements.filter(a => a.earned).length;

  const updateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", "/api/profile", { firstName, lastName, email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: lang === "uk" ? "Профіль оновлено" : "Profile updated",
        description: lang === "uk" ? "Ваші дані успішно збережено." : "Your data has been saved.",
      });
    },
    onError: () => {
      toast({
        title: lang === "uk" ? "Помилка" : "Error",
        description: lang === "uk" ? "Не вдалося оновити профіль." : "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-muted-foreground">
          {lang === "uk" ? "Увійдіть, щоб переглянути профіль." : "Please log in to view your profile."}
        </p>
        <Button onClick={() => setLocation("/login")}>
          {lang === "uk" ? "Увійти" : "Log In"}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="flex items-center gap-1 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          {lang === "uk" ? "Назад" : "Back"}
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {user?.username?.charAt(0).toUpperCase() ?? <UserIcon />}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user?.username}</CardTitle>
              <CardDescription>
                {lang === "uk" ? "Налаштування профілю" : "Profile Settings"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{lang === "uk" ? "Ім'я" : "First Name"}</Label>
              <Input
                id="firstName"
                data-testid="input-firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={lang === "uk" ? "Введіть ім'я" : "Enter first name"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{lang === "uk" ? "Прізвище" : "Last Name"}</Label>
              <Input
                id="lastName"
                data-testid="input-lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={lang === "uk" ? "Введіть прізвище" : "Enter last name"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{lang === "uk" ? "Електронна пошта" : "Email"}</Label>
            <Input
              id="email"
              type="email"
              data-testid="input-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={lang === "uk" ? "Введіть email" : "Enter email"}
            />
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-4">
              {lang === "uk" ? "Ім'я користувача: " : "Username: "}
              <span className="font-semibold text-foreground">{user?.username}</span>
            </p>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              data-testid="button-save-profile"
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending
                ? (lang === "uk" ? "Збереження..." : "Saving...")
                : (lang === "uk" ? "Зберегти зміни" : "Save Changes")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card data-testid="recommendations-block">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              {lang === "uk" ? "Рекомендовано далі" : "Recommended next"}
            </CardTitle>
            <CardDescription>
              {lang === "uk"
                ? "Що варто пройти, виходячи з вашого прогресу"
                : "What to study next based on your progress"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <Link key={rec.topicSlug} href={`/topic/${rec.topicSlug}`}>
                  <div
                    className="flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                    data-testid={`recommendation-${rec.topicSlug}`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "flex items-center justify-center w-9 h-9 rounded-lg font-bold text-sm shrink-0",
                        idx === 0 && "bg-amber-500 text-white",
                        idx === 1 && "bg-slate-400 text-white",
                        idx === 2 && "bg-orange-700 text-white",
                      )}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate">
                          {lang === "uk" ? rec.titleUk : rec.titleEn}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {lang === "uk" ? rec.descriptionUk : rec.descriptionEn}
                        </p>
                        <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {lang === "uk" ? rec.reasonUk : rec.reasonEn}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Results */}
      {quizResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {lang === "uk" ? "Результати тестів" : "Quiz Results"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quizResults.map(result => {
                const pct = Math.round((result.score / result.totalQuestions) * 100);
                const passed = pct >= 60;
                const topic = TOPIC_NAMES[result.topicSlug];
                return (
                  <div key={result.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className={`font-semibold text-sm ${topic?.color ?? "text-foreground"}`}>
                        {topic ? (lang === "uk" ? topic.uk : topic.en) : result.topicSlug}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.score}/{result.totalQuestions} {lang === "uk" ? "правильних" : "correct"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${passed ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                        {pct}%
                      </div>
                      <Badge variant={passed ? "default" : "destructive"} className="text-xs">
                        {passed
                          ? (lang === "uk" ? "Зараховано" : "Passed")
                          : (lang === "uk" ? "Не зараховано" : "Failed")}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity heatmap */}
      <ActivityHeatmap />

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {lang === "uk" ? "Досягнення" : "Achievements"}
          </CardTitle>
          <CardDescription>
            {lang === "uk"
              ? `Отримано ${earnedCount} з ${achievements.length} бейджів`
              : `${earnedCount} of ${achievements.length} badges earned`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {lang === "uk" ? "Завантаження бейджів..." : "Loading badges..."}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {achievements.map(a => {
                const meta = BADGE_ICONS[a.icon] || BADGE_ICONS.star;
                const Icon = meta.icon;
                return (
                  <div
                    key={a.id}
                    data-testid={`badge-${a.id}`}
                    className={cn(
                      "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all",
                      a.earned
                        ? meta.color + " hover:scale-105 hover:-translate-y-0.5 hover:shadow-md"
                        : "bg-muted/30 border-border text-muted-foreground opacity-50"
                    )}
                  >
                    <div className={cn("p-2 rounded-full", a.earned ? "bg-current/10" : "bg-muted")}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs leading-tight">
                        {lang === "uk" ? a.labelUk : a.labelEn}
                      </p>
                      <p className="text-[10px] opacity-70 mt-0.5 leading-tight">
                        {lang === "uk" ? a.descUk : a.descEn}
                      </p>
                    </div>
                    {!a.earned && (
                      <div className="absolute top-1.5 right-1.5">
                        <span className="text-xs">🔒</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
