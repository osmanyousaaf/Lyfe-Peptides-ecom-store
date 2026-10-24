// Dual chamber pen content, from the live site's pen pages, shared by the landing page and the
// full comparison article.

export const COMPARISON: { feature: string; prefilled: string; dual: string }[] = [
  { feature: "Peptide stability", prefilled: "Degrades from day of manufacture", dual: "Stable until activation" },
  { feature: "Shelf life", prefilled: "2–4 weeks (reconstituted)", dual: "12–24 months (lyophilized)" },
  { feature: "Cold chain sensitivity", prefilled: "High, must remain refrigerated", dual: "Lower, tolerates brief excursions" },
  { feature: "Visual inspection", prefilled: "Not possible", dual: "Full visibility during mixing" },
  { feature: "Potency at use", prefilled: "Unknown, depends on age and handling", dual: "Maximum, freshly reconstituted" },
  { feature: "Convenience", prefilled: "No mixing required", dual: "30-second mix step" },
  { feature: "Dosing precision", prefilled: "Fixed or limited", dual: "Click-dial precision" },
  { feature: "Waste reduction", prefilled: "Higher, expired stock common", dual: "Lower, long shelf life" },
];

export const STEPS: { img: string; w: number; h: number; title: string; text: string }[] = [
  { img: "/pen/step1.png", w: 672, h: 405, title: "Attach the needle", text: "Screw the needle onto the pen. Do not overtighten." },
  {
    img: "/pen/step2.png",
    w: 396,
    h: 405,
    title: "Mix the chambers",
    text: "Firmly twist the cartridge until B clicks into the notch. Gently tilt the pen from side to side. Do not shake.",
  },
  {
    img: "/pen/step3.png",
    w: 384,
    h: 405,
    title: "Clear the air",
    text: "Remove the outer needle cover and hold the pen upright. Tap the cartridge gently to move air bubbles to the top, then twist until C clicks into the notch.",
  },
  {
    img: "/pen/step4.png",
    w: 327,
    h: 405,
    title: "Prime the pen",
    text: "Remove the second needle cover, turn the dial to 3 IU and push the black button until liquid appears. Repeat if necessary.",
  },
];

export const ADVANTAGES: { title: string; text: string }[] = [
  {
    title: "Maximum potency at point of use",
    text: "The peptide stays lyophilized until activation, so there is no degradation from sitting in solution. It is as potent as the day it was manufactured.",
  },
  {
    title: "Extended shelf life",
    text: "Lyophilized peptides stored properly can remain stable for 12–24 months or more, compared with just weeks for reconstituted solutions.",
  },
  {
    title: "Reduced cold chain risk",
    text: "Refrigeration is still recommended, but dry powder is far more tolerant of brief temperature excursions than a liquid solution.",
  },
  {
    title: "On-demand reconstitution",
    text: "You control exactly when mixing happens. Mix it when you're ready to use it, not when a factory decided to.",
  },
  {
    title: "Visual confirmation",
    text: "Watch the powder dissolve. A clear, particle-free solution confirms proper reconstitution, and any issue is immediately visible.",
  },
  {
    title: "Precise measurement",
    text: "Click-dial mechanisms allow precise, repeatable measurement in increments as small as 0.01 mL.",
  },
];
