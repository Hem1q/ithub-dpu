import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle, BarChart2, MessageSquare, CheckSquare } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface PollResult { option: number; count: number }
interface Poll {
  id: number;
  questionUk: string;
  questionEn: string;
  optionsUk: string[];
  optionsEn: string[];
  multipleChoice: boolean;
  userResponse: number | null;
  userResponses: number[] | null;
  results: PollResult[];
}

export function PollWidget() {
  const { lang } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);

  const { data: polls = [], isLoading } = useQuery<Poll[]>({
    queryKey: ["/api/polls"],
  });

  const respondMutation = useMutation({
    mutationFn: ({ pollId, selectedOptions }: { pollId: number; selectedOptions: number[] }) =>
      apiRequest("POST", `/api/polls/${pollId}/respond`, {
        selectedOption: selectedOptions[0],
        selectedOptions,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
    },
  });

  const labels = {
    uk: { title: "Опитування", subtitle: "Ваша думка важлива", vote: "Проголосувати", login: "Увійдіть щоб взяти участь", results: "Результати", total: "голосів", multiHint: "Можна обрати кілька" },
    en: { title: "Survey", subtitle: "Your opinion matters", vote: "Vote", login: "Log in to participate", results: "Results", total: "votes", multiHint: "Select all that apply" },
  }[lang];

  if (isLoading || polls.length === 0) return null;

  const poll = polls[idx];
  const options = lang === "uk" ? poll.optionsUk : poll.optionsEn;
  const question = lang === "uk" ? poll.questionUk : poll.questionEn;
  const hasVoted = poll.userResponse !== null || poll.userResponses !== null;
  const myVotes = poll.userResponses ?? (poll.userResponse !== null ? [poll.userResponse] : []);
  const totalVotes = poll.results.reduce((s, r) => s + r.count, 0);

  const getCount = (optIdx: number) => poll.results.find(r => r.option === optIdx)?.count || 0;
  const getPct = (optIdx: number) => totalVotes === 0 ? 0 : Math.round((getCount(optIdx) / totalVotes) * 100);

  const handleToggle = (i: number) => {
    if (poll.multipleChoice) {
      setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
    } else {
      setSelected([i]);
    }
  };

  const handleVote = () => {
    if (selected.length === 0 || !isAuthenticated) return;
    respondMutation.mutate({ pollId: poll.id, selectedOptions: selected });
  };

  const handleNav = (dir: number) => {
    setIdx(i => i + dir);
    setSelected([]);
  };

  return (
    <Card className="p-4 space-y-4 border-border/60 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">{labels.title}</h3>
          <p className="text-[10px] text-muted-foreground">{labels.subtitle}</p>
        </div>
        {polls.length > 1 && (
          <span className="ml-auto text-[10px] text-muted-foreground">{idx + 1}/{polls.length}</span>
        )}
      </div>

      {/* Question */}
      <div>
        <p className="text-sm font-medium text-foreground leading-snug">{question}</p>
        {poll.multipleChoice && !hasVoted && isAuthenticated && (
          <p className="text-[10px] text-primary mt-1 flex items-center gap-1">
            <CheckSquare className="w-3 h-3" />{labels.multiHint}
          </p>
        )}
      </div>

      {/* Options or Results */}
      {hasVoted ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
            <BarChart2 className="w-3 h-3" />
            <span>{labels.results} · {totalVotes} {labels.total}</span>
          </div>
          {options.map((opt, i) => {
            const pct = getPct(i);
            const isMyVote = myVotes.includes(i);
            return (
              <div key={i} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={cn("leading-snug", isMyVote ? "text-primary font-semibold" : "text-foreground/80")}>
                    {isMyVote && <CheckCircle className="w-3 h-3 inline mr-1 text-primary" />}{opt}
                  </span>
                  <span className="text-muted-foreground ml-2 flex-shrink-0">{pct}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-500", isMyVote ? "bg-primary" : "bg-primary/30")}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {!isAuthenticated ? (
            <p className="text-xs text-muted-foreground italic">{labels.login}</p>
          ) : (
            <>
              {options.map((opt, i) => {
                const isSelected = selected.includes(i);
                return (
                  <button key={i} onClick={() => handleToggle(i)}
                    className={cn(
                      "w-full text-left text-xs px-3 py-2 rounded-lg border transition-all flex items-center gap-2",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border/60 hover:border-primary/40 hover:bg-primary/5 text-foreground/80"
                    )}
                    data-testid={`poll-option-${poll.id}-${i}`}>
                    <span className={cn(
                      "w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors",
                      poll.multipleChoice ? "rounded" : "rounded-full",
                      isSelected ? "bg-primary border-primary" : "border-current"
                    )}>
                      {isSelected && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                    </span>
                    {opt}
                  </button>
                );
              })}
              <Button size="sm" className="w-full mt-1 text-xs h-8"
                disabled={selected.length === 0 || respondMutation.isPending}
                onClick={handleVote}
                data-testid={`poll-vote-${poll.id}`}>
                {labels.vote}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Navigation */}
      {polls.length > 1 && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={idx === 0}
            onClick={() => handleNav(-1)}>
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <div className="flex gap-1 mx-auto">
            {polls.map((_, i) => (
              <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-colors", i === idx ? "bg-primary" : "bg-muted-foreground/30")} />
            ))}
          </div>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={idx === polls.length - 1}
            onClick={() => handleNav(1)}>
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      )}
    </Card>
  );
}
