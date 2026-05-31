import { pgTable, text, varchar, serial, boolean, integer, json, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Express session store managed by `connect-pg-simple`. Declared here so
// drizzle-kit doesn't try to drop the table during migrations.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire", { precision: 6 }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  patronymic: text("patronymic"),
  phone: text("phone"),
  gender: text("gender"),
  birthYear: text("birth_year"),
  region: text("region"),
  city: text("city"),
  faculty: text("faculty"),
  specialty: text("specialty"),
  course: text("course"),
  academicGroup: text("academic_group"),
  profileImageUrl: text("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users);
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = InsertUser;

export interface SubTopic {
  titleUk: string;
  titleEn: string;
  descUk: string;
  descEn: string;
  url?: string;
}

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // oracle, amazon, cisco
  name: text("name").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  officialUrl: text("official_url"),
  // Each entry is a JSON-stringified `SubTopic` object (kept as text[] so
  // production migrations don't need a destructive ALTER COLUMN cast).
  // Use `parseSubTopic`/`stringifySubTopic` from `shared/topic-subtopics` to convert.
  subTopics: text("sub_topics").array(),
});

export const insertTopicSchema = createInsertSchema(topics).omit({ id: true });
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topicSlug: text("topic_slug").notNull(),
  completedAt: text("completed_at"),
});

export const insertProgressSchema = createInsertSchema(progress).omit({ id: true });
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;

export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topicSlug: text("topic_slug").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: text("completed_at").notNull(),
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({ id: true });
export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;

export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  questionUk: text("question_uk").notNull(),
  questionEn: text("question_en").notNull(),
  optionsUk: text("options_uk").array().notNull(),
  optionsEn: text("options_en").array().notNull(),
  isActive: boolean("is_active").default(true),
  multipleChoice: boolean("multiple_choice").default(false),
  createdAt: text("created_at").notNull(),
});

export const insertPollSchema = createInsertSchema(polls).omit({ id: true });
export type Poll = typeof polls.$inferSelect;
export type InsertPoll = z.infer<typeof insertPollSchema>;

export const pollResponses = pgTable("poll_responses", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull(),
  userId: integer("user_id").notNull(),
  selectedOption: integer("selected_option").notNull(),
  selectedOptions: text("selected_options"),
  respondedAt: text("responded_at").notNull(),
});

export const insertPollResponseSchema = createInsertSchema(pollResponses).omit({ id: true });
export type PollResponse = typeof pollResponses.$inferSelect;
export type InsertPollResponse = z.infer<typeof insertPollResponseSchema>;

export const feedbackResponses = pgTable("feedback_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  name: text("name").notNull(),
  course: text("course").notNull(),
  specialty: text("specialty").notNull(),
  ratingOverall: integer("rating_overall").notNull(),
  ratingContent: integer("rating_content"),
  ratingTeachers: integer("rating_teachers"),
  ratingPlatform: integer("rating_platform"),
  npsScore: integer("nps_score"),
  topic: text("topic"), // 'oracle' | 'amazon' | 'cisco' | 'general'
  liked: boolean("liked").notNull(),
  positiveAspects: text("positive_aspects"),
  negativeAspects: text("negative_aspects"),
  feedbackText: text("feedback_text").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertFeedbackResponseSchema = createInsertSchema(feedbackResponses)
  .omit({ id: true, createdAt: true, userId: true })
  .extend({
    name: z.string().min(2, "Ім'я має містити щонайменше 2 символи"),
    course: z.string().min(1, "Оберіть курс"),
    specialty: z.string().min(1, "Оберіть спеціальність"),
    ratingOverall: z.number().int().min(1).max(5),
    ratingContent: z.number().int().min(1).max(5).optional().nullable(),
    ratingTeachers: z.number().int().min(1).max(5).optional().nullable(),
    ratingPlatform: z.number().int().min(1).max(5).optional().nullable(),
    npsScore: z.number().int().min(0).max(10).optional().nullable(),
    topic: z.enum(["oracle", "amazon", "cisco", "general"]).optional().nullable(),
    liked: z.boolean(),
    feedbackText: z.string().min(5, "Відгук має містити щонайменше 5 символів"),
    positiveAspects: z.string().optional().nullable(),
    negativeAspects: z.string().optional().nullable(),
  });

export type FeedbackResponse = typeof feedbackResponses.$inferSelect;
export type InsertFeedbackResponse = z.infer<typeof insertFeedbackResponseSchema>;
