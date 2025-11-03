<template>
  <div v-if="content">
    <component
      :is="tagForType(item.type)"
      v-for="(item, index) in content.content"
      :key="index"
      v-html="renderRichText(item)"
    />
  </div>
</template>

<script setup lang="ts">
import type { StoryblokRichText } from '~/types/storyblok'

interface Props {
  content: StoryblokRichText
}

const props = defineProps<Props>()

const tagForType = (type: string): string => {
  const tagMap: Record<string, string> = {
    paragraph: 'p',
    heading: 'h2',
    bullet_list: 'ul',
    ordered_list: 'ol',
    list_item: 'li',
    hard_break: 'br',
    blockquote: 'blockquote',
    code_block: 'pre',
  }
  return tagMap[type] || 'div'
}

const renderRichText = (item: StoryblokRichText): string => {
  if (item.text) {
    let text = item.text
    
    if (item.marks) {
      item.marks.forEach((mark) => {
        switch (mark.type) {
          case 'bold':
            text = `<strong>${text}</strong>`
            break
          case 'italic':
            text = `<em>${text}</em>`
            break
          case 'underline':
            text = `<u>${text}</u>`
            break
          case 'strike':
            text = `<s>${text}</s>`
            break
          case 'code':
            text = `<code>${text}</code>`
            break
          case 'link':
            if (mark.attrs?.href) {
              text = `<a href="${mark.attrs.href}" target="${mark.attrs.target || '_self'}">${text}</a>`
            }
            break
        }
      })
    }
    
    return text
  }
  
  if (item.content && item.content.length > 0) {
    return item.content.map((child) => renderRichText(child)).join('')
  }
  
  return ''
}
</script>

