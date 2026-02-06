<script setup>
definePageMeta({
  layout: 'dashboard',
})
if (import.meta.client) console.log(useAuth().user.value)
</script>

<template>
  <div class="text-9xl text-red-500">dashboard</div>
</template>

<style scoped>

</style>
