<script setup>

const route = useRoute()
const routesWithHeaderAndFooter = ['index', 'auth-login', 'auth-verify']

useSeoMeta({
  title: 'Kander',
  ogTitle: 'Kander: effortless order management',
  description: 'A reliable order management solution for SMEs powered by Nuxt 4. Kanbanize your workflow starting today.',
  ogDescription: 'A reliable order management solution for SMEs powered by Nuxt 4. Kanbanize your workflow starting today.',
  ogImage: 'https://kander.space/images/kander_512.png',
})
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
