<script lang="ts" setup>
</script>

<template>
  <UFooter class="*:*:border">
    <template #left>
      <div class="flex items-center gap-2 h-6">
        <img alt="Kander logo" class="h-6 object-fit select-none pointer-events-none" src="/images/kander_192.png">
        <p class="text-muted text-sm">
          Copyright Kander {{new Date().getFullYear()}}
        </p>
      </div>
    </template>

    <NuxtLink class="overflow-hidden border-red-400" external href='https://ko-fi.com/Y8Y81CVQ1C' target='_blank'>
      <img alt='Buy Me a Coffee at ko-fi.com' class="object-cover h-9" src='https://storage.ko-fi.com/cdn/kofi3.png?v=6'/>
    </NuxtLink>

    <template #right>
      <div class="flex justify-center">
        <UColorModeSelect class=""/>
      </div>
    </template>
  </UFooter>
</template>

<style scoped>

</style>
