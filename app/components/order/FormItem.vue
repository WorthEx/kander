<script lang="ts" setup>
const props = defineProps<{
  serviceId: string,
  title: string,
  price: number,
  quantity: number,
  currencySymbol: string,
  index: number
  active?: boolean
  done?: boolean
}>()

const emit = defineEmits<{
  (e: 'remove', itemIndex: number): void
  (e: 'switch', itemIndex: number, done: boolean): void
}>()

const handleRemoveItem = () => emit('remove', props.index)

const handleSwitchStatus = () => {
  if (!props.active || props.done === undefined || props.done === null) return
  emit('switch', props.index, !props.done)
}

</script>

<template>
  <div
    class="flex justify-between items-center gap-2 rounded-xl p-3 select-none dark:bg-muted bg-elevated/80">
    <div class="flex flex-col gap-1">
      <span class="text-sm font-bold">{{ title }}</span>
      <span class="uppercase">
          <span class="text-muted/80">{{ currencySymbol }}</span>
          {{ formatPrice(price * quantity) }}<span class="text-dimmed"> | {{ formatPrice(price) }} × {{
          quantity
        }}</span>
        </span>
    </div>
    <div class="flex gap-2 items-center">
      <UButton v-if="active" :icon="done ? 'i-ri-check-fill' : null" class="cursor-pointer size-8" variant="outline"
               @click="handleSwitchStatus"/>
      <UButton class="cursor-pointer" color="error" icon="i-ri-delete-bin-6-fill" variant="soft"
               @click="handleRemoveItem"/>
    </div>
  </div>
</template>
