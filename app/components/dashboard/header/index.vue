<script lang="ts" setup>

</script>

<template>
  <div class="flex justify-between items-center gap-2 pt-4">
    <div class="flex flex-col gap-1">
      <span class="text-2xl font-semibold"><slot name="title"/></span>
      <span class="text-dimmed text-base"><slot name="description"/></span>
    </div>
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
