<script setup>

const route = useRoute()
const routesWithHeaderAndFooterAndBanner = ['index', 'auth-login', 'auth-verify']

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
    <UBanner v-if="routesWithHeaderAndFooterAndBanner.includes(route.name)"
             class="*:h-fit *:py-2 *:w-fit *:mx-auto select-none"
             title="The app is currently under active development!"/>
    <GlobalHeader v-if="routesWithHeaderAndFooterAndBanner.includes(route.name)"/>
    <UMain>
      <NuxtLayout>
        <NuxtPage/>
      </NuxtLayout>
    </UMain>
    <USeparator v-if="routesWithHeaderAndFooterAndBanner.includes(route.name)" class="h-px"/>
    <GlobalFooter v-if="routesWithHeaderAndFooterAndBanner.includes(route.name)"/>
  </UApp>
</template>
