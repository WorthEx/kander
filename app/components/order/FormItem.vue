<script lang="ts" setup>
const props = defineProps<{
  serviceId: string,
  title: string,
  price: number,
  quantity: number,
  currencySymbol: string,
  index: number
}>()

const emit = defineEmits<{
  (e: 'remove', itemIndex: number): void
}>()

const handleRemoveItem = () => emit('remove', props.index)

</script>

<template>
  <div
    class="flex justify-between items-center gap-2 border border-accented rounded-xl p-2 select-none bg-muted">
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
      <UButton class="cursor-pointer" color="error" icon="i-ri-delete-bin-6-fill" variant="soft"
               @click="handleRemoveItem"/>
    </div>
  </div>
</template>
