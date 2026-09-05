export type Coordinates = { latitude: number; longitude: number };
export type ServiceReach = "Local" | "Remote" | "Local & Remote";
export type CommunityRole = "leader" | "co-leader" | "moderator" | "member";
export type MembershipType = "open" | "approval" | "invite-only";

export type CommunityStats = {
  confirmedContributions: number;
  completedTrades: number;
  activeContributorsMonth: number;
  uniqueMembersHelped: number;
  repeatTradeRate: number;
  fairTradeRate: number;
  recentActivity: number;
  memberGrowthMonth: number;
};
export type CommunityLeadership = {
  leader: string;
  coLeaders: string[];
  moderatorCount: number;
};
export type Community = {
  id: string;
  name: string;
  icon: string;
  banner?: string;
  description: string;
  tags: string[];
  specialties: string[];
  needs: string[];
  level: number;
  memberCount: number;
  stats: CommunityStats;
  createdAt: string;
  leadership: CommunityLeadership;
  rules: string[];
  membershipType: MembershipType;
  parentCommunityId?: string;
  regions: string[];
};
export type CommunityMembership = {
  userId: string;
  communityId: string;
  role: CommunityRole;
  joinedAt: string;
  primary: boolean;
  status: "active" | "pending";
};
export type CommunityCapability = {
  name: string;
  providers: number;
  requests: number;
};
export type CommunityLeaderboardEntry = {
  communityId: string;
  rank: number;
  value: string;
  explanation: string;
};
export type CommunityContributionEvent = {
  id: string;
  communityId: string;
  tradeId: string;
  contributorId: string;
  recipientId: string;
  confirmedAt: string;
  kind: "completed-trade" | "confirmed-contribution";
};
export type LocationResolution = Coordinates & {
  approximateLocationLabel: string;
  source: "demo-geocode" | "regional-fallback";
};

export const rolePermissions: Record<CommunityRole, string[]> = {
  leader: [
    "settings",
    "identity",
    "rules",
    "members",
    "roles",
    "announcements",
    "moderation",
  ],
  "co-leader": ["members", "moderator-roles", "announcements", "moderation"],
  moderator: ["moderation", "reports"],
  member: ["participate", "trade", "communicate", "contribute"],
};
