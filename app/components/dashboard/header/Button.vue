<script setup>
defineProps({
  icon: {
    type: String,
    required: true
  },
  action: {
    type: Function,
    required: false
  },
  label: {
    type: String,
    required: true
  },
  disabled: Boolean
})
</script>

<template>
  <UButton :disabled class="cursor-pointer px-4 py-2 rounded-full" color="primary" variant="solid" @click="action">
    <template #trailing>
      <UIcon :name="icon" class="size-5"/>
    </template>
    <template #default>
      <span>{{ label }}</span>
    </template>
  </UButton>
</template>

<style scoped>

</style>
