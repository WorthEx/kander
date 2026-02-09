<script lang="ts" setup>
const props = defineProps<{
  title: string,
  numberOfMembers: number,
  role: string,
  wsId: string
}>()

</script>

<template>
  <NuxtLink :to="`/workspace/${wsId}/board`">
    <div
      class="flex flex-col gap-2 ring-1 ring-accented/80 rounded-lg p-5 bg-muted/70 select-none
    hover:ring-primary active:scale-99 cursor-pointer transition-all">
      <div class="flex flex-col">
        <span class="font-semibold">{{ title }}</span>
        <span class="text-sm text-dimmed">{{ numberOfMembers }} {{
            numberOfMembers === 1 ? 'member' : 'members'
          }}</span>
      </div>
      <div class="flex items-center gap-1 mt-4">
        <UIcon class="size-4 text-default" name="i-ri-user-2-fill"/>
        <span class="capitalize text-sm text-dimmed">{{ role }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
</style>
