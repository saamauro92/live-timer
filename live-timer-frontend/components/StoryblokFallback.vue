<template>
  <div class="p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
    <p class="text-sm text-yellow-800 dark:text-yellow-200">
      Component <strong>{{ blok.component }}</strong> is not yet implemented.
    </p>
    <pre class="mt-2 text-xs overflow-auto">{{ JSON.stringify(blok, null, 2) }}</pre>
  </div>
</template>

<script setup lang="ts">
import type { StoryblokComponent } from '~/types/storyblok'

interface Props {
  blok: StoryblokComponent
}

defineProps<Props>()
</script>

