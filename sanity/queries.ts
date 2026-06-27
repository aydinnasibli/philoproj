import { sanityFetch } from "./fetch";
import { sanityClient } from "./client";
import type {
  LineageNode,
  PhilosopherListItem,
  EraWithPhilosophers,
  FullPhilosopher,
  SchoolWithPhilosophers,
  SchoolListItem,
  LearningPathListItem,
  LearningPathFull,
} from "@/lib/types";

// ── Static params (build-time only — cannot use sanityFetch/draftMode) ───────

export async function getPhilosopherSlugs(): Promise<{ slug: string }[]> {
  const slugs = await sanityClient.fetch<{ slug: string }[]>(
    `*[_type == "philosopher" && defined(slug.current)]{ "slug": slug.current }`
  );
  return slugs;
}

export async function getSchoolSlugs(): Promise<{ slug: string }[]> {
  const slugs = await sanityClient.fetch<{ slug: string }[]>(
    `*[_type == "school" && defined(slug.current)]{ "slug": slug.current }`
  );
  return slugs;
}

// ── Network / Home ────────────────────────────────────────────────────────────

type RawLineageNode = {
  _id: string; name: string; slug: { current: string };
  coreBranch: string; hookQuote: string; shortSummary: string;
  avatarUrl: string; networkX: number; networkY: number;
  era: { _id: string; title: string; slug: { current: string }; description: string };
  birthYear: number; deathYear: number;
  mentors: { philosopher: { _id: string }; strength: string }[];
  students: { philosopher: { _id: string }; strength: string }[];
  influencedBy: { philosopher: { _id: string }; strength: string }[];
};

export async function getLineageNodes(): Promise<LineageNode[]> {
  const { data } = await sanityFetch({
    tags: ["philosopher"],
    query: `
      *[_type == "philosopher"] | order(birthYear asc) [0...500] {
        _id, name, slug, coreBranch, hookQuote, shortSummary,
        avatarUrl, networkX, networkY, birthYear, deathYear,
        "era": era->{ _id, title, slug, description },
        "mentors": mentors[]{
          "philosopher": select(_type == "reference" => @->{ _id }, philosopher->{ _id }),
          "strength": coalesce(strength, "strong")
        },
        "students": students[]{
          "philosopher": select(_type == "reference" => @->{ _id }, philosopher->{ _id }),
          "strength": coalesce(strength, "strong")
        },
        influencedBy[]{ "philosopher": philosopher->{ _id }, strength }
      }
    `,
  });
  const raw = data as RawLineageNode[];

  return raw.map((p) => ({
    _id:          p._id,
    name:         p.name,
    slug:         p.slug.current,
    coreBranch:   p.coreBranch ?? "",
    hookQuote:    p.hookQuote ?? "",
    shortSummary: p.shortSummary ?? "",
    avatarUrl:    p.avatarUrl ?? "",
    networkX:     p.networkX ?? 50,
    networkY:     p.networkY ?? 50,
    mentors:      (p.mentors ?? [])
      .filter((m) => m.philosopher)
      .map((m) => ({ id: m.philosopher._id, strength: (m.strength ?? "strong") as "strong" | "medium" | "weak" })),
    students:     (p.students ?? [])
      .filter((s) => s.philosopher)
      .map((s) => ({ id: s.philosopher._id, strength: (s.strength ?? "strong") as "strong" | "medium" | "weak" })),
    influences:   (p.influencedBy ?? [])
      .filter((i) => i.philosopher)
      .map((i) => ({ id: i.philosopher._id, strength: i.strength as "strong" | "medium" | "weak" })),
    eraId:          p.era?._id ?? "",
    eraTitle:       p.era?.title ?? "",
    eraSlug:        p.era?.slug?.current ?? "",
    eraDescription: p.era?.description ?? "",
    birthYear:      p.birthYear ?? 0,
    deathYear:      p.deathYear ?? 0,
  }));
}

// ── Archive / Philosophers list ───────────────────────────────────────────────

type RawPhilosopherListItem = {
  _id: string; name: string; slug: { current: string };
  coreBranch: string; birthYear: number; deathYear: number;
  avatarUrl: string;
  era: { _id: string; title: string };
};

export async function getPhilosophersAlpha(): Promise<PhilosopherListItem[]> {
  const { data } = await sanityFetch({
    tags: ["philosopher"],
    query: `
      *[_type == "philosopher"] | order(name asc) [0...500] {
        _id, name, slug, coreBranch, birthYear, deathYear, avatarUrl,
        "era": era->{ _id, title }
      }
    `,
  });
  const raw = data as RawPhilosopherListItem[];

  return raw.map((p) => ({
    _id:        p._id,
    name:       p.name,
    slug:       p.slug.current,
    coreBranch: p.coreBranch ?? "",
    birthYear:  p.birthYear ?? 0,
    deathYear:  p.deathYear ?? 0,
    avatarUrl:  p.avatarUrl ?? "",
    eraTitle:   p.era?.title ?? "",
    eraId:      p.era?._id ?? "",
  }));
}

// ── Eras ──────────────────────────────────────────────────────────────────────

type RawEra = {
  _id: string; title: string; slug: { current: string };
  startYear: number; endYear: number; description: string;
  philosophers: { _id: string; name: string; slug: { current: string }; coreBranch: string; avatarUrl: string }[];
};

export async function getErasWithPhilosophers(): Promise<EraWithPhilosophers[]> {
  const { data } = await sanityFetch({
    tags: ["era", "philosopher"],
    query: `
      *[_type == "era"] | order(startYear asc) [0...50] {
        _id, title, slug, startYear, endYear, description,
        "philosophers": *[_type == "philosopher" && references(^._id)] | order(birthYear asc) {
          _id, name, slug, coreBranch, avatarUrl
        }
      }
    `,
  });
  const raw = data as RawEra[];

  return raw.map((e) => ({
    _id:         e._id,
    title:       e.title,
    slug:        e.slug.current,
    startYear:   e.startYear ?? 0,
    endYear:     e.endYear ?? 0,
    description: e.description ?? "",
    philosophers: (e.philosophers ?? []).map((p) => ({
      _id:        p._id,
      name:       p.name,
      slug:       p.slug.current,
      coreBranch: p.coreBranch ?? "",
      avatarUrl:  p.avatarUrl ?? "",
    })),
  }));
}

// ── Philosopher profile ───────────────────────────────────────────────────────

type RawFullPhilosopher = {
  _id: string; name: string; slug: { current: string };
  coreBranch: string; birthYear: number; deathYear: number;
  hookQuote: string; shortSummary: string; fullBiography: string;
  avatarUrl: string;
  importantWorks: { title: string; year: number; synopsis: string }[];
  keyTakeaways: string[];
  primarySources: { title: string; url: string; description: string; excerpt: string }[];
  era: { _id: string; title: string; slug: { current: string } };
  mentors: { _id: string; name: string; slug: { current: string }; avatarUrl: string; coreBranch: string }[];
  students: { _id: string; name: string; slug: { current: string }; avatarUrl: string; coreBranch: string }[];
} | null;

export async function getPhilosopherBySlug(slug: string): Promise<FullPhilosopher | null> {
  const { data } = await sanityFetch({
    tags: ["philosopher"],
    query: `
      *[_type == "philosopher" && slug.current == $slug][0] {
        _id, name, slug, coreBranch, birthYear, deathYear,
        hookQuote, shortSummary, fullBiography, avatarUrl,
        importantWorks, keyTakeaways, primarySources,
        "era": era->{ _id, title, slug },
        "mentors": mentors[]->{ _id, name, slug, avatarUrl, coreBranch },
        "students": students[]->{ _id, name, slug, avatarUrl, coreBranch }
      }
    `,
    params: { slug },
  });
  const raw = data as RawFullPhilosopher;

  if (!raw) return null;

  return {
    _id:           raw._id,
    name:          raw.name,
    slug:          raw.slug.current,
    coreBranch:    raw.coreBranch ?? "",
    birthYear:     raw.birthYear ?? 0,
    deathYear:     raw.deathYear ?? 0,
    hookQuote:     raw.hookQuote ?? "",
    shortSummary:  raw.shortSummary ?? "",
    fullBiography: raw.fullBiography ?? "",
    avatarUrl:     raw.avatarUrl ?? "",
    importantWorks:  raw.importantWorks ?? [],
    keyTakeaways:    raw.keyTakeaways ?? [],
    primarySources:  (raw.primarySources ?? []).map(s => ({
      title: s.title ?? "", url: s.url ?? "", description: s.description ?? "", excerpt: s.excerpt ?? "",
    })),
    eraTitle:      raw.era?.title ?? "",
    eraSlug:       raw.era?.slug?.current ?? "",
    eraId:         raw.era?._id ?? "",
    mentors: (raw.mentors ?? []).filter(Boolean).map((m) => ({
      _id:        m._id,
      name:       m.name,
      slug:       m.slug.current,
      avatarUrl:  m.avatarUrl ?? "",
      coreBranch: m.coreBranch ?? "",
    })),
    students: (raw.students ?? []).filter(Boolean).map((s) => ({
      _id:        s._id,
      name:       s.name,
      slug:       s.slug.current,
      avatarUrl:  s.avatarUrl ?? "",
      coreBranch: s.coreBranch ?? "",
    })),
  };
}

// ── Schools ───────────────────────────────────────────────────────────────────

type RawPhilosopherRef = { _id: string; name: string; slug: { current: string }; avatarUrl: string; coreBranch: string };

type RawSchool = {
  _id: string; title: string; slug: { current: string };
  eraRange: string; startYear?: number; tagline?: string; networkX?: number; networkY?: number;
  description: string; coreIdeas: string[];
  philosophers: RawPhilosopherRef[];
  keyThinkers: RawPhilosopherRef[];
  influencedBy: { _id: string; title: string; slug: { current: string } }[];
  influencedTo: { _id: string; title: string; slug: { current: string } }[];
} | null;

export async function getSchoolBySlug(slug: string): Promise<SchoolWithPhilosophers | null> {
  const { data } = await sanityFetch({
    tags: ["school"],
    query: `
      *[_type == "school" && slug.current == $slug][0] {
        _id, title, slug, eraRange, startYear, tagline, networkX, networkY, description, coreIdeas,
        "philosophers": philosophers[].philosopher->{ _id, name, slug, avatarUrl, coreBranch },
        "keyThinkers": philosophers[isKeyThinker == true].philosopher->{ _id, name, slug, avatarUrl, coreBranch },
        "influencedBy": influencedBy[]->{ _id, title, slug },
        "influencedTo": influencedTo[]->{ _id, title, slug }
      }
    `,
    params: { slug },
  });
  const raw = data as RawSchool;

  if (!raw) return null;

  return {
    _id:         raw._id,
    title:       raw.title,
    slug:        raw.slug.current,
    eraRange:    raw.eraRange ?? "",
    startYear:   raw.startYear,
    tagline:     raw.tagline,
    networkX:    raw.networkX,
    networkY:    raw.networkY,
    description: raw.description ?? "",
    coreIdeas:   raw.coreIdeas ?? [],
    philosophers: (raw.philosophers ?? []).filter(Boolean).map((p) => ({
      _id:        p._id,
      name:       p.name,
      slug:       p.slug.current,
      avatarUrl:  p.avatarUrl ?? "",
      coreBranch: p.coreBranch ?? "",
    })),
    keyThinkers: (raw.keyThinkers ?? []).filter(Boolean).map((p) => ({
      _id:        p._id,
      name:       p.name,
      slug:       p.slug.current,
      avatarUrl:  p.avatarUrl ?? "",
      coreBranch: p.coreBranch ?? "",
    })),
    influencedBy: (raw.influencedBy ?? []).filter(Boolean).map((b) => ({
      _id: b._id, title: b.title, slug: b.slug.current,
    })),
    influencedTo: (raw.influencedTo ?? []).filter(Boolean).map((t) => ({
      _id: t._id, title: t.title, slug: t.slug.current,
    })),
  };
}

export async function getSchoolsList(): Promise<SchoolListItem[]> {
  const { data } = await sanityFetch({
    tags: ["school"],
    query: `
      *[_type == "school"] | order(startYear asc) [0...200] {
        _id, title, "slug": slug.current, eraRange, description,
        "philosopherPreview": philosophers[0..2][].philosopher->{ _id, name },
        "philosopherCount": count(philosophers)
      }
    `,
  });
  const raw = data as { _id: string; title: string; slug: string; eraRange: string; description: string; philosopherPreview: { _id: string; name: string }[] | null; philosopherCount: number }[];

  return raw.map((s) => ({
    _id:               s._id,
    title:             s.title,
    slug:              s.slug,
    eraRange:          s.eraRange ?? "",
    description:       s.description ?? "",
    philosopherPreview: (s.philosopherPreview ?? []).filter(Boolean),
    philosopherCount:  s.philosopherCount ?? 0,
  }));
}

export async function getSchoolsWithPhilosophers(): Promise<SchoolWithPhilosophers[]> {
  const { data } = await sanityFetch({
    tags: ["school"],
    query: `
      *[_type == "school"] | order(startYear asc) [0...200] {
        _id, title, slug, eraRange, startYear, tagline, networkX, networkY, description, coreIdeas,
        "philosophers": philosophers[].philosopher->{ _id, name, slug, avatarUrl, coreBranch },
        "keyThinkers": philosophers[isKeyThinker == true].philosopher->{ _id, name, slug, avatarUrl, coreBranch },
        "influencedBy": influencedBy[]->{ _id, title, slug },
        "influencedTo": influencedTo[]->{ _id, title, slug }
      }
    `,
  });
  const raw = data as Exclude<RawSchool, null>[];

  return raw.map((s) => ({
    _id:         s._id,
    title:       s.title,
    slug:        s.slug.current,
    eraRange:    s.eraRange ?? "",
    startYear:   s.startYear,
    tagline:     s.tagline,
    networkX:    s.networkX,
    networkY:    s.networkY,
    description: s.description ?? "",
    coreIdeas:   s.coreIdeas ?? [],
    philosophers: (s.philosophers ?? []).filter(Boolean).map((p) => ({
      _id:        p._id,
      name:       p.name,
      slug:       p.slug.current,
      avatarUrl:  p.avatarUrl ?? "",
      coreBranch: p.coreBranch ?? "",
    })),
    keyThinkers: (s.keyThinkers ?? []).filter(Boolean).map((p) => ({
      _id:        p._id,
      name:       p.name,
      slug:       p.slug.current,
      avatarUrl:  p.avatarUrl ?? "",
      coreBranch: p.coreBranch ?? "",
    })),
    influencedBy: (s.influencedBy ?? []).filter(Boolean).map((b) => ({
      _id: b._id, title: b.title, slug: b.slug.current,
    })),
    influencedTo: (s.influencedTo ?? []).filter(Boolean).map((t) => ({
      _id: t._id, title: t.title, slug: t.slug.current,
    })),
  }));
}

// ── Learning Paths ────────────────────────────────────────────────────────────

export async function getLearningPathSlugs(): Promise<{ slug: string }[]> {
  return sanityClient.fetch<{ slug: string }[]>(
    `*[_type == "learningPath" && defined(slug.current)]{ "slug": slug.current }`
  );
}

export async function getLearningPaths(): Promise<LearningPathListItem[]> {
  const { data } = await sanityFetch({
    tags: ["learningPath"],
    query: `
      *[_type == "learningPath"] | order(_createdAt desc) [0...100] {
        _id, title, "slug": slug.current, description, difficulty, estimatedMinutes, tags,
        "stepCount": count(steps)
      }
    `,
  });
  type Raw = { _id: string; title: string; slug: string; description: string; difficulty: string; estimatedMinutes: number; tags: string[]; stepCount: number };
  return (data as Raw[]).map((p) => ({
    _id:              p._id,
    title:            p.title,
    slug:             p.slug,
    description:      p.description ?? "",
    difficulty:       p.difficulty ?? "beginner",
    estimatedMinutes: p.estimatedMinutes ?? 0,
    tags:             p.tags ?? [],
    stepCount:        p.stepCount ?? 0,
  }));
}

export async function getLearningPathBySlug(slug: string): Promise<LearningPathFull | null> {
  const { data } = await sanityFetch({
    tags: ["learningPath"],
    query: `
      *[_type == "learningPath" && slug.current == $slug][0] {
        _id, title, "slug": slug.current, description, difficulty, estimatedMinutes, tags,
        "stepCount": count(steps),
        "steps": steps[] {
          title, description, type, readingContent,
          "philosopher": philosopher->{ _id, name, "slug": slug.current, avatarUrl },
          "school": school->{ _id, title, "slug": slug.current }
        }
      }
    `,
    params: { slug },
  });
  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = data as any;
  return {
    _id:              p._id,
    title:            p.title,
    slug:             p.slug,
    description:      p.description ?? "",
    difficulty:       p.difficulty ?? "beginner",
    estimatedMinutes: p.estimatedMinutes ?? 0,
    tags:             p.tags ?? [],
    stepCount:        p.stepCount ?? 0,
    steps: (p.steps ?? []).map((s: Record<string, unknown>) => ({
      title:          s.title ?? "",
      description:    s.description ?? "",
      type:           s.type ?? "reading",
      philosopher:    s.philosopher ?? undefined,
      school:         s.school ?? undefined,
      readingContent: s.readingContent ?? undefined,
    })),
  };
}
