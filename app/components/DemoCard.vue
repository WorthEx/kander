<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  orderPositionCount: {
    type: Number,
    required: true
  },
  progressPercent: {
    type: Number,
    required: true
  },
  clientFullName: {
    type: String,
    required: true
  },
  column: {
    type: Number,
  },
  priority: {
    type: Number,
    required: true
  },
  due: {
    type: Date,
    required: true
  },
  numberOfLinks: {
    type: Number,
  },
  priceWithCurrency: {
    type: String,
  }
})

const getDate = computed(_ => {
  const day = String(props.due.getDate()).padStart(2, '0')

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const month = months[props.due.getMonth()]
  const year = props.due.getFullYear()

  return `${day} ${month} ${year}`
})
const todayIsDueDate = computed(() => props.due.toDateString() === new Date().toDateString())

</script>

<template>
  <div>
    <div
      class="paper px-4 pt-4 pb-5 dark:bg-elevated/50 bg-muted hover:dark:bg-elevated hover:bg-default rounded-lg cursor-grab active:cursor-grabbing transition-colors relative
      overflow-hidden select-none flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <UBadge v-if="todayIsDueDate" class="w-fit" color="error" icon="i-ri-flag-line">
          <template #leading>
            <UIcon name="i-ri-flag-line"/>
          </template>
          {{ getDate }}
        </UBadge>
        <div v-else class="text-xs text-muted flex items-center gap-1">
          <UIcon class="text-dimmed size-3" name="i-ri-flag-line"/>
          <span>{{ getDate }}</span>
        </div>
        <span class="uppercase font-semibold">{{ priceWithCurrency }}</span>
      </div>
      <div class="w-full justify-between flex gap-2 items-center relative">
        <span class="font-semibold text-sm line-clamp-1">{{ title }}</span>
      </div>
      <div class="w-full h-1 bg-accented rounded-full relative">
        <div :class="{'bg-tertiary': column ===  0, 'bg-primary': column === 1}"
             :style="{'width': `${progressPercent}%`}"
             class="h-1 absolute rounded-full">
        </div>
      </div>
      <div class="flex gap-1 flex-wrap">
        <PriorityChip :priority/>
      </div>
      <USeparator class="h-px mt-4"/>
      <div class="flex justify-between pt-1 text-sm text-muted">
        <span>{{ clientFullName }}</span>
        <div class="flex items-center gap-1">
          <UIcon name="i-ri-link"/>
          <span>{{ numberOfLinks }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
