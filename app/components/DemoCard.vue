<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  positionCount: {
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
  }
})
</script>

<template>
  <div class="px-2 py-2 rounded-lg cursor-move transition-colors relative overflow-hidden">
    <div :class="{'bg-tertiary/40': column ===  0, 'bg-secondary/40': column === 1}"
         :style="{'width': `${progressPercent}%`}"
         class="absolute inset-x-0 inset-y-0 h-full"/>
    <div class="w-full justify-between flex gap-2 items-center relative">
      <span class="text-sm">{{ title }}</span>
      <span class="font-semibold lg:block hidden">{{ progressPercent }}%</span>
    </div>
    <div class="mt-6 flex items-center gap-2 relative">
      <img v-if="positionCount < 4" alt="" class="w-6 rounded-full" src="https://i.pravatar.cc/150?img=32">
      <img v-else-if="positionCount < 8" alt="" class="w-6 rounded-full" src="https://i.pravatar.cc/150?img=10">
      <img v-else-if="positionCount < 12" alt="" class="w-6 rounded-full" src="https://i.pravatar.cc/150?img=13">
      <img v-else alt="" class="w-6 rounded-full" src="https://i.pravatar.cc/150?img=14">
      <span class="text-xs">{{ clientFullName }}</span>
    </div>
    <!--        <img alt="Demo client avatar" src="https://i.pravatar.cc/150?img=32">-->
  </div>
</template>

<style scoped>

</style>
