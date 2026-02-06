<script setup>
const route = useRoute()
const routesWithHeader = ['index', 'auth-login', 'auth-verify']
</script>

<template>
  <VitePwaManifest/>
  <UApp :toaster="{position: 'top-right'}">
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
