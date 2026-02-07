<script setup>
const route = useRoute()
const routesWithHeaderAndFooter = ['index', 'auth-login', 'auth-verify']
</script>

<template>
  <UApp :toaster="{position: 'top-right'}">
    <GlobalHeader v-if="routesWithHeaderAndFooter.includes(route.name)"/>
    <UMain>
      <NuxtLayout>
        <NuxtPage/>
      </NuxtLayout>
    </UMain>
    <USeparator v-if="routesWithHeaderAndFooter.includes(route.name)" class="h-px"/>
    <GlobalFooter v-if="routesWithHeaderAndFooter.includes(route.name)"/>
  </UApp>
</template>
