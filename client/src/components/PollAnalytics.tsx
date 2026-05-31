import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { BarChart3, Download, MessageSquare, Users, MapPin, GraduationCap, ChevronDown, ChevronUp, ListOrdered } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface OptionBreakdown { index: number; labelUk: string; labelEn: string; count: number }
interface KeyCount { key: string; count: number }
interface DetailedResponse {
  responseId: number;
  userId: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  region: string | null;
  course: string | null;
  specialty: string | null;
  gender: string | null;
  selectedOption: number;
  selectedOptionTextUk: string;
  selectedOptionTextEn: string;
  respondedAt: string;
}
interface PollAnalyticsItem {
  id: number;
  questionUk: string;
  questionEn: string;
  optionsUk: string[];
  optionsEn: string[];
  totalResponses: number;
  optionBreakdown: OptionBreakdown[];
  byRegion: KeyCount[];
  byCourse: KeyCount[];
  byGender: KeyCount[];
  bySpecialty: KeyCount[];
  detailed: DetailedResponse[];
}
interface PollAnalyticsResponse { polls: PollAnalyticsItem[] }

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

function truncate(s: string, n = 28) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function PollAnalytics() {
  const { lang } = useLanguage();
  const [openTable, setOpenTable] = useState<Record<number, boolean>>({});

  const { data, isLoading } = useQuery<PollAnalyticsResponse>({
    queryKey: ["/api/admin/poll-analytics"],
  });

  const t = {
    uk: {
      title: "Аналітика опитувань",
      subtitle: "Інтерактивні графіки та детальна таблиця відповідей",
      total: "усього голосів",
      noData: "Поки що немає відповідей на опитування. Дані з'являться, коли користувачі почнуть голосувати.",
      noPolls: "Немає активних опитувань.",
      byOption: "Розподіл за варіантами",
      byRegion: "За регіонами",
      byCourse: "За курсами",
      byGender: "За статтю",
      bySpecialty: "За спеціальностями",
      detailedTable: "Детальна таблиця відповідей",
      hide: "Сховати таблицю",
      show: "Показати таблицю",
      exportCsv: "Експорт у CSV",
      th: { id: "ID", user: "Користувач", region: "Регіон", course: "Курс", specialty: "Спеціальність", choice: "Відповідь", time: "Час" },
      noDemographic: "Немає даних з профілів",
    },
    en: {
      title: "Polls Analytics",
      subtitle: "Interactive charts and a detailed responses table",
      total: "total votes",
      noData: "No poll responses yet. Data will appear once users start voting.",
      noPolls: "No active polls.",
      byOption: "Option breakdown",
      byRegion: "By region",
      byCourse: "By year",
      byGender: "By gender",
      bySpecialty: "By specialty",
      detailedTable: "Detailed responses table",
      hide: "Hide table",
      show: "Show table",
      exportCsv: "Export CSV",
      th: { id: "ID", user: "User", region: "Region", course: "Year", specialty: "Specialty", choice: "Answer", time: "Time" },
      noDemographic: "No profile data available",
    },
  }[lang];

  const handleExport = () => {
    window.location.href = "/api/admin/poll-responses.csv";
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-8 text-center text-muted-foreground">{lang === "uk" ? "Завантаження аналітики..." : "Loading analytics..."}</CardContent>
      </Card>
    );
  }

  if (!data || data.polls.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-8 text-center text-muted-foreground">{t.noPolls}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header card */}
      <Card className="shadow-sm border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{t.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</p>
              </div>
            </div>
            <Button onClick={handleExport} size="sm" variant="default" className="gap-2" data-testid="button-export-csv">
              <Download className="w-4 h-4" />
              {t.exportCsv}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Per-poll cards */}
      {data.polls.map((poll) => {
        const question = lang === "uk" ? poll.questionUk : poll.questionEn;
        const options = lang === "uk" ? poll.optionsUk : poll.optionsEn;
        const isOpen = !!openTable[poll.id];

        const optionChartData = poll.optionBreakdown.map((o, i) => ({
          name: `${i + 1}. ${truncate(lang === "uk" ? o.labelUk : o.labelEn, 22)}`,
          fullName: lang === "uk" ? o.labelUk : o.labelEn,
          count: o.count,
        }));

        const regionData = poll.byRegion.slice(0, 8).map(r => ({ name: truncate(r.key, 18), count: r.count }));
        const courseData = poll.byCourse.map(c => ({ name: c.key, count: c.count }));
        const genderData = poll.byGender.map(g => ({ name: g.key, value: g.count }));

        return (
          <Card key={poll.id} className="shadow-sm" data-testid={`poll-analytics-${poll.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base leading-snug">{question}</CardTitle>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {poll.totalResponses} {t.total}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-mono">#{poll.id}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {poll.totalResponses === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-6">{t.noData}</p>
              ) : (
                <>
                  {/* Option Breakdown — Bar chart */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5" />
                      {t.byOption}
                    </h4>
                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={optionChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} angle={-15} textAnchor="end" height={60} interval={0} />
                          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                            labelFormatter={(_, payload) => (payload && payload[0]?.payload?.fullName) || ""}
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {optionChartData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Per-option list */}
                    <div className="space-y-1.5 mt-3">
                      {poll.optionBreakdown.map((o, i) => {
                        const pct = poll.totalResponses === 0 ? 0 : Math.round((o.count / poll.totalResponses) * 100);
                        return (
                          <div key={o.index} className="flex items-center gap-3 text-xs">
                            <span className="font-mono text-muted-foreground w-5">{i + 1}.</span>
                            <span className="flex-1 truncate text-foreground/90">{lang === "uk" ? o.labelUk : o.labelEn}</span>
                            <span className="font-semibold text-foreground tabular-nums">{o.count}</span>
                            <span className="text-muted-foreground tabular-nums w-10 text-right">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Demographics: 3-column grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                    {/* By Region */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {t.byRegion}
                      </h4>
                      {regionData.length > 0 ? (
                        <div className="w-full h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : <p className="text-xs text-muted-foreground italic h-40 flex items-center">{t.noDemographic}</p>}
                    </div>

                    {/* By Course */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {t.byCourse}
                      </h4>
                      {courseData.length > 0 ? (
                        <div className="w-full h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={courseData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : <p className="text-xs text-muted-foreground italic h-40 flex items-center">{t.noDemographic}</p>}
                    </div>

                    {/* By Gender — Pie */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {t.byGender}
                      </h4>
                      {genderData.length > 0 ? (
                        <div className="w-full h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label={(e: any) => `${e.name}: ${e.value}`} labelLine={false} fontSize={10}>
                                {genderData.map((_, i) => (
                                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : <p className="text-xs text-muted-foreground italic h-40 flex items-center">{t.noDemographic}</p>}
                    </div>
                  </div>

                  {/* Detailed Table — collapsible */}
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenTable(s => ({ ...s, [poll.id]: !isOpen }))}
                      className="text-xs h-8 gap-1.5 text-muted-foreground"
                      data-testid={`button-toggle-table-${poll.id}`}
                    >
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {isOpen ? t.hide : t.show} ({poll.totalResponses})
                    </Button>
                    {isOpen && (
                      <div className="mt-3 overflow-x-auto rounded-lg border">
                        <table className="w-full text-xs" data-testid={`table-responses-${poll.id}`}>
                          <thead>
                            <tr className="border-b bg-muted/40">
                              <th className="text-left px-3 py-2 font-semibold text-muted-foreground">{t.th.id}</th>
                              <th className="text-left px-3 py-2 font-semibold text-muted-foreground">{t.th.user}</th>
                              <th className="text-left px-3 py-2 font-semibold text-muted-foreground">{t.th.region}</th>
                              <th className="text-left px-3 py-2 font-semibold text-muted-foreground">{t.th.course}</th>
                              <th className="text-left px-3 py-2 font-semibold text-muted-foreground">{t.th.specialty}</th>
                              <th className="text-left px-3 py-2 font-semibold text-muted-foreground">{t.th.choice}</th>
                              <th className="text-left px-3 py-2 font-semibold text-muted-foreground">{t.th.time}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {poll.detailed.map((r) => {
                              const fullName = [r.firstName, r.lastName].filter(Boolean).join(" ");
                              const choiceText = lang === "uk" ? r.selectedOptionTextUk : r.selectedOptionTextEn;
                              const date = r.respondedAt ? new Date(r.respondedAt) : null;
                              return (
                                <tr key={r.responseId} className="border-b last:border-0 hover:bg-muted/20 transition-colors" data-testid={`row-response-${r.responseId}`}>
                                  <td className="px-3 py-2 text-muted-foreground font-mono">#{r.responseId}</td>
                                  <td className="px-3 py-2">
                                    <div className="font-medium text-foreground">{r.username}</div>
                                    {fullName && <div className="text-[10px] text-muted-foreground">{fullName}</div>}
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">{r.region || "—"}</td>
                                  <td className="px-3 py-2 text-muted-foreground">{r.course || "—"}</td>
                                  <td className="px-3 py-2 text-muted-foreground">{r.specialty || "—"}</td>
                                  <td className="px-3 py-2">
                                    <span className="inline-flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PIE_COLORS[r.selectedOption % PIE_COLORS.length] }} />
                                      <span className="text-foreground">{truncate(choiceText, 40)}</span>
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground font-mono text-[10px]">
                                    {date ? `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "—"}
                                  </td>
                                </tr>
                              );
                            })}
                            {poll.detailed.length === 0 && (
                              <tr>
                                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground italic">{t.noData}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
