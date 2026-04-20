/**
 * Seed script: populates MongoDB with eras + philosophers
 * Run: npx tsx scripts/seed.ts
 */
import "dotenv/config";
import mongoose from "mongoose";
import Era from "../lib/models/Era";
import Philosopher from "../lib/models/Philosopher";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set in environment.");

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB");

  // ── Wipe existing data ─────────────────────────────────────
  await Era.deleteMany({});
  await Philosopher.deleteMany({});

  // ── Eras ──────────────────────────────────────────────────
  const [ancient, hellenistic, earlyModern, modern] = await Era.insertMany([
    {
      title: "The Socratic Epoch",
      slug: "socratic-epoch",
      startYear: -470,
      endYear: -322,
      description:
        "The golden age of Greek philosophy, anchored by the trial of Socrates and the meteoric rise of Plato and Aristotle. Reason, virtue, and the good life became the central questions of an emerging tradition.",
    },
    {
      title: "Hellenistic Philosophy",
      slug: "hellenistic",
      startYear: -322,
      endYear: 529,
      description:
        "After Alexander's conquests, philosophy splintered into competing schools—Stoics, Epicureans, Skeptics—each offering a practical guide to living well amid an uncertain empire.",
    },
    {
      title: "The Early Modern Turn",
      slug: "early-modern",
      startYear: 1596,
      endYear: 1780,
      description:
        "The Reformation and Scientific Revolution shattered scholasticism. Thinkers like Descartes, Locke, Hume, and Spinoza rebuilt philosophy on foundations of reason, sensation, and the sovereign individual.",
    },
    {
      title: "The Critical & Post-Critical Era",
      slug: "critical-era",
      startYear: 1724,
      endYear: 1951,
      description:
        "Kant's Copernican revolution in philosophy, followed by the explosive Romanticist and Existentialist reactions—from Hegel's dialectic to Nietzsche's hammer, and finally Wittgenstein's quiet dissolution of traditional problems.",
    },
  ]);

  // ── Placeholder slugs for cross-referencing ───────────────
  const socrates = new Philosopher({  name: "Socrates",       slug: "socrates" });
  const plato     = new Philosopher({ name: "Plato",          slug: "plato" });
  const aristotle = new Philosopher({ name: "Aristotle",      slug: "aristotle" });
  const descartes = new Philosopher({ name: "René Descartes", slug: "descartes" });
  const locke     = new Philosopher({ name: "John Locke",     slug: "locke" });
  const hume      = new Philosopher({ name: "David Hume",     slug: "hume" });
  const spinoza   = new Philosopher({ name: "Baruch Spinoza", slug: "spinoza" });
  const kant      = new Philosopher({ name: "Immanuel Kant",  slug: "kant" });
  const nietzsche = new Philosopher({ name: "Friedrich Nietzsche", slug: "nietzsche" });
  const wittgenstein = new Philosopher({ name: "Ludwig Wittgenstein", slug: "wittgenstein" });

  // Persist to get IDs
  await Promise.all([
    socrates.save(), plato.save(), aristotle.save(),
    descartes.save(), locke.save(), hume.save(),
    spinoza.save(), kant.save(), nietzsche.save(), wittgenstein.save(),
  ]);

  // ── Full data ─────────────────────────────────────────────
  await Philosopher.findByIdAndUpdate(socrates._id, {
    era: ancient._id,
    birthYear: -470, deathYear: -399,
    hookQuote: "The unexamined life is not worth living.",
    coreBranch: "Ethics & Dialectic",
    networkX: 20, networkY: 30,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Socrate_du_Louvre.jpg/440px-Socrate_du_Louvre.jpg",
    shortSummary: "The gadfly of Athens who never wrote a word, yet whose questions reshaped Western thought. Socrates practised philosophy as a form of moral midwifery, drawing truth from others through relentless dialogue.",
    fullBiography: `Socrates (c. 470–399 BC) is one of the founders of Western philosophy. Unlike his predecessors, he turned philosophical inquiry away from cosmology and toward ethics and the human soul. He left no writings of his own; his ideas survive through the dialogues of his student Plato.\n\nSocrates developed the *elenctic method*—a form of cooperative argument aimed at exposing inconsistencies in his interlocutors' beliefs. He believed that virtue is knowledge, and that wrongdoing is therefore a form of ignorance. This radical claim united ethics and epistemology in a way that proved formative for all subsequent Western thought.\n\nIn 399 BC, he was tried by an Athenian jury on charges of impiety and corrupting the youth. He was found guilty and sentenced to death by hemlock. His willingness to accept the sentence rather than compromise his principles became one of philosophy's most enduring images of intellectual integrity.`,
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
    students: [plato._id],
  });

  await Philosopher.findByIdAndUpdate(plato._id, {
    era: ancient._id,
    birthYear: -428, deathYear: -348,
    hookQuote: "At the touch of love, everyone becomes a poet.",
    coreBranch: "Metaphysics & Political Philosophy",
    networkX: 38, networkY: 18,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Plato_Silanion_Musei_Capitolini_MC1377.jpg/440px-Plato_Silanion_Musei_Capitolini_MC1377.jpg",
    shortSummary: "Founder of the Academy and architect of the Theory of Forms. Plato held that the world we perceive is a shadow of a higher realm of perfect, eternal archetypes — and that the philosopher's task is to ascend toward that light.",
    fullBiography: `Plato (c. 428–348 BC) was an Athenian philosopher and student of Socrates. He founded the *Academy* in Athens — often considered the first institution of higher learning in the Western world — and taught there for nearly fifty years. Among his students was Aristotle.\n\nHis most celebrated contribution is the *Theory of Forms*: the idea that the physical world is not the most real level of reality. Abstract entities — the Form of Beauty, the Form of Justice, the Form of the Good — are more real than their imperfect material instantiations. The philosopher's task is to turn the mind's eye away from shadows (the *Allegory of the Cave*) and toward the blinding light of the Good.\n\nIn political philosophy, Plato's *Republic* argues for a hierarchical city-state governed by a philosopher-king trained in mathematics and dialectic. His later works — the *Timaeus*, *Philebus*, and *Laws* — show a mind continually revising and expanding its own system.`,
    importantWorks: [
      { title: "The Republic", year: -380, synopsis: "A foundational treatise on justice, the ideal state, and the philosopher-king." },
      { title: "The Symposium", year: -385, synopsis: "A series of speeches on the nature of Eros and the ascent to Beauty itself." },
      { title: "Phaedo", year: -360, synopsis: "Socrates' final hours, arguing for the immortality of the soul." },
      { title: "Meno", year: -380, synopsis: "An inquiry into virtue and the theory that all learning is recollection." },
    ],
    keyTakeaways: [
      "The material world is a copy of eternal, perfect Forms.",
      "The soul pre-exists the body and is immortal.",
      "A just soul mirrors a just city-state: reason governs appetite.",
      "The Allegory of the Cave: education is a turning of the whole soul toward the light.",
      "Philosophy is preparation for death — the freeing of the soul from the body.",
    ],
    mentors: [socrates._id],
    students: [aristotle._id],
  });

  await Philosopher.findByIdAndUpdate(aristotle._id, {
    era: ancient._id,
    birthYear: -384, deathYear: -322,
    hookQuote: "We are what we repeatedly do. Excellence, then, is not an act but a habit.",
    coreBranch: "Logic, Ethics & Natural Philosophy",
    networkX: 58, networkY: 22,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Aristotle_Altemps_Inv8575.jpg/440px-Aristotle_Altemps_Inv8575.jpg",
    shortSummary: "The Stagyrite who classified everything. Aristotle's encyclopaedic intellect ranged from biology to tragedy, establishing logic, physics, ethics, and political theory as distinct disciplines for the first time.",
    fullBiography: `Aristotle (384–322 BC) was born in Stagira, Macedonia, and entered Plato's Academy at age seventeen, where he studied for twenty years. After Plato's death, he founded his own school, the *Lyceum*, in Athens.\n\nHe is perhaps history's most wide-ranging intellect. He wrote treatises on logic (*Organon*), natural science (*Physics*, *De Anima*), ethics (*Nicomachean Ethics*), politics (*Politics*), rhetoric, aesthetics, and biology. In almost every field he visited, he was the first to treat it as a systematic discipline.\n\nIn metaphysics, he rejected Plato's separate Forms, arguing instead for *hylomorphism*: every substance is a union of matter (*hyle*) and form (*morphe*). His concept of *eudaimonia* — often translated as flourishing or happiness — remains one of the most influential ideas in ethical theory. For Aristotle, the good life is the life of virtuous activity in accordance with reason, pursued as an end in itself.`,
    importantWorks: [
      { title: "Nicomachean Ethics", year: -350, synopsis: "The definitive ancient account of virtue, practical wisdom, and the good life." },
      { title: "Politics", year: -350, synopsis: "Man is a political animal; the city-state is the natural context for human flourishing." },
      { title: "Metaphysics", year: -340, synopsis: "An inquiry into being qua being, substance, causation, and the Unmoved Mover." },
      { title: "Prior Analytics", year: -350, synopsis: "The founding treatise of formal logic and the syllogism." },
    ],
    keyTakeaways: [
      "Form is immanent in matter, not separate from it (contra Plato).",
      "The four causes: material, formal, efficient, final.",
      "Virtue is a mean between extremes — courage lies between cowardice and recklessness.",
      "Man is by nature a political animal (zoon politikon).",
      "Eudaimonia (flourishing) is the highest human good, achieved through virtuous activity.",
    ],
    mentors: [plato._id],
  });

  await Philosopher.findByIdAndUpdate(descartes._id, {
    era: earlyModern._id,
    birthYear: 1596, deathYear: 1650,
    hookQuote: "Cogito, ergo sum — I think, therefore I am.",
    coreBranch: "Epistemology & Rationalism",
    networkX: 30, networkY: 60,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg/440px-Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg",
    shortSummary: "Father of Modern Philosophy. By doubting everything that could be doubted, Descartes arrived at the one indubitable truth — the existence of the thinking self — and built an entire philosophical architecture upon it.",
    fullBiography: `René Descartes (1596–1650) was a French mathematician, physicist, and philosopher. He is often called the father of modern philosophy for his method of systematic doubt, which swept away the accumulated authority of scholasticism and started afresh from the single indubitable point: *Cogito, ergo sum*.\n\nIn the *Meditations on First Philosophy* he argues that mind and body are distinct substances — a position known as Cartesian dualism. The mind is a thinking thing (*res cogitans*); the body and all of nature are extended things (*res extensa*). This dualism posed the notorious problem of how an immaterial mind could interact with a material body.\n\nHis contributions to mathematics were equally vast: he invented the Cartesian coordinate system, uniting algebra and geometry into analytic geometry. In natural philosophy, his *Principles of Philosophy* proposed a mechanistic universe governed entirely by extension and motion — a vision that inspired Newton and the Scientific Revolution.`,
    importantWorks: [
      { title: "Meditations on First Philosophy", year: 1641, synopsis: "Six meditations reconstructing knowledge from the ground up, establishing the self as the first certainty." },
      { title: "Discourse on the Method", year: 1637, synopsis: "The manifesto of rational method and the origin of the Cogito argument." },
      { title: "Principles of Philosophy", year: 1644, synopsis: "A grand mechanistic system of matter, motion, and the laws of nature." },
    ],
    keyTakeaways: [
      "Systematic doubt reveals the cogito as the one indubitable certainty.",
      "Mind and body are distinct, interacting substances (Cartesian dualism).",
      "Clear and distinct perception is the criterion of truth.",
      "God's existence guarantees the reliability of reason.",
      "Analytic geometry: algebraic equations can describe geometric curves.",
    ],
    students: [spinoza._id],
  });

  await Philosopher.findByIdAndUpdate(spinoza._id, {
    era: earlyModern._id,
    birthYear: 1632, deathYear: 1677,
    hookQuote: "I have striven not to laugh at human actions, not to weep at them, nor to hate them, but to understand them.",
    coreBranch: "Metaphysics & Pantheism",
    networkX: 48, networkY: 55,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Spinoza.jpg/440px-Spinoza.jpg",
    shortSummary: "The excommunicated lens-grinder who identified God with Nature. Spinoza's rigorous geometrical method produced a monist philosophy of radical freedom and the equanimity that comes from understanding necessity.",
    fullBiography: `Baruch Spinoza (1632–1677) was born into a Portuguese-Jewish family in Amsterdam. His pantheistic ideas led to his excommunication from the Jewish community at age twenty-three. He earned his living polishing lenses and refrained from publishing his most radical work, the *Ethics*, during his lifetime.\n\nThe *Ethics* is written in the form of Euclid's *Elements* — definitions, axioms, propositions, demonstrations — a deliberate claim that metaphysics can achieve the certainty of mathematics. Its central thesis is that there is only one substance, which Spinoza calls God or Nature (*Deus sive Natura*). Everything that exists is a mode of this single infinite substance.\n\nFrom this monism flows a philosophy of freedom: human beings are free insofar as they act from their own nature (adequate causes) rather than from external compulsion. The highest human freedom is the *intellectual love of God* — the mind's identification with the eternal, rational order of Nature. This vision had a profound influence on the German Romanticists and on Einstein, who famously said he believed in Spinoza's God.`,
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
    mentors: [descartes._id],
  });

  await Philosopher.findByIdAndUpdate(locke._id, {
    era: earlyModern._id,
    birthYear: 1632, deathYear: 1704,
    hookQuote: "No man's knowledge here can go beyond his experience.",
    coreBranch: "Empiricism & Political Theory",
    networkX: 65, networkY: 52,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/JohnLocke.png/440px-JohnLocke.png",
    shortSummary: "Father of liberalism. Locke argued that the mind begins as a blank slate and knowledge comes entirely from experience — and extended that empiricist spirit to politics, grounding legitimate government in consent and natural rights.",
    fullBiography: `John Locke (1632–1704) was an English philosopher and physician, widely regarded as one of the most influential Enlightenment thinkers. His *Essay Concerning Human Understanding* mounted a systematic alternative to Cartesian rationalism: the mind at birth is a *tabula rasa*, and all its ideas — simple or complex — ultimately derive from sensory experience or reflection on that experience.\n\nIn political philosophy, his *Two Treatises of Government* attacked the divine right of kings and argued that political authority derives from the consent of the governed. Individuals enter society from a state of nature in which they already possess natural rights to life, liberty, and estate. If government violates those rights, revolution is not only permitted but required. This argument formed the philosophical backbone of both the Glorious Revolution (1688) and the American Declaration of Independence (1776).\n\nLocke's religious tolerance essays were equally influential. He argued for the separation of church and state and the toleration of most Protestant sects — though not, by his own admission, atheists or Catholics.`,
    importantWorks: [
      { title: "An Essay Concerning Human Understanding", year: 1689, synopsis: "Empiricism's founding text: the mind begins empty; knowledge derives from experience." },
      { title: "Two Treatises of Government", year: 1689, synopsis: "The social contract, natural rights, and the right of revolution." },
      { title: "A Letter Concerning Toleration", year: 1689, synopsis: "An argument for religious toleration and the separation of civil and ecclesiastical authority." },
    ],
    keyTakeaways: [
      "The mind is a blank slate (tabula rasa) — all knowledge comes from experience.",
      "Natural rights to life, liberty, and property are pre-political and inalienable.",
      "Legitimate government rests on the consent of the governed.",
      "The right of revolution: a government that violates natural rights may be overthrown.",
      "Primary vs. secondary qualities: shape is real; colour is mind-dependent.",
    ],
    students: [hume._id],
  });

  await Philosopher.findByIdAndUpdate(hume._id, {
    era: earlyModern._id,
    birthYear: 1711, deathYear: 1776,
    hookQuote: "Reason is, and ought only to be, the slave of the passions.",
    coreBranch: "Empiricism & Scepticism",
    networkX: 80, networkY: 48,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Painting_of_David_Hume.jpg/440px-Painting_of_David_Hume.jpg",
    shortSummary: "The Great Doubter. Hume pushed empiricism to its radical conclusion: causation, the self, and the external world are not rationally knowable — they are habits of the imagination. He woke Kant from his dogmatic slumber.",
    fullBiography: `David Hume (1711–1776) was a Scottish philosopher and historian who pushed the empiricism of Locke and Berkeley to its sceptical limit. His first and most ambitious work, *A Treatise of Human Nature*, was published when he was twenty-eight and, notoriously, "fell dead-born from the press." He later revised and popularised its ideas in the *Enquiries*.\n\nHume's most famous argument concerns causation. We never *see* one billiard ball *causing* another to move; we only ever observe constant conjunction. The idea of necessary connection — the idea that the cause *must* produce the effect — is a habit of the imagination, not a perception of objective reality. This challenge struck at the heart of Newtonian science and rational theology alike.\n\nHe applied a similar scepticism to the idea of the self: introspect, and you find only a bundle of perceptions — never a unified, persisting 'I'. His *Dialogues Concerning Natural Religion*, published posthumously, remains the sharpest philosophical critique of the argument from design. Kant credited Hume with waking him from his "dogmatic slumber," directly inspiring the *Critique of Pure Reason*.`,
    importantWorks: [
      { title: "A Treatise of Human Nature", year: 1739, synopsis: "The masterwork of British empiricism, arguing scepticism about causation, the self, and induction." },
      { title: "An Enquiry Concerning Human Understanding", year: 1748, synopsis: "A polished, accessible reformulation of the Treatise's epistemological arguments." },
      { title: "Dialogues Concerning Natural Religion", year: 1779, synopsis: "A devastating critique of the design argument for God's existence." },
    ],
    keyTakeaways: [
      "Causation is habit, not rational necessity — Hume's Fork.",
      "The self is a bundle of perceptions, not a unified substance.",
      "Is-ought gap: no moral conclusion strictly follows from factual premises.",
      "Reason serves the passions; it cannot motivate action on its own.",
      "Scepticism about induction: past regularities give no logical guarantee of the future.",
    ],
    mentors: [locke._id],
    students: [kant._id],
  });

  await Philosopher.findByIdAndUpdate(kant._id, {
    era: modern._id,
    birthYear: 1724, deathYear: 1804,
    hookQuote: "Two things fill the mind with ever-new and increasing admiration and awe: the starry heavens above me and the moral law within me.",
    coreBranch: "Epistemology & Moral Philosophy",
    networkX: 55, networkY: 75,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Immanuel_Kant_%28painted_portrait%29.jpg/440px-Immanuel_Kant_%28painted_portrait%29.jpg",
    shortSummary: "The architect of the Copernican Revolution in philosophy. Kant synthesised rationalism and empiricism, arguing that the mind actively structures experience — and that moral duty is grounded in reason alone, not in consequences.",
    fullBiography: `Immanuel Kant (1724–1804) was born and died in Königsberg, Prussia, rarely leaving the city. His quiet, clockwork-regular life belied the earthquake he triggered in Western philosophy. He spent eleven years writing the *Critique of Pure Reason* (1781), one of the most difficult and consequential books in the philosophical canon.\n\nKant's "Copernican revolution": just as Copernicus moved the sun to the centre of the solar system, Kant moved the *mind* to the centre of experience. We do not passively receive a world; we actively constitute it through the *forms of intuition* (space and time) and the *categories of the understanding* (such as causality and substance). This means we can have genuine, universal knowledge — but only of *phenomena* (things as they appear to us), never of *things-in-themselves* (*Noumena*).\n\nIn ethics, the *Groundwork for the Metaphysics of Morals* argues that the moral worth of an action lies entirely in its motive — specifically, the motive of duty. The supreme principle of morality is the *Categorical Imperative*, which Kant formulated in multiple ways: "Act only according to that maxim by which you can at the same time will that it should become a universal law."`,
    importantWorks: [
      { title: "Critique of Pure Reason", year: 1781, synopsis: "The synthesis of empiricism and rationalism: the mind constitutes experience through its own a priori structures." },
      { title: "Groundwork for the Metaphysics of Morals", year: 1785, synopsis: "The Categorical Imperative as the supreme principle of morality." },
      { title: "Critique of Practical Reason", year: 1788, synopsis: "The foundations of moral duty and the postulates of practical reason." },
      { title: "Critique of Judgement", year: 1790, synopsis: "Aesthetics and teleology: the beautiful, the sublime, and purposiveness in nature." },
    ],
    keyTakeaways: [
      "The mind constitutes experience; space, time, and causality are mental frameworks.",
      "We can know phenomena, never things-in-themselves (noumena).",
      "The Categorical Imperative: act only on maxims you could will to be universal laws.",
      "Moral worth lies in acting from duty, not from inclination or consequences.",
      "The three ideas of reason — God, freedom, immortality — are beyond theoretical knowledge but necessary for morality.",
    ],
    mentors: [hume._id],
    students: [nietzsche._id],
  });

  await Philosopher.findByIdAndUpdate(nietzsche._id, {
    era: modern._id,
    birthYear: 1844, deathYear: 1900,
    hookQuote: "That which does not kill us makes us stronger.",
    coreBranch: "Existentialism & Cultural Critique",
    networkX: 72, networkY: 80,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/440px-Nietzsche187a.jpg",
    shortSummary: "The philosopher with the hammer. Nietzsche diagnosed the death of God and the coming of nihilism, then prescribed the Übermensch and the will to power as humanity's creative response — an affirmation of life in all its chaos.",
    fullBiography: `Friedrich Nietzsche (1844–1900) was a German philologist-turned-philosopher who became one of the most influential and provocative thinkers of the modern era. His early work, *The Birth of Tragedy*, proposed that Greek culture was the product of a tension between the Apollonian impulse (order, reason, individuation) and the Dionysian (chaos, instinct, unity).\n\nHis mature masterpiece, *Thus Spoke Zarathustra*, announced the death of God — not as a triumphant atheism but as a cultural diagnosis of potentially catastrophic nihilism. If God is dead, the entire edifice of Western morality collapses. Nietzsche's answer was not despair but creation: the Übermensch (*Overman*), who creates new values beyond the herd morality of slave Christianity.\n\nIn *On the Genealogy of Morality*, he performed a "genealogical" critique: our moral values — good/evil, guilt, bad conscience — have historical origins in power and resentment, not in transcendent truth. His concept of the *will to power* is not a crude desire to dominate others but a fundamental drive toward growth, self-overcoming, and creative expression.`,
    importantWorks: [
      { title: "Thus Spoke Zarathustra", year: 1883, synopsis: "The death of God, the Eternal Return, and the vision of the Übermensch in poetic prose." },
      { title: "Beyond Good and Evil", year: 1886, synopsis: "A critique of past philosophers and a call for new, life-affirming values." },
      { title: "On the Genealogy of Morality", year: 1887, synopsis: "The historical origins of guilt, bad conscience, and slave morality." },
      { title: "The Birth of Tragedy", year: 1872, synopsis: "Apollo vs. Dionysus: the two impulses at the heart of Greek aesthetic achievement." },
    ],
    keyTakeaways: [
      "God is dead: the foundations of Western morality have collapsed.",
      "Will to power: the fundamental drive is toward self-overcoming and creative expression.",
      "Perspectivism: there are no facts, only interpretations.",
      "The Eternal Return: amor fati — love your fate and affirm all of life.",
      "Slave morality inverts master morality; resentment is the engine of 'good' and 'evil'.",
    ],
    mentors: [kant._id],
    students: [wittgenstein._id],
  });

  await Philosopher.findByIdAndUpdate(wittgenstein._id, {
    era: modern._id,
    birthYear: 1889, deathYear: 1951,
    hookQuote: "Whereof one cannot speak, thereof one must be silent.",
    coreBranch: "Philosophy of Language & Logic",
    networkX: 88, networkY: 72,
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Ludwig_Wittgenstein_%281929%29.jpg/440px-Ludwig_Wittgenstein_%281929%29.jpg",
    shortSummary: "The philosopher who revolutionised philosophy twice. The early Wittgenstein pictured the world as facts and language as their logical mirror. The later Wittgenstein dissolved that picture, arguing that meaning is use in a form of life.",
    fullBiography: `Ludwig Wittgenstein (1889–1951) was an Austrian-British philosopher, born into one of Vienna's wealthiest families, who gave away his enormous inheritance and lived monastically. He studied engineering and became fascinated by the foundations of mathematics, leading him to Bertrand Russell at Cambridge.\n\nHis first masterwork, the *Tractatus Logico-Philosophicus* (1921), proposed that language pictures the logical structure of the world. Propositions are arrangements of names that correspond to arrangements of objects. Metaphysical, ethical, and religious claims lie beyond the boundary of sense ("Whereof one cannot speak…"). This work was taken as a founding text of logical positivism, though Wittgenstein himself was not a positivist.\n\nHe believed the *Tractatus* had solved all genuine philosophical problems and spent ten years as a village schoolteacher in Austria. Returning to philosophy, he developed a radically different view, collected in the posthumous *Philosophical Investigations*. Language is not a mirror of reality but a collection of "language-games" embedded in forms of life. Meaning is use. Traditional philosophical problems arise from language going "on holiday" — from misapplying words in contexts that generate nonsense. Philosophy's task is therapeutic: to silence confusion, not produce doctrine.`,
    importantWorks: [
      { title: "Tractatus Logico-Philosophicus", year: 1921, synopsis: "Language pictures reality; what cannot be said can only be shown; silence is the endpoint." },
      { title: "Philosophical Investigations", year: 1953, synopsis: "Language-games, family resemblance, and the private language argument — philosophy as therapy." },
      { title: "On Certainty", year: 1969, synopsis: "Posthumous: the relationship between doubt, knowledge, and form of life." },
    ],
    keyTakeaways: [
      "Early: language pictures the logical form of facts (Tractatus).",
      "Later: meaning is use; words have meaning in language-games, not by picturing reality.",
      "Private language argument: a genuinely private language is impossible.",
      "Philosophical problems arise when language goes on holiday — philosophy is therapy.",
      "Family resemblance: concepts need not share a single defining feature.",
    ],
    mentors: [nietzsche._id],
  });

  console.log("✓ Seeded 4 eras and 10 philosophers");
  await mongoose.disconnect();
  console.log("✓ Disconnected");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
