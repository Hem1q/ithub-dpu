import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Star, ThumbsUp, ThumbsDown, Trash2, Download } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { FeedbackResponse } from "@shared/schema";

type SortKey = "createdAt" | "name" | "course" | "ratingOverall";
type SortDir = "asc" | "desc";

export default function FeedbackTable({ showAdminControls = false }: { showAdminControls?: boolean }) {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { data: responses = [], isLoading } = useQuery<FeedbackResponse[]>({
    queryKey: ["/api/feedback"],
  });

  const clearMutation = useMutation({
    mutationFn: async () => apiRequest("DELETE", "/api/admin/feedback"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/analytics"] });
      toast({
        title: lang === "uk" ? "Очищено" : "Cleared",
        description: lang === "uk" ? "Усі відгуки видалено" : "All feedback removed",
      });
    },
  });

  const courses = useMemo(() => {
    const set = new Set<string>();
    responses.forEach(r => set.add(r.course));
    return Array.from(set).sort();
  }, [responses]);

  const filtered = useMemo(() => {
    let list = responses.filter(r => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.feedbackText.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (courseFilter !== "all" && r.course !== courseFilter) return false;
      if (ratingFilter !== "all" && String(r.ratingOverall) !== ratingFilter) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "ratingOverall") cmp = a.ratingOverall - b.ratingOverall;
      else if (sortKey === "createdAt") cmp = (a.createdAt || "").localeCompare(b.createdAt || "");
      else cmp = String(a[sortKey] || "").localeCompare(String(b[sortKey] || ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [responses, search, courseFilter, ratingFilter, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
  };

  return (
    <Card className="p-6 rounded-2xl shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground" data-testid="text-table-title">
            {lang === "uk" ? "Таблиця відповідей" : "Responses Table"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {lang === "uk" ? "Усього: " : "Total: "}
            <span className="font-bold text-foreground" data-testid="text-total-count">{responses.length}</span>
            {filtered.length !== responses.length && (
              <span className="ml-2">
                ({lang === "uk" ? "відображено" : "shown"}: <span className="font-bold text-foreground">{filtered.length}</span>)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {showAdminControls && user?.isAdmin && (
            <Button
              variant="outline"
              size="sm"
              asChild
              data-testid="button-export-csv"
            >
              <a href="/api/admin/feedback.csv" download>
                <Download className="w-4 h-4 mr-1.5" />
                CSV
              </a>
            </Button>
          )}
          {showAdminControls && user?.isAdmin && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm(lang === "uk" ? "Видалити ВСІ відгуки? Ця дія незворотна." : "Delete ALL feedback? This is irreversible.")) {
                  clearMutation.mutate();
                }
              }}
              disabled={clearMutation.isPending}
              data-testid="button-clear-feedback"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              {lang === "uk" ? "Очистити" : "Clear"}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 pb-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={lang === "uk" ? "Пошук по імені або тексту..." : "Search by name or text..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger data-testid="select-filter-course">
            <SelectValue placeholder={lang === "uk" ? "Курс" : "Course"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === "uk" ? "Усі курси" : "All courses"}</SelectItem>
            {courses.map(c => (
              <SelectItem key={c} value={c}>{lang === "uk" ? `${c} курс` : `Year ${c}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger data-testid="select-filter-rating">
            <SelectValue placeholder={lang === "uk" ? "Оцінка" : "Rating"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === "uk" ? "Усі оцінки" : "All ratings"}</SelectItem>
            {[5, 4, 3, 2, 1].map(n => (
              <SelectItem key={n} value={String(n)}>{n} ★</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          {lang === "uk" ? "Завантаження..." : "Loading..."}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {lang === "uk" ? "Відповідей не знайдено. Спробуйте змінити фільтри." : "No responses found. Try changing the filters."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-2.5 font-semibold">
                  <button onClick={() => toggleSort("name")} className="inline-flex items-center gap-1 hover:text-primary" data-testid="sort-name">
                    {lang === "uk" ? "Ім'я" : "Name"} <SortIcon k="name" />
                  </button>
                </th>
                <th className="text-left p-2.5 font-semibold">
                  <button onClick={() => toggleSort("course")} className="inline-flex items-center gap-1 hover:text-primary" data-testid="sort-course">
                    {lang === "uk" ? "Курс" : "Year"} <SortIcon k="course" />
                  </button>
                </th>
                <th className="text-left p-2.5 font-semibold hidden md:table-cell">
                  {lang === "uk" ? "Спеціальність" : "Specialty"}
                </th>
                <th className="text-left p-2.5 font-semibold">
                  <button onClick={() => toggleSort("ratingOverall")} className="inline-flex items-center gap-1 hover:text-primary" data-testid="sort-rating">
                    {lang === "uk" ? "Оцінка" : "Rating"} <SortIcon k="ratingOverall" />
                  </button>
                </th>
                <th className="text-left p-2.5 font-semibold hidden sm:table-cell">
                  {lang === "uk" ? "Подобається" : "Liked"}
                </th>
                <th className="text-left p-2.5 font-semibold">
                  {lang === "uk" ? "Відгук" : "Feedback"}
                </th>
                <th className="text-right p-2.5 font-semibold hidden lg:table-cell">
                  <button onClick={() => toggleSort("createdAt")} className="inline-flex items-center gap-1 hover:text-primary" data-testid="sort-date">
                    {lang === "uk" ? "Дата" : "Date"} <SortIcon k="createdAt" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr
                  key={r.id}
                  className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                  data-testid={`row-feedback-${r.id}`}
                >
                  <td className="p-2.5 font-medium" data-testid={`cell-name-${r.id}`}>{r.name}</td>
                  <td className="p-2.5">
                    <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {r.course}
                    </span>
                  </td>
                  <td className="p-2.5 text-muted-foreground hidden md:table-cell">{r.specialty}</td>
                  <td className="p-2.5">
                    <div className="inline-flex items-center gap-1" data-testid={`cell-rating-${r.id}`}>
                      <Star className={cn("w-3.5 h-3.5 fill-current", r.ratingOverall >= 4 ? "text-emerald-500" : r.ratingOverall >= 3 ? "text-amber-500" : "text-rose-500")} />
                      <span className="font-bold">{r.ratingOverall}</span>
                      <span className="text-muted-foreground text-xs">/5</span>
                    </div>
                  </td>
                  <td className="p-2.5 hidden sm:table-cell">
                    {r.liked ? (
                      <ThumbsUp className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ThumbsDown className="w-4 h-4 text-rose-600" />
                    )}
                  </td>
                  <td className="p-2.5 text-muted-foreground max-w-[300px] truncate" title={r.feedbackText} data-testid={`cell-feedback-${r.id}`}>
                    {r.feedbackText}
                  </td>
                  <td className="p-2.5 text-right text-xs text-muted-foreground hidden lg:table-cell">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString(lang === "uk" ? "uk-UA" : "en-US", { dateStyle: "short", timeStyle: "short" }) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
