export interface CategoryMeta {
  slug: string;
  name: string;
  description: string;
}

export const RESOURCE_CATEGORIES: CategoryMeta[] = [
  { slug: 'academics', name: 'Academics', description: 'Peer-reviewed research papers and theoretical electromagnetics.' },
  { slug: 'general', name: 'General', description: 'Comprehensive fundamentals: subatomic physics, circuit laws, electrostatics, semiconductors, and electromagnetism.' },
  { slug: 'experimental', name: 'Experimental', description: 'Laboratory telemetry, Thévenin-Norton network verification, Superposition theorem, Transformer OC/SC tests, and GaN power datasets.' },
  { slug: 'books', name: 'Books', description: 'Textbooks, micro-controller firmware references, and DSP handbooks.' },
  { slug: 'practice-sets', name: 'Practice Sets', description: 'Problem sets, op-amp design assessments, and Verilog state machines.' },
  { slug: 'history', name: 'History of Electrical Engineering', description: 'Historical milestones, Faraday-Maxwell discoveries, early galvanism, and AC vs DC power grid evolution.' },
  { slug: 'career', name: 'Career & Industry Paths', description: 'Career roadmaps, hardware engineering interview guides, and specialization paths.' },
];
