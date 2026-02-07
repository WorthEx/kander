<script setup>
defineProps({
  icon: {
    type: String,
    required: true
  },
  action: {
    type: Function,
    required: true
  },
  label: {
    type: String,
    required: true
  },
})
</script>

<template>
  <UButton class="cursor-pointer xs:px-4 px-2 py-2 rounded-full" color="primary" variant="solid" @click="action">
    <template #trailing>
      <UIcon :name="icon" class="size-5"/>
    </template>
    <template #default>
      <span class="xs:block hidden">{{ label }}</span>
    </template>
  </UButton>
</template>

<style scoped>

</style>
