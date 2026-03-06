<script lang="ts" setup>
defineProps<{
  linkItem: { title: string, description: string, link: string }
}>()
</script>

<template>
  <NuxtLink :to="linkItem.link"
            class="flex gap-1 group flex-col overflow-hidden justify-between border border-dashed border-default rounded-xl cursor-pointer w-full p-4 bg-muted/50
            hover:bg-muted hover:border-primary transition-all relative"
            external target="_blank">
    <span class="text-sm group-hover:text-primary transition-all">{{ linkItem.title }}</span>
    <span class="text-sm text-dimmed break-all">{{ linkItem.description }}</span>
    <UIcon
      class="size-32 absolute right-4 top-1/2 -translate-y-1/2 text-dimmed/20 group-hover:xs:text-primary/30 transition-all"
      name="i-ri-links-fill"/>
  </NuxtLink>
</template>
