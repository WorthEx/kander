<script setup>
const props = defineProps({
  title: String,
  items: Array,
  customerName: String,
  priority: String,
  due: String,
  numberOfLinks: Number,
  totalCost: Number,
  source: String,
  dimmed: Boolean,
  currencySymbol: String
})

const getDate = computed(_ => {
  if (!props.due) return null
  const [year, month, day] = props.due.split('-')

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return `${day} ${months[parseInt(month) - 1]} ${year}`
})

const overdue = computed(() => {
  const dueDate = new Date(props.due)
  if (!dueDate || !props.due) return false
  return (new Date() - dueDate) > 0
})

const progressPercent = computed(() => {
  const doneItems = props.items.filter(item => item.isDone === true)
  return doneItems / props.items.length
})
</script>

<template>
  <div>
    <USlideover>
      <div
        :class="{'opacity-30' :dimmed}"
        class="paper px-4 pt-4 pb-5 dark:bg-elevated/50 bg-muted hover:dark:bg-elevated hover:bg-default rounded-lg cursor-grab active:cursor-grabbing transition-colors relative
      select-none flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <span class="uppercase font-bold"><span class="text-muted/80">{{ currencySymbol }}</span> {{
              formatPrice(totalCost)
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
          <OrderSourceChip :source/>
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
  </div>
</template>
