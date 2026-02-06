<script setup>
const props = defineProps({
  priority: {
    type: Number,
  }
})
const icon = ref("")
const color = ref("")

switch (props.priority) {
  case 1:
    icon.value = "i-ri-circle-line"
    color.value = "warning"
    break
  case 2:
    icon.value = "i-ri-arrow-up-s-line"
    color.value = "error"
    break
  default:
    icon.value = "i-ri-arrow-down-s-line"
    color.value = "tertiary"
    break
}
</script>

<template>
  <UBadge :color :icon class="w-fit" variant="subtle">{{ Priority[priority] }}</UBadge>
</template>
