import { sanityClient } from "./client";
import type {
  LineageNode,
  PhilosopherListItem,
  EraWithPhilosophers,
  FullPhilosopher,
  SchoolWithPhilosophers,
} from "@/lib/types";
import { cacheLife } from "next/cache";

// ── Network / Home ────────────────────────────────────────────────────────────

export async function getLineageNodes(): Promise<LineageNode[]> {
  "use cache";
  cacheLife("days");

  const raw = await sanityClient.fetch<{
    _id: string; name: string; slug: { current: string };
    coreBranch: string; hookQuote: string; shortSummary: string;
    avatarUrl: string; networkX: number; networkY: number;
    era: { _id: string; title: string; slug: { current: string }; description: string };
    birthYear: number; deathYear: number;
    mentors: { _id: string }[];
    students: { _id: string }[];
    influencedBy: { philosopher: { _id: string }; strength: string }[];
  }[]>(`
    *[_type == "philosopher"] | order(birthYear asc) {
      _id, name, slug, coreBranch, hookQuote, shortSummary,
      avatarUrl, networkX, networkY, birthYear, deathYear,
      "era": era->{ _id, title, slug, description },
      "mentors": mentors[]->{ _id },
      "students": students[]->{ _id },
      influencedBy[]{ "philosopher": philosopher->{ _id }, strength }
    }
  `);

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

export async function getPhilosophersAlpha(): Promise<PhilosopherListItem[]> {
  "use cache";
  cacheLife("days");

  const raw = await sanityClient.fetch<{
    _id: string; name: string; slug: { current: string };
    coreBranch: string; birthYear: number; deathYear: number;
    avatarUrl: string;
    era: { _id: string; title: string };
  }[]>(`
    *[_type == "philosopher"] | order(name asc) {
      _id, name, slug, coreBranch, birthYear, deathYear, avatarUrl,
      "era": era->{ _id, title }
    }
  `);

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

export async function getErasWithPhilosophers(): Promise<EraWithPhilosophers[]> {
  "use cache";
  cacheLife("days");

  const raw = await sanityClient.fetch<{
    _id: string; title: string; slug: { current: string };
    startYear: number; endYear: number; description: string;
    philosophers: { _id: string; name: string; slug: { current: string }; coreBranch: string; avatarUrl: string }[];
  }[]>(`
    *[_type == "era"] | order(startYear asc) {
      _id, title, slug, startYear, endYear, description,
      "philosophers": *[_type == "philosopher" && references(^._id)] | order(birthYear asc) {
        _id, name, slug, coreBranch, avatarUrl
      }
    }
  `);

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

export async function getPhilosopherBySlug(slug: string): Promise<FullPhilosopher | null> {
  "use cache";
  cacheLife("days");

  const raw = await sanityClient.fetch<{
    _id: string; name: string; slug: { current: string };
    coreBranch: string; birthYear: number; deathYear: number;
    hookQuote: string; shortSummary: string; fullBiography: string;
    avatarUrl: string;
    importantWorks: { title: string; year: number; synopsis: string }[];
    keyTakeaways: string[];
    era: { _id: string; title: string; slug: { current: string } };
    mentors: { _id: string; name: string; slug: { current: string }; avatarUrl: string; coreBranch: string }[];
    students: { _id: string; name: string; slug: { current: string }; avatarUrl: string; coreBranch: string }[];
  } | null>(`
    *[_type == "philosopher" && slug.current == $slug][0] {
      _id, name, slug, coreBranch, birthYear, deathYear,
      hookQuote, shortSummary, fullBiography, avatarUrl,
      importantWorks, keyTakeaways,
      "era": era->{ _id, title, slug },
      "mentors": mentors[]->{ _id, name, slug, avatarUrl, coreBranch },
      "students": students[]->{ _id, name, slug, avatarUrl, coreBranch }
    }
  `, { slug });

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

export async function getSchoolBySlug(slug: string): Promise<SchoolWithPhilosophers | null> {
  "use cache";
  cacheLife("days");

  const raw = await sanityClient.fetch<{
    _id: string; title: string; slug: { current: string };
    eraRange: string; description: string; coreIdeas: string[];
    philosophers: { _id: string; name: string; slug: { current: string }; avatarUrl: string; coreBranch: string }[];
    influencedBy: { _id: string; title: string; slug: { current: string } }[];
    influencedTo: { _id: string; title: string; slug: { current: string } }[];
  } | null>(`
    *[_type == "school" && slug.current == $slug][0] {
      _id, title, slug, eraRange, description, coreIdeas,
      "philosophers": philosophers[]->{ _id, name, slug, avatarUrl, coreBranch },
      "influencedBy": influencedBy[]->{ _id, title, slug },
      "influencedTo": influencedTo[]->{ _id, title, slug }
    }
  `, { slug });

  if (!raw) return null;

  return {
    _id:         raw._id,
    title:       raw.title,
    slug:        raw.slug.current,
    eraRange:    raw.eraRange ?? "",
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
  "use cache";
  cacheLife("days");

  const raw = await sanityClient.fetch<{
    _id: string; title: string; slug: { current: string };
    eraRange: string; description: string; coreIdeas: string[];
    philosophers: { _id: string; name: string; slug: { current: string }; avatarUrl: string; coreBranch: string }[];
    influencedBy: { _id: string; title: string; slug: { current: string } }[];
    influencedTo: { _id: string; title: string; slug: { current: string } }[];
  }[]>(`
    *[_type == "school"] | order(_createdAt asc) {
      _id, title, slug, eraRange, description, coreIdeas,
      "philosophers": philosophers[]->{ _id, name, slug, avatarUrl, coreBranch },
      "influencedBy": influencedBy[]->{ _id, title, slug },
      "influencedTo": influencedTo[]->{ _id, title, slug }
    }
  `);

  return raw.map((s) => ({
    _id:         s._id,
    title:       s.title,
    slug:        s.slug.current,
    eraRange:    s.eraRange ?? "",
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
