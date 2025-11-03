<template>
  <div>
    <StoryblokComponent
      v-for="blok in body"
      :key="blok._uid"
      :blok="blok"
    /> 


  </div>
</template>

<script setup lang="ts">
import type { PageModule } from '~/types/storyblok'

interface Props {

  body: StoryblokComponent[]
}

const props = defineProps<Props>()


</script>

