<script setup>
defineProps({
  title: {
    type: String,
    required: false
  },
  desc: {
    type: String,
    required: false
  },
})
</script>

<template>
  <section class="flex gap-4 ring ring-default rounded-xl w-full h-32">
    <div class="flex flex-col w-full">
      <span class="text-lg">{{ title }}</span>
      <p v-if="desc" class="text-dimmed text-sm">{{ desc }}</p>
    </div>
  </section>
</template>
