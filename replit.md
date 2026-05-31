# Освітній IT-ХАБ — ДПУ / ФФЦТ / КІТіС

## Overview
Full-stack TypeScript educational hub for Державний податковий університет (ДПУ),
Faculty of Finance and Digital Technologies (ФФЦТ), Department of Computer Information
Technologies and Systems (КІТіС).

## Stack
- **Frontend:** React + Vite + Wouter + TanStack Query v5 + Tailwind + shadcn/ui +
  Framer Motion + Recharts + react-hook-form + zod
- **Backend:** Express + Passport (local strategy) + Drizzle ORM + PostgreSQL +
  connect-pg-simple (sessions)
- **Shared:** `shared/schema.ts` exports drizzle tables, zod insert schemas, and TS types
- **Auth:** session-based via Replit auth integration (`javascript_log_in_with_replit`)
- **DB driver:** `pg` Pool (see `server/db.ts`)

## Key Routes
| Path             | Purpose                                                     |
|------------------|-------------------------------------------------------------|
| `/`              | Home — hub overview with provider academies and sections    |
| `/topic/:slug`   | Topic detail (Oracle Academy / AWS Academy / Cisco Academy) |
| `/quiz/:slug`    | Interactive quiz for the topic                              |
| `/students`      | Section page for students                                   |
| `/applicants`    | Section page for applicants                                 |
| `/teachers`      | Section page for teachers                                   |
| `/news`          | News feed                                                   |
| `/leaderboard`   | Top performers leaderboard                                  |
| `/feedback`      | Rich feedback survey form (rating, like, conditional fields)|
| `/analytics`     | Public KPI dashboard with charts and auto-conclusion        |
| `/admin`         | Admin panel (poll analytics, user management)               |

## Feedback & Analytics System
- **Table:** `feedback_responses` (id, userId nullable, name, course, specialty,
  ratingOverall 1-5, **ratingContent/ratingTeachers/ratingPlatform 1-5 nullable**,
  **npsScore 0-10 nullable**, **topic enum: oracle/amazon/cisco/general nullable**,
  liked bool, positiveAspects, negativeAspects, feedbackText, createdAt)
- **POST /api/feedback** — public submit, validates with `insertFeedbackResponseSchema`
  (zod enum on topic, 0-10 NPS clamp)
- **GET /api/feedback** — sorted list of all responses
- **GET /api/feedback/analytics?from=&to=&topic=** — filterable; returns `kpi`,
  `nps {score, total, promoters, passives, detractors, *Pct}`,
  `criteria {content, teachers, platform, *Count}`,
  `ratingDist`, `courseDist`, `specialtyDist`,
  `topicBreakdown {topic, total, avgRating, avgNps}`,
  `timeSeries {date, count, avgRating, avgNps}`,
  `wordCloud {positive[], negative[]}` (UA+EN STOP_WORDS),
  `conclusion {uk, en, tone}` (NPS-aware)
- **GET /api/users/me/achievements** — array of 10 computed badges
  `{id, icon, labelUk, labelEn, descUk, descEn, earned}` (no DB table — pure compute)
- **GET /api/users/me/recommendations** — top-3 unfinished topics
  `{topicSlug, titleUk, titleEn, descriptionUk, descriptionEn, reasonUk, reasonEn, priority}`
- **DELETE /api/admin/feedback** — admin-only clear
- **GET /api/admin/feedback.csv** — admin-only UTF-8 BOM CSV export

The analytics dashboard at `/analytics` includes: filters (period 7d/30d/all + topic),
5 KPI cards (with NPS), conclusion block, NPS PieChart, criteria RadarChart,
time-series LineChart, topic comparison BarChart, two WordClouds (positive/negative),
rating distribution + satisfaction pies, course/specialty bars, sortable feedback
table. Auto-refresh every 30 s. Print CSS @media (`@page A4`, hides nav/sidebar).
Client-side **PDF export** uses dynamic import of `html2canvas + jspdf`.

## Topics & Sub-Topics
- **Schema:** `topics.subTopics` is `jsonb` typed as `SubTopic[]` (see `shared/schema.ts`).
  `SubTopic = { titleUk, titleEn, descUk, descEn, url? }`
- **Canonical sub-topic data** lives in `shared/topic-subtopics.ts` and is reused by:
  1. The runtime seeder in `server/routes.ts` (creates topics on first start)
  2. The migration script `scripts/migrate-subtopics.mjs` (one-shot ALTER + UPDATE
     for environments that were seeded before the schema change)
- **Renames:** Topics are now displayed as **Oracle Academy / AWS Academy /
  Cisco Academy** (was "Oracle / Amazon Web Services / Cisco Systems"). Naming is
  consistent across Hub, Layout, Topic page and DB-stored `topics.name`.
- **Topic page render** (`client/src/pages/topic.tsx`) renders each sub-topic as
  a numbered card with bilingual title, description and an optional external
  "Details" link (`url`). Has a backwards-compat fallback for legacy `string[]`.

## Notable Components
- `client/src/components/Layout.tsx` — top header banner + nav links + side panels
- `client/src/components/PollAnalytics.tsx` — admin poll analytics with Recharts
- `client/src/components/FeedbackTable.tsx` — sortable/filterable responses table
- `client/src/components/WordCloud.tsx` — SVG-free word cloud (sized + colored spans)
- `client/src/components/StatCounter.tsx` — animated count-up using `framer-motion useInView`
  + RAF easing; props `value/suffix/prefix/label/sublabel/icon/accent/duration/decimals/testId`
  with 6 accent variants (emerald/violet/sky/amber/rose/blue). Used on /, /students,
  /applicants, /teachers.

## Home Page Sections (`client/src/pages/home.tsx`)
Rich landing layout with the following ordered sections (each `space-y-14`):
1. **Hero** — gradient `primary→blue→indigo` bg, dot-grid + 2 blur blobs, 2-col layout
   with floating Cisco/Oracle/AWS chips on the right (md+); 3 CTAs (Register/Hub/Leaders);
   Register CTA hidden when `isAuthenticated`.
2. **Audience cards (×3)** — Студентам/Абітурієнтам/Викладачам in their respective
   theme colors (emerald/violet/sky), gradient icon, ring-shadow, stat badge, ChevronRight.
3. **Live stats (×4)** — `StatCounter` driven by `/api/stats/overview` — totalUsers,
   totalTopics, max(totalCompleted, totalSubModules), 100% free.
4. **Progress card** — visible only when `isAuthenticated`; pulls `/api/progress`,
   shows Trophy icon + greeting + Progress bar + topic-status chips.
5. **Topic cards (×3)** — existing `<TopicCard>` for Oracle/AWS/Cisco.
6. **Why IT-HUB (×6)** — benefit grid with icons (ShieldCheck/Award/Network/Globe/Clock/Cloud).
7. **How it works (×4 steps)** — horizontal timeline with gradient connecting line and
   numbered step bubbles; UserPlus/Compass/BookOpen/Trophy icons.
8. **FAQ (sticky 2-col)** — sticky left intro (badge + heading + "Ask question" CTA →
   `/feedback`); right shadcn `<Accordion type="single" collapsible>` with 7 bilingual
   Q&As (cost / certificates / who can register / duration / language / curriculum /
   support); first item open by default; numbered chip on each trigger.
9. **Community (2-col)** — left: active poll from `/api/polls` (vote handler with
   optimistic toast + `invalidateQueries`); right: top-5 from `/api/users/leaderboard`
   sorted client-side by `completedTopics` with medal coloring for top-3.
10. **Events calendar (×6)** — 3-col responsive grid of event cards covering May–Jul
    2026: FFDT Open Day, Cisco CCNA spring start, AWS Cloud Practitioner deadline,
    Oracle 21c webinar, KITiS Summer School, Cisco IT Essentials new cohort. Each card
    has a gradient date tile (day/month-abbr/year) with overlapping circular icon badge
    and a content side (kind chip + title + desc + location/time meta). Bilingual via
    inline `monthShort()` helper. Tones per event kind (event/course/deadline/webinar).
11. **Partners band (×6)** — Cisco/Oracle/AWS (react-icons/si) + DPU/FFCT/KITiS
    (lucide icons).
12. **Final CTA** — gradient indigo→cyan banner with Register + Feedback CTAs;
    Register hidden when authenticated.

All Link/anchor wrappers are styled directly (no nested `<button>` inside `<Link>`/`<a>`)
to avoid invalid HTML5 nesting and a11y issues.

## Notable Pages
- `client/src/pages/feedback.tsx` — topic selector, overall + 3-criteria stars,
  NPS 0-10 grid (rose/amber/emerald), like/dislike, conditional pros/cons textareas
- `client/src/pages/analytics.tsx` — full dashboard (filters, NPS, radar, time series,
  word cloud, topic breakdown, PDF export, print CSS, real-time refetch 30 s)
- `client/src/pages/students.tsx` / `applicants.tsx` / `teachers.tsx` — audience
  landing pages, each with themed hero (emerald/violet/sky), floating chips,
  StatCounters, benefit grid, custom timeline, and theme-coloured CTA banners.
- `client/src/pages/profile.tsx` — server-driven achievements grid + recommendations

## Development
- Workflow `Start application` runs `npm run dev` (Express + Vite on port 5000)
- DB schema sync: `npm run db:push --force` (some renames must be done via SQL)
- Demo data: 14 seeded feedback responses (avgRating 4.21, ~78% satisfied)

## Conventions
- All interactive elements have `data-testid` attributes following
  `{action}-{target}` or `{type}-{content}` patterns
- Bilingual: every user-facing string has UK and EN variants based on `useLanguage()`
- TanStack Query v5 object form everywhere; cache invalidation by array key
- Zod validation: `insertFeedbackResponseSchema` from `@shared/schema` is the
  source of truth on the backend; the form mirrors it locally with localized
  error messages
- Error handling: every new API route uses try/catch with stable JSON 5xx responses
- Admin-only endpoints check `req.isAuthenticated() && (req.user as any).isAdmin`
