# Storyblok Integration Guide

This guide explains how to set up and use Storyblok CMS with your Nuxt.js frontend.

## Prerequisites

1. A Storyblok account (sign up at [storyblok.com](https://www.storyblok.com))
2. A Storyblok space created
3. Your Storyblok access token

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env` file in the `live-timer-frontend` directory:

```env
# Storyblok Configuration
NUXT_PUBLIC_STORYBLOK_ACCESS_TOKEN=your-storyblok-access-token-here
NUXT_PUBLIC_STORYBLOK_VERSION=draft  # Use 'draft' for development, 'published' for production
```

**How to get your access token:**
1. Log in to your Storyblok account
2. Go to Settings > Access Tokens
3. Copy your "Public" or "Preview" token
4. Use "Preview" token for development (draft mode)
5. Use "Public" token for production (published mode)

### 2. Storyblok Space Configuration

In your Storyblok space, you'll use a hierarchical naming convention:

#### Component Naming Convention:

- **`modules/*`** - Page-level content types (e.g., `modules/page`, `modules/use-cases`, `modules/testimonials`)
- **`block/*`** - Nestable components (e.g., `block/hero`, `block/slider`, `block/feature`)
- **`content/*`** - Rich text and core content (e.g., `content/text`)

#### Required Components:

1. **Page Module** (`modules/page`)
   - Fields:
     - `title` (Text)
     - `description` (Textarea)
     - `seo_title` (Text)
     - `seo_description` (Textarea)
     - `seo_keywords` (Text)
     - `body` (Blocks - allows nesting block components)

2. **Hero Block** (`block/hero`)
   - Fields:
     - `title` (Text)
     - `subtitle` (Text, optional)
     - `description` (Textarea, optional)
     - `image` (Asset, optional)
     - `cta_text` (Text, optional)
     - `cta_link` (Link, optional)
     - `background_color` (Text, optional)

3. **Feature Block** (`block/feature`)
   - Fields:
     - `title` (Text)
     - `description` (Textarea, optional)
     - `features` (Blocks - nested feature items)
       - Feature item fields:
         - `title` (Text)
         - `description` (Textarea)
         - `icon` (Asset, optional)

4. **Text Content** (`content/text`)
   - Fields:
     - `title` (Text, optional)
     - `content` (Rich Text)
     - `alignment` (Single-Option - left, center, right)

5. **Slider Block** (`block/slider`) - Optional
   - Fields:
     - `slides` (Blocks - nested slide items)
       - Slide item fields:
         - `title` (Text, optional)
         - `image` (Asset)
         - `content` (Rich Text, optional)
     - `autoplay` (Boolean, optional)
     - `interval` (Number, optional)

6. **Use Cases Module** (`modules/use-cases`) - For SEO pages like /use-cases
   - Fields:
     - `title` (Text)
     - `description` (Textarea, optional)
     - `use_cases` (Blocks - nested use case items)
       - Use case item fields:
         - `title` (Text)
         - `description` (Textarea)
         - `image` (Asset, optional)
         - `slug` (Text, optional)
     - `seo_title` (Text, optional)
     - `seo_description` (Textarea, optional)

7. **Testimonials Module** (`modules/testimonials`) - Optional
   - Fields:
     - `title` (Text, optional)
     - `testimonials` (Blocks - nested testimonial items)
       - Testimonial item fields:
         - `name` (Text)
         - `role` (Text, optional)
         - `company` (Text, optional)
         - `quote` (Textarea)
         - `image` (Asset, optional)
         - `rating` (Number, optional, 1-5)

### 3. Creating Your First Story

#### Homepage Story

1. In Storyblok, create a new story with slug: `home`
2. Select the `modules/page` component type
3. Fill in the SEO fields
4. Add block components to the `body` field (`block/hero`, `block/feature`, `content/text`, etc.)
5. Publish the story

#### Creating SEO Pages (e.g., /use-cases)

1. Create a new story in Storyblok
2. Set the slug to `use-cases` (this will create the route `/use-cases`)
3. Use the `modules/page` component type
4. Fill in SEO fields
5. Add block components to the `body` field
6. Publish the story

The catch-all route `[...slug].vue` will automatically handle these routes.

**Note**: You can also use specific module types like `modules/use-cases` for specialized page layouts.

## Usage

### Fetching Content in Components

```vue
<script setup lang="ts">
import type { StoryblokStory } from '~/types/storyblok'

const { getHomepage } = useStoryblok()

const { data: story } = await useAsyncData('homepage', async () => {
  return await getHomepage()
})
</script>
```

### Fetching a Specific Story

```vue
<script setup lang="ts">
const { getStory } = useStoryblok()

const { data: story } = await useAsyncData('my-story', async () => {
  return await getStory('use-cases')
})
</script>
```

### Fetching Multiple Stories

```vue
<script setup lang="ts">
const { getStories } = useStoryblokContent()

// Fetch stories by module type (e.g., modules/use-cases)
const { data: stories } = await useAsyncData('use-cases', async () => {
  return await getStories('modules/use-cases', {
    perPage: 10,
    sortBy: 'created_at:desc'
  })
})
</script>
```

**Note**: When fetching by content type, use the full component name including the prefix (e.g., `modules/page`, `modules/use-cases`, `modules/testimonials`).

### Using Storyblok Components

The `StoryblokComponent` component automatically renders Storyblok content:

```vue
<template>
  <StoryblokComponent :blok="story.content" />
</template>
```

## Component Mapping

Storyblok components are automatically mapped to Vue components using the new naming convention:

### Block Components (Nestable)
- `block/hero` → `StoryblokHero`
- `block/feature` → `StoryblokFeature`
- `block/slider` → `StoryblokSlider` (to be created)

### Content Components (Rich Text)
- `content/text` → `StoryblokText`

### Module Components (Page-level)
- `modules/page` → `StoryblokPage`
- `modules/use-cases` → `StoryblokUseCases` (to be created)
- `modules/testimonials` → `StoryblokTestimonials` (to be created)

### Legacy Support
The system also supports the old naming format for backward compatibility:
- `hero` → `StoryblokHero`
- `feature` → `StoryblokFeature`
- `text` → `StoryblokText`
- `page` → `StoryblokPage`

**Any unmapped component** → `StoryblokFallback` (shows a warning)

## Adding New Components

To add support for a new Storyblok component following the naming convention:

### For Block Components (Nestable)

1. Create a new Vue component in `components/Storyblok[ComponentName].vue`
2. Add it to the component map in `components/StoryblokComponent.vue` with the `block/` prefix
3. Define the TypeScript interface in `types/storyblok.d.ts`

Example:

```vue
<!-- components/StoryblokSlider.vue -->
<template>
  <section class="slider">
    <div v-for="slide in blok.slides" :key="slide._uid">
      <h2>{{ slide.title }}</h2>
      <img :src="getImageUrl(slide.image)" :alt="slide.title" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SliderBlock } from '~/types/storyblok'

interface Props {
  blok: SliderBlock
}

const props = defineProps<Props>()
const { getImageUrl } = useStoryblokContent()
</script>
```

Then add to `StoryblokComponent.vue`:
```typescript
import StoryblokSlider from './StoryblokSlider.vue'

const componentMap: Record<string, any> = {
  // ... existing mappings
  'block/slider': StoryblokSlider,
}
```

And add the type to `types/storyblok.d.ts`:
```typescript
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
```

### For Module Components (Page-level)

Follow the same pattern but use the `modules/` prefix:
- Component: `modules/testimonials`
- Vue component: `StoryblokTestimonials.vue`
- Type: `TestimonialsModule`

### For Content Components (Rich Text)

Follow the same pattern but use the `content/` prefix:
- Component: `content/quote`
- Vue component: `StoryblokQuote.vue`
- Type: `QuoteContent`

## SEO Optimization

SEO metadata is automatically handled:

- Homepage (`index.vue`) uses Storyblok SEO fields with fallback
- Dynamic pages (`[...slug].vue`) use Storyblok SEO fields
- All pages support `seo_title`, `seo_description`, and `seo_keywords`

## Development vs Production

### Development Mode
- Use `NUXT_PUBLIC_STORYBLOK_VERSION=draft`
- Shows draft content (requires Preview token)
- Allows content editors to see changes immediately

### Production Mode
- Use `NUXT_PUBLIC_STORYBLOK_VERSION=published`
- Shows only published content (requires Public token)
- Better performance and caching

## Troubleshooting

### Content Not Showing

1. Check that your access token is correct
2. Verify the story slug matches what you're fetching
3. Ensure the story is published (if using `published` version)
4. Check browser console for errors

### Components Not Rendering

1. Verify the component name in Storyblok matches the mapping
2. Check that the component file exists in `components/`
3. Look for errors in the browser console
4. Check that `StoryblokFallback` is showing (means component isn't mapped)

### 404 Errors on Dynamic Routes

1. Ensure the story slug in Storyblok matches the URL path
2. Check that the story is published
3. Verify the catch-all route `[...slug].vue` exists

## Best Practices

1. **Content Structure**: Organize content logically in Storyblok folders
2. **Component Reusability**: Create reusable components for common patterns
3. **SEO**: Always fill in SEO fields for better search engine optimization
4. **Performance**: Use `published` version in production for better caching
5. **Type Safety**: Always define TypeScript interfaces for new components

## Resources

- [Storyblok Documentation](https://www.storyblok.com/docs)
- [Storyblok Nuxt Module](https://github.com/storyblok/storyblok-nuxt)
- [Storyblok Vue SDK](https://github.com/storyblok/storyblok-vue)

