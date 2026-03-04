<script setup>
const props = defineProps({
  source: {
    type: String,
  }
})
const icon = ref("")
const color = ref("")

switch (props.source) {
  case 'api':
    icon.value = "i-ri-code-view"
    color.value = "quinary"
    break
  case 'manual':
    icon.value = "i-ri-customer-service-2-fill"
    color.value = "secondary"
    break
  default:

    break
}
</script>

<template>
  <UBadge :color :icon class="w-fit capitalize" variant="subtle">{{ source }}</UBadge>
</template>
