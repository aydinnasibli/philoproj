import { sanityFetch } from "./live";
import { sanityClient } from "./client";
import type {
  LineageNode,
  PhilosopherListItem,
  EraWithPhilosophers,
  FullPhilosopher,
  SchoolWithPhilosophers,
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
  mentors: { _id: string }[];
  students: { _id: string }[];
  influencedBy: { philosopher: { _id: string }; strength: string }[];
};

export async function getLineageNodes(): Promise<LineageNode[]> {
  const { data } = await sanityFetch({
    query: `
      *[_type == "philosopher"] | order(birthYear asc) {
        _id, name, slug, coreBranch, hookQuote, shortSummary,
        avatarUrl, networkX, networkY, birthYear, deathYear,
        "era": era->{ _id, title, slug, description },
        "mentors": mentors[]->{ _id },
        "students": students[]->{ _id },
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
    mentors:      (p.mentors ?? []).map((m) => m._id),
    students:     (p.students ?? []).map((s) => s._id),
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
    query: `
      *[_type == "philosopher"] | order(name asc) {
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
    query: `
      *[_type == "era"] | order(startYear asc) {
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
  era: { _id: string; title: string; slug: { current: string } };
  mentors: { _id: string; name: string; slug: { current: string }; avatarUrl: string; coreBranch: string }[];
  students: { _id: string; name: string; slug: { current: string }; avatarUrl: string; coreBranch: string }[];
} | null;

export async function getPhilosopherBySlug(slug: string): Promise<FullPhilosopher | null> {
  const { data } = await sanityFetch({
    query: `
      *[_type == "philosopher" && slug.current == $slug][0] {
        _id, name, slug, coreBranch, birthYear, deathYear,
        hookQuote, shortSummary, fullBiography, avatarUrl,
        importantWorks, keyTakeaways,
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
    importantWorks: raw.importantWorks ?? [],
    keyTakeaways:  raw.keyTakeaways ?? [],
    eraTitle:      raw.era?.title ?? "",
    eraSlug:       raw.era?.slug?.current ?? "",
    eraId:         raw.era?._id ?? "",
    mentors: (raw.mentors ?? []).map((m) => ({
      _id:        m._id,
      name:       m.name,
      slug:       m.slug.current,
      avatarUrl:  m.avatarUrl ?? "",
      coreBranch: m.coreBranch ?? "",
    })),
    students: (raw.students ?? []).map((s) => ({
      _id:        s._id,
      name:       s.name,
      slug:       s.slug.current,
      avatarUrl:  s.avatarUrl ?? "",
      coreBranch: s.coreBranch ?? "",
    })),
  };
}

// ── Schools ───────────────────────────────────────────────────────────────────

type RawSchool = {
  _id: string; title: string; slug: { current: string };
  eraRange: string; startYear?: number; tagline?: string; networkX?: number; networkY?: number;
  description: string; coreIdeas: string[];
  philosophers: { _id: string; name: string; slug: { current: string }; avatarUrl: string; coreBranch: string }[];
  influencedBy: { _id: string; title: string; slug: { current: string } }[];
  influencedTo: { _id: string; title: string; slug: { current: string } }[];
} | null;

export async function getSchoolBySlug(slug: string): Promise<SchoolWithPhilosophers | null> {
  const { data } = await sanityFetch({
    query: `
      *[_type == "school" && slug.current == $slug][0] {
        _id, title, slug, eraRange, startYear, tagline, networkX, networkY, description, coreIdeas,
        "philosophers": philosophers[]->{ _id, name, slug, avatarUrl, coreBranch },
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
    philosophers: (raw.philosophers ?? []).map((p) => ({
      _id:        p._id,
      name:       p.name,
      slug:       p.slug.current,
      avatarUrl:  p.avatarUrl ?? "",
      coreBranch: p.coreBranch ?? "",
    })),
    influencedBy: (raw.influencedBy ?? []).map((b) => ({
      _id: b._id, title: b.title, slug: b.slug.current,
    })),
    influencedTo: (raw.influencedTo ?? []).map((t) => ({
      _id: t._id, title: t.title, slug: t.slug.current,
    })),
  };
}

export async function getSchoolsWithPhilosophers(): Promise<SchoolWithPhilosophers[]> {
  const { data } = await sanityFetch({
    query: `
      *[_type == "school"] | order(startYear asc) {
        _id, title, slug, eraRange, startYear, tagline, networkX, networkY, description, coreIdeas,
        "philosophers": philosophers[]->{ _id, name, slug, avatarUrl, coreBranch },
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
    philosophers: (s.philosophers ?? []).map((p) => ({
      _id:        p._id,
      name:       p.name,
      slug:       p.slug.current,
      avatarUrl:  p.avatarUrl ?? "",
      coreBranch: p.coreBranch ?? "",
    })),
    influencedBy: (s.influencedBy ?? []).map((b) => ({
      _id: b._id, title: b.title, slug: b.slug.current,
    })),
    influencedTo: (s.influencedTo ?? []).map((t) => ({
      _id: t._id, title: t.title, slug: t.slug.current,
    })),
  }));
}
