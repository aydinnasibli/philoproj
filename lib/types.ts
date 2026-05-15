export type InfluenceLink = { id: string; strength: "strong" | "medium" | "weak" };

export type PhilosopherNode = {
  _id: string;
  name: string;
  slug: string;
  coreBranch: string;
  hookQuote: string;
  shortSummary: string;
  avatarUrl: string;
  networkX: number;
  networkY: number;
  mentors: InfluenceLink[];
  students: InfluenceLink[];
  influences: InfluenceLink[];
};

export type PhilosopherListItem = {
  _id: string;
  name: string;
  slug: string;
  coreBranch: string;
  birthYear: number;
  deathYear: number;
  avatarUrl: string;
  eraTitle: string;
  eraId: string;
};

export type EraWithPhilosophers = {
  _id: string;
  title: string;
  slug: string;
  startYear: number;
  endYear: number;
  description: string;
  philosophers: {
    _id: string;
    name: string;
    slug: string;
    coreBranch: string;
    avatarUrl: string;
  }[];
};

export type FullPhilosopher = {
  _id: string;
  name: string;
  slug: string;
  coreBranch: string;
  birthYear: number;
  deathYear: number;
  hookQuote: string;
  shortSummary: string;
  fullBiography: string;
  avatarUrl: string;
  importantWorks: { title: string; year: number; synopsis: string }[];
  keyTakeaways: string[];
  eraTitle: string;
  eraSlug: string;
  eraId: string;
  mentors: { _id: string; name: string; slug: string; avatarUrl: string; coreBranch: string }[];
  students: { _id: string; name: string; slug: string; avatarUrl: string; coreBranch: string }[];
};

export type LineageNode = PhilosopherNode & {
  eraId: string;
  eraTitle: string;
  eraSlug: string;
  eraDescription: string;
  birthYear: number;
  deathYear: number;
};

export type SchoolWithPhilosophers = {
  _id: string;
  title: string;
  slug: string;
  eraRange: string;
  startYear?: number;
  tagline?: string;
  networkX?: number;
  networkY?: number;
  description: string;
  coreIdeas: string[];
  philosophers: { _id: string; name: string; slug: string; avatarUrl: string; coreBranch: string }[];
  influencedBy: { _id: string; title: string; slug: string }[];
  influencedTo: { _id: string; title: string; slug: string }[];
};
