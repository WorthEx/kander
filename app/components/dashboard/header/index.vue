<script lang="ts" setup>

</script>

<template>
  <div class="flex justify-between items-center gap-2 pb-4">
    <span class="text-xl font-semibold">
      <slot name="title"/>
    </span>
    <div class="flex gap-2">
      <slot/>
    </div>
    <div class="flex gap-2">
      <slot name="right"/>
    </div>
  </div>
</template>

<style scoped>

</style>
