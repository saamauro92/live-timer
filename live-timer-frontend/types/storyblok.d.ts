// Storyblok Types
export interface StoryblokAsset {
  id?: number;
  alt?: string;
  name?: string;
  focus?: string;
  title?: string;
  filename?: string;
  copyright?: string;
  fieldtype?: string;
}

export interface StoryblokImage extends StoryblokAsset {
  filename: string;
  alt?: string;
}

export interface StoryblokLink {
  id?: string;
  url?: string;
  linktype?: string;
  fieldtype?: string;
  cached_url?: string;
  anchor?: string;
  target?: string;
}

export interface StoryblokRichText {
  type: string;
  content?: StoryblokRichText[];
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
  attrs?: Record<string, unknown>;
}

export interface StoryblokComponent {
  _uid: string;
  _editable?: string;
  component: string;
  [key: string]: unknown;
}

export interface StoryblokStory {
  name: string;
  created_at?: string;
  published_at?: string;
  id: number;
  uuid: string;
  slug: string;
  full_slug: string;
  content: StoryblokComponent;
  tag_list?: string[];
  is_startpage?: boolean;
  parent_id?: number | null;
  group_id?: string;
  alternates?: Array<{
    id: number;
    name: string;
    published: boolean;
    full_slug: string;
  }>;
  sort_by_date?: string | null;
  position?: number;
  meta_data?: Record<string, unknown>;
  translated_slugs?: Array<{
    path: string;
    name: string;
    lang: string;
  }>;
}

export interface StoryblokSpace {
  id: number;
  name: string;
  domain?: string;
  version?: number;
  language_codes?: string[];
}

// Block Components (Nestable - e.g., block/hero, block/slider)
export interface HeroBlock extends StoryblokComponent {
  component: "block/hero" | "hero"; // Support both formats
  title: string;
  subtitle?: string;
  description?: string;
  image?: StoryblokImage;
  // New format: links array with Link components
  links?: StoryblokComponent[];
  // Legacy format (for backward compatibility)
  cta_text?: string;
  cta_link?: StoryblokLink;
  cta_secondary_text?: string;
  cta_secondary_link?: StoryblokLink;
  cta?: StoryblokComponent | StoryblokComponent[];
  cta_secondary?: StoryblokComponent | StoryblokComponent[];
  background_color?: string;
  custom_background_color?: string;
  alignment?: "left" | "center" | "right";
}

export interface FeatureBlock extends StoryblokComponent {
  component: "block/feature" | "feature"; // Support both formats
  title: string;
  description?: string;
  feature?: Array<{
    _uid?: string;
    component?: string;
    title: string;
    description: string | StoryblokRichText;
    icon?: StoryblokImage;
    icon_color?: string;
    type?: string;
  }>;
  features?: Array<{
    _uid?: string;
    component?: string;
    title: string;
    description: string | StoryblokRichText;
    icon?: StoryblokImage;
    icon_color?: string;
    type?: string;
  }>;
  layout?: "grid-3" | "grid-2" | "list";
  background_color?: "white" | "gray" | "dark";
}

export interface SliderBlock extends StoryblokComponent {
  component: "block/slider";
  slides?: Array<{
    title?: string;
    image?: StoryblokImage;
    content?: StoryblokRichText;
  }>;
  autoplay?: boolean;
  interval?: number;
}

// Content Components (Rich text, core - e.g., content/text)
export interface TextContent extends StoryblokComponent {
  component: "content/text" | "text"; // Support both formats
  title?: string;
  content?: StoryblokRichText;
  alignment?: "left" | "center" | "right";
}

// Core Components (Reusable - e.g., core/link)
export interface LinkContent extends StoryblokComponent {
  component: "core/link" | "link";
  label: string;
  link?: StoryblokLink | string;
  variant?: "primary" | "secondary" | "text";
  size?: "sm" | "md" | "lg";
  target?: string;
}

// Module Components (Page-level - e.g., modules/page, modules/use-cases)
export interface PageModule extends StoryblokComponent {
  component: "modules/page" | "page"; // Support both formats
  title: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image?: StoryblokImage;
  body?: StoryblokComponent[];
}

export interface UseCasesModule extends StoryblokComponent {
  component: "modules/use-cases";
  title: string;
  description?: string;
  use_cases?: Array<{
    title: string;
    description: string;
    image?: StoryblokImage;
    slug?: string;
  }>;
  seo_title?: string;
  seo_description?: string;
}

export interface TestimonialsModule extends StoryblokComponent {
  component: "modules/testimonials";
  title?: string;
  testimonials?: Array<{
    name: string;
    role?: string;
    company?: string;
    quote: string;
    image?: StoryblokImage;
    rating?: number;
  }>;
}

// New Block Components for Homepage
export interface StepBlock extends StoryblokComponent {
  component: "block/step";
  title: string;
  description?: string;
  steps?: Array<{
    _uid?: string;
    component?: string;
    title: string;
    description: string | StoryblokRichText;
    icon?: StoryblokImage;
    type?: string;
  }>;
  layout?: "horizontal" | "vertical";
  show_numbers?: boolean;
}

// Legacy support
export interface StepsBlock extends StepBlock {
  component: "block/steps" | "block/step";
}

export interface UseCasesBlock extends StoryblokComponent {
  component: "block/use-cases";
  title: string;
  description?: string;
  use_cases?: Array<{
    title: string;
    description: string;
    icon?: StoryblokImage;
    image?: StoryblokImage;
    link?: StoryblokLink;
  }>;
  layout?: "grid-3" | "grid-2" | "grid-4";
}

export interface TestimonialsBlock extends StoryblokComponent {
  component: "block/testimonials";
  title: string;
  description?: string;
  testimonials?: Array<{
    _uid?: string;
    component?: string;
    quote: string;
    name: string;
    role?: string;
    company?: string;
    image?: StoryblokImage;
    rating?: number | string;
    featured?: boolean;
    type?: string;
  }>;
  layout?: "carousel" | "grid-3" | "grid-2";
  show_ratings?: boolean;
  autoplay?: boolean;
  autoplay_interval?: number;
}

export interface StatsBlock extends StoryblokComponent {
  component: "block/stats";
  title?: string;
  description?: string;
  stats?: Array<{
    _uid?: string;
    component?: string;
    stat: string;
    value?: string;
    label?: string;
    description?: string;
    icon?: StoryblokImage;
    highlight?: boolean;
    type?: string;
  }>;
  layout?: "grid-4" | "grid-3" | "grid-2";
  background_color?: "white" | "gray" | "dark" | "gradient";
}

export interface FaqBlock extends StoryblokComponent {
  component: "block/faq";
  title: string;
  description?: string;
  faqs?: Array<{
    _uid?: string;
    component?: string;
    question: string;
    answer: string | StoryblokRichText;
    category?: string;
    featured?: boolean;
    type?: string;
  }>;
  layout?: "accordion" | "list";
  allow_multiple_open?: boolean;
}

export interface CtaBlock extends StoryblokComponent {
  component: "block/cta";
  title?: string;
  description?: string;
  // New format: links array with Link components
  links?: StoryblokComponent[];
  // Legacy format (for backward compatibility)
  cta_text?: string;
  cta_link?: StoryblokLink;
  cta_secondary_text?: string;
  cta_secondary_link?: StoryblokLink;
  cta?: StoryblokComponent | StoryblokComponent[];
  cta_secondary?: StoryblokComponent | StoryblokComponent[];
  background_color?: "white" | "gray";
  alignment?: "left" | "center" | "right";
}

export interface CtaBannerBlock extends StoryblokComponent {
  component: "block/cta-banner";
  title?: string;
  description?: string;
  // New format: links array with Link components
  links?: StoryblokComponent[];
  // Legacy format (for backward compatibility)
  cta_text?: string;
  cta_link?: StoryblokLink;
  cta_secondary_text?: string;
  cta_secondary_link?: StoryblokLink;
  cta?: StoryblokComponent | StoryblokComponent[];
  cta_secondary?: StoryblokComponent | StoryblokComponent[];
  background_color?: "white" | "gray";
}

// Legacy types for backward compatibility
export interface HeroSection extends HeroBlock {}
export interface FeatureSection extends FeatureBlock {}
export interface TextSection extends TextContent {}
export interface Page extends PageModule {}
export interface UseCasePage extends UseCasesModule {}

export type StoryblokComponentType =
  | HeroBlock
  | FeatureBlock
  | SliderBlock
  | TextContent
  | LinkContent
  | PageModule
  | UseCasesModule
  | TestimonialsModule
  | StepBlock
  | StepsBlock
  | UseCasesBlock
  | TestimonialsBlock
  | StatsBlock
  | FaqBlock
  | CtaBlock
  | CtaBannerBlock
  // Legacy types
  | HeroSection
  | FeatureSection
  | TextSection
  | Page
  | UseCasePage
  | StoryblokComponent;

