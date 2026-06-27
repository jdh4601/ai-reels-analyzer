import { z } from "zod";

export const TranscriptLineSchema = z.object({
  startSec: z.number().nonnegative(),
  endSec: z.number().nonnegative(),
  text: z.string(),
});
export type TranscriptLine = z.infer<typeof TranscriptLineSchema>;

export const RetentionPointSchema = z.object({
  sec: z.number().nonnegative(),
  pct: z.number().min(0).max(100),
});
export type RetentionPoint = z.infer<typeof RetentionPointSchema>;

export const ReachSourcesSchema = z.object({
  reelsTab: z.number().min(0).max(100).optional(),
  explore: z.number().min(0).max(100).optional(),
  home: z.number().min(0).max(100).optional(),
  profile: z.number().min(0).max(100).optional(),
  other: z.number().min(0).max(100).optional(),
});
export type ReachSources = z.infer<typeof ReachSourcesSchema>;

export const DerivedRatesSchema = z.object({
  shareRate: z.number(),
  saveRate: z.number(),
  likeRate: z.number(),
  commentRate: z.number(),
  engagementRate: z.number(),
  completionRate: z.number(),
  followRate: z.number().optional(),
});
export type DerivedRates = z.infer<typeof DerivedRatesSchema>;

export const ReelSchema = z.object({
  id: z.string().min(1),
  postedAt: z.string(),
  durationSec: z.number().positive(),
  views: z.number().nonnegative(),
  reach: z.number().nonnegative(),
  likes: z.number().nonnegative(),
  comments: z.number().nonnegative(),
  saves: z.number().nonnegative(),
  shares: z.number().nonnegative(),
  avgWatchTimeSec: z.number().nonnegative(),
  hookRetention3s: z.number().min(0).max(100).optional(),
  retentionCurve: z.array(RetentionPointSchema).optional(),
  reachSources: ReachSourcesSchema.optional(),
  followsFromReel: z.number().nonnegative().optional(),
  caption: z.string().optional(),
  transcript: z.array(TranscriptLineSchema).optional(),
  derived: DerivedRatesSchema.optional(),
});
export type Reel = z.infer<typeof ReelSchema>;

export const AccountSnapshotSchema = z.object({
  date: z.string(),
  followerCount: z.number().nonnegative(),
  reachLast7d: z.number().nonnegative(),
});
export type AccountSnapshot = z.infer<typeof AccountSnapshotSchema>;

// Claude Vision 스크린샷 파싱 결과 (API가 못 주는 3개 지표)
export const ScreenshotParseSchema = z.object({
  hookRetention3s: z.number().min(0).max(100).optional(),
  retentionCurve: z.array(RetentionPointSchema).optional(),
  reachSources: ReachSourcesSchema.optional(),
});
export type ScreenshotParse = z.infer<typeof ScreenshotParseSchema>;
