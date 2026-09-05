import { communityCatalog } from "./communityData";
import type { Community, CommunityMembership } from "./communityTypes";

export type Member = {
  id: string;
  name: string;
  initials: string;
  skill: string;
  offers: string[];
  title: string;
  about: string;
  distance: number;
  karma: number;
  trades: number;
  years: number;
  wants: string[];
  color: string;
  available: string;
  remote: boolean;
  offerReach: Record<string, "Local" | "Remote" | "Local & Remote">;
  examples: string[];
  interests: string[];
  workingStyle: string;
  exchangeIdeas: string[];
  repeatPartners: number;
  communityId: string;
  communityIds: string[];
  latitude: number;
  longitude: number;
  locationLabel: string;
};
const memberSeeds: Omit<
  Member,
  | "interests"
  | "workingStyle"
  | "exchangeIdeas"
  | "repeatPartners"
  | "communityId"
  | "communityIds"
  | "latitude"
  | "longitude"
  | "locationLabel"
>[] = [
  {
    id: "marcus",
    name: "Marcus Chen",
    initials: "MC",
    skill: "Plumbing",
    offers: ["Plumbing", "Home repairs", "Water systems"],
    title: "Fixtures, faucets, and household plumbing repairs.",
    about:
      "I enjoy solving the everyday plumbing problems that get put off. Happy to talk through the job first so we both know what to expect.",
    distance: 1.2,
    karma: 38,
    trades: 24,
    years: 9,
    wants: ["Electrical", "Carpentry", "Gardening"],
    color: "#e1ebee",
    available: "This week",
    remote: false,
    offerReach: {
      Plumbing: "Local",
      "Home repairs": "Local",
      "Water systems": "Local",
    },
    examples: [
      "Replace a kitchen faucet",
      "Repair a running toilet",
      "Install a shower fixture",
    ],
  },
  {
    id: "sofia",
    name: "Sofia Rivera",
    initials: "SR",
    skill: "Gardening",
    offers: ["Gardening", "Farming", "Land care"],
    title: "Yard care, planting, and food-growing support.",
    about:
      "From a fresh cut to a fresh start for your garden. I bring my own basic tools and love helping neighbors grow something good.",
    distance: 2.4,
    karma: 24,
    trades: 16,
    years: 6,
    wants: ["Home repairs", "Pet care", "Plumbing"],
    color: "#e8ecd6",
    available: "Weekends",
    remote: false,
    offerReach: {
      Gardening: "Local",
      Farming: "Local",
      "Land care": "Local",
    },
    examples: [
      "Mow a small yard",
      "Prepare a vegetable bed",
      "Seasonal garden cleanup",
    ],
  },
  {
    id: "james",
    name: "James Wilson",
    initials: "JW",
    skill: "Carpentry",
    offers: ["Carpentry", "Woodworking", "Home repairs"],
    title: "Furniture repair, shelving, and practical carpentry.",
    about:
      "Furniture repairs, shelves, and practical woodworking. I like clear plans, thoughtful materials, and leaving a space better than I found it.",
    distance: 3.1,
    karma: 56,
    trades: 32,
    years: 12,
    wants: ["Electrical", "Gardening", "Plumbing"],
    color: "#f0e3d3",
    available: "This week",
    remote: false,
    offerReach: {
      Carpentry: "Local",
      Woodworking: "Local",
      "Home repairs": "Local",
    },
    examples: [
      "Fit a floating shelf",
      "Repair a wooden chair",
      "Adjust a sticking door",
    ],
  },
  {
    id: "amara",
    name: "Amara Brooks",
    initials: "AB",
    skill: "Pet care",
    offers: ["Pet care", "House sitting", "Errands"],
    title: "Dependable dog walking and pet visits.",
    about:
      "Patient walks and dependable company for dogs. Let’s meet with your pet first and make sure everyone feels comfortable.",
    distance: 0.8,
    karma: 19,
    trades: 12,
    years: 4,
    wants: ["Gardening", "Tutoring", "Home repairs"],
    color: "#eee1e9",
    available: "This week",
    remote: false,
    offerReach: {
      "Pet care": "Local",
      "House sitting": "Local",
      Errands: "Local",
    },
    examples: [
      "A 30-minute neighborhood walk",
      "An afternoon pet visit",
      "A recurring walking arrangement",
    ],
  },
  {
    id: "daniel",
    name: "Daniel Park",
    initials: "DP",
    skill: "Electrical",
    offers: ["Electrical", "Home repairs", "Technical help"],
    title: "Residential lighting assessment and electrical planning.",
    about:
      "I can help assess lighting projects and explain what is involved. The exact work depends on the existing installation and local requirements.",
    distance: 4.5,
    karma: 31,
    trades: 21,
    years: 8,
    wants: ["Plumbing", "Carpentry", "Gardening"],
    color: "#f4ebcb",
    available: "Weekends",
    remote: false,
    offerReach: {
      Electrical: "Local",
      "Home repairs": "Local",
      "Technical help": "Remote",
    },
    examples: [
      "Assess a light fixture replacement",
      "Plan under-cabinet lighting",
      "Help identify a lighting problem",
    ],
  },
  {
    id: "leila",
    name: "Leila Hassan",
    initials: "LH",
    skill: "Tutoring",
    offers: ["Tutoring", "Languages", "Computer help"],
    title: "Practical tutoring in math and language.",
    about:
      "Friendly, practical math and language sessions for adult learners. We can meet online and work at a pace that suits you.",
    distance: 6.2,
    karma: 17,
    trades: 10,
    years: 5,
    wants: ["Design", "Gardening", "Bookkeeping"],
    color: "#e3e4f2",
    available: "This week",
    remote: true,
    offerReach: {
      Tutoring: "Remote",
      Languages: "Remote",
      "Computer help": "Remote",
    },
    examples: [
      "An hour of conversational French",
      "Help with everyday math",
      "Review a study plan",
    ],
  },
];
const personal: Record<
  string,
  {
    interests: string[];
    workingStyle: string;
    exchangeIdeas: string[];
    repeatPartners: number;
    communityId: string;
    communityIds: string[];
    latitude: number;
    longitude: number;
    locationLabel: string;
  }
> = {
  marcus: {
    interests: ["Hiking", "Cooking", "Live music"],
    workingStyle:
      "I explain the work, agree on the scope, and communicate directly if anything changes.",
    repeatPartners: 8,
    communityId: "homestead-builders",
    communityIds: ["homestead-builders", "makers-united"],
    latitude: 40.735,
    longitude: -74.273,
    locationLabel: "Maplewood",
    exchangeIdeas: [
      "A faucet replacement for help with a light fixture — both jobs checked first.",
    ],
  },
  sofia: {
    interests: ["Growing food", "Dogs", "Cooking"],
    workingStyle:
      "I confirm the plan first, bring my basic tools, and leave the work area orderly.",
    repeatPartners: 6,
    communityId: "neighbor-network",
    communityIds: ["neighbor-network", "homestead-builders"],
    latitude: 40.748,
    longitude: -74.266,
    locationLabel: "Maplewood",
    exchangeIdeas: ["A small-yard tidy-up for help putting up a shelf."],
  },
  james: {
    interests: ["Woodworking", "Live music", "Hiking"],
    workingStyle:
      "I prefer a clear plan, careful material choices, and focused work once we begin.",
    repeatPartners: 11,
    communityId: "makers-united",
    communityIds: ["makers-united", "homestead-builders"],
    latitude: 40.722,
    longitude: -74.279,
    locationLabel: "South Orange",
    exchangeIdeas: ["Repair a chair in exchange for a hand in the garden."],
  },
  amara: {
    interests: ["Dogs", "Hiking", "Photography"],
    workingStyle:
      "I start with a short introduction, follow care instructions closely, and communicate directly.",
    repeatPartners: 5,
    communityId: "neighbor-network",
    communityIds: ["neighbor-network"],
    latitude: 40.729,
    longitude: -74.263,
    locationLabel: "Irvington",
    exchangeIdeas: ["A few dog walks for help getting a garden bed started."],
  },
  daniel: {
    interests: ["Cycling", "Cooking", "Woodworking"],
    workingStyle:
      "Happy to share what I know. I focus while working and enjoy catching up afterward.",
    repeatPartners: 7,
    communityId: "",
    communityIds: [],
    latitude: 40.751,
    longitude: -74.254,
    locationLabel: "Union",
    exchangeIdeas: [
      "Help with a lighting job for a small plumbing repair, after checking both scopes.",
    ],
  },
  leila: {
    interests: ["Reading", "Languages", "Growing food"],
    workingStyle:
      "I arrive prepared, set a clear goal for the session, and work at the learner’s pace.",
    repeatPartners: 4,
    communityId: "remote-skills",
    communityIds: ["remote-skills", "homestead-builders"],
    latitude: 40.79,
    longitude: -74.21,
    locationLabel: "Montclair",
    exchangeIdeas: ["A language session for a little design help."],
  },
};
export const members: Member[] = memberSeeds.map((m) => ({
  ...m,
  ...personal[m.id],
}));
export const interestOptions = [
  "Hiking",
  "Cooking",
  "Live music",
  "Growing food",
  "Dogs",
  "Woodworking",
  "Cycling",
  "Photography",
  "Reading",
  "Languages",
  "Board games",
  "Coffee & conversation",
];
export const workStyles = [
  "Communicate directly as we go",
  "Prefer to focus, catch up after",
  "Enjoy working alongside someone",
  "Talk through the plan before starting",
  "Keep it practical and friendly",
];
export type Profile = {
  name: string;
  area: string;
  bio: string;
  skills: string[];
  availability: string;
  radius: string;
  onboarded: boolean;
  interests: string[];
  workingStyle: string;
  wants: string[];
  tools: string;
  exclusions: string;
  latitude: number;
  longitude: number;
  approximateLocationLabel: string;
  homeCommunityId: string;
  primaryCommunityId?: string;
  serviceReach: "Local" | "Remote" | "Local & Remote";
  searchRadiusMiles: number;
  remoteAvailable: boolean;
  locationUpdatedAt: string;
  communityAssignmentType: "automatic" | "manual";
};
export type Trade = {
  id: string;
  memberId: string;
  need: string;
  offer: string;
  theirEffort: string;
  myEffort: string;
  materials: string;
  timing: string;
  notes: string;
  stage:
    | "Draft"
    | "Interest sent"
    | "Interested"
    | "Declined"
    | "Proposed"
    | "Agreed"
    | "In progress"
    | "Completed"
    | "Cancelled";
  phase?: "hello" | "details";
  interestConfirmed?: boolean;
  mineDone: boolean;
  theirsDone: boolean;
  fair: boolean | null;
  created: string;
};
export type Message = {
  id: string;
  memberId: string;
  text: string;
  time: string;
  mine: boolean;
};
export type State = {
  profile: Profile;
  saved: string[];
  blocked: string[];
  trades: Trade[];
  messages: Message[];
  joined: string[];
  claims: string[];
  reports: { memberId: string; reason: string }[];
  communities: Community[];
  memberships: CommunityMembership[];
};
export const initialState: State = {
  profile: {
    name: "Your name",
    area: "Maplewood",
    bio: "",
    skills: ["Electrical", "Home repairs"],
    availability: "Weekends",
    radius: "20 miles",
    onboarded: false,
    interests: [],
    workingStyle: "",
    wants: [],
    tools: "",
    exclusions: "",
    latitude: 40.7312,
    longitude: -74.2714,
    approximateLocationLabel: "Maplewood",
    homeCommunityId: "",
    primaryCommunityId: undefined,
    serviceReach: "Local",
    searchRadiusMiles: 20,
    remoteAvailable: false,
    locationUpdatedAt: "2026-09-05T00:00:00.000Z",
    communityAssignmentType: "manual",
  },
  saved: [],
  blocked: [],
  trades: [],
  messages: [
    {
      id: "welcome",
      memberId: "marcus",
      text: "Hi! Happy to talk through a plumbing job. A description of the fixture and what needs fixing is a good place to start.",
      time: "Sample conversation",
      mine: false,
    },
  ],
  joined: [],
  claims: [],
  reports: [],
  communities: communityCatalog,
  memberships: [],
};
export const skills = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Gardening",
  "Farming",
  "Land care",
  "Pet care",
  "Home repairs",
  "Tutoring",
  "Design",
  "Cooking",
  "Moving",
  "Cleaning",
  "Computer help",
  "Languages",
  "Bookkeeping",
  "Technical help",
  "Water systems",
];
export const gifts = [
  {
    id: "eggs",
    title: "A dozen fresh eggs",
    owner: "Sofia Rivera",
    detail: "Collected this week · bring a carton",
    icon: "sun",
    color: "#f3eacb",
  },
  {
    id: "pots",
    title: "Terracotta plant pots",
    owner: "James Wilson",
    detail: "Set of 4 · used, in good condition",
    icon: "box",
    color: "#ecdfd3",
  },
  {
    id: "books",
    title: "Books for a new gardener",
    owner: "Leila Hassan",
    detail: "3 well-loved guides · porch pickup",
    icon: "book-open",
    color: "#e5ead8",
  },
];
