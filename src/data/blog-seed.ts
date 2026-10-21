// The launch articles. On first run they are copied into the database, where the admin edits them.
// Each is a quick read: a summary, a few animated key points and a short wrap-up.
import type { Block, Post } from "@/lib/blog";

const RUO: Block = {
  type: "callout",
  tone: "warn",
  title: "For research use only",
  text: "Lyfe Peptides products are sold as laboratory reference materials. They are not for human or animal consumption and are not approved by Health Canada for personal use. Nothing in this article is medical advice.",
};

export const SEED_POSTS: Post[] = [
  {
    slug: "how-to-read-a-peptide-certificate-of-analysis",
    title: "How to Read a Peptide Certificate of Analysis (COA)",
    description:
      "A quick guide to reading a research peptide certificate of analysis: matching the lot number, HPLC purity, mass spec identity and the details that make a COA trustworthy.",
    excerpt: "A COA is the lab report for one batch. Four checks tell you whether it is worth trusting.",
    date: "2026-10-02",
    readMinutes: 2,
    category: "Quality & Testing",
    anim: "coa",
    keywords: ["peptide COA", "certificate of analysis", "how to read a COA", "research peptide purity", "Canada"],
    products: ["bpc-157-10-mg", "ghk-cu-100-mg", "nad-500-mg", "tb-500-bpc-157-10-mg"],
    body: [
      {
        type: "summary",
        text: "A certificate of analysis is the lab report for **one batch**. Check four things: the lot number, the purity, the identity and the test details.",
      },
      {
        type: "point",
        title: "Match the lot number",
        text: "The lot on the certificate must match the lot printed on your vial. A COA for a different batch tells you nothing about the one in your hands.",
        anim: "lot-number",
      },
      {
        type: "point",
        title: "Purity comes from HPLC",
        text: "HPLC separates the sample into peaks. The main peak's share of the total is the purity figure, and Lyfe only lists lots at **99% or higher**.",
        anim: "purity-peak",
      },
      {
        type: "point",
        title: "Identity comes from mass spec",
        text: "Purity says how clean a sample is, not what it is. Mass spectrometry confirms the molecule by matching its measured mass to the expected one.",
        anim: "mass-spec",
      },
      {
        type: "point",
        title: "Read the fine print",
        text: "A trustworthy COA names the method, the test date and a clear pass result. Undated or vague certificates are a red flag.",
        anim: "coa-check",
      },
      {
        type: "p",
        text: "Every Lyfe order ships with the batch-specific certificate. Lost yours? Send us the product and lot number and we will resend it.",
      },
      RUO,
    ],
  },
  {
    slug: "hplc-vs-mass-spectrometry-peptide-purity",
    title: "HPLC vs Mass Spectrometry: How Peptide Purity Is Verified",
    description:
      "HPLC measures how pure a research peptide is; mass spectrometry confirms what it is. A short explainer on how each works and why credible suppliers use both.",
    excerpt: "Purity and identity are two different questions. Here is how each instrument answers one of them.",
    date: "2026-09-10",
    readMinutes: 2,
    category: "Quality & Testing",
    anim: "hplc",
    keywords: ["HPLC peptide purity", "mass spectrometry peptide", "LC-MS", "peptide testing", "research peptides Canada"],
    products: ["semax-10-mg", "ss-31-10-mg", "tb-500-bpc-157-10-mg-2", "cjc-1295-ipamorelin-10-mg"],
    body: [
      {
        type: "summary",
        text: "**HPLC** tells you how pure a sample is. **Mass spectrometry** tells you what it is. A lot needs both to be trusted.",
      },
      {
        type: "point",
        title: "HPLC separates",
        text: "The sample is pushed through a column, and each component leaves at a different time as its own peak. The bigger the main peak's share, the purer the lot.",
        anim: "purity-peak",
      },
      {
        type: "point",
        title: "Mass spec weighs",
        text: "Molecules are ionised and sorted by mass. A strong signal at the expected mass confirms the peptide is the one on the label.",
        anim: "mass-spec",
      },
      {
        type: "point",
        title: "Why one isn't enough",
        text: "A sample can be 99% pure and still be the wrong compound, or the right compound carrying impurities. Run together, the two tests close both gaps.",
        anim: "coa-check",
      },
      {
        type: "point",
        title: "Tested per batch",
        text: "Testing is done for every lot, not once per product, so the results always describe the vial you receive.",
        anim: "lot-number",
      },
      {
        type: "p",
        text: "Both results appear on the certificate of analysis that ships with every Lyfe order.",
      },
      RUO,
    ],
  },
  {
    slug: "how-dual-chamber-pens-work",
    title: "How Dual Chamber Pens Work",
    description:
      "Inside a dual chamber pen: lyophilized peptide and bacteriostatic water stay sealed apart until one twist combines them, and every Lyfe pen is sized for a 28-day research cycle.",
    excerpt: "Two sealed chambers, one twist. How the pen keeps powder and water apart until the moment you need them.",
    date: "2026-08-19",
    readMinutes: 2,
    category: "Dual Chamber Pens",
    anim: "pen",
    keywords: ["dual chamber pen", "peptide pen Canada", "lyophilized peptide pen", "28 day pen", "Lyfe pen"],
    products: ["bpc-157-10-mg", "ghk-cu-50-mg", "glow-70-mg", "pen-needles-6mm-32g"],
    body: [
      {
        type: "summary",
        text: "Powder and diluent sit in **separate sealed chambers** until one twist combines them, so nothing is mixed before it is needed.",
      },
      {
        type: "point",
        title: "Two sealed chambers",
        text: "The front chamber holds the lyophilized peptide. The rear holds bacteriostatic water. A stopper keeps them apart.",
        anim: "powder-cake",
      },
      {
        type: "point",
        title: "One twist to activate",
        text: "Twisting the pen drives the plunger forward, and the water flows around the stopper into the powder chamber.",
        anim: "pen-twist",
      },
      {
        type: "point",
        title: "Swirl, don't shake",
        text: "A gentle roll dissolves the powder. Hard shaking can foam the solution and stress some peptides.",
        anim: "drop-mix",
      },
      {
        type: "point",
        title: "Sized for 28 days",
        text: "Once mixed, a solution has a limited window, so each pen holds a **28-day research cycle**. Less waste, nothing left over.",
        anim: "day-ring",
      },
      {
        type: "p",
        text: "Lyfe is the first manufacturer of dual chamber pens in Canada. Pens are offered on 13 compounds as a package option on each product page.",
      },
      RUO,
    ],
  },
  {
    slug: "storing-lyophilized-peptides",
    title: "Storing Lyophilized Peptides: Cold, Dark and Dry",
    description:
      "How to store research peptides in the lab: freezer vs fridge for lyophilized powder, protecting vials from light and moisture, and handling them after reconstitution.",
    excerpt: "Most peptide degradation is avoidable. Keep the powder cold, dark and dry, and date anything you mix.",
    date: "2026-07-08",
    readMinutes: 2,
    category: "Storage & Handling",
    anim: "storage",
    keywords: ["how to store peptides", "lyophilized peptide storage", "peptide freezer", "reconstituted peptide storage", "peptide stability"],
    products: ["bacteriostatic-water-30-ml", "tb-500-bpc-157-10-mg-2", "mots-c-10-mg", "kpv-10-mg"],
    body: [
      {
        type: "summary",
        text: "Dry powder is stable. Keep it **cold, dark and dry**, and treat anything you reconstitute as short-lived.",
      },
      {
        type: "point",
        title: "Cold",
        text: "For long-term storage, keep sealed vials at **−20 °C**. For a few weeks, 2–8 °C in a fridge is fine.",
        anim: "freezer",
      },
      {
        type: "point",
        title: "Dark",
        text: "Light can break some peptides down. Keep vials in their box or another opaque container.",
        anim: "light-shield",
      },
      {
        type: "point",
        title: "Dry",
        text: "Moisture is the enemy of a lyophilized cake. Let a cold vial reach room temperature before opening it, so condensation can't form inside.",
        anim: "moisture",
      },
      {
        type: "point",
        title: "Date what you mix",
        text: "Once reconstituted, keep the solution at 2–8 °C, label it with the date and use it within its documented window. Don't refreeze it.",
        anim: "calendar",
      },
      {
        type: "p",
        text: "Lyfe ships every order from inside Canada, and same-day dispatch keeps the time in transit short.",
      },
      RUO,
    ],
  },
  {
    slug: "bacteriostatic-water-vs-sterile-water",
    title: "Bacteriostatic Water vs Sterile Water",
    description:
      "The difference between bacteriostatic water and sterile water for reconstituting research peptides: benzyl alcohol, single-use vs multi-access vials, and dating the use window.",
    excerpt: "They look identical in the vial but behave very differently on the bench. The short version.",
    date: "2026-06-12",
    readMinutes: 2,
    category: "Storage & Handling",
    anim: "vial",
    keywords: ["bacteriostatic water", "bacteriostatic water vs sterile water", "peptide reconstitution", "benzyl alcohol", "bac water Canada"],
    products: ["bacteriostatic-water-30-ml", "syringe-1ml-31g-x-6mm-10-pack", "bpc-157-10-mg", "igf-1-lr3-1-mg"],
    body: [
      {
        type: "summary",
        text: "Both are sterile. Bacteriostatic water adds **0.9% benzyl alcohol**, so a vial can be accessed more than once in the lab.",
      },
      {
        type: "point",
        title: "Sterile water: use once",
        text: "It has no preservative. Once a vial is opened, use it once and discard the rest.",
        anim: "single-use",
      },
      {
        type: "point",
        title: "Bacteriostatic: multi-access",
        text: "The benzyl alcohol suppresses bacterial growth, so the vial can be entered several times within its use window, commonly up to 28 days.",
        anim: "preserve",
      },
      {
        type: "point",
        title: "The usual diluent",
        text: "Bacteriostatic water is the standard diluent for multi-use research vials, and it is what fills the Lyfe pen's water chamber. Some compounds call for sterile water, so check the compound's documentation.",
        anim: "drop-mix",
      },
      {
        type: "point",
        title: "Date the vial",
        text: "Write the date on the vial when you first open it, store it as labelled, and discard it at the end of the window even if liquid remains.",
        anim: "calendar",
      },
      {
        type: "p",
        text: "Lyfe stocks 30 ml bacteriostatic water alongside every peptide, so a full research kit ships in one order.",
      },
      RUO,
    ],
  },
];
