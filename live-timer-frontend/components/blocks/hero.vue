<template>
  <section
    class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20"

  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          {{ title }}
        </h1>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HeroBlock } from '~/types/storyblok'

interface Props {
  title: string
}

const props = defineProps<Props>()



</script>

