<script setup>
import Draggable from 'vuedraggable'
import {useMediaQuery} from "@vueuse/core";

definePageMeta({
  auth: false,
})

const demoList1 = ref([
  {
    id: 'adfhdfh',
    title: "Brand design for a new product",
    orderPositionCount: 5,
    progressPercent: 5,
    clientFullName: "Marisa Kirisame",
    priority: Priority.Low,
    due: new Date(new Date().setDate(new Date().getDate() - 13)),
    numberOfLinks: 2,
    price: "40 000"
  },
  {
    id: 'bgfjfjg',
    title: "Music video for a pop song with a really really lreally I sweaarrr really long name fr fr y know bruh",
    orderPositionCount: 1,
    progressPercent: 10,
    clientFullName: "Hatsune Miku",
    priority: Priority.Medium,
    due: new Date(new Date().setDate(new Date().getDate() - 6)),
    numberOfLinks: 3,
    price: "20 000"
  },
  {
    id: 'cfgjfgj',
    title: "Advertisement video",
    orderPositionCount: 4,
    progressPercent: 0,
    clientFullName: "Markiplier",
    priority: Priority.Low,
    due: new Date(new Date().setDate(new Date().getDate() - 9)),
    numberOfLinks: 3,
    price: "50 000"
  },
])
const demoList2 = ref([
  {
    id: 'afkfhk',
    title: "Spaceship 3D model renders",
    orderPositionCount: 8,
    progressPercent: 75,
    clientFullName: "Neil Armstrong",
    priority: Priority.High,
    due: new Date(new Date().setDate(new Date().getDate() - 1)),
    numberOfLinks: 4,
    price: "120 000"
  },
  {
    id: 'bfhkfhk',
    title: "Search engine functionality",
    orderPositionCount: 12,
    progressPercent: 58,
    clientFullName: "Sundar Pichai",
    priority: Priority.High,
    due: new Date(),
    numberOfLinks: 2,
    price: "150 000"
  },
])
const demoKanban = ref([
  {
    id: '3425345',
    title: 'To do',
    orders: [...demoList1.value]
  },
  {
    id: '484684',
    title: 'In progress',
    orders: [...demoList2.value]
  },
])
const features = ref([
  {
    title: 'Kanban styled',
    description: 'We provide intuitive and, more importantly, super-convenient UI to guarantee smooth, high-level user experience.',
    icon: 'i-ri-table-fill',
  },
  {
    title: 'Fully responsive',
    description: 'Kander was designed to be used from any preferred platform. We don\'t recommend using it while driving tho.',
    icon: 'i-ri-mobile-download-fill',
  },
  {
    title: 'Free of charge',
    description: 'The project is sponsored by ads which helps keeping all of its features completely free to use. Please consider supporting us on Ko‑fi btw.',
    icon: 'i-ri-price-tag-3-fill',
    to: 'https://ko-fi.com/worthex'
  }
])

const auth = useAuth()
const logInLink = computed(_ => {
  if (auth.initialized.value && auth.user.value) return '/overview'
  else return '/auth/login'
})

const isMobile = useMediaQuery('(max-width: 1024px)')
</script>

<template>
  <UPage class="pb-20">
    <div
      class="absolute animate-pulse animate-duration-8500
          bg-primary w-screen h-20 inset-x-1/2 -translate-x-1/2 -top-40 rounded-full drop-shadow-2xl drop-shadow-primary blur-[20rem]"/>
    <UPageHero
      class="animate-fade-up animate-ease-out animate-duration-1000 *:lg:py-20"
      description="A tool making order management as effortless as you can imagine with kanban-styled boards for ur team or your precious self"
      orientation="horizontal">
      <template #title>Kanbanize your workflow with ease</template>
      <template #links>
        <div class="flex gap-2 *:w-fit max-[350px]:flex-col">
          <UButton :to="logInLink" class="cursor-pointer group" label="Get started" size="xl">
            <template #trailing>
              <UIcon class="size-6 border group-hover:translate-x-0.5 transition-transform"
                     name="i-ri-arrow-right-s-line"/>
            </template>
          </UButton>
        </div>
      </template>
      <template #default>
        <div
          class="z-1 size-full dark:bg-muted bg-accented/50 rounded-2xl animate-fade-up animate-ease-out flex overflow-hidden">
          <div v-for="(column, columnIndex) in demoKanban"
               :style="{'animationDelay': `${columnIndex * 200}ms` }"
               class="flex flex-col sm:basis-1/2 basis-full animate-fade-up animate-ease-out animate-once nth-2:sm:flex nth-2:hidden">
            <div
              class="w-full ps-3 pe-2 py-3 select-none flex flex-row items-center justify-between gap-2">
              <div class="flex gap-2 items-center">
                <div v-if="columnIndex===1" class="rounded-full ring ring-neutral-500 size-2">
                  <div class="bg-neutral-500 w-1 h-2 rounded-s-full"></div>
                </div>
                <div v-else class="rounded-full ring ring-neutral-500 size-2"/>
                <span class="font-semibold text-sm text-muted">{{ column.title }}</span>
                <div class="dark:bg-elevated/50 bg-muted rounded-lg px-2 py-0.5 text-sm font-semibold text-muted">
                  {{ column.orders.length }}
                </div>
              </div>
              <UButton class="cursor-pointer" color="neutral" leading-icon="i-ri-add-fill"
                       variant="ghost"/>
            </div>
            <Draggable
              v-model="column.orders"
              :disabled="isMobile"
              class="h-full px-2 pb-2 space-y-3 no-scrollbar max-h-150 overflow-y-auto"
              drag-class="dragged"
              ghost-class="ghost"
              group="cards"
              item-key="id">
              <template #item="{element}">
                <DemoCard :clientFullName="element.clientFullName" :column="columnIndex"
                          :due="element.due" :numberOfLinks="element.numberOfLinks"
                          :orderPositionCount="element.orderPositionCount"
                          :price="element.price"
                          :priority="element.priority"
                          :progressPercent="element.progressPercent" :title="element.title"/>
              </template>
            </Draggable>
          </div>
        </div>
      </template>
    </UPageHero>
    <UPageSection
      :features="features"
      class="*:*:*:*:*:nth-3:hover:scale-101 *:*:*:*:*:nth-3:hover:*:*:nth-3:text-primary
          *:*:*:*:*:nth-3:*:*:nth-1:animate-pulse *:*:*:*:*:nth-3:hover:*:*:nth-1:animate-none animate-fade-up animate-ease-out animate-duration-1000 animate-delay-400"
      description="Kander was developed to solve a specific problem - to simplify the way you manage orders and track progress... for free!"
      title="Enhance your working experience starting today"
    />
  </UPage>
</template>

<style>
.ghost > * > * {
  opacity: 40%;
}

.ghost {
  opacity: 50%;
}


.dragged > * {
  @apply rotate-6;
}
</style>
