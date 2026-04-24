/**
 * Mock data — drop-in replacement for MongoDB.
 * Replace with real DB calls later.
 */

export const ERAS = [
  {
    _id: "era-1",
    title: "The Socratic Epoch",
    slug: "socratic-epoch",
    startYear: -470,
    endYear: -322,
    description:
      "The golden age of Greek philosophy, anchored by the trial of Socrates and the meteoric rise of Plato and Aristotle. Reason, virtue, and the good life became the central questions of an emerging tradition.",
  },
  {
    _id: "era-2",
    title: "Hellenistic Philosophy",
    slug: "hellenistic",
    startYear: -322,
    endYear: 529,
    description:
      "After Alexander's conquests, philosophy splintered into competing schools—Stoics, Epicureans, Skeptics—each offering a practical guide to living well amid an uncertain empire.",
  },
  {
    _id: "era-3",
    title: "The Early Modern Turn",
    slug: "early-modern",
    startYear: 1596,
    endYear: 1780,
    description:
      "The Reformation and Scientific Revolution shattered scholasticism. Thinkers like Descartes, Locke, Hume, and Spinoza rebuilt philosophy on foundations of reason, sensation, and the sovereign individual.",
  },
  {
    _id: "era-4",
    title: "The Critical & Post-Critical Era",
    slug: "critical-era",
    startYear: 1724,
    endYear: 1951,
    description:
      "Kant's Copernican revolution in philosophy, followed by the explosive Romanticist and Existentialist reactions—from Hegel's dialectic to Nietzsche's hammer, and finally Wittgenstein's quiet dissolution of traditional problems.",
  },
];

export const PHILOSOPHERS = [
  {
    _id: "p-1",
    name: "Socrates",
    slug: "socrates",
    eraId: "era-1",
    birthYear: -470,
    deathYear: -399,
    hookQuote: "The unexamined life is not worth living.",
    coreBranch: "Ethics & Dialectic",
    networkX: 20,
    networkY: 30,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Socrate_du_Louvre.jpg/440px-Socrate_du_Louvre.jpg",
    shortSummary:
      "The gadfly of Athens who never wrote a word, yet whose questions reshaped Western thought. Socrates practised philosophy as a form of moral midwifery, drawing truth from others through relentless dialogue.",
    fullBiography: `Socrates (c. 470–399 BC) is one of the founders of Western philosophy. Unlike his predecessors, he turned philosophical inquiry away from cosmology and toward ethics and the human soul. He left no writings of his own; his ideas survive through the dialogues of his student Plato.\n\nSocrates developed the elenctic method—a form of cooperative argument aimed at exposing inconsistencies in his interlocutors' beliefs. He believed that virtue is knowledge, and that wrongdoing is therefore a form of ignorance.\n\nIn 399 BC, he was tried by an Athenian jury on charges of impiety and corrupting the youth. He was found guilty and sentenced to death by hemlock. His willingness to accept the sentence rather than compromise his principles became one of philosophy's most enduring images of intellectual integrity.`,
    importantWorks: [
      { title: "The Apology (via Plato)", year: -399, synopsis: "Socrates' defence speech at his trial, presenting his philosophical mission as a divine calling." },
      { title: "Euthyphro (via Plato)", year: -399, synopsis: "An examination of the nature of piety and whether the gods approve of things because they are good." },
    ],
    keyTakeaways: [
      "Know thyself — self-knowledge is the foundation of all wisdom.",
      "Virtue is knowledge; evil is ignorance of the good.",
      "The unexamined life is not worth living.",
      "True wisdom begins in recognising what you do not know.",
      "Philosophy is a form of practice, not merely theory.",
    ],
    mentorIds: [],
    studentIds: ["p-2"],
  },
  {
    _id: "p-2",
    name: "Plato",
    slug: "plato",
    eraId: "era-1",
    birthYear: -428,
    deathYear: -348,
    hookQuote: "At the touch of love, everyone becomes a poet.",
    coreBranch: "Metaphysics & Political Philosophy",
    networkX: 38,
    networkY: 15,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Plato_Silanion_Musei_Capitolini_MC1377.jpg/440px-Plato_Silanion_Musei_Capitolini_MC1377.jpg",
    shortSummary:
      "Founder of the Academy and architect of the Theory of Forms. Plato held that the world we perceive is a shadow of a higher realm of perfect, eternal archetypes.",
    fullBiography: `Plato (c. 428–348 BC) was an Athenian philosopher and student of Socrates. He founded the Academy in Athens — often considered the first institution of higher learning in the Western world — and taught there for nearly fifty years. Among his students was Aristotle.\n\nHis most celebrated contribution is the Theory of Forms: the idea that the physical world is not the most real level of reality. Abstract entities — the Form of Beauty, the Form of Justice, the Form of the Good — are more real than their imperfect material instantiations.\n\nIn political philosophy, Plato's Republic argues for a hierarchical city-state governed by a philosopher-king trained in mathematics and dialectic.`,
    importantWorks: [
      { title: "The Republic", year: -380, synopsis: "A foundational treatise on justice, the ideal state, and the philosopher-king." },
      { title: "The Symposium", year: -385, synopsis: "A series of speeches on the nature of Eros and the ascent to Beauty itself." },
      { title: "Phaedo", year: -360, synopsis: "Socrates' final hours, arguing for the immortality of the soul." },
    ],
    keyTakeaways: [
      "The material world is a copy of eternal, perfect Forms.",
      "The soul pre-exists the body and is immortal.",
      "A just soul mirrors a just city-state: reason governs appetite.",
      "The Allegory of the Cave: education is a turning of the whole soul toward the light.",
      "Philosophy is preparation for death — the freeing of the soul from the body.",
    ],
    mentorIds: ["p-1"],
    studentIds: ["p-3"],
  },
  {
    _id: "p-3",
    name: "Aristotle",
    slug: "aristotle",
    eraId: "era-1",
    birthYear: -384,
    deathYear: -322,
    hookQuote: "We are what we repeatedly do. Excellence, then, is not an act but a habit.",
    coreBranch: "Logic, Ethics & Natural Philosophy",
    networkX: 58,
    networkY: 22,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Aristotle_Altemps_Inv8575.jpg/440px-Aristotle_Altemps_Inv8575.jpg",
    shortSummary:
      "The Stagyrite who classified everything. Aristotle's encyclopaedic intellect ranged from biology to tragedy, establishing logic, physics, ethics, and political theory as distinct disciplines.",
    fullBiography: `Aristotle (384–322 BC) was born in Stagira, Macedonia, and entered Plato's Academy at age seventeen, where he studied for twenty years. After Plato's death, he founded his own school, the Lyceum, in Athens.\n\nHe is perhaps history's most wide-ranging intellect. He wrote treatises on logic, natural science, ethics, politics, rhetoric, aesthetics, and biology. In almost every field he visited, he was the first to treat it as a systematic discipline.\n\nIn metaphysics, he rejected Plato's separate Forms, arguing instead for hylomorphism: every substance is a union of matter and form. His concept of eudaimonia — often translated as flourishing or happiness — remains one of the most influential ideas in ethical theory.`,
    importantWorks: [
      { title: "Nicomachean Ethics", year: -350, synopsis: "The definitive ancient account of virtue, practical wisdom, and the good life." },
      { title: "Politics", year: -350, synopsis: "Man is a political animal; the city-state is the natural context for human flourishing." },
      { title: "Metaphysics", year: -340, synopsis: "An inquiry into being qua being, substance, causation, and the Unmoved Mover." },
    ],
    keyTakeaways: [
      "Form is immanent in matter, not separate from it (contra Plato).",
      "The four causes: material, formal, efficient, final.",
      "Virtue is a mean between extremes — courage lies between cowardice and recklessness.",
      "Man is by nature a political animal (zoon politikon).",
      "Eudaimonia (flourishing) is the highest human good, achieved through virtuous activity.",
    ],
    mentorIds: ["p-2"],
    studentIds: [],
  },
  {
    _id: "p-4",
    name: "René Descartes",
    slug: "descartes",
    eraId: "era-3",
    birthYear: 1596,
    deathYear: 1650,
    hookQuote: "Cogito, ergo sum — I think, therefore I am.",
    coreBranch: "Epistemology & Rationalism",
    networkX: 30,
    networkY: 60,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg/440px-Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg",
    shortSummary:
      "Father of Modern Philosophy. By doubting everything that could be doubted, Descartes arrived at the one indubitable truth — the existence of the thinking self.",
    fullBiography: `René Descartes (1596–1650) was a French mathematician, physicist, and philosopher. He is often called the father of modern philosophy for his method of systematic doubt, which swept away the accumulated authority of scholasticism.\n\nIn the Meditations on First Philosophy he argues that mind and body are distinct substances — a position known as Cartesian dualism. The mind is a thinking thing; the body and all of nature are extended things.\n\nHis contributions to mathematics were equally vast: he invented the Cartesian coordinate system, uniting algebra and geometry into analytic geometry.`,
    importantWorks: [
      { title: "Meditations on First Philosophy", year: 1641, synopsis: "Six meditations reconstructing knowledge from the ground up, establishing the self as the first certainty." },
      { title: "Discourse on the Method", year: 1637, synopsis: "The manifesto of rational method and the origin of the Cogito argument." },
    ],
    keyTakeaways: [
      "Systematic doubt reveals the cogito as the one indubitable certainty.",
      "Mind and body are distinct, interacting substances (Cartesian dualism).",
      "Clear and distinct perception is the criterion of truth.",
      "God's existence guarantees the reliability of reason.",
      "Analytic geometry: algebraic equations can describe geometric curves.",
    ],
    mentorIds: [],
    studentIds: ["p-5"],
  },
  {
    _id: "p-5",
    name: "Baruch Spinoza",
    slug: "spinoza",
    eraId: "era-3",
    birthYear: 1632,
    deathYear: 1677,
    hookQuote: "I have striven not to laugh at human actions, not to weep at them, nor to hate them, but to understand them.",
    coreBranch: "Metaphysics & Pantheism",
    networkX: 48,
    networkY: 55,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Spinoza.jpg/440px-Spinoza.jpg",
    shortSummary:
      "The excommunicated lens-grinder who identified God with Nature. Spinoza's rigorous geometrical method produced a monist philosophy of radical freedom.",
    fullBiography: `Baruch Spinoza (1632–1677) was born into a Portuguese-Jewish family in Amsterdam. His pantheistic ideas led to his excommunication from the Jewish community at age twenty-three.\n\nThe Ethics is written in the form of Euclid's Elements — definitions, axioms, propositions, demonstrations — a deliberate claim that metaphysics can achieve the certainty of mathematics. Its central thesis is that there is only one substance, which Spinoza calls God or Nature.\n\nFrom this monism flows a philosophy of freedom: human beings are free insofar as they act from their own nature rather than from external compulsion.`,
    importantWorks: [
      { title: "Ethics", year: 1677, synopsis: "A geometric proof of monism: God, Nature, mind, and freedom shown to follow necessarily from definitions." },
      { title: "Tractatus Theologico-Politicus", year: 1670, synopsis: "A pioneering work of biblical criticism and an early defence of freedom of thought." },
    ],
    keyTakeaways: [
      "God and Nature are one infinite substance (pantheism / monism).",
      "Emotions are understood, not suppressed: adequate ideas dissolve passive affects.",
      "Freedom is acting from one's own nature, not the absence of determination.",
      "The highest human good is the intellectual love of God.",
      "Geometric method applied to ethics: philosophy can be as rigorous as mathematics.",
    ],
    mentorIds: ["p-4"],
    studentIds: [],
  },
  {
    _id: "p-6",
    name: "John Locke",
    slug: "locke",
    eraId: "era-3",
    birthYear: 1632,
    deathYear: 1704,
    hookQuote: "No man's knowledge here can go beyond his experience.",
    coreBranch: "Empiricism & Political Theory",
    networkX: 65,
    networkY: 52,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/JohnLocke.png/440px-JohnLocke.png",
    shortSummary:
      "Father of liberalism. Locke argued that the mind begins as a blank slate and knowledge comes entirely from experience, grounding legitimate government in consent and natural rights.",
    fullBiography: `John Locke (1632–1704) was an English philosopher and physician. His Essay Concerning Human Understanding mounted a systematic alternative to Cartesian rationalism: the mind at birth is a tabula rasa, and all its ideas ultimately derive from sensory experience or reflection.\n\nIn political philosophy, his Two Treatises of Government argued that political authority derives from the consent of the governed. Individuals enter society from a state of nature in which they already possess natural rights to life, liberty, and estate.\n\nThis argument formed the philosophical backbone of both the Glorious Revolution (1688) and the American Declaration of Independence (1776).`,
    importantWorks: [
      { title: "An Essay Concerning Human Understanding", year: 1689, synopsis: "Empiricism's founding text: the mind begins empty; knowledge derives from experience." },
      { title: "Two Treatises of Government", year: 1689, synopsis: "The social contract, natural rights, and the right of revolution." },
    ],
    keyTakeaways: [
      "The mind is a blank slate (tabula rasa) — all knowledge comes from experience.",
      "Natural rights to life, liberty, and property are pre-political and inalienable.",
      "Legitimate government rests on the consent of the governed.",
      "The right of revolution: a government that violates natural rights may be overthrown.",
      "Primary vs. secondary qualities: shape is real; colour is mind-dependent.",
    ],
    mentorIds: [],
    studentIds: ["p-7"],
  },
  {
    _id: "p-7",
    name: "David Hume",
    slug: "hume",
    eraId: "era-3",
    birthYear: 1711,
    deathYear: 1776,
    hookQuote: "Reason is, and ought only to be, the slave of the passions.",
    coreBranch: "Empiricism & Scepticism",
    networkX: 80,
    networkY: 48,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Painting_of_David_Hume.jpg/440px-Painting_of_David_Hume.jpg",
    shortSummary:
      "The Great Doubter. Hume pushed empiricism to its radical conclusion: causation, the self, and the external world are not rationally knowable — they are habits of the imagination.",
    fullBiography: `David Hume (1711–1776) was a Scottish philosopher and historian who pushed the empiricism of Locke and Berkeley to its sceptical limit.\n\nHume's most famous argument concerns causation. We never see one billiard ball causing another to move; we only ever observe constant conjunction. The idea of necessary connection is a habit of the imagination, not a perception of objective reality.\n\nKant credited Hume with waking him from his "dogmatic slumber," directly inspiring the Critique of Pure Reason.`,
    importantWorks: [
      { title: "A Treatise of Human Nature", year: 1739, synopsis: "The masterwork of British empiricism, arguing scepticism about causation, the self, and induction." },
      { title: "Dialogues Concerning Natural Religion", year: 1779, synopsis: "A devastating critique of the design argument for God's existence." },
    ],
    keyTakeaways: [
      "Causation is habit, not rational necessity — Hume's Fork.",
      "The self is a bundle of perceptions, not a unified substance.",
      "Is-ought gap: no moral conclusion strictly follows from factual premises.",
      "Reason serves the passions; it cannot motivate action on its own.",
      "Scepticism about induction: past regularities give no logical guarantee of the future.",
    ],
    mentorIds: ["p-6"],
    studentIds: ["p-8"],
  },
  {
    _id: "p-8",
    name: "Immanuel Kant",
    slug: "kant",
    eraId: "era-4",
    birthYear: 1724,
    deathYear: 1804,
    hookQuote: "Two things fill the mind with ever-new and increasing admiration and awe: the starry heavens above me and the moral law within me.",
    coreBranch: "Epistemology & Moral Philosophy",
    networkX: 55,
    networkY: 75,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Immanuel_Kant_%28painted_portrait%29.jpg/440px-Immanuel_Kant_%28painted_portrait%29.jpg",
    shortSummary:
      "The architect of the Copernican Revolution in philosophy. Kant synthesised rationalism and empiricism, arguing that the mind actively structures experience.",
    fullBiography: `Immanuel Kant (1724–1804) was born and died in Königsberg, Prussia, rarely leaving the city. He spent eleven years writing the Critique of Pure Reason (1781), one of the most difficult and consequential books in the philosophical canon.\n\nKant's "Copernican revolution": just as Copernicus moved the sun to the centre of the solar system, Kant moved the mind to the centre of experience. We do not passively receive a world; we actively constitute it through the forms of intuition (space and time) and the categories of the understanding.\n\nIn ethics, the Groundwork argues that the moral worth of an action lies entirely in its motive — specifically, the motive of duty. The supreme principle is the Categorical Imperative.`,
    importantWorks: [
      { title: "Critique of Pure Reason", year: 1781, synopsis: "The synthesis of empiricism and rationalism: the mind constitutes experience through its own a priori structures." },
      { title: "Groundwork for the Metaphysics of Morals", year: 1785, synopsis: "The Categorical Imperative as the supreme principle of morality." },
      { title: "Critique of Judgement", year: 1790, synopsis: "Aesthetics and teleology: the beautiful, the sublime, and purposiveness in nature." },
    ],
    keyTakeaways: [
      "The mind constitutes experience; space, time, and causality are mental frameworks.",
      "We can know phenomena, never things-in-themselves (noumena).",
      "The Categorical Imperative: act only on maxims you could will to be universal laws.",
      "Moral worth lies in acting from duty, not from inclination or consequences.",
      "The three ideas of reason — God, freedom, immortality — are beyond theoretical knowledge.",
    ],
    mentorIds: ["p-7"],
    studentIds: ["p-9"],
  },
  {
    _id: "p-9",
    name: "Friedrich Nietzsche",
    slug: "nietzsche",
    eraId: "era-4",
    birthYear: 1844,
    deathYear: 1900,
    hookQuote: "That which does not kill us makes us stronger.",
    coreBranch: "Existentialism & Cultural Critique",
    networkX: 72,
    networkY: 80,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/440px-Nietzsche187a.jpg",
    shortSummary:
      "The philosopher with the hammer. Nietzsche diagnosed the death of God and the coming of nihilism, then prescribed the Übermensch as humanity's creative response.",
    fullBiography: `Friedrich Nietzsche (1844–1900) was a German philologist-turned-philosopher who became one of the most influential and provocative thinkers of the modern era.\n\nHis mature masterpiece, Thus Spoke Zarathustra, announced the death of God — not as a triumphant atheism but as a cultural diagnosis of potentially catastrophic nihilism. If God is dead, the entire edifice of Western morality collapses.\n\nIn On the Genealogy of Morality, he performed a genealogical critique: our moral values have historical origins in power and resentment, not in transcendent truth.`,
    importantWorks: [
      { title: "Thus Spoke Zarathustra", year: 1883, synopsis: "The death of God, the Eternal Return, and the vision of the Übermensch in poetic prose." },
      { title: "Beyond Good and Evil", year: 1886, synopsis: "A critique of past philosophers and a call for new, life-affirming values." },
      { title: "On the Genealogy of Morality", year: 1887, synopsis: "The historical origins of guilt, bad conscience, and slave morality." },
    ],
    keyTakeaways: [
      "God is dead: the foundations of Western morality have collapsed.",
      "Will to power: the fundamental drive is toward self-overcoming and creative expression.",
      "Perspectivism: there are no facts, only interpretations.",
      "The Eternal Return: amor fati — love your fate and affirm all of life.",
      "Slave morality inverts master morality; resentment is the engine of 'good' and 'evil'.",
    ],
    mentorIds: ["p-8"],
    studentIds: ["p-10"],
  },
  {
    _id: "p-10",
    name: "Ludwig Wittgenstein",
    slug: "wittgenstein",
    eraId: "era-4",
    birthYear: 1889,
    deathYear: 1951,
    hookQuote: "Whereof one cannot speak, thereof one must be silent.",
    coreBranch: "Philosophy of Language & Logic",
    networkX: 88,
    networkY: 72,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Ludwig_Wittgenstein_%281929%29.jpg/440px-Ludwig_Wittgenstein_%281929%29.jpg",
    shortSummary:
      "The philosopher who revolutionised philosophy twice. The early Wittgenstein pictured the world as facts; the later Wittgenstein dissolved that picture, arguing meaning is use in a form of life.",
    fullBiography: `Ludwig Wittgenstein (1889–1951) was an Austrian-British philosopher, born into one of Vienna's wealthiest families, who gave away his enormous inheritance.\n\nHis first masterwork, the Tractatus Logico-Philosophicus (1921), proposed that language pictures the logical structure of the world. Metaphysical, ethical, and religious claims lie beyond the boundary of sense.\n\nReturning to philosophy, he developed a radically different view in the posthumous Philosophical Investigations. Language is not a mirror of reality but a collection of language-games embedded in forms of life. Meaning is use. Philosophy's task is therapeutic: to silence confusion, not produce doctrine.`,
    importantWorks: [
      { title: "Tractatus Logico-Philosophicus", year: 1921, synopsis: "Language pictures reality; what cannot be said can only be shown; silence is the endpoint." },
      { title: "Philosophical Investigations", year: 1953, synopsis: "Language-games, family resemblance, and the private language argument — philosophy as therapy." },
    ],
    keyTakeaways: [
      "Early: language pictures the logical form of facts (Tractatus).",
      "Later: meaning is use; words have meaning in language-games, not by picturing reality.",
      "Private language argument: a genuinely private language is impossible.",
      "Philosophical problems arise when language goes on holiday — philosophy is therapy.",
      "Family resemblance: concepts need not share a single defining feature.",
    ],
    mentorIds: ["p-9"],
    studentIds: [],
  },
];

// ── Helper types (mirror the DB shapes used by pages) ────────

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
  mentors: string[];
  students: string[];
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

// ── Query helpers ─────────────────────────────────────────────

export function getNetworkNodes(): PhilosopherNode[] {
  return PHILOSOPHERS.map((p) => ({
    _id:          p._id,
    name:         p.name,
    slug:         p.slug,
    coreBranch:   p.coreBranch,
    hookQuote:    p.hookQuote,
    shortSummary: p.shortSummary,
    avatarUrl:    p.avatarUrl,
    networkX:     p.networkX,
    networkY:     p.networkY,
    mentors:      p.mentorIds,
    students:     p.studentIds,
  }));
}

export function getLineageNodes(): LineageNode[] {
  return PHILOSOPHERS.map((p) => {
    const era = ERAS.find((e) => e._id === p.eraId);
    return {
      _id:              p._id,
      name:             p.name,
      slug:             p.slug,
      coreBranch:       p.coreBranch,
      hookQuote:        p.hookQuote,
      shortSummary:     p.shortSummary,
      avatarUrl:        p.avatarUrl,
      networkX:         p.networkX,
      networkY:         p.networkY,
      mentors:          p.mentorIds,
      students:         p.studentIds,
      eraId:            p.eraId,
      eraTitle:         era?.title ?? "",
      eraSlug:          era?.slug ?? "",
      eraDescription:   era?.description ?? "",
      birthYear:        p.birthYear,
      deathYear:        p.deathYear,
    };
  });
}

export function getErasWithPhilosophers(): EraWithPhilosophers[] {
  return ERAS.map((era) => ({
    ...era,
    philosophers: PHILOSOPHERS.filter((p) => p.eraId === era._id).map((p) => ({
      _id:        p._id,
      name:       p.name,
      slug:       p.slug,
      coreBranch: p.coreBranch,
      avatarUrl:  p.avatarUrl,
    })),
  }));
}

export function getPhilosophersAlpha(): PhilosopherListItem[] {
  return [...PHILOSOPHERS]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => ({
      _id:        p._id,
      name:       p.name,
      slug:       p.slug,
      coreBranch: p.coreBranch,
      birthYear:  p.birthYear,
      deathYear:  p.deathYear,
      avatarUrl:  p.avatarUrl,
      eraTitle:   ERAS.find((e) => e._id === p.eraId)?.title ?? "",
    }));
}

export function getPhilosopherBySlug(slug: string): FullPhilosopher | null {
  const p = PHILOSOPHERS.find((x) => x.slug === slug);
  if (!p) return null;

  const era = ERAS.find((e) => e._id === p.eraId);

  const resolvePeople = (ids: string[]) =>
    ids
      .map((id) => PHILOSOPHERS.find((x) => x._id === id))
      .filter(Boolean)
      .map((m) => ({
        _id:        m!._id,
        name:       m!.name,
        slug:       m!.slug,
        avatarUrl:  m!.avatarUrl,
        coreBranch: m!.coreBranch,
      }));

  return {
    _id:           p._id,
    name:          p.name,
    slug:          p.slug,
    coreBranch:    p.coreBranch,
    birthYear:     p.birthYear,
    deathYear:     p.deathYear,
    hookQuote:     p.hookQuote,
    shortSummary:  p.shortSummary,
    fullBiography: p.fullBiography,
    avatarUrl:     p.avatarUrl,
    importantWorks: p.importantWorks,
    keyTakeaways:  p.keyTakeaways,
    eraTitle:      era?.title ?? "",
    eraSlug:       era?.slug ?? "",
    mentors:       resolvePeople(p.mentorIds),
    students:      resolvePeople(p.studentIds),
  };
}
