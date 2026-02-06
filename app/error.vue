<script lang="ts" setup>
import type {NuxtError} from "#app";

defineProps({
  error: Object as () => NuxtError,
})

</script>

<template>
  <div class="relative overflow-hidden h-screen">
    <UError
      :clear="{
      color: 'primary',
      icon: 'i-ri-home-6-fill',
      class: 'rounded-full cursor-pointer',
      label: 'Take me home'
    }"
      :error="{
      statusCode: error?.status,
      statusMessage: error?.statusText,
    }"
      class="px-4"
    />
    <div class="size-fit absolute inset-1/2 -translate-1/2 lg:text-[32rem] text-[11rem] -z-1 flex flex-col gap-4">
      <div v-for="(_, index) in 7"
           :style="{
        'animationDelay': `${index * 100}ms`
           }"
           class="size-fit font-black text-dimmed/20 animate-pulse animate-duration-2500 lg:leading-100 leading-30">
        {{
          error?.status
        }}
      </div>
    </div>

  </div>
</template>
