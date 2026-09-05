import { Community, CommunityLeaderboardEntry } from "./communityTypes";
export const calculateCommunityLevel = (c: Community) =>
  Math.max(
    1,
    Math.floor(
      Math.sqrt(
        c.stats.confirmedContributions / 105 +
          c.stats.activeContributorsMonth / 8,
      ),
    ),
  );
export type LeaderboardCategory =
  | "Overall"
  | "Most Active"
  | "Most Reliable"
  | "Fastest Growing"
  | "Best Trade Completion";
export const communityLeaderboard = (
  communities: Community[],
  category: LeaderboardCategory,
): CommunityLeaderboardEntry[] =>
  communities
    .map((c) => {
      const s = c.stats;
      const score =
        category === "Most Active"
          ? s.recentActivity / Math.max(25, c.memberCount)
          : category === "Most Reliable"
            ? s.fairTradeRate
            : category === "Fastest Growing"
              ? s.memberGrowthMonth
              : category === "Best Trade Completion"
                ? (s.completedTrades /
                    Math.max(
                      1,
                      s.completedTrades + Math.round(s.recentActivity * 0.08),
                    )) *
                  100
                : calculateCommunityLevel(c) * 10 +
                  s.fairTradeRate / 10 +
                  s.repeatTradeRate / 20;
      const value =
        category === "Most Active"
          ? `${Math.round(score * 100)} active / 100 members`
          : category === "Fastest Growing"
            ? `${score.toFixed(1)}% this month`
            : category === "Overall"
              ? `Level ${calculateCommunityLevel(c)}`
              : `${Math.round(score)}%`;
      return { communityId: c.id, score, value };
    })
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({
      communityId: e.communityId,
      rank: i + 1,
      value: e.value,
      explanation:
        category === "Overall"
          ? "Confirmed contribution, activity, and reliability"
          : category,
    }));
