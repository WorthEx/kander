<script setup>
const props = defineProps({
  progress: {
    type: Number,
  }
})
const icon = computed(() => {
  if (props.progress === 0) return "i-ri-circle-line"
  else if (props.progress <= 16) return "i-ri-progress-1-line"
  else if (props.progress <= 25) return "i-ri-progress-2-line"
  else if (props.progress <= 33) return "i-ri-progress-3-line"
  else if (props.progress <= 50) return "i-ri-progress-4-line"
  else if (props.progress <= 66) return "i-ri-progress-5-line"
  else if (props.progress <= 75) return "i-ri-progress-6-line"
  else if (props.progress < 100) return "i-ri-progress-7-line"
  else return "i-ri-progress-8-line"
})
const color = computed(() => props.progress >= 100 ? "success" : "tertiary")


</script>

<template>
  <UBadge :color :icon class="w-fit capitalize" variant="solid">{{ Math.round(progress) }}%</UBadge>
</template>
