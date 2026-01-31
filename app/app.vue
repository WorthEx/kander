<script setup>
const route = useRoute()
const routesWithHeader = ['index']
</script>

<template>
  <VitePwaManifest/>
  <UApp>
    <GlobalHeader v-if="routesWithHeader.includes(route.name)"/>
    <UMain>
      <NuxtLayout>
        <NuxtPage/>
      </NuxtLayout>
    </UMain>

    <USeparator class="h-px"/>
    <GlobalFooter/>
  </UApp>
</template>
