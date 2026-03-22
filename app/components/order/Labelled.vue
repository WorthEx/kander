<script lang="ts" setup>

const {colon = false, display = false} = defineProps<{
  label: string
  colon?: boolean
  display?: boolean
}>()
</script>

<template>
  <div :class="display ?  'gap-3' : 'gap-1'" class="flex flex-col text-sm">
    <span :class="[display && 'uppercase text-xs tracking-widest']" class="text-muted/90 select-none">{{ label }}{{
        colon ? ':' : ''
      }}</span>
    <slot/>
  </div>
</template>

<style scoped>

</style>
