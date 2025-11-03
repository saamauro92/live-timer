<template>
  <StoryblokRenderer :story="story" :loading="pending" />
</template>

<script setup lang="ts">
import type { StoryblokStory } from '~/types/storyblok'

// Define page meta to control route priority
definePageMeta({
  // This route should only match if no other route matches
  // We'll handle exclusions in the script
})

const route = useRoute()
const { getStoryByFullSlug } = useStoryblokContent()

// List of routes that should NOT be handled by Storyblok (these are handled by existing pages)
const excludedRoutes = [
  'login',
  'register',
  'dashboard',
  'billing',
  'pricing',
  'verify-email',
  'subscription-success',
  'subscription-canceled',
  'auth',
  'room',
  'rooms',
]

// Get the full slug from the route
const slug = computed(() => {
  const slugArray = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
  return slugArray.filter(Boolean).join('/')
})

// Check if this route should be excluded from Storyblok
const isExcludedRoute = computed(() => {
  const path = route.path
  // Check if path starts with any excluded route
  return excludedRoutes.some(excluded => {
    const excludedPath = `/${excluded}`
    return path === excludedPath || path.startsWith(excludedPath + '/')
  })
})

// If this is an excluded route, return 404 immediately (let Nuxt handle it with existing routes)
if (isExcludedRoute.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
  })
}

// Fetch the story from Storyblok
const { data: story, pending, error } = await useAsyncData<StoryblokStory | null>(
  `story-${slug.value || 'empty'}`,
  async () => {
    // Don't fetch if this is an excluded route
    if (isExcludedRoute.value || !slug.value) {
      return null
    }
    
    // Handle homepage separately
    if (slug.value === 'home') {
      return await getStoryByFullSlug('home')
    }
    
    // Try to fetch by full slug
    return await getStoryByFullSlug(slug.value)
  },
  {
    default: () => null,
  }
)

// Set SEO metadata if story exists
if (story.value) {
  const seoTitle = (story.value.content.seo_title as string) || (story.value.content.title as string) || story.value.name || ''
  const seoDescription = (story.value.content.seo_description as string) || (story.value.content.description as string) || ''
  const seoKeywords = (story.value.content.seo_keywords as string) || ''
  
  useHead({
    title: seoTitle,
    meta: [
      {
        name: 'description',
        content: seoDescription,
      },
      ...(seoKeywords ? [{
        name: 'keywords',
        content: seoKeywords,
      }] : []),
    ],
  })
}

// Handle 404 if story not found
if (!story.value && !pending.value && !error.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
  })
}
</script>

