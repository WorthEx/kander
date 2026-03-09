<script setup>
const props = defineProps({
  title: String,
  items: Array,
  customerName: String,
  priority: String,
  due: Date,
  numberOfLinks: Number,
  totalCost: Number,
  source: String
})

const getDate = computed(_ => {
  if (!props.due) return null
  const day = String(props.due.getDate()).padStart(2, '0')

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const month = months[props.due.getMonth()]
  const year = props.due.getFullYear()

  return `${day} ${month} ${year}`
})
const overdue = computed(() => {
  if (!props.due) return false
  return (new Date() - props.due) <= 0
})
const progressPercent = computed(() => {
  const doneItems = props.items.filter(item => item.isDone === true)
  return doneItems / props.items.length
})
</script>

<template>
  <USlideover>
    <div
      class="paper px-4 pt-4 pb-5 dark:bg-elevated/50 bg-muted hover:dark:bg-elevated hover:bg-default rounded-lg cursor-grab active:cursor-grabbing transition-colors relative
      select-none flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <span class="uppercase font-bold">{{ totalCost }}</span>
        <UBadge v-if="overdue" class="w-fit" color="error">
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
        <span class="text-sm line-clamp-1">{{ title }}</span>
      </div>
      <!--   progress bar   -->
      <div class="w-full h-1 bg-accented rounded-full relative">
        <div :style="{'width': `${progressPercent}%`}"
             class="h-1 absolute rounded-full bg-primary">
        </div>
      </div>
      <!--   tags   -->
      <div class="flex gap-1 flex-wrap">
        <OrderPriorityChip :priority/>
        <DemoSourceChip :source/>
      </div>
      <!--   footer   -->
      <USeparator class="h-px mt-4"/>
      <div class="flex justify-between pt-1 text-sm text-muted">
        <span>{{ customerName }}</span>
        <div class="flex items-center gap-1">
          <UIcon class="size-4" name="i-ri-link"/>
          <span>{{ numberOfLinks }}</span>
        </div>
      </div>
    </div>
  </USlideover>
</template>
