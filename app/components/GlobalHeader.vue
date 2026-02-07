<script setup>
const auth = useAuth()
const logInLink = computed(_ => {
  if (auth.initialized.value && auth.user.value) return '/overview'
  else return '/auth/login'
})
const userLoaded = computed(_ => auth.initialized.value && auth.user.value)
</script>

<template>
  <UHeader :toggle="{
    variant: 'naked',
    class: 'cursor-pointer'
  }" class="bg-transparent backdrop-blur-md border-none" mode="slideover">
    <template #title>
      <div class="flex items-center gap-2">
        <img alt="Kander logo" class="lg:h-8 h-7 object-fit select-none pointer-events-none rounded-lg"
             src="/images/kander_192.png">
        <div class="font-bold leading-7 self-end">Kander</div>
      </div>
    </template>

    <template #right>
      <UColorModeButton class="cursor-pointer" variant="naked"/>
      <ClientOnly>
        <UButton
          :to="logInLink"
          class="lg:flex hidden cursor-pointer px-4"
          color="primary"
          variant="solid">
          {{ userLoaded ? 'Overview' : 'Log in' }}
        </UButton>
        <template #fallback>
          <UButton
            class="lg:flex hidden cursor-pointer px-4"
            color="primary"
            variant="solid">
            <USkeleton class="h-4 w-16 bg-default/20 rounded-full"></USkeleton>
          </UButton>
        </template>
      </ClientOnly>
    </template>

    <template #body>
      <div class="flex flex-col ring dark:ring-neutral-800 ring-neutral-200 rounded-xl overflow-hidden">
        <ClientOnly>
          <UButton
            :to="logInLink"
            class="cursor-pointer w-full flex items-center justify-between p-6 rounded-t-xl rounded-b-none group"
            color="neutral"
            variant="ghost">
            <span class="font-semibold text-lg">{{ userLoaded ? 'Overview' : 'Log in' }}</span>
            <UIcon :name="userLoaded ? 'i-ri-home-6-fill' : 'i-ri-door-open-fill'"
                   class="size-7 group-hover:bg-secondary transition-colors"></UIcon>
          </UButton>
        </ClientOnly>
        <!--        <USeparator class="h-px"/>-->
        <!--        <UButton-->
        <!--          class="cursor-pointer w-full flex items-center justify-between p-6 rounded-none group"-->
        <!--          color="neutral"-->
        <!--          variant="ghost">-->
        <!--          <div class="flex flex-col items-start">-->
        <!--            <span class="font-semibold text-lg">Create account</span>-->
        <!--            <span class="text-muted">I'm a complete beginner</span>-->
        <!--          </div>-->
        <!--          <UIcon class="size-7 group-hover:bg-primary transition-colors" name="i-ri-rocket-2-fill"></UIcon>-->
        <!--        </UButton>-->
      </div>
    </template>
  </UHeader>
</template>
