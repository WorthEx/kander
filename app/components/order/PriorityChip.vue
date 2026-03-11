<script setup>
const props = defineProps({
  priority: {
    type: String,
  }
})
const icon = ref("")
const color = ref("")

switch (props.priority) {
  case 'medium':
    icon.value = "i-ri-circle-line"
    color.value = "warning"
    break
  case 'high':
    icon.value = "i-ri-arrow-up-s-line"
    color.value = "error"
    break
  default:
    icon.value = "i-ri-arrow-down-s-line"
    color.value = "info"
    break
}
</script>

<template>
  <UBadge :color :icon class="w-fit capitalize" variant="solid">{{ priority }}</UBadge>
</template>
