<script setup>
defineProps({
  title: {
    type: String,
    required: false
  },
  desc: {
    type: String,
    required: false
  },
})
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex flex-col w-full">
      <span class="text-lg">{{ title }}</span>
      <p class="text-dimmed text-sm">{{ desc }}</p>
    </div>
    <!--    <div-->
    <!--      class="w-full rounded-xl bg-muted px-3 py-2 h-fit text-sm ring ring-accented flex gap-2 items-center">-->
    <!--      <USkeleton v-if="!apiKeyFetched || actionInProgress" class="h-6 rounded-lg w-full"/>-->
    <!--      <div v-else-if="cachedApiKey.length < 1"-->
    <!--           class="">You haven't generated an API key yet.-->
    <!--      </div>-->
    <!--      <UTooltip v-else text="Copy API key">-->
    <!--        <div :class="keyHidden ? 'blur-sm' : 'hover:bg-accented'"-->
    <!--             class="py-1 px-1.5 rounded-xl break-all cursor-pointer font-mono transition-all select-none"-->
    <!--             @click="handleCopyApiKey">-->
    <!--          {{ cachedApiKey }}-->
    <!--        </div>-->
    <!--      </UTooltip>-->

    <!--      <UButton v-if="apiKeyFetched && cachedApiKey?.length > 1"-->
    <!--               :icon="keyHidden ? 'i-ri-eye-off-line' : 'i-ri-eye-line'"-->
    <!--               class="cursor-pointer ms-auto"-->
    <!--               color="neutral"-->
    <!--               variant="link" @click="keyHidden = !keyHidden"/>-->
    <!--    </div>-->
  </section>
</template>
