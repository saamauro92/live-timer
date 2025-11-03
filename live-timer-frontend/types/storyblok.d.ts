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
  component: 'block/hero' | 'hero'; // Support both formats
  title: string;
  subtitle?: string;
  description?: string;
  image?: StoryblokImage;
  cta_text?: string;
  cta_link?: StoryblokLink;
  background_color?: string;
}

export interface FeatureBlock extends StoryblokComponent {
  component: 'block/feature' | 'feature'; // Support both formats
  title: string;
  description?: string;
  features?: Array<{
    title: string;
    description: string;
    icon?: StoryblokImage;
  }>;
}

export interface SliderBlock extends StoryblokComponent {
  component: 'block/slider';
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
  component: 'content/text' | 'text'; // Support both formats
  title?: string;
  content?: StoryblokRichText;
  alignment?: 'left' | 'center' | 'right';
}

// Module Components (Page-level - e.g., modules/page, modules/use-cases)
export interface PageModule extends StoryblokComponent {
  component: 'modules/page' | 'page'; // Support both formats
  title: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  body?: StoryblokComponent[];
}

export interface UseCasesModule extends StoryblokComponent {
  component: 'modules/use-cases';
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
  component: 'modules/testimonials';
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
  | PageModule
  | UseCasesModule
  | TestimonialsModule
  // Legacy types
  | HeroSection
  | FeatureSection
  | TextSection
  | Page
  | UseCasePage
  | StoryblokComponent;

