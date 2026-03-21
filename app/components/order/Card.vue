<script setup>
const props = defineProps({
  order: Object,
  dimmed: Boolean,
  currencySymbol: String
})

const getDate = computed(_ => {
  if (!props.order.deadline) return null
  const [year, month, day] = props.order.deadline.split('-')

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return `${day} ${months[parseInt(month) - 1]} ${year}`
})

const overdue = computed(() => {
  const dueDate = new Date(props.order.deadline)
  if (!dueDate || !props.order.deadline) return false
  return (new Date() - dueDate) > 0
})

const progressPercent = computed(() => {
  const doneItems = props.order.items.filter(item => item.isDone === true)
  return doneItems / props.order.items.length
})
</script>

<template>
  <div>
    <USlideover>
      <template #body>
        <div class="flex flex-col"><span>{{ order.position }}</span>
          <span>{{ order.id }}</span>
        </div>
      </template>
      <div
        :class="{'opacity-30' :dimmed}"
        class="paper px-4 pt-4 pb-5 dark:bg-elevated/50 bg-muted hover:dark:bg-elevated hover:bg-default rounded-lg cursor-grab active:cursor-grabbing transition-colors relative
      select-none flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <span class="uppercase font-bold"><span class="text-muted/80">{{ currencySymbol }}</span> {{
              formatPrice(order.totalCost)
            }}</span>
          <UBadge v-if="overdue" class="w-fit" color="error" variant="subtle">
            <template #leading>
              <UIcon name="i-ri-flag-line"/>
            </template>
            {{ getDate }}
          </UBadge>
          <div v-else class="text-xs text-muted flex items-center gap-1">
            <UIcon class="text-dimmed size-3" name="i-ri-flag-line"/>
            <span>{{ getDate ?? 'No deadline' }}</span>
          </div>
        </div>
        <div class="w-full">
          <span class="text-sm line-clamp-1">{{ order.title }}</span>
        </div>
        <!--   progress bar   -->
        <div class="w-full h-1 bg-accented rounded-full relative">
          <div :style="{'width': `${progressPercent}%`}"
               class="h-1 absolute rounded-full bg-primary">
          </div>
        </div>
        <!--   tags   -->
        <div class="flex gap-1 flex-wrap">
          <OrderPriorityChip :priority="order.priority"/>
          <OrderSourceChip :source="order.source"/>
        </div>
        <!--   footer   -->
        <USeparator class="h-px mt-4"/>
        <div class="flex justify-between pt-1 text-sm text-muted">
          <span>{{ order.customer.fullName }}</span>
          <div class="flex items-center gap-1">
            <UIcon class="size-4" name="i-ri-link"/>
            <span>{{ order.links.length }}</span>
          </div>
        </div>
      </div>
    </USlideover>
  </div>
</template>
