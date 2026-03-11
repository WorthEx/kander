<script setup>
import Draggable from 'vuedraggable'

definePageMeta({
  layout: 'dashboard',
})
const {data: currentWorkspace} = useNuxtData('currentWorkspace')
const route = useRoute()
const wsId = computed(() => route.params.wsId)
const toaster = useToast()
const notif = useNotification(toaster)
const nuxtApp = useNuxtApp()

const searchQuery = ref("")
const newOrderModalOpened = ref(false)
const activeTab = ref('kanban')
const tabItems = [
  {
    label: 'Kanban',
    icon: 'i-ri-kanban-view-2',
    value: 'kanban',
    class: '**:w-full ring'
  },
  {
    label: 'Table',
    icon: 'i-ri-table-view',
    value: 'table',
    class: '**:w-full ring'
  }
]
const onlineIndicatorColor = ref('warning')
const onlineStatus = ref('pending')
const columnColors = ['bg-secondary outline-secondary', 'bg-primary outline-primary', 'bg-tertiary outline-tertiary', 'bg-quaternary outline-quaternary', 'bg-quinary outline-quinary']

const refresh = async _ => {
  await refreshOrders()
}

const {
  data: kanbanColumns,
  pending: loadingOrders,
  refresh: refreshOrders,
} = await useLazyFetch(_ => `/api/workspaces/${wsId.value}/orders`, {
  server: false,
  key: `orders-${wsId.value}`,
  watch: [wsId],
})
const onlineIndicatorClasses = computed(_ => [
  onlineIndicatorColor === 'success' && 'animate-pulse',
  `bg-${onlineIndicatorColor.value}`,
])
const isMobile = computed(_ => {
  if (import.meta.client) return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})
</script>

<template>
  <div :class="{'h-fit': !loadingOrders && kanbanColumns?.length > 0}"
       class="flex flex-col gap-4 pb-0 size-full">
    <header class="flex max-lg:flex-col-reverse lg:justify-between gap-4 lg:items-center w-full">
      <div class="flex items-center gap-2">
        <UTabs v-model="activeTab" :content="false" :items="tabItems"
               class="**:cursor-pointer max-lg:w-full max-lg:*:*:nth-3:w-full max-lg:*:*:nth-2:w-full" variant="link"/>
      </div>
      <div class="flex w-full items-center justify-between gap-2">
        <UInput v-model="searchQuery"
                class="w-full lg:max-w-md [&>input]:rounded-xl [&>input]:ps-10 [&>input]:pe-10 [&>input]:py-2"
                leadingIcon="i-ri-search-line"
                placeholder="Search..." variant="soft">
          <template v-if="searchQuery?.length" #trailing>
            <UButton
              aria-label="Clear input"
              class="cursor-pointer"
              color="neutral"
              icon="i-ri-close-fill"
              size="sm"
              variant="link"
              @click="searchQuery = ''"
            />
          </template>
        </UInput>
        <div class="flex gap-2 items-center">
          <UButton class="p-2.5 cursor-pointer opacity-60" color="neutral" variant="link"
                   @click="newOrderModalOpened = true">
            <template #trailing>
              <UIcon class="size-4.5" name="i-ri-settings-2-fill"/>
            </template>
          </UButton>
          <div
            class="px-3.5 py-3.5 xs:py-2.5 flex items-center gap-2 ring ring-default rounded-xl bg-muted/50 select-none">
            <div :class="onlineIndicatorClasses" class="size-2 rounded-full"/>
            <span class="uppercase text-xs text-toned max-xs:hidden">{{ onlineStatus }}</span>
          </div>
          <UButton class="xs:px-4 px-2.5 xs:py-2 py-2.5 rounded-xl cursor-pointer" color="primary"
                   @click="newOrderModalOpened = true">
            <template #trailing>
              <UIcon class="size-4.5" name="i-ri-add-fill"/>
            </template>
            <template #default>
              <span class="max-xs:hidden">New</span>
            </template>
          </UButton>
        </div>
      </div>
    </header>
    <section v-if="kanbanColumns && !loadingOrders" class="size-full">
      <div v-if="activeTab === 'kanban'" class="size-full">
        <div
          class="size-full xs:divide-x divide-accented/50 dark:bg-muted bg-accented/50 rounded-2xl animate-fade-up animate-ease-out flex overflow-x-auto snap-x *:snap-start snap-mandatory">
          <div v-for="(column, columnIndex) in kanbanColumns"
               class="flex flex-col 2xl:min-w-1/6 2xl:w-full xl:min-w-1/4 lg:min-w-1/3 sm:min-w-1/2 min-w-full">
            <div
              class="w-full ps-4 pe-2 py-3 select-none flex flex-row items-center justify-between gap-2 sticky top-0">
              <div class="flex gap-2 items-center">
                <div :class="[columnColors[columnIndex % columnColors.length]]"
                     class="rounded-full min-h-2 min-w-2 max-h-2 max-w-2 outline outline-offset-2"/>
                <span class="font-semibold text-sm text-muted whitespace-nowrap">{{ column.title }}</span>
                <div class="dark:bg-elevated/50 bg-muted rounded-lg px-2 py-0.5 text-sm font-semibold text-muted">
                  {{ column.orders.length }}
                </div>
              </div>
              <UButton class="cursor-pointer" color="neutral" icon="i-ri-more-fill"
                       variant="link"/>
            </div>
            <Draggable
              v-if="kanbanColumns.some(column => column.orders.length > 0)"
              v-model="column.orders"
              :disabled="isMobile"
              class="h-full px-2 pb-2 space-y-3 no-scrollbar overflow-y-auto"
              drag-class="dragged"
              ghost-class="ghost"
              group="cards"
              item-key="id">
              <template #item="{element}">
                <OrderCard :key="element.id"
                           :customerName="element.customer.fullName"
                           :due="element.deadline" :items="element.items" :numberOfLinks="element.links.length"
                           :priority="element.priority" :source="element.source" :title="element.title"
                           :totalCost="element.totalCost"/>
              </template>
            </Draggable>
            <div v-else class="size-full min-h-32 p-2">
              <div
                class="size-full border-2 border-accented rounded-xl border-dashed min-h-32 grid place-content-center">
                <span class="text-dimmed/50 select-none">ᗜ˰ᗜ</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div v-else-if="activeTab === 'table'" class="size-full">

      </div>
    </section>
    <section v-else class="size-full flex max-xs:flex-col gap-2">
      <USkeleton v-for="(_, i) in 5" :style="{'animationDelay': `${i * 300}ms`}"
                 class="max-xs:w-full w-1/5 max-xs:h-32 h-full rounded-lg"/>
    </section>
  </div>
</template>

<style>
.ghost > * > * {
  opacity: 0;
}

.ghost {
  opacity: 50%;
  border-radius: 0.5rem;
  border: 2px dashed var(--ui-color-neutral-500);
}


.dragged > * {
  @apply rotate-6;
}
</style>
