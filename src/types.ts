/**
 * Types modeling e-commerce design specs and portfolio assets.
 */

export interface ExplodedLayer {
  zIndex: number;
  title: string;
  description: string;
  material: string;
  color: string;
  highlightColor: string;
}

export interface RenderDirective {
  phase: string;
  description: string;
  hardwareTerm: string;
}

export interface MetricSet {
  ctrBoost: string;
  conversionIncrease: string;
  impressionBoost: string;
}

export interface DesignBrief {
  conceptName: string;
  tagline: string;
  heroSpecification: string;
  stylingPhilosophy: string;
  metrics: MetricSet;
  explodedViews: ExplodedLayer[];
  renderDirectives: RenderDirective[];
  brandNarrative: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  stats: { label: string; value: string; detail: string }[];
  description: string;
  technicalTerm: string;
  materials: string[];
  tagline: string;
  imageUrl: string;
}

export interface SiteMapNode {
  name: string;
  description: string;
  path: string;
  techKeywords: string[];
}
