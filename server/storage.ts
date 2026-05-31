import { type User, type InsertUser, type Topic, type InsertTopic, type Progress, type InsertProgress, type QuizResult, type InsertQuizResult, type Poll, type PollResponse, type InsertPollResponse, type FeedbackResponse, type InsertFeedbackResponse } from "@shared/schema";
import { users, topics, progress, quizResults, polls, pollResponses, feedbackResponses } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<Pick<User, "firstName" | "lastName" | "email">>): Promise<User>;
  getAllUsersWithProgress(): Promise<(User & { completedTopics: number; completedTopicSlugs: string[] })[]>;
  
  getTopics(): Promise<Topic[]>;
  getTopicBySlug(slug: string): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(slug: string, data: Partial<Pick<Topic, "name" | "description" | "content" | "imageUrl" | "officialUrl" | "subTopics">>): Promise<Topic | undefined>;
  
  markProgressCompleted(userId: number, topicSlug: string): Promise<void>;
  getUserProgress(userId: number): Promise<Progress[]>;

  saveQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  getUserQuizResults(userId: number): Promise<QuizResult[]>;
  getQuizResultByTopic(userId: number, topicSlug: string): Promise<QuizResult | undefined>;

  getActivePolls(): Promise<Poll[]>;
  createPoll(poll: { questionUk: string; questionEn: string; optionsUk: string[]; optionsEn: string[]; isActive: boolean; createdAt: string }): Promise<Poll>;
  getPollById(id: number): Promise<Poll | undefined>;
  getPollResponse(pollId: number, userId: number): Promise<PollResponse | undefined>;
  savePollResponse(response: InsertPollResponse): Promise<PollResponse>;
  getPollResults(pollId: number): Promise<{ option: number; count: number }[]>;
  getAllPollResponses(): Promise<PollResponse[]>;

  saveFeedbackResponse(payload: InsertFeedbackResponse & { userId: number | null }): Promise<FeedbackResponse>;
  getAllFeedbackResponses(): Promise<FeedbackResponse[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<Pick<User, "firstName" | "lastName" | "email" | "patronymic" | "phone" | "gender" | "birthYear" | "region" | "city" | "faculty" | "specialty" | "course" | "academicGroup">>): Promise<User> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getTopics(): Promise<Topic[]> {
    return await db.select().from(topics);
  }

  async getTopicBySlug(slug: string): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.slug, slug));
    return topic;
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const [topic] = await db.insert(topics).values(insertTopic).returning();
    return topic;
  }

  async updateTopic(
    slug: string,
    data: Partial<Pick<Topic, "name" | "description" | "content" | "imageUrl" | "officialUrl" | "subTopics">>,
  ): Promise<Topic | undefined> {
    const [topic] = await db.update(topics).set(data).where(eq(topics.slug, slug)).returning();
    return topic;
  }

  async getAllUsersWithProgress(): Promise<(User & { completedTopics: number; completedTopicSlugs: string[] })[]> {
    const allUsers = await db.select().from(users);
    const progressData = await db.select().from(progress);
    
    return allUsers.map(user => {
      const userProgress = progressData.filter(p => p.userId === user.id && p.completedAt);
      return {
        ...user,
        completedTopics: userProgress.length,
        completedTopicSlugs: userProgress.map(p => p.topicSlug),
      };
    });
  }

  async markProgressCompleted(userId: number, topicSlug: string): Promise<void> {
    const existing = await db.select().from(progress)
      .where(eq(progress.userId, userId));
    const topicProgress = existing.find(p => p.topicSlug === topicSlug);
    
    if (!topicProgress) {
      await db.insert(progress).values({
        userId,
        topicSlug,
        completedAt: new Date().toISOString()
      });
    }
  }

  async getUserProgress(userId: number): Promise<Progress[]> {
    return await db.select().from(progress).where(eq(progress.userId, userId));
  }

  async saveQuizResult(result: InsertQuizResult): Promise<QuizResult> {
    const existing = await this.getQuizResultByTopic(result.userId, result.topicSlug);
    if (existing) {
      const [updated] = await db.update(quizResults)
        .set({ score: result.score, completedAt: result.completedAt })
        .where(eq(quizResults.id, existing.id))
        .returning();
      return updated;
    }
    const [saved] = await db.insert(quizResults).values(result).returning();
    return saved;
  }

  async getUserQuizResults(userId: number): Promise<QuizResult[]> {
    return await db.select().from(quizResults).where(eq(quizResults.userId, userId));
  }

  async getQuizResultByTopic(userId: number, topicSlug: string): Promise<QuizResult | undefined> {
    const results = await db.select().from(quizResults).where(eq(quizResults.userId, userId));
    return results.find(r => r.topicSlug === topicSlug);
  }

  async getActivePolls(): Promise<Poll[]> {
    return await db.select().from(polls).where(eq(polls.isActive, true));
  }

  async createPoll(poll: { questionUk: string; questionEn: string; optionsUk: string[]; optionsEn: string[]; isActive: boolean; multipleChoice?: boolean; createdAt: string }): Promise<Poll> {
    const [created] = await db.insert(polls).values(poll).returning();
    return created;
  }

  async getPollById(id: number): Promise<Poll | undefined> {
    const [poll] = await db.select().from(polls).where(eq(polls.id, id));
    return poll;
  }

  async getPollResponse(pollId: number, userId: number): Promise<PollResponse | undefined> {
    const responses = await db.select().from(pollResponses).where(eq(pollResponses.pollId, pollId));
    return responses.find(r => r.userId === userId);
  }

  async savePollResponse(response: InsertPollResponse): Promise<PollResponse> {
    const [saved] = await db.insert(pollResponses).values(response).returning();
    return saved;
  }

  async getPollResults(pollId: number): Promise<{ option: number; count: number }[]> {
    const responses = await db.select().from(pollResponses).where(eq(pollResponses.pollId, pollId));
    const counts: Record<number, number> = {};
    for (const r of responses) {
      if (r.selectedOptions) {
        try {
          const opts: number[] = JSON.parse(r.selectedOptions);
          for (const o of opts) counts[o] = (counts[o] || 0) + 1;
        } catch { counts[r.selectedOption] = (counts[r.selectedOption] || 0) + 1; }
      } else {
        counts[r.selectedOption] = (counts[r.selectedOption] || 0) + 1;
      }
    }
    return Object.entries(counts).map(([opt, count]) => ({ option: Number(opt), count }));
  }

  async getAllPollResponses(): Promise<PollResponse[]> {
    return await db.select().from(pollResponses);
  }

  async saveFeedbackResponse(payload: InsertFeedbackResponse & { userId: number | null }): Promise<FeedbackResponse> {
    const [saved] = await db.insert(feedbackResponses).values({
      ...payload,
      userId: payload.userId,
      createdAt: new Date().toISOString(),
    }).returning();
    return saved;
  }

  async getAllFeedbackResponses(): Promise<FeedbackResponse[]> {
    return await db.select().from(feedbackResponses);
  }
}

export const storage = new DatabaseStorage();
