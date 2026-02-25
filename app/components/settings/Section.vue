<script lang="ts" setup>
const props = defineProps<{
  color?: 'danger',
}>()
const cardClasses = computed(() => {
  switch (props.color) {
    case "danger":
      return 'bg-error-500/10 ring-error-500/40 ring'
    default:
      return 'dark:bg-elevated/20 bg-elevated/70 ring-default ring'
  }
})
</script>
<template>
  <section class="flex flex-col gap-4">
    <span class="text-lg">
      <slot name="title"/>
    </span>
    <div :class="cardClasses" class="flex flex-col gap-4 p-4 rounded-2xl">
      <slot/>
      <div class="flex w-full justify-end">
        <slot name="footer"/>
      </div>
    </div>
  </section>
</template>
