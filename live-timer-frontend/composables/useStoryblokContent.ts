import type { StoryblokStory, StoryblokComponent } from '~/types/storyblok'

export const useStoryblokContent = () => {
  const config = useRuntimeConfig()
  
  // Create Storyblok API client
  const getStoryblokApi = () => {
    // Use the Storyblok CDN API directly
    const accessToken = config.public.storyblokAccessToken as string
    const baseUrl = 'https://api.storyblok.com/v2'
    
    return {
      get: async (endpoint: string, params: Record<string, string> = {}): Promise<{ data: unknown }> => {
        const queryParams: Record<string, string> = {
          token: accessToken || '',
          ...params,
        }
        
        const queryString = new URLSearchParams(queryParams).toString()
        const url = `${baseUrl}/${endpoint}?${queryString}`
        const response = await $fetch<unknown>(url)
        return { data: response }
      },
    }
  }
  
  const storyblokApi = getStoryblokApi()
  
  // Helper to construct query params properly
  const buildQueryParams = (params: Record<string, string | number | undefined>): Record<string, string> => {
    const result: Record<string, string> = {}
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        result[key] = String(value)
      }
    })
    return result
  }

  /**
   * Fetch a story by slug
   */
  const getStory = async (slug: string, options?: {
    version?: 'draft' | 'published';
    resolveRelations?: string[];
    language?: string;
  }): Promise<StoryblokStory | null> => {
    try {
      const version = options?.version || (config.public.storyblokVersion as 'draft' | 'published')
      
      const queryParams = buildQueryParams({
        version,
        ...(options?.resolveRelations && options.resolveRelations.length > 0 ? { resolve_relations: options.resolveRelations.join(',') } : {}),
        ...(options?.language ? { language: options.language } : {}),
      })
      
      const { data } = await storyblokApi.get(`cdn/stories/${slug}`, queryParams)

      return (data as { story: StoryblokStory }).story
    } catch (error) {
      console.error(`Error fetching story with slug "${slug}":`, error)
      return null
    }
  }

  /**
   * Fetch homepage story
   */
  const getHomepage = async (options?: {
    version?: 'draft' | 'published';
    resolveRelations?: string[];
  }): Promise<StoryblokStory | null> => {
    try {
      const version = options?.version || (config.public.storyblokVersion as 'draft' | 'published')
      
      const queryParams = buildQueryParams({
        version,
        ...(options?.resolveRelations && options.resolveRelations.length > 0 ? { resolve_relations: options.resolveRelations.join(',') } : {}),
      })
      
      const { data } = await storyblokApi.get('cdn/stories/home', queryParams)

      return (data as { story: StoryblokStory }).story
    } catch (error) {
      console.error('Error fetching homepage:', error)
      return null
    }
  }

  /**
   * Fetch all stories by content type
   */
  const getStories = async (contentType: string, options?: {
    version?: 'draft' | 'published';
    perPage?: number;
    page?: number;
    filters?: Record<string, string>;
    sortBy?: string;
    resolveRelations?: string[];
  }): Promise<StoryblokStory[]> => {
    try {
      const version = options?.version || (config.public.storyblokVersion as 'draft' | 'published')
      const perPage = options?.perPage || 10
      const page = options?.page || 1
      
      const filters: Record<string, string> = {
        'component': contentType,
        ...options?.filters,
      }

      const queryParams = buildQueryParams({
        version,
        per_page: perPage,
        page: page,
        ...filters,
        ...(options?.resolveRelations && options.resolveRelations.length > 0 ? { resolve_relations: options.resolveRelations.join(',') } : {}),
        ...(options?.sortBy ? { sort_by: options.sortBy } : {}),
      })

      const { data } = await storyblokApi.get('cdn/stories', queryParams)

      return (data as { stories: StoryblokStory[] }).stories
    } catch (error) {
      console.error(`Error fetching stories of type "${contentType}":`, error)
      return []
    }
  }

  /**
   * Fetch story by full slug path
   */
  const getStoryByFullSlug = async (fullSlug: string, options?: {
    version?: 'draft' | 'published';
    resolveRelations?: string[];
  }): Promise<StoryblokStory | null> => {
    try {
      const version = options?.version || (config.public.storyblokVersion as 'draft' | 'published')
      
      const queryParams = buildQueryParams({
        version,
        slug: fullSlug,
        ...(options?.resolveRelations && options.resolveRelations.length > 0 ? { resolve_relations: options.resolveRelations.join(',') } : {}),
      })
      
      const { data } = await storyblokApi.get('cdn/stories', queryParams)

      const stories = (data as { stories?: StoryblokStory[] }).stories
      if (stories && stories.length > 0) {
        return stories[0] || null
      }

      return null
    } catch (error) {
      console.error(`Error fetching story with full slug "${fullSlug}":`, error)
      return null
    }
  }

  /**
   * Resolve a Storyblok link
   */
  const resolveLink = (link: string | { url?: string; cached_url?: string }): string => {
    if (typeof link === 'string') {
      return link
    }
    
    if (link?.url) {
      return link.url
    }
    
    if (link?.cached_url) {
      return link.cached_url
    }
    
    return '#'
  }

  /**
   * Get image URL from Storyblok asset
   */
  const getImageUrl = (image: { filename?: string } | string | null | undefined, options?: {
    width?: number;
    height?: number;
    fit?: 'in' | 'out' | 'fill' | 'crop';
    quality?: number;
  }): string => {
    if (!image) return ''
    
    const filename = typeof image === 'string' ? image : image.filename
    if (!filename) return ''

    const baseUrl = filename.startsWith('http') ? filename : `https://a.storyblok.com/${filename}`
    
    if (!options) return baseUrl

    const params = new URLSearchParams()
    if (options.width) params.append('m', options.width.toString())
    if (options.height) params.append('m', options.height.toString())
    if (options.fit) params.append('fit', options.fit)
    if (options.quality) params.append('q', options.quality.toString())

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl
  }

  return {
    getStory,
    getHomepage,
    getStories,
    getStoryByFullSlug,
    resolveLink,
    getImageUrl,
    api: storyblokApi,
  }
}

