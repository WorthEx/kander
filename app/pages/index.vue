<script setup>
import Draggable from 'vuedraggable'

const demoList1 = ref([
  {
    title: "Brand design for a new product",
    positionCount: 5,
    progressPercent: 0,
    clientFullName: "Markiplier"
  },
  {
    title: "Music video for a pop song",
    positionCount: 1,
    progressPercent: 0,
    clientFullName: "Hatsune Miku"
  },
  {
    title: "Advertisement video",
    positionCount: 4,
    progressPercent: 0,
    clientFullName: "Markiplier"
  },
])
const demoList2 = ref([
  {
    title: "Spaceship 3D model renders",
    positionCount: 8,
    progressPercent: 75,
    clientFullName: "Neil Armstrong"
  },
  {
    title: "Search engine functionality",
    positionCount: 12,
    progressPercent: 58,
    clientFullName: "Sundar Pichai"
  },
])

const log = (evt) => {
  console.log(evt)
}
</script>

<template>
  <UPage>
    <UPageHero
      description="A tool making order management as effortless as you can imagine with kanban-styled boards for ur team or your precious self"
      orientation="horizontal">
      <template #title>Kanbanize your workflow with ease</template>
      <template #links>
        <div class="flex gap-2 *:w-fit max-[315px]:flex-col">
          <UButton class="cursor-pointer group" label="Get started" size="xl">
            <template #trailing>
              <UIcon class="size-6 border group-hover:translate-x-0.5 transition-transform"
                     name="i-ri-arrow-right-s-line"/>
            </template>
          </UButton>
          <UButton class="cursor-pointer" color="neutral" label="Create organization" size="xl" variant="outline"/>
        </div>
      </template>
      <template #default>
        <div class="size-full dark:bg-muted bg-elevated rounded-2xl min-h-64 flex overflow-hidden">
          <div class="basis-1/2 flex flex-col">
            <div
              class="w-full py-3 grid place-content-center font-semibold text-sm text-dimmed select-none dark:bg-elevated/30 bg-accented/60">
              To be done
            </div>
            <Draggable
              v-model="demoList1"
              class="h-full p-2 space-y-2"
              drag-class="dragged"
              ghost-class="ghost"
              group="cards"
              item-key="id">
              <template #item="{element}">
                <DemoCard :clientFullName="element.clientFullName" :column="0"
                          :positionCount="element.positionCount" :progressPercent="element.progressPercent"
                          :title="element.title"
                          class="bg-tertiary/20 hover:bg-tertiary/30"/>
              </template>
            </Draggable>
          </div>
          <div class="w-px dark:bg-neutral-700 bg-border"/>
          <div class="basis-1/2 flex flex-col">
            <div
              class="w-full py-3 grid place-content-center font-semibold text-sm text-dimmed select-none dark:bg-elevated/30 bg-accented/60">
              In progress
            </div>
            <Draggable
              v-model="demoList2"
              class="h-full p-2 space-y-2"
              drag-class="dragged"
              ghost-class="ghost"
              group="cards"
              item-key="id">
              <template #item="{element}">
                <DemoCard :clientFullName="element.clientFullName" :column="1"
                          :positionCount="element.positionCount" :progressPercent="element.progressPercent"
                          :title="element.title"
                          class="bg-secondary/20 hover:bg-secondary/30"/>
              </template>
            </Draggable>
          </div>
        </div>
      </template>
    </UPageHero>
  </UPage>
</template>

<style scoped>
.ghost {
  background: var(--ui-bg-muted);
}

.ghost > * {
  opacity: 0.1;
}
</style>
