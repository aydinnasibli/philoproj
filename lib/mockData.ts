/**
 * Mock data — drop-in replacement for MongoDB.
 * Replace with real DB calls later.
 */

export const ERAS = [
  {
    _id: "era-1",
    title: "Pre-Socratic Philosophy",
    slug: "pre-socratic",
    startYear: -610,
    endYear: -450,
    description:
      "The first flowering of rational inquiry in the ancient Greek world. Before Socrates turned philosophy inward toward ethics and the soul, Milesian and Ionian thinkers asked what the cosmos is made of and what principle underlies all change — inaugurating the Western tradition of natural philosophy.",
  },
  {
    _id: "era-2",
    title: "Classical Antiquity",
    slug: "classical-antiquity",
    startYear: -470,
    endYear: -322,
    description:
      "The golden age of Greek philosophy, anchored by the trial of Socrates and the meteoric rise of Plato and Aristotle. Reason, virtue, and the good life became the central questions of an emerging tradition that would shape Western thought for two millennia.",
  },
  {
    _id: "era-3",
    title: "Hellenistic & Roman Philosophy",
    slug: "hellenistic-roman",
    startYear: -322,
    endYear: 200,
    description:
      "After Alexander's conquests, philosophy splintered into competing practical schools — Stoics, Epicureans, Skeptics — each offering a guide to living well in an uncertain empire. In Rome, Stoicism in particular became the creed of statesmen and emperors.",
  },
  {
    _id: "era-4",
    title: "Late Antique Philosophy",
    slug: "late-antique",
    startYear: 200,
    endYear: 600,
    description:
      "As the Roman Empire fractured, philosophy turned inward and upward. Plotinus forged Neoplatonism from Platonic sources, charting the soul's return to the ineffable One. Augustine baptised this tradition into Christianity, producing the intellectual framework that would govern the medieval world.",
  },
  {
    _id: "era-5",
    title: "Medieval Philosophy",
    slug: "medieval",
    startYear: 600,
    endYear: 1400,
    description:
      "The great project of the medieval universities was to reconcile Greek reason with revealed religion. Islamic, Jewish, and Christian thinkers — Averroes, Maimonides, Aquinas — each attempted a systematic synthesis of Aristotle with their own theological traditions, producing the tradition of Scholasticism.",
  },
  {
    _id: "era-6",
    title: "The Early Modern Turn",
    slug: "early-modern",
    startYear: 1596,
    endYear: 1780,
    description:
      "The Reformation and Scientific Revolution shattered scholasticism. Thinkers like Descartes, Locke, Hume, and Spinoza rebuilt philosophy on foundations of reason, sensation, and the sovereign individual — setting the agenda for all subsequent modern thought.",
  },
  {
    _id: "era-7",
    title: "The Critical & Post-Critical Era",
    slug: "critical-era",
    startYear: 1724,
    endYear: 1951,
    description:
      "Kant's Copernican revolution placed the mind at the centre of experience. What followed was an explosion of reaction — Hegel's dialectic, Nietzsche's hammer, Wittgenstein's therapeutic dissolution of traditional problems — making this the most turbulent and productive century in the history of philosophy.",
  },
];

export const PHILOSOPHERS = [
  {
    _id: "p-1",
    name: "Socrates",
    slug: "socrates",
    eraId: "era-2",
    birthYear: -470,
    deathYear: -399,
    hookQuote: "The unexamined life is not worth living.",
    coreBranch: "Ethics & Dialectic",
    networkX: 10,
    networkY: 34,
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
    studentIds: ["p-2", "p-22"],
  },
  {
    _id: "p-2",
    name: "Plato",
    slug: "plato",
    eraId: "era-2",
    birthYear: -428,
    deathYear: -348,
    hookQuote: "At the touch of love, everyone becomes a poet.",
    coreBranch: "Metaphysics & Political Philosophy",
    networkX: 26,
    networkY: 18,
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
    eraId: "era-2",
    birthYear: -384,
    deathYear: -322,
    hookQuote: "We are what we repeatedly do. Excellence, then, is not an act but a habit.",
    coreBranch: "Logic, Ethics & Natural Philosophy",
    networkX: 40,
    networkY: 28,
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
    eraId: "era-6",
    birthYear: 1596,
    deathYear: 1650,
    hookQuote: "Cogito, ergo sum — I think, therefore I am.",
    coreBranch: "Epistemology & Rationalism",
    networkX: 14,
    networkY: 66,
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
    influencedByIds: [{ id: "p-2", strength: "medium" }, { id: "p-3", strength: "medium" }] as InfluenceLink[],
  },
  {
    _id: "p-5",
    name: "Baruch Spinoza",
    slug: "spinoza",
    eraId: "era-6",
    birthYear: 1632,
    deathYear: 1677,
    hookQuote: "I have striven not to laugh at human actions, not to weep at them, nor to hate them, but to understand them.",
    coreBranch: "Metaphysics & Pantheism",
    networkX: 28,
    networkY: 78,
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
    influencedByIds: [{ id: "p-2", strength: "medium" }, { id: "p-3", strength: "medium" }] as InfluenceLink[],
  },
  {
    _id: "p-6",
    name: "John Locke",
    slug: "locke",
    eraId: "era-6",
    birthYear: 1632,
    deathYear: 1704,
    hookQuote: "No man's knowledge here can go beyond his experience.",
    coreBranch: "Empiricism & Political Theory",
    networkX: 64,
    networkY: 12,
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
    influencedByIds: [{ id: "p-3", strength: "medium" }, { id: "p-4", strength: "medium" }] as InfluenceLink[],
  },
  {
    _id: "p-7",
    name: "David Hume",
    slug: "hume",
    eraId: "era-6",
    birthYear: 1711,
    deathYear: 1776,
    hookQuote: "Reason is, and ought only to be, the slave of the passions.",
    coreBranch: "Empiricism & Scepticism",
    networkX: 84,
    networkY: 38,
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
    influencedByIds: [{ id: "p-3", strength: "medium" }, { id: "p-4", strength: "medium" }] as InfluenceLink[],
  },
  {
    _id: "p-8",
    name: "Immanuel Kant",
    slug: "kant",
    eraId: "era-7",
    birthYear: 1724,
    deathYear: 1804,
    hookQuote: "Two things fill the mind with ever-new and increasing admiration and awe: the starry heavens above me and the moral law within me.",
    coreBranch: "Epistemology & Moral Philosophy",
    networkX: 66,
    networkY: 54,
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
    influencedByIds: [{ id: "p-2", strength: "medium" }, { id: "p-3", strength: "medium" }] as InfluenceLink[],
  },
  {
    _id: "p-9",
    name: "Friedrich Nietzsche",
    slug: "nietzsche",
    eraId: "era-7",
    birthYear: 1844,
    deathYear: 1900,
    hookQuote: "That which does not kill us makes us stronger.",
    coreBranch: "Existentialism & Cultural Critique",
    networkX: 82,
    networkY: 68,
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
    influencedByIds: [{ id: "p-2", strength: "medium" }, { id: "p-5", strength: "strong" }] as InfluenceLink[],
  },
  {
    _id: "p-10",
    name: "Ludwig Wittgenstein",
    slug: "wittgenstein",
    eraId: "era-7",
    birthYear: 1889,
    deathYear: 1951,
    hookQuote: "Whereof one cannot speak, thereof one must be silent.",
    coreBranch: "Philosophy of Language & Logic",
    networkX: 94,
    networkY: 26,
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
    influencedByIds: [{ id: "p-1", strength: "medium" }, { id: "p-3", strength: "weak" }] as InfluenceLink[],
  },
  {
    _id: "p-20",
    name: "Anaximander",
    slug: "anaximander",
    eraId: "era-1",
    birthYear: -610,
    deathYear: -546,
    hookQuote: "The origin of things is the Boundless — from which all things arise and to which all return.",
    coreBranch: "Pre-Socratic Cosmology",
    networkX: 4,
    networkY: 20,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Anaximander.jpg/440px-Anaximander.jpg",
    shortSummary:
      "The first philosopher to theorise a non-material origin of the cosmos. Anaximander posited the apeiron — the infinite, boundless — as the primordial source from which all opposites and things emerge and to which they return.",
    fullBiography: `Anaximander (c. 610–546 BC) was a pre-Socratic philosopher of Miletus and a student of Thales. He was perhaps the first thinker to produce a written philosophical treatise, of which only a single tantalising fragment survives.\n\nWhere Thales proposed water as the arche (first principle), Anaximander argued that no ordinary material could play that role. The source of all things must itself be indefinite and boundless — the apeiron — from which the warring opposites (hot/cold, wet/dry) separate out to form the cosmos.\n\nHe also produced an early cosmological model placing Earth at the centre of the universe, suspended freely in space with no support — a striking departure from mythological accounts.`,
    importantWorks: [
      { title: "On Nature (fragment)", year: -560, synopsis: "The lone surviving fragment proposing the apeiron as the origin of all things and the necessity of return." },
    ],
    keyTakeaways: [
      "The first principle (arche) is the apeiron — boundless and indefinite, not any ordinary substance.",
      "All existing things emerge from the apeiron and must return to it as punishment for their separation.",
      "He pioneered the idea of the Earth as a free body suspended in space.",
      "Introduced a naturalistic cosmology independent of myth.",
      "First known thinker to write philosophical prose rather than epic verse.",
    ],
    mentorIds: [],
    studentIds: [],
  },
  {
    _id: "p-21",
    name: "Anaxagoras",
    slug: "anaxagoras",
    eraId: "era-1",
    birthYear: -500,
    deathYear: -428,
    hookQuote: "All things were together; then Mind came and set them in order.",
    coreBranch: "Pre-Socratic Natural Philosophy",
    networkX: 6,
    networkY: 28,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Anaxagoras_Lebiedzki_Rahl.jpg/440px-Anaxagoras_Lebiedzki_Rahl.jpg",
    shortSummary:
      "The first philosopher to settle in Athens, Anaxagoras introduced the concept of Nous (Mind) as the organising intelligence behind the cosmos — a leap that influenced Plato and sparked a scientific tradition.",
    fullBiography: `Anaxagoras (c. 500–428 BC) was a Greek philosopher from Clazomenae in Asia Minor who became the first philosopher to bring the Ionian tradition of inquiry to Athens. He was a close associate of Pericles, the statesman who presided over Athens' golden age.\n\nAgainst Empedocles' four elements, Anaxagoras argued that every portion of reality contains a portion of everything — what later interpreters called his theory of infinite divisibility of matter. The exception is Nous (Mind), which is unmixed, pure, and the initiating cause of the cosmic rotation that differentiated the original mixture.\n\nHe was prosecuted for impiety after claiming the sun was a fiery stone rather than a god, and fled Athens for Lampsacus, where he died.`,
    importantWorks: [
      { title: "On Nature (fragments)", year: -460, synopsis: "Fragments outlining the infinite divisibility of matter and Mind as the cosmic organiser." },
    ],
    keyTakeaways: [
      "Nous (Mind) is the sole unmixed reality and the cause of all motion and order in the cosmos.",
      "Everything contains a portion of everything — no complete separation exists in the material world.",
      "The sun is a fiery rock larger than the Peloponnese — not a divine being.",
      "First philosopher to reside in Athens, bringing natural philosophy to the city that would define it.",
      "His concept of Nous directly influenced Plato's Demiurge and Aristotle's Unmoved Mover.",
    ],
    mentorIds: [],
    studentIds: [],
    influencedByIds: [{ id: "p-20", strength: "medium" }] as InfluenceLink[],
  },
  {
    _id: "p-22",
    name: "Antisthenes",
    slug: "antisthenes",
    eraId: "era-2",
    birthYear: -445,
    deathYear: -365,
    hookQuote: "Virtue is sufficient for happiness; it requires nothing else beyond Socratic strength.",
    coreBranch: "Ethics & Cynic Foundations",
    networkX: 18,
    networkY: 42,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Antisthene.jpg/440px-Antisthene.jpg",
    shortSummary:
      "Devoted pupil of Socrates and the intellectual founder of Cynicism. Antisthenes argued that virtue alone constitutes happiness, that conventional goods are indifferent, and that the philosopher must achieve self-sufficiency above all.",
    fullBiography: `Antisthenes (c. 445–365 BC) was an Athenian philosopher who first studied under the sophist Gorgias before becoming one of Socrates' most devoted followers. He founded a school at the Cynosarges gymnasium in Athens.\n\nAntisthenes radicalised Socratic ethics: if virtue is sufficient for happiness, then wealth, pleasure, and social status are not merely less important than virtue — they are positively dangerous. The virtuous philosopher needs only virtue and the strength to live by it.\n\nHe also developed an early theory of predication: only identical statements are strictly true (e.g., 'man is man'), and all cross-predicative statements are problematic. This logical position provoked Aristotle's sustained critique. His practical ethics were taken further by his student Diogenes of Sinope, who became the paradigmatic Cynic.`,
    importantWorks: [
      { title: "Ajax and Odysseus (fragments)", year: -390, synopsis: "A rhetorical exercise contrasting genuine and spurious claims to virtue." },
      { title: "Heracles (fragments)", year: -385, synopsis: "The mythic hero recast as the Cynic ideal — toil, endurance, and virtue over pleasure." },
    ],
    keyTakeaways: [
      "Virtue alone is sufficient for happiness; all conventional goods are indifferent or harmful.",
      "The philosopher must cultivate autarkeia — radical self-sufficiency and independence.",
      "Pleasure is not a good; Antisthenes preferred madness to pleasure.",
      "Logical nominalism: only tautological predications are strictly true.",
      "Founded the ethical tradition that became Cynicism, which in turn influenced Stoicism.",
    ],
    mentorIds: ["p-1"],
    studentIds: [],
    influencedByIds: [{ id: "p-2", strength: "weak" }] as InfluenceLink[],
  },
  {
    _id: "p-23",
    name: "Augustine of Hippo",
    slug: "augustine",
    eraId: "era-4",
    birthYear: 354,
    deathYear: 430,
    hookQuote: "Our heart is restless until it rests in Thee.",
    coreBranch: "Theology, Epistemology & Ethics",
    networkX: 36,
    networkY: 60,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Saint_Augustine_by_Philippe_de_Champaigne.jpg/440px-Saint_Augustine_by_Philippe_de_Champaigne.jpg",
    shortSummary:
      "The towering intellectual of Latin Christianity. Augustine fused Platonic philosophy with Christian theology, shaping Western thought on original sin, free will, predestination, and the City of God for over a millennium.",
    fullBiography: `Augustine of Hippo (354–430 AD) was born in Thagaste, North Africa, to a pagan father and a devout Christian mother, Monica. After years as a Manichaean, a sceptic, and an admirer of Neoplatonism, he converted to Christianity at age thirty-two under the influence of Ambrose of Milan.\n\nHis Confessions is one of the first and greatest autobiographies in Western literature — a searching account of his restless intellectual journey to God. The City of God, written in response to the sack of Rome (410), argued that history is a conflict between two cities: the earthly city of self-love and the heavenly city of love for God.\n\nHis theological legacy is immense: he developed the doctrines of original sin and grace into systematic form, defended the compatibility of free will and divine foreknowledge, and shaped the entire Augustinian tradition that runs from the medieval period through the Reformation.`,
    importantWorks: [
      { title: "Confessions", year: 400, synopsis: "The autobiography of a restless soul — from Manichaeism and scepticism to Christian conversion." },
      { title: "The City of God", year: 426, synopsis: "History as a conflict between the earthly city of self-love and the heavenly city of love of God." },
      { title: "On Free Choice of the Will", year: 395, synopsis: "A dialogue defending free will while anchoring goodness in the eternal truth of God." },
    ],
    keyTakeaways: [
      "The restless heart: the soul is made for God and finds no lasting peace elsewhere.",
      "Original sin radically wounded human nature — reason and will are both affected.",
      "Grace is prior to human merit; salvation depends entirely on God's unmerited gift.",
      "Illuminationism: God is the inner teacher who illumines the mind to grasp eternal truths.",
      "Two cities, one history: all politics is ultimately a struggle between love of self and love of God.",
    ],
    mentorIds: [],
    studentIds: [],
    influencedByIds: [{ id: "p-2", strength: "strong" }, { id: "p-12", strength: "strong" }, { id: "p-3", strength: "medium" }] as InfluenceLink[],
  },
  {
    _id: "p-24",
    name: "Averroes",
    slug: "averroes",
    eraId: "era-5",
    birthYear: 1126,
    deathYear: 1198,
    hookQuote: "Knowledge is the conformity of the object and the intellect.",
    coreBranch: "Islamic Philosophy & Aristotelianism",
    networkX: 58,
    networkY: 52,
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Averroes_and_Porphyry.jpg/440px-Averroes_and_Porphyry.jpg",
    shortSummary:
      "The great Arab commentator who rescued Aristotle for medieval Europe. Averroes' meticulous commentaries on the Aristotelian corpus sparked the Scholastic revolution and deeply unsettled Christian and Jewish theologians alike.",
    fullBiography: `Ibn Rushd, known in the Latin West as Averroes (1126–1198), was an Andalusian polymath — physician, jurist, and the most systematic Islamic philosopher of the medieval period. Born in Córdoba, he served as court physician to the Almohad caliphs.\n\nHis comprehensive commentaries on nearly the entire Aristotelian corpus earned him the title The Commentator in medieval European philosophy. When Latin translations of his work arrived in the thirteenth century, they reignited the study of Aristotle throughout European universities and directly provoked the great Scholastic syntheses of Albert the Great and Thomas Aquinas.\n\nIn the Incoherence of the Incoherence, he systematically refuted al-Ghazali's attack on philosophy. He argued for the eternity of the world against creatio ex nihilo and for a doctrine of the unity of the Active Intellect — positions condemned by both Christian and Islamic authorities.`,
    importantWorks: [
      { title: "Commentaries on Aristotle", year: 1180, synopsis: "Short, middle, and long commentaries covering the entire Aristotelian corpus, authoritative for centuries." },
      { title: "The Incoherence of the Incoherence", year: 1180, synopsis: "A systematic rebuttal of al-Ghazali's attack on philosophy, defending reason's autonomy." },
      { title: "The Decisive Treatise", year: 1179, synopsis: "A legal argument that philosophy is obligatory for qualified Muslims and compatible with revelation." },
    ],
    keyTakeaways: [
      "Philosophy and revelation address the same truth at different levels of demonstration and persuasion.",
      "The Active Intellect is a single, universal, and immortal intellect shared by all humans.",
      "The world is eternal — creation ex nihilo contradicts Aristotle's physics and metaphysics.",
      "Al-Ghazali's attacks on philosophy rest on misreadings of Aristotle; philosophy is self-sufficient.",
      "His Latin commentaries were the proximate cause of the Scholastic rediscovery of Aristotle.",
    ],
    mentorIds: [],
    studentIds: [],
    influencedByIds: [{ id: "p-3", strength: "strong" }] as InfluenceLink[],
  },
];

// ── Helper types (mirror the DB shapes used by pages) ────────

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
  mentors: string[];
  students: string[];
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
    influences:   (p.influencedByIds ?? []) as InfluenceLink[],
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
      influences:       (p.influencedByIds ?? []) as InfluenceLink[],
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
      eraId:      p.eraId,
    }));
}

// ── Schools of Thought ────────────────────────────────────

// ── Additional philosophers for new lineage schools ────────

const EXTRA_PHILOSOPHERS = [
  {
    _id: "p-11",
    name: "Marcus Aurelius",
    slug: "marcus-aurelius",
    eraId: "era-3",
    birthYear: 121,
    deathYear: 180,
    hookQuote: "You have power over your mind, not outside events. Realize this, and you will find strength.",
    coreBranch: "Stoic Ethics & Cosmology",
    networkX: 52,
    networkY: 44,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/MSR-ra-61-b-1.jpg/440px-MSR-ra-61-b-1.jpg",
    shortSummary:
      "Roman Emperor and Stoic philosopher whose private journal, the Meditations, became the definitive expression of Stoic practice — a guide to living with reason, virtue, and equanimity in the face of mortality.",
    fullBiography: `Marcus Aurelius (121–180 AD) was Roman Emperor from 161 to 180 and the last of the Five Good Emperors. Despite ruling the most powerful empire in the world, he devoted his private hours to philosophy, composing his Meditations — a series of personal notes written in Greek, never intended for publication.\n\nHis Meditations are a sustained exercise in Stoic self-discipline: reminders to himself to act rationally, accept what cannot be changed, and treat all human beings as fellow citizens of a common rational cosmos.\n\nMarcus represents the culmination of Hellenistic Stoicism as a practical ethics, bridging the early Greek school and the later Neoplatonist tradition.`,
    importantWorks: [
      { title: "Meditations", year: 170, synopsis: "Personal Stoic reflections on duty, mortality, and the rational governance of the self." },
    ],
    keyTakeaways: [
      "Virtue, not pleasure or wealth, is the only genuine good.",
      "External circumstances are indifferent — only our judgements of them are in our power.",
      "We are all citizens of the rational cosmos; universal brotherhood follows.",
      "Memento mori — constant awareness of mortality sharpens the value of the present.",
      "Act for the common good; leadership is service.",
    ],
    mentorIds: [] as string[],
    studentIds: [] as string[],
    influencedByIds: [{ id: "p-1", strength: "medium" }, { id: "p-2", strength: "medium" }] as InfluenceLink[],
  },
  {
    _id: "p-12",
    name: "Plotinus",
    slug: "plotinus",
    eraId: "era-4",
    birthYear: 204,
    deathYear: 270,
    hookQuote: "Withdraw into yourself and look.",
    coreBranch: "Metaphysics & Mystical Ascent",
    networkX: 46,
    networkY: 66,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Plotinos.jpg/440px-Plotinos.jpg",
    shortSummary:
      "The founder of Neoplatonism who transformed Plato's philosophy into a mystical system of emanation — from the ineffable One, through Intellect and Soul, down to matter — and charted the soul's contemplative return to its source.",
    fullBiography: `Plotinus (c. 204–270 AD) was an Egyptian-born philosopher who studied in Alexandria before settling in Rome, where he founded his school. His lectures were collected and edited by his student Porphyry into the Enneads.\n\nPlotinus reconstructed Platonic metaphysics as a hierarchy of emanations: from the absolutely simple and ineffable One, Intellect (nous) flows as a second hypostasis, and Soul as a third. Matter, the lowest level, is not evil but simply the absence of form.\n\nFor Plotinus, philosophy is not primarily theoretical but spiritual — the soul's ascent through contemplation back to its divine origin. This vision of philosophy as a transformative practice profoundly influenced Augustine, Islamic philosophy, and the entire medieval tradition.`,
    importantWorks: [
      { title: "The Enneads", year: 270, synopsis: "Six groups of nine treatises covering the One, Intellect, Soul, and the path of mystical ascent." },
    ],
    keyTakeaways: [
      "The One is beyond being and thought — it can only be approached by negation.",
      "Reality flows from the One by emanation, not creation; it is not a voluntary act.",
      "The soul is naturally divine and seeks return to its source through contemplation.",
      "Beauty is the trace of the One in matter — aesthetic experience points upward.",
      "Evil is privation, not a positive force — the absence of form and goodness.",
    ],
    mentorIds: [] as string[],
    studentIds: [] as string[],
    influencedByIds: [{ id: "p-2", strength: "strong" }] as InfluenceLink[],
  },
  {
    _id: "p-13",
    name: "Thomas Aquinas",
    slug: "aquinas",
    eraId: "era-5",
    birthYear: 1225,
    deathYear: 1274,
    hookQuote: "To one who has faith, no explanation is necessary. To one without faith, no explanation is possible.",
    coreBranch: "Scholastic Theology & Natural Law",
    networkX: 32,
    networkY: 52,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Saint_Thomas_Aquinas.jpg/440px-Saint_Thomas_Aquinas.jpg",
    shortSummary:
      "The greatest philosopher-theologian of the medieval period, who synthesised Aristotelian philosophy with Christian theology to show that faith and reason are not enemies but complementary paths to truth.",
    fullBiography: `Thomas Aquinas (1225–1274) was an Italian Dominican friar and the foremost thinker of Scholasticism. His two great Summae — the Summa Theologiae and the Summa Contra Gentiles — represent the most systematic attempt in history to reconcile Aristotle with Christian doctrine.\n\nAquinas argued that reason can establish certain truths about God (existence, simplicity, eternity) independently of revelation, while other truths (the Trinity, the Incarnation) require faith. The two domains are complementary: grace perfects nature, it does not destroy it.\n\nHis natural law theory held that moral norms are accessible to human reason because they are written into the structure of human nature by its creator. This framework shaped centuries of Catholic moral theology and Western jurisprudence.`,
    importantWorks: [
      { title: "Summa Theologiae", year: 1274, synopsis: "The comprehensive synthesis of Christian theology and Aristotelian philosophy." },
      { title: "Summa Contra Gentiles", year: 1265, synopsis: "A rational defence of Christian truth aimed at non-Christian readers." },
    ],
    keyTakeaways: [
      "Faith and reason are complementary: theology and philosophy share truth without contradiction.",
      "The Five Ways: five rational arguments for the existence of God from motion, causation, contingency, degree, and teleology.",
      "Natural law: moral truths are rationally accessible because human nature has a God-given telos.",
      "Grace perfects nature — the supernatural does not abolish the natural but elevates it.",
      "Being (esse) is the deepest actuality of everything that exists: God is pure act of being.",
    ],
    mentorIds: [] as string[],
    studentIds: [] as string[],
    influencedByIds: [{ id: "p-2", strength: "medium" }, { id: "p-3", strength: "strong" }] as InfluenceLink[],
  },
  {
    _id: "p-14",
    name: "G.W.F. Hegel",
    slug: "hegel",
    eraId: "era-7",
    birthYear: 1770,
    deathYear: 1831,
    hookQuote: "The owl of Minerva spreads its wings only with the falling of the dusk.",
    coreBranch: "Dialectics & Philosophy of History",
    networkX: 76,
    networkY: 22,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Hegel_portrait_by_Schlesinger_1831.jpg/440px-Hegel_portrait_by_Schlesinger_1831.jpg",
    shortSummary:
      "The most ambitious systematic philosopher of the modern era, who argued that reality is the self-development of rational Spirit through history — a process driven by dialectical contradiction toward an ever-greater realisation of freedom.",
    fullBiography: `Georg Wilhelm Friedrich Hegel (1770–1831) was a German philosopher at the University of Berlin whose system of Absolute Idealism became the dominant philosophy of the early nineteenth century and shaped virtually every major subsequent movement.\n\nHegel held that reality is not a static collection of substances but a dynamic, self-developing process — the Absolute Spirit or Geist coming to know itself through history. This development proceeds dialectically: every determinate position (thesis) generates its negation (antithesis), and the tension is resolved in a higher unity (synthesis) that preserves both while transcending them.\n\nHis Phenomenology of Spirit traces consciousness's journey from immediate sense-experience through self-consciousness, reason, and spirit to Absolute Knowing. His Philosophy of Right argued that the rational state is the highest expression of ethical life. He influenced Marx, Kierkegaard, Nietzsche, and the entire tradition of Continental philosophy.`,
    importantWorks: [
      { title: "Phenomenology of Spirit", year: 1807, synopsis: "The journey of consciousness from sense-certainty to Absolute Knowing, via master-slave dialectic and more." },
      { title: "Science of Logic", year: 1816, synopsis: "The self-development of pure thought through the categories of being, essence, and concept." },
      { title: "Philosophy of Right", year: 1820, synopsis: "Ethical life realised through family, civil society, and the rational state." },
    ],
    keyTakeaways: [
      "The real is rational and the rational is real — reason is not merely subjective but the structure of reality.",
      "The dialectical method: contradiction is the engine of development, not a logical error to be eliminated.",
      "History is the progressive self-realisation of freedom — the World Spirit unfolding through time.",
      "The master-slave dialectic: self-consciousness requires recognition from another self-consciousness.",
      "Philosophy can only understand its own time — it cannot prophesy what comes next.",
    ],
    mentorIds: [] as string[],
    studentIds: [] as string[],
    influencedByIds: [{ id: "p-2", strength: "medium" }, { id: "p-3", strength: "medium" }, { id: "p-5", strength: "strong" }, { id: "p-8", strength: "strong" }] as InfluenceLink[],
  },
];

// Merge into main PHILOSOPHERS array at runtime
(PHILOSOPHERS as typeof EXTRA_PHILOSOPHERS).push(...EXTRA_PHILOSOPHERS);

export const SCHOOLS = [
  {
    _id: "sch-1",
    title: "The Socratic Method",
    slug: "socratic-method",
    eraRange: "c. 470 – 399 BC",
    description:
      "Born from Socrates' practice of relentless questioning, the dialectic method treats philosophy as intellectual midwifery — drawing truth from others by exposing contradictions in their beliefs. Virtue, self-knowledge, and the examined life are its central preoccupations.",
    coreIdeas: [
      "Philosophical inquiry as dialogue and questioning (elenchus)",
      "Virtue is knowledge; wrongdoing is a form of ignorance",
      "The unexamined life is not worth living",
      "True wisdom begins in recognising what you do not know",
    ],
    philosopherIds: ["p-1", "p-2"],
    influencedByIds: [] as string[],
    influencedToIds: ["sch-2", "sch-3"],
  },
  {
    _id: "sch-2",
    title: "Platonic Philosophy",
    slug: "platonism",
    eraRange: "c. 428 – 30 BC",
    description:
      "Plato extended Socratic inquiry into a comprehensive metaphysics. The physical world is a shadow of a higher realm of perfect, eternal Forms — with the Form of the Good at the summit. This tradition shaped Christian theology, Renaissance humanism, and over two millennia of Western thought.",
    coreIdeas: [
      "The Theory of Forms: abstract ideals are more real than material instances",
      "The soul is immortal and pre-exists the body",
      "The Allegory of the Cave: education is a turning of the whole soul toward the light",
      "The philosopher-king: reason should govern both the soul and the state",
    ],
    philosopherIds: ["p-2", "p-3"],
    influencedByIds: ["sch-1"],
    influencedToIds: ["sch-3"],
  },
  {
    _id: "sch-3",
    title: "Aristotelianism",
    slug: "aristotelianism",
    eraRange: "c. 384 BC – AD 1200",
    description:
      "Aristotle rejected Plato's separate Forms in favour of hylomorphism — form is always immanent in matter. He created the first systematic empirical philosophy, establishing logic, ethics, politics, and natural science as distinct disciplines. His work became the intellectual backbone of medieval scholasticism.",
    coreIdeas: [
      "Hylomorphism: every substance is a union of matter and form, not two separate realms",
      "The four causes: material, formal, efficient, and final",
      "Eudaimonia (flourishing) achieved through virtuous activity and practical wisdom",
      "Logic as the organon — the tool presupposed by every discipline",
    ],
    philosopherIds: ["p-3"],
    influencedByIds: ["sch-1", "sch-2"],
    influencedToIds: ["sch-9"],
  },
  {
    _id: "sch-4",
    title: "Rationalism",
    slug: "rationalism",
    eraRange: "c. 1596 – 1780",
    description:
      "The Continental rationalists held that reason alone — independent of sensory experience — is capable of yielding certain knowledge. Modelling philosophy on mathematics, they sought a priori foundations for metaphysics, theology, and ethics, directly challenging the Aristotelian reliance on observation.",
    coreIdeas: [
      "Reason — not sensation — is the primary and most reliable source of knowledge",
      "Clear and distinct ideas as the criterion of truth (Descartes)",
      "A priori truths can be known independently of any experience",
      "The universe follows a rational, mathematical structure knowable by the intellect",
    ],
    philosopherIds: ["p-4", "p-5"],
    influencedByIds: ["sch-11"],
    influencedToIds: ["sch-6"],
  },
  {
    _id: "sch-5",
    title: "Empiricism",
    slug: "empiricism",
    eraRange: "c. 1632 – 1780",
    description:
      "British empiricists argued that the mind begins as a blank slate and all knowledge derives from sensory experience. Hume pushed this to a sceptical limit — causation, the self, and external reality are not rationally knowable, only habitual. It was Hume who roused Kant from his dogmatic slumber.",
    coreIdeas: [
      "The mind at birth is a blank slate (tabula rasa) — all ideas come from experience",
      "Natural rights to life, liberty, and property are pre-political (Locke)",
      "Causation is constant conjunction, not rational necessity — Hume's Fork",
      "The self is a bundle of perceptions, not a unified substance",
    ],
    philosopherIds: ["p-6", "p-7"],
    influencedByIds: ["sch-11"],
    influencedToIds: ["sch-6"],
  },
  {
    _id: "sch-6",
    title: "Critical Philosophy",
    slug: "critical-philosophy",
    eraRange: "c. 1781 – 1850",
    description:
      "Kant's Copernican revolution placed the structure of the mind — not the world — at the centre of epistemology. By synthesising rationalist and empiricist insights, he showed that the mind actively constitutes experience through a priori categories. This tradition shaped German Idealism and set the agenda for all subsequent philosophy.",
    coreIdeas: [
      "The mind constitutes experience through pure intuitions (space, time) and categories",
      "We can know phenomena only — never things-in-themselves (noumena)",
      "The Categorical Imperative: act only on maxims universalisable for all rational beings",
      "Reason overreaches when it claims theoretical knowledge of God, freedom, or immortality",
    ],
    philosopherIds: ["p-8"],
    influencedByIds: ["sch-4", "sch-5"],
    influencedToIds: ["sch-12", "sch-7"],
  },
  {
    _id: "sch-7",
    title: "Existentialism & Nihilism",
    slug: "existentialism",
    eraRange: "c. 1844 – 1980",
    description:
      "Reacting against Kantian systematising and the moral inheritance of Christianity, Nietzsche diagnosed the death of God as a cultural catastrophe — the collapse of the foundations of Western values. The existentialist response was to foreground individual will, self-overcoming, and the creation of new meaning.",
    coreIdeas: [
      "God is dead: the transcendent foundations of Western morality have collapsed",
      "Will to power and self-overcoming as the fundamental human drive",
      "Perspectivism: there are no facts, only interpretations — truth is a will to power",
      "The Eternal Return and amor fati — love your fate and affirm life unconditionally",
    ],
    philosopherIds: ["p-9"],
    influencedByIds: ["sch-12", "sch-6"],
    influencedToIds: ["sch-8"],
  },
  {
    _id: "sch-8",
    title: "Analytic Philosophy",
    slug: "analytic-philosophy",
    eraRange: "c. 1889 – present",
    description:
      "Emerging from the logical work of Frege and Russell, analytic philosophy turned to language, logic, and meaning as the primary objects of inquiry. Wittgenstein's two philosophies — the Tractatus and the Investigations — became its twin poles: one seeking the logical structure of reality, the other dissolving philosophical problems as grammatical confusions.",
    coreIdeas: [
      "Language as the primary medium and central problem of philosophy",
      "Early: language pictures the logical form of reality; what can't be said must be shown",
      "Later: meaning is use in language-games embedded in forms of life",
      "Philosophy as therapy — dissolving confusion rather than constructing systems",
    ],
    philosopherIds: ["p-10"],
    influencedByIds: ["sch-7"],
    influencedToIds: [] as string[],
  },
  {
    _id: "sch-9",
    title: "Stoicism",
    slug: "stoicism",
    eraRange: "c. 300 BC – AD 200",
    description:
      "Founded in Athens by Zeno of Citium, Stoicism held that virtue alone is the highest good and that external circumstances — wealth, power, health — are indifferent to the well-lived life. By the Roman era, Stoics like Marcus Aurelius had developed it into the most practical and enduring philosophy of antiquity: a guide to equanimity in the face of fate.",
    coreIdeas: [
      "Virtue (wisdom, justice, courage, temperance) is the only true good",
      "External events are 'indifferent' — only our judgements of them are in our control",
      "The logos: a rational, providential principle governs the cosmos",
      "Live according to nature — align the will with universal reason",
    ],
    philosopherIds: ["p-11"],
    influencedByIds: ["sch-3"],
    influencedToIds: ["sch-10"],
  },
  {
    _id: "sch-10",
    title: "Neoplatonism",
    slug: "neoplatonism",
    eraRange: "c. AD 200 – 600",
    description:
      "Plotinus synthesised Platonic metaphysics into a grand mystical hierarchy: from the ineffable One, Intellect and Soul emanate downward, with matter at the lowest level. Philosophy becomes a spiritual ascent — the soul's return to its divine origin. Neoplatonism profoundly shaped early Christian theology and Islamic philosophy, bridging ancient Greece to the medieval world.",
    coreIdeas: [
      "The One: the ultimate, ineffable source beyond being and thought",
      "Emanation: Intellect and Soul flow necessarily from the One like light from the sun",
      "The soul can ascend through contemplation to mystical union with the One",
      "Matter is not evil but the lowest degree of being — the absence of form",
    ],
    philosopherIds: ["p-12"],
    influencedByIds: ["sch-9", "sch-2"],
    influencedToIds: ["sch-11"],
  },
  {
    _id: "sch-11",
    title: "Scholasticism",
    slug: "scholasticism",
    eraRange: "c. AD 1000 – 1400",
    description:
      "The great intellectual project of the medieval universities was to reconcile revealed Christian faith with the rediscovered philosophy of Aristotle. Thomas Aquinas achieved this synthesis most completely: reason and faith operate on different planes but cannot ultimately contradict each other. Scholasticism also transmitted Aristotle into the Early Modern period, where it became the foil against which Descartes and Hume would define themselves.",
    coreIdeas: [
      "Faith and reason are complementary, not contradictory — each has its proper domain",
      "The Five Ways: rational arguments for the existence of God",
      "Natural law: moral norms are accessible to human reason independently of revelation",
      "The soul is the form of the body — resurrection requires both",
    ],
    philosopherIds: ["p-13"],
    influencedByIds: ["sch-10"],
    influencedToIds: ["sch-4", "sch-5"],
  },
  {
    _id: "sch-12",
    title: "German Idealism",
    slug: "german-idealism",
    eraRange: "c. 1781 – 1850",
    description:
      "Kant's successors — Fichte, Schelling, and above all Hegel — pushed his insight that mind constitutes reality to its radical conclusion: reality itself is the self-development of rational spirit (Geist). Hegel's dialectic traces this development through history — contradiction driving progress — making German Idealism the most ambitious philosophical system ever constructed, and the direct ancestor of Marx, Kierkegaard, and twentieth-century existentialism.",
    coreIdeas: [
      "Reality is the self-realisation of Absolute Spirit (Geist) through history",
      "The dialectical method: thesis and antithesis are resolved in a higher synthesis",
      "Freedom is the telos of history — its progressive realisation is history's meaning",
      "The rational is actual, and the actual is rational",
    ],
    philosopherIds: ["p-14"],
    influencedByIds: ["sch-6"],
    influencedToIds: ["sch-7"],
  },
];

export type SchoolWithPhilosophers = {
  _id: string;
  title: string;
  slug: string;
  eraRange: string;
  description: string;
  coreIdeas: string[];
  philosophers: { _id: string; name: string; slug: string; avatarUrl: string; coreBranch: string }[];
  influencedBy: { _id: string; title: string; slug: string }[];
  influencedTo: { _id: string; title: string; slug: string }[];
};

export function getSchoolsWithPhilosophers(): SchoolWithPhilosophers[] {
  return SCHOOLS.map((school) => ({
    _id: school._id,
    title: school.title,
    slug: school.slug,
    eraRange: school.eraRange,
    description: school.description,
    coreIdeas: school.coreIdeas,
    philosophers: school.philosopherIds
      .map((id) => PHILOSOPHERS.find((p) => p._id === id))
      .filter((p): p is NonNullable<typeof p> => p != null)
      .map((p) => ({
        _id: p._id,
        name: p.name,
        slug: p.slug,
        avatarUrl: p.avatarUrl,
        coreBranch: p.coreBranch,
      })),
    influencedBy: school.influencedByIds
      .map((id) => SCHOOLS.find((s) => s._id === id))
      .filter((s): s is NonNullable<typeof s> => s != null)
      .map((s) => ({ _id: s._id, title: s.title, slug: s.slug })),
    influencedTo: school.influencedToIds
      .map((id) => SCHOOLS.find((s) => s._id === id))
      .filter((s): s is NonNullable<typeof s> => s != null)
      .map((s) => ({ _id: s._id, title: s.title, slug: s.slug })),
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
    eraId:         p.eraId,
    mentors:       resolvePeople(p.mentorIds),
    students:      resolvePeople(p.studentIds),
  };
}
