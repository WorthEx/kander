<script lang="ts" setup>

const props = defineProps<{
  title: string,
  description?: string,
  tint: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary' | undefined,
  icon?: string
}>()

const iconClass = {
  'primary': 'text-primary',
  'secondary': 'text-secondary',
  'tertiary': 'text-tertiary',
  'quaternary': 'text-quaternary',
  'quinary': 'text-quinary',
  'inverted': 'text-inverted',
}

const pinColorClass = {
  'primary': 'bg-primary',
  'secondary': 'bg-secondary',
  'tertiary': 'bg-tertiary',
  'quaternary': 'bg-quaternary',
  'quinary': 'bg-quinary',
  'inverted': 'bg-inverted'
}

const gradientClass = {
  'primary': 'to-primary/20 hover:to-primary/30',
  'secondary': 'to-secondary/20 hover:to-secondary/30',
  'tertiary': 'to-tertiary/20 hover:to-tertiary/30',
  'quaternary': 'to-quaternary/20 hover:to-quaternary/30',
  'quinary': 'to-quinary/20 hover:to-quinary/30',
  'inverted': 'to-inverted/20 hover:to-inverted/30',
}
</script>

<template>
  <UPopover>
    <template #content>
      <div class="p-2">
        <p class="text-sm text-wrap">{{ description }}</p>
      </div>
    </template>
    <div :class="tint ? gradientClass[tint] : gradientClass['inverted']"
         class="flex flex-col xs:gap-4 gap-2 w-full xs:px-4 px-3 rounded-xl bg-linear-to-br from-30% ring ring-default/50 select-none cursor-pointer transition-colors relative overflow-hidden">
      <div
        class="lg:hidden absolute -right-8 -rotate-15 top-1/2 -translate-y-[43%] -z-1 dark:opacity-25 opacity-15">
        <UIcon v-if="icon" :class="tint ? iconClass[tint] : iconClass['inverted']" :name="icon"
               class="size-40"/>
      </div>
      <div class="flex flex-col pt-4">
        <div class="flex gap-2 justify-between items-center">
          <div class="inline-flex items-center gap-2 text-muted">
            <div :class="tint ? pinColorClass[tint] : pinColorClass['inverted']" class="xs:size-3 size-2 rounded-full"/>
            <span class="text-nowrap text-sm">{{ title }}</span>
          </div>
        </div>
        <div>
          <slot name="default"/>
        </div>
      </div>
      <div class="pb-2">
        <slot name="secondary"/>
      </div>
    </div>
  </UPopover>
</template>

<style scoped>

</style>
