// Blog posts as structured blocks, rendered by src/app/blog/[slug]/page.tsx.
// Topics stay on quality, testing, storage and buying: research use only, no dosing or health claims.

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "figure"; src: string; w: number; h: number; alt: string; caption?: string; frame?: "doc" | "soft" }
  | { type: "callout"; tone: "info" | "tip" | "note"; title: string; text: string }
  | { type: "takeaways"; items: string[] }
  | { type: "stats"; items: { n: string; label: string }[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "checklist"; items: { title: string; text: string }[] }
  | { type: "cta"; title: string; text: string; href: string; label: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Quality & testing" | "Storage & handling" | "Buying guide" | "Product knowledge";
  date: string; // ISO
  minutes: number;
  cover: { src: string; w: number; h: number; fit: "doc" | "product" };
  href?: string; // set when the post lives at its own route
  blocks: Block[];
};

const COA_HEADER = { src: "/blog/coa-header.jpg", w: 1710, h: 540 };

export const POSTS: Post[] = [
  {
    slug: "how-to-read-a-certificate-of-analysis",
    title: "How to read a certificate of analysis, line by line",
    excerpt:
      "A COA is the most useful document in peptide research, if you know where to look. We walk through a real report from Peptide Test Canada, section by section.",
    category: "Quality & testing",
    date: "2026-10-20",
    minutes: 6,
    cover: { src: "/coa/coa-bpc-157-hd.jpg", w: 1445, h: 1870, fit: "doc" },
    blocks: [
      {
        type: "takeaways",
        items: [
          "Check who tested the sample, and that the report can be verified.",
          "Match the compound, lot number and mass to the vial you bought.",
          "Purity and net peptide content are different numbers. Read both.",
          "Every specification should show a result and a pass or fail.",
        ],
      },
      {
        type: "p",
        text: "A certificate of analysis (COA) is a lab's written record of what it found when it tested a sample. For research peptides it's the closest thing you have to looking inside the vial. Below we use a real certificate, for BPC-157 lot 11-399-AA, tested by Peptide Test Canada, an independent Canadian lab.",
      },
      { type: "h2", text: "1. The header: who tested it, and can you check?" },
      {
        type: "figure",
        ...COA_HEADER,
        alt: "Header of a Peptide Test Canada certificate of analysis showing the lab logo, report date, a scan-to-verify QR code and the end customer, Lyfe Canada",
        caption: "The header names the lab, the report date and the customer, and carries a QR code to verify the report.",
        frame: "doc",
      },
      {
        type: "p",
        text: "Start at the top. A trustworthy COA names an **independent laboratory**, not just the seller, and gives you a way to confirm the report is genuine. This one has a **scan-to-verify QR code** and a verification page, plus an order number tying it to a specific submission.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Quick check",
        text: "If a supplier's COA has no lab name, no date and no way to verify it, treat it as marketing, not evidence.",
      },
      { type: "h2", text: "2. Sample information: is it your vial?" },
      {
        type: "figure",
        src: "/blog/coa-sample.jpg",
        w: 1710,
        h: 360,
        alt: "Sample information section listing sample ID, compound BPC-157, report number, lot number 11-399-AA, total mass 68.2 mg, appearance lyophilized powder, and molecular formula",
        caption: "Sample information ties the report to one physical lot.",
        frame: "doc",
      },
      {
        type: "p",
        text: "This block tells you exactly what was tested: the compound, the **lot number**, the received and analysed dates, the appearance and the chemical identity (CAS number, formula and molecular weight). The lot number is the link between the paper and the vial in your hand, so it's worth matching.",
      },
      { type: "h2", text: "3. Analytical results: the part that matters most" },
      {
        type: "figure",
        src: "/blog/coa-results.jpg",
        w: 1120,
        h: 704,
        alt: "Analytical results table: compound test BPC-157 matches, net peptide content 11.01 mg against a 10.00 mg specification, label accuracy 110.1 percent, chromatographic purity 99.5 percent, status PASS",
        caption: "Each test lists a specification, the measured result, and a status.",
        frame: "doc",
      },
      {
        type: "p",
        text: "Read this table one row at a time. Each row has a **specification** (what the result must meet), the **result** the lab measured, and a **status**.",
      },
      {
        type: "table",
        head: ["Test", "Specification", "Result", "What it tells you"],
        rows: [
          ["Compound test", "BPC-157", "BPC-157", "Identity: the vial holds the peptide on the label."],
          ["Net peptide content", "10.00 mg", "11.01 mg", "How much actual peptide is in the vial."],
          ["Label accuracy", "≥ 90%", "110.1%", "Content as a share of the label claim."],
          ["Chromatographic purity", "≥ 98%", "99.5%", "How much of the peptide material is the target peptide."],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Purity is not the same as content",
        text: "Purity tells you how clean the peptide is (99.5% is the target peptide, 0.5% is related impurities). Net peptide content tells you how much peptide is in the vial. A vial can be very pure and still be under-filled, which is why a good COA reports both.",
      },
      { type: "h2", text: "4. The chromatogram: what the instrument actually saw" },
      {
        type: "figure",
        src: "/blog/coa-chromatogram.jpg",
        w: 1710,
        h: 500,
        alt: "LC-MS/MS detail showing a single sharp BPC-157 peak at retention time 7.062 minutes, with quantifier and qualifier ion transitions",
        caption: "One clean, sharp peak at 7.06 minutes, confirmed by two ion transitions.",
        frame: "doc",
      },
      {
        type: "p",
        text: "The chart plots the instrument's response over time. A single, sharp peak at the expected retention time, with a flat baseline either side, is what you want to see. The table beside it lists the **mass transitions** used to confirm identity: one to measure (quantifier) and one to double-check (qualifier).",
      },
      { type: "h2", text: "Your five-point COA checklist" },
      {
        type: "checklist",
        items: [
          { title: "Independent lab", text: "Named, with a way to verify the report." },
          { title: "Matching lot", text: "The lot number and compound match your vial." },
          { title: "Identity confirmed", text: "By mass spectrometry, not just HPLC." },
          { title: "Purity and content", text: "Both reported, both against a specification." },
          { title: "A clear status", text: "Every test shows pass or fail." },
        ],
      },
      {
        type: "cta",
        title: "Read our certificates",
        text: "Ten full reports from Peptide Test Canada are published on our Documentation page.",
        href: "/documentation#certificates",
        label: "View certificates",
      },
    ],
  },
  {
    slug: "hplc-vs-mass-spectrometry",
    title: "HPLC vs. mass spectrometry: how peptide purity is really verified",
    excerpt:
      "Two instruments, two different questions: how clean is it, and what is it? Here's how LC-MS/MS answers both, explained without the jargon.",
    category: "Quality & testing",
    date: "2026-10-14",
    minutes: 5,
    cover: { src: "/blog/coa-results.jpg", w: 1120, h: 704, fit: "doc" },
    blocks: [
      {
        type: "takeaways",
        items: [
          "HPLC separates a sample so you can measure how much is the target peptide.",
          "Mass spectrometry weighs molecules to confirm what the peptide is.",
          "Together (LC-MS/MS) they answer purity, identity and content in one run.",
        ],
      },
      {
        type: "p",
        text: "When a supplier says \"99% pure\", the next question should be: measured how? Two techniques do most of the work in peptide testing, and they answer different questions.",
      },
      { type: "h2", text: "HPLC: how clean is it?" },
      {
        type: "p",
        text: "High-performance liquid chromatography pushes the dissolved sample through a column packed with tiny particles. Different molecules travel through at different speeds, so they come out at different times. A detector records each one as a **peak**.",
      },
      {
        type: "p",
        text: "The target peptide shows up as one tall peak. Impurities, such as shortened or damaged peptide chains, show up as smaller peaks nearby. **Purity is the target peak's share of the total peak area.**",
      },
      {
        type: "callout",
        tone: "info",
        title: "What HPLC can't tell you",
        text: "A peak only tells you something came out at a certain time. On its own, HPLC can't prove that the big peak is the right molecule. That's the mass spectrometer's job.",
      },
      { type: "h2", text: "Mass spectrometry: what is it?" },
      {
        type: "p",
        text: "A mass spectrometer turns molecules into charged ions and measures their **mass-to-charge ratio** with great precision. Every peptide has a known mass, so a match confirms identity. Tandem mass spectrometry (MS/MS) goes further: it breaks the ion into fragments and checks those too, like confirming a fingerprint rather than a silhouette.",
      },
      {
        type: "figure",
        src: "/blog/coa-chromatogram.jpg",
        w: 1710,
        h: 500,
        alt: "Real LC-MS/MS trace for BPC-157 with a single sharp peak at 7.062 minutes and two confirmed ion transitions",
        caption: "A real LC-MS/MS trace for BPC-157: one peak at 7.06 min, with a precursor of 710.40 Da and two confirming transitions.",
        frame: "doc",
      },
      { type: "h2", text: "Side by side" },
      {
        type: "table",
        head: ["", "HPLC", "Mass spectrometry"],
        rows: [
          ["Question it answers", "How pure is it?", "What is it?"],
          ["What it measures", "Peak area over time", "Mass of ions and fragments"],
          ["Catches", "Impurities and degradation", "Wrong or mislabelled compounds"],
          ["Misses on its own", "Identity", "Exact purity percentage"],
        ],
      },
      { type: "h2", text: "Why LC-MS/MS is the gold standard" },
      {
        type: "p",
        text: "Liquid chromatography tandem mass spectrometry runs both in sequence: the chromatograph separates the sample, then the mass spectrometer identifies what comes out. One run gives you identity, purity and content, which is why our batches are tested this way.",
      },
      {
        type: "stats",
        items: [
          { n: "99.5%", label: "Chromatographic purity, BPC-157 lot 11-399-AA" },
          { n: "110.1%", label: "Label accuracy on the same lot" },
          { n: "7.06 min", label: "Retention time of the single main peak" },
        ],
      },
      {
        type: "cta",
        title: "See the full report",
        text: "Open the real certificate this trace comes from.",
        href: "/documentation#certificates",
        label: "View certificates",
      },
    ],
  },
  {
    slug: "the-28-day-rule-peptide-storage",
    title: "The 28-day rule: storing peptides so they stay potent",
    excerpt:
      "Freeze-dried peptides keep for months; reconstituted ones don't. Here's why the clock starts at mixing, and how to buy and store so nothing goes to waste.",
    category: "Storage & handling",
    date: "2026-10-08",
    minutes: 5,
    cover: { src: "/cutouts/bpc-157-10mg.png", w: 320, h: 722, fit: "product" },
    blocks: [
      {
        type: "stats",
        items: [
          { n: "12–24", label: "Months stable as dry, refrigerated powder" },
          { n: "~28", label: "Days of peak potency once reconstituted" },
          { n: "0", label: "Reasons to stockpile mixed vials" },
        ],
      },
      {
        type: "p",
        text: "Research peptides ship as a dry, freeze-dried powder for a good reason: in that form they're remarkably stable. The moment you add bacteriostatic water, that changes. Understanding the difference is the easiest way to protect your results and your budget.",
      },
      { type: "h2", text: "Why the clock starts at reconstitution" },
      {
        type: "p",
        text: "In solution, peptide chains are exposed to water, temperature changes, light and, every time the stopper is punctured, a little air. All of these slowly break the peptide down. After about **28 days**, the loss in potency becomes noticeable.",
      },
      {
        type: "list",
        items: [
          "**Temperature swings** speed up breakdown, even inside a fridge door.",
          "**Light** degrades sensitive peptides over time.",
          "**Repeated punctures** let in air and contaminants.",
        ],
      },
      { type: "h2", text: "How to store each form" },
      {
        type: "table",
        head: ["Form", "Where", "How long"],
        rows: [
          ["Freeze-dried (unopened)", "Refrigerated, away from light", "12–24 months"],
          ["Reconstituted vial", "Refrigerated, upright, away from light", "About 28 days"],
          ["Dual chamber pen (not activated)", "Refrigerated", "Up to 24 months"],
          ["Dual chamber pen (activated)", "Refrigerated", "About 28 days"],
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Only mix what you'll use this month",
        text: "Keep spare vials dry and reconstitute one at a time. A 90-day supply sounds economical until a third of it degrades before it's used.",
      },
      { type: "h2", text: "Buy for 28 days, then reorder fresh" },
      {
        type: "p",
        text: "Plan how much your research needs over four weeks and buy that amount. Fresh vials deliver what the label says; vials that have sat reconstituted for six weeks don't. It's the same reason we size our vials for real research protocols.",
      },
      {
        type: "figure",
        src: "/pen/dual-chamber-cartridge.jpg",
        w: 848,
        h: 1264,
        alt: "Dual chamber cartridge with freeze-dried peptide in the top chamber and sterile diluent in the bottom chamber",
        caption: "In a dual chamber cartridge the powder stays dry until you twist to mix, so the 28-day clock hasn't started yet.",
        frame: "soft",
      },
      {
        type: "cta",
        title: "No more 28-day limits",
        text: "Our dual chamber pen keeps powder and diluent apart until you activate it.",
        href: "/dual-chamber-pen-vs-prefilled",
        label: "How the pen works",
      },
    ],
  },
  {
    slug: "choosing-a-research-peptide-supplier-canada",
    title: "Choosing a research peptide supplier in Canada: a 7-point checklist",
    excerpt:
      "\"Research-grade\" is easy to print on a label. Here's what to actually look for before you order, from third-party testing to excipients and shipping.",
    category: "Buying guide",
    date: "2026-09-30",
    minutes: 6,
    cover: { src: "/cutouts/lyfe-ghk-cu-100mg.png", w: 345, h: 657, fit: "product" },
    blocks: [
      {
        type: "p",
        text: "Anyone can call a product \"research-grade\". The difference between suppliers shows up in the paperwork, the materials and the logistics. Use this checklist before you place an order, with us or anyone else.",
      },
      {
        type: "checklist",
        items: [
          { title: "Independent third-party testing", text: "Testing by a named outside lab, not just in-house claims." },
          { title: "Published, verifiable COAs", text: "Real reports you can read before buying, ideally with a verification code." },
          { title: "Identity confirmed by mass spectrometry", text: "HPLC alone can't prove a peptide is what the label says." },
          { title: "Quality excipients", text: "USP-grade, low-endotoxin, low-metal materials, from GMP-sourced raw materials." },
          { title: "Domestic stock and fast dispatch", text: "Shipping inside Canada means no customs delays sitting in a warm depot." },
          { title: "Sensible pack sizes", text: "Vials sized for real protocols, so you don't overbuy and watch it degrade." },
          { title: "Clear research-use labelling", text: "Honest labelling and disclaimers are a sign of a supplier that takes compliance seriously." },
        ],
      },
      { type: "h2", text: "Why domestic shipping matters more than you'd think" },
      {
        type: "p",
        text: "Peptides are more stable as dry powder, but long transit and customs holds still add risk. A Canadian supplier shipping inside Canada removes the border from the equation, and same-day dispatch shortens the time in transit.",
      },
      {
        type: "callout",
        tone: "note",
        title: "A red flag to watch for",
        text: "Prices far below everyone else's, with no lab reports to back them, usually mean something has been skipped: testing, materials, or both.",
      },
      { type: "h2", text: "How Lyfe measures up" },
      {
        type: "table",
        head: ["Checklist item", "At Lyfe"],
        rows: [
          ["Third-party testing", "Peptide Test Canada, LC-MS/MS"],
          ["Published COAs", "10 certificates on our Documentation page"],
          ["Excipients", "USP-grade, low endotoxin, low metal"],
          ["Raw materials", "Sourced from GMP manufacturing facilities"],
          ["Shipping", "From Canada, same day before 1 PM EST"],
          ["Pack sizes", "Sized for 28-day research cycles"],
        ],
      },
      {
        type: "cta",
        title: "Browse the catalogue",
        text: "Every product ships with its certificate of analysis.",
        href: "/shop",
        label: "Shop research peptides",
      },
    ],
  },
  {
    slug: "why-peptides-ship-as-powder",
    title: "Why peptides ship as powder: lyophilization explained",
    excerpt:
      "Freeze-drying is the reason a peptide can sit on a shelf for months. A short, visual guide to what lyophilization does and why it matters.",
    category: "Product knowledge",
    date: "2026-09-22",
    minutes: 4,
    cover: { src: "/pen/dual-chamber-cartridge.jpg", w: 848, h: 1264, fit: "doc" },
    blocks: [
      {
        type: "p",
        text: "Open a new vial and you'll find a small white cake or powder rather than a liquid. That's deliberate. The peptide has been **lyophilized**, or freeze-dried, the most reliable way to keep it stable between the lab and your bench.",
      },
      { type: "h2", text: "What lyophilization does" },
      {
        type: "list",
        ordered: true,
        items: [
          "**Freeze**: the peptide solution is frozen solid.",
          "**Vacuum**: pressure is lowered so ice turns straight into vapour, skipping the liquid stage.",
          "**Dry**: remaining moisture is gently removed, leaving a dry, porous cake.",
        ],
      },
      {
        type: "p",
        text: "Without water, the chemical reactions that break peptides down slow to a crawl. That's why a sealed, freeze-dried vial can stay stable for **12–24 months** refrigerated, while the same peptide in solution lasts weeks.",
      },
      {
        type: "figure",
        src: "/pen/dual-chamber-cartridge.jpg",
        w: 848,
        h: 1264,
        alt: "Dual chamber cartridge: freeze-dried peptide cake in the upper chamber, sterile diluent in the lower chamber",
        caption: "The white cake in the upper chamber is the lyophilized peptide. The diluent waits below.",
        frame: "soft",
      },
      {
        type: "callout",
        tone: "info",
        title: "A good-looking cake is a good sign",
        text: "An intact, uniform white cake suggests the freeze-drying went well. A collapsed or discoloured one can point to moisture or heat exposure.",
      },
      { type: "h2", text: "Taking it one step further" },
      {
        type: "p",
        text: "Dual chamber cartridges keep the lyophilized powder and the diluent sealed in separate chambers, so nothing mixes until activation. You get the shelf life of powder with the convenience of a pen.",
      },
      {
        type: "cta",
        title: "Dual chamber vs. prefilled",
        text: "See how the two pen designs compare, feature by feature.",
        href: "/dual-chamber-pen-vs-prefilled",
        label: "Read the comparison",
      },
    ],
  },
  {
    slug: "dual-chamber-pen-vs-prefilled",
    href: "/dual-chamber-pen-vs-prefilled",
    title: "Dual chamber cartridge pen vs. prefilled: why dual chamber wins",
    excerpt:
      "Stability until activation, a 12–24 month shelf life and full visibility while mixing. A head-to-head comparison of the two pen designs.",
    category: "Product knowledge",
    date: "2026-05-21",
    minutes: 6,
    cover: { src: "/cutouts/lyfe-pen-v2.png", w: 696, h: 938, fit: "product" },
    blocks: [],
  },
];

export const CATEGORIES = ["All", "Quality & testing", "Storage & handling", "Buying guide", "Product knowledge"] as const;

export const sortedPosts = () => [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug && !p.href);
export const postHref = (p: Post) => p.href ?? `/blog/${p.slug}`;
export const formatDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
