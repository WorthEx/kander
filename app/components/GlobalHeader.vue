<script setup>

</script>

<template>
  <UHeader :toggle="{
    variant: 'naked',
    class: 'cursor-pointer'
  }" class="bg-transparent backdrop-blur-md border-none" mode="slideover">
    <template #title>
      <div class="flex items-center gap-2">
        <img alt="Kander logo" class="lg:h-8 h-7 object-fit select-none pointer-events-none"
             src="/images/kander_192.png">
        <div class="font-bold leading-7 self-end">Kander</div>
      </div>
    </template>

    <template #right>
      <UColorModeButton class="cursor-pointer" variant="naked"/>
      <UButton
        class="lg:flex hidden cursor-pointer px-4"
        color="neutral"
        variant="naked">
        Create account
      </UButton>
      <UButton
        class="lg:flex hidden cursor-pointer px-4"
        color="primary"
        variant="solid">
        Log in
      </UButton>
    </template>

    <template #body>
      <div class="flex flex-col ring dark:ring-neutral-800 ring-neutral-200 rounded-xl overflow-hidden">
        <UButton
          class="cursor-pointer w-full flex items-center justify-between p-6 rounded-t-xl rounded-b-none group"
          color="neutral"
          variant="ghost">
          <div class="flex flex-col items-start">
            <span class="font-semibold text-lg">Log me in</span>
            <span class="text-muted">I'm not a rookie y'know</span>
          </div>
          <UIcon class="size-7 group-hover:bg-secondary transition-colors" name="i-ri-login-circle-fill"></UIcon>
        </UButton>
        <USeparator class="h-px"/>
        <UButton
          class="cursor-pointer w-full flex items-center justify-between p-6 rounded-none group"
          color="neutral"
          variant="ghost">
          <div class="flex flex-col items-start">
            <span class="font-semibold text-lg">Create account</span>
            <span class="text-muted">I'm a complete beginner</span>
          </div>
          <UIcon class="size-7 group-hover:bg-primary transition-colors" name="i-ri-rocket-2-fill"></UIcon>
        </UButton>
        <!--        <USeparator class="h-px"/>-->
        <!--        <UButton-->
        <!--          class="cursor-pointer w-full flex items-center justify-between p-6 rounded-b-xl rounded-t-none group"-->
        <!--          color="neutral"-->
        <!--          variant="ghost">-->
        <!--          <div class="flex flex-col items-start">-->
        <!--            <span class="font-semibold text-lg">Create organization</span>-->
        <!--            <span class="text-muted">I want to set up a Kander space</span>-->
        <!--          </div>-->
        <!--          <UIcon class="size-7 group-hover:bg-tertiary transition-colors" name="i-ri-function-add-fill"></UIcon>-->
        <!--        </UButton>-->
      </div>
    </template>
  </UHeader>
</template>
