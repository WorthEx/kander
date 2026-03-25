<script lang="ts" setup>
const props = defineProps<{
  id: string,
  title: string,
  link: string,
  isResponsible: boolean
}>()

const emit = defineEmits<{
  (e: 'remove', id: string): void
}>()

const linkDomain = computed(() => {
  try {
    return new URL(props.link).hostname
  } catch {
    return props.link
  }
})
</script>

<template>
  <NuxtLink :to="link"
            class="flex gap-1 group items-center justify-between border border-dashed border-default rounded-xl cursor-pointer w-full p-3 bg-muted/50
            hover:bg-muted hover:border-primary transition-all"
            external target="_blank">
    <div class="flex flex-col overflow-hidden">
      <span class="text-sm group-hover:text-primary transition-all">{{ title }}</span>
      <span class="text-sm text-dimmed break-all truncate">{{ linkDomain }}</span>
    </div>
    <UButton :disabled="!isResponsible"
             class="cursor-pointer"
             color="error"
             icon="i-ri-delete-bin-6-fill" variant="soft"
             @click.stop.prevent="emit('remove', id)"/>
  </NuxtLink>
</template>
