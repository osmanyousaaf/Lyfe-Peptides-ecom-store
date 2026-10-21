// Research-goal taxonomy (from the store's own tags), ordered deliberately. Safe to import on the client.
export type Goal = {
  tag: string;
  label: string;
  blurb: string;
};

export const GOALS: Goal[] = [
  { tag: "Fat Loss", label: "Fat Loss", blurb: "Metabolic & lipolysis research" },
  { tag: "Muscle & Growth", label: "Muscle & Growth", blurb: "GH axis & secretagogues" },
  { tag: "Recovery", label: "Recovery", blurb: "Tissue & connective repair" },
  { tag: "Anti-Aging & Skin", label: "Anti-Aging & Skin", blurb: "Matrix & dermal research" },
  { tag: "Cognitive", label: "Cognitive", blurb: "Nootropic & neuro models" },
  { tag: "Energy & Endurance", label: "Energy", blurb: "Mitochondrial & output" },
  { tag: "Sexual Health", label: "Sexual Health", blurb: "Signalling research" },
  { tag: "Gut Health", label: "Gut Health", blurb: "GI-lining models" },
];
