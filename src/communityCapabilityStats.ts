import type { Member } from "./data";

export type CapabilityStat = { skill: string; count: number };

export const communityCapabilityStats = (
  communityId: string,
  members: Member[],
): CapabilityStat[] => {
  const counts = members
    .filter((member) => member.communityId === communityId)
    .reduce<Record<string, number>>((result, member) => {
      member.offers.forEach((offer) => {
        result[offer] = (result[offer] || 0) + 1;
      });
      return result;
    }, {});
  return Object.entries(counts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill));
};

const usefulSkills = [
  "Electrical",
  "Plumbing",
  "Gardening",
  "Carpentry",
  "Mechanical",
  "HVAC",
  "Roofing",
  "Appliance repair",
];

export const scarceCommunitySkills = (
  communityId: string,
  members: Member[],
  limit = 4,
) => {
  const present = new Set(
    members
      .filter((member) => member.communityId === communityId)
      .flatMap((member) => member.offers),
  );
  return usefulSkills.filter((skill) => !present.has(skill)).slice(0, limit);
};
