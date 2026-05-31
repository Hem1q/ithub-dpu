import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { quizData } from "@/data/quizData";
import { CheckCircle, XCircle, ArrowLeft, Trophy, RotateCcw, ChevronRight, CheckSquare } from "lucide-react";

const TOPIC_NAMES: Record<string, { uk: string; en: string }> = {
  oracle: { uk: "Oracle", en: "Oracle" },
  amazon: { uk: "Amazon Web Services", en: "Amazon Web Services" },
  cisco: { uk: "Cisco Systems", en: "Cisco Systems" },
};

const TOPIC_COLORS: Record<string, string> = {
  oracle: "from-red-600 to-orange-500",
  amazon: "from-yellow-500 to-orange-400",
  cisco: "from-blue-600 to-cyan-500",
};

function isMultiple(correct: number | number[]): correct is number[] {
  return Array.isArray(correct);
}

function isAnswerCorrect(selected: number[], correct: number | number[]): boolean {
  if (isMultiple(correct)) {
    const sortedSelected = [...selected].sort((a, b) => a - b);
    const sortedCorrect = [...correct].sort((a, b) => a - b);
    return sortedSelected.length === sortedCorrect.length &&
      sortedSelected.every((v, i) => v === sortedCorrect[i]);
  }
  return selected.length === 1 && selected[0] === correct;
}

export default function Quiz() {
  const [, params] = useRoute("/quiz/:slug");
  const [, setLocation] = useLocation();
  const { lang } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const slug = params?.slug ?? "";
  const questions = quizData[slug] ?? [];
  const topicName = TOPIC_NAMES[slug]?.[lang] ?? slug;
  const gradientClass = TOPIC_COLORS[slug] ?? "from-primary to-blue-600";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (data: { topicSlug: string; score: number; totalQuestions: number }) => {
      return apiRequest("POST", "/api/quiz/result", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quiz/results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  if (!questions.length) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        {lang === "uk" ? "Тест не знайдено." : "Quiz not found."}
      </div>
    );
  }

  const question = questions[currentIndex];
  const options = lang === "uk" ? question.options : question.optionsEn;
  const questionText = lang === "uk" ? question.question : question.questionEn;
  const progress = (currentIndex / questions.length) * 100;
  const multi = isMultiple(question.correct);
  const correct = question.correct;
  const answeredCorrectly = confirmed && isAnswerCorrect(selectedAnswers, correct);
  const percentage = Math.round((score / questions.length) * 100);

  const handleSelect = (idx: number) => {
    if (confirmed) return;
    if (multi) {
      setSelectedAnswers(prev =>
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      );
    } else {
      setSelectedAnswers([idx]);
    }
  };

  const handleConfirm = () => {
    if (selectedAnswers.length === 0) return;
    setConfirmed(true);
    if (isAnswerCorrect(selectedAnswers, correct)) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    const isLast = currentIndex + 1 >= questions.length;
    const lastCorrect = isAnswerCorrect(selectedAnswers, correct);
    if (isLast) {
      const finalScore = score + (lastCorrect ? 1 : 0);
      setFinished(true);
      if (isAuthenticated) {
        saveMutation.mutate({
          topicSlug: slug,
          score: finalScore,
          totalQuestions: questions.length,
        });
      }
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswers([]);
      setConfirmed(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setConfirmed(false);
    setScore(0);
    setFinished(false);
  };

  const getOptionStyle = (idx: number): string => {
    const correctArr = Array.isArray(correct) ? correct : [correct];
    const isSelected = selectedAnswers.includes(idx);
    const isCorrectOption = correctArr.includes(idx);

    if (!confirmed) {
      return isSelected
        ? "border-2 border-primary bg-primary/10 cursor-pointer"
        : "border-2 border-border bg-card hover:bg-muted/60 cursor-pointer";
    }
    if (isCorrectOption) {
      return "border-2 border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-default";
    }
    if (isSelected && !isCorrectOption) {
      return "border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 cursor-default";
    }
    return "border-2 border-border bg-card opacity-50 cursor-default";
  };

  if (finished) {
    const finalScore = score;
    const finalPct = Math.round((finalScore / questions.length) * 100);
    const finalPassed = finalPct >= 60;
    return (
      <div className="max-w-xl mx-auto py-8 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/topic/${slug}`)} className="flex items-center gap-1 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          {lang === "uk" ? "До теми" : "Back to topic"}
        </Button>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className={`bg-gradient-to-br ${gradientClass} p-8 text-white`}>
              <div className="flex justify-center mb-4">
                {finalPassed
                  ? <Trophy className="w-16 h-16 text-yellow-300 drop-shadow" />
                  : <XCircle className="w-16 h-16 text-white/80" />}
              </div>
              <h2 className="text-3xl font-bold mb-1">
                {finalPassed
                  ? (lang === "uk" ? "Вітаємо!" : "Congratulations!")
                  : (lang === "uk" ? "Спробуйте ще раз" : "Try Again")}
              </h2>
              <p className="text-white/80 text-sm">
                {lang === "uk" ? `Тест: ${topicName}` : `Quiz: ${topicName}`}
              </p>
            </div>

            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-foreground mb-1">{finalPct}%</div>
                <div className="text-muted-foreground text-sm">
                  {lang === "uk"
                    ? `Правильних відповідей: ${finalScore} з ${questions.length}`
                    : `Correct answers: ${finalScore} of ${questions.length}`}
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-3 rounded-full ${finalPassed ? "bg-green-500" : "bg-red-500"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${finalPct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>

              <Badge variant={finalPassed ? "default" : "destructive"} className="w-full justify-center py-2 text-sm">
                {finalPassed
                  ? (lang === "uk" ? "Тему зараховано!" : "Topic completed!")
                  : (lang === "uk" ? "Необхідно 60% для зарахування" : "60% required to pass")}
              </Badge>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRestart} className="flex-1 gap-2">
                  <RotateCcw className="w-4 h-4" />
                  {lang === "uk" ? "Пройти знову" : "Retry"}
                </Button>
                <Button onClick={() => setLocation("/")} className="flex-1">
                  {lang === "uk" ? "На головну" : "Home"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/topic/${slug}`)} className="flex items-center gap-1 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          {lang === "uk" ? "До теми" : "Back to topic"}
        </Button>
        <Badge variant="secondary" className="text-xs">
          {currentIndex + 1} / {questions.length}
        </Badge>
      </div>

      <div className={`rounded-xl bg-gradient-to-r ${gradientClass} p-4 text-white`}>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">
          {lang === "uk" ? `Тест: ${topicName}` : `Quiz: ${topicName}`}
        </p>
        <Progress value={progress} className="h-2 bg-white/30 [&>div]:bg-white" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="shadow-md">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold leading-snug text-foreground">
                  {questionText}
                </h2>
                {multi && (
                  <p className="text-xs text-primary font-medium flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5" />
                    {lang === "uk" ? "Оберіть усі правильні відповіді" : "Select all correct answers"}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {options.map((option, idx) => {
                  const correctArr = Array.isArray(correct) ? correct : [correct];
                  const isSelected = selectedAnswers.includes(idx);
                  const isCorrectOption = correctArr.includes(idx);

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!confirmed ? { scale: 1.01 } : {}}
                      whileTap={!confirmed ? { scale: 0.99 } : {}}
                      onClick={() => handleSelect(idx)}
                      data-testid={`option-${idx}`}
                      className={`w-full text-left rounded-xl px-5 py-4 text-sm font-medium transition-all ${getOptionStyle(idx)}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-${multi ? "md" : "full"} border-2 border-current flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${isSelected && !confirmed ? "bg-primary text-white border-primary" : ""}`}>
                          {multi
                            ? (isSelected || (confirmed && isCorrectOption) ? "✓" : "")
                            : String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                        {confirmed && isCorrectOption && (
                          <CheckCircle className="w-5 h-5 text-green-500 ml-auto shrink-0" />
                        )}
                        {confirmed && isSelected && !isCorrectOption && (
                          <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {confirmed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg p-3 text-sm font-medium ${answeredCorrectly
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"}`}
                >
                  {answeredCorrectly
                    ? (lang === "uk" ? "Правильно!" : "Correct!")
                    : multi
                      ? (lang === "uk"
                        ? `Неправильно. Правильні відповіді: ${(Array.isArray(correct) ? correct : [correct]).map(i => options[i]).join(", ")}`
                        : `Wrong. Correct answers: ${(Array.isArray(correct) ? correct : [correct]).map(i => options[i]).join(", ")}`)
                      : (lang === "uk"
                        ? `Неправильно. Правильна відповідь: ${options[correct as number]}`
                        : `Wrong. Correct answer: ${options[correct as number]}`)}
                </motion.div>
              )}

              <div className="flex justify-end">
                {!confirmed ? (
                  <Button
                    onClick={handleConfirm}
                    disabled={selectedAnswers.length === 0}
                    data-testid="button-confirm"
                    className="gap-2"
                  >
                    {lang === "uk" ? "Підтвердити" : "Confirm"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={handleNext} data-testid="button-next" className="gap-2">
                    {currentIndex + 1 >= questions.length
                      ? (lang === "uk" ? "Завершити тест" : "Finish Quiz")
                      : (lang === "uk" ? "Наступне питання" : "Next Question")}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
