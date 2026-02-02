<script setup>
const props = defineProps({
  priority: {
    type: Number,
  }
})
const icon = ref("")
const color = ref("")

switch (props.priority) {
  case 0:
    icon.value = "i-ri-arrow-down-double-fill"
    color.value = "neutral"
    break
  case 1:
    icon.value = "i-ri-arrow-down-s-line"
    color.value = "tertiary"
    break
  case 2:
    icon.value = "i-ri-circle-line"
    color.value = "warning"
    break
  case 3:
    icon.value = "i-ri-arrow-up-s-line"
    color.value = "secondary"
    break
  case 4:
    icon.value = "i-ri-arrow-up-double-fill"
    color.value = "error"
    break
  default:
    icon.value = "i-ri-arrow-up-double-fill"
    color.value = "neutral"
    break;
}
</script>

<template>
  <UBadge :color :leading-icon="icon" class="w-fit" variant="subtle">{{ Priority[priority] }}</UBadge>
</template>
