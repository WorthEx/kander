<script setup>
import Draggable from 'vuedraggable'

definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const wsId = computed(() => route.params.wsId)
const toaster = useToast()
const notif = useNotification(toaster)
const {loadingOrders, cachedOrderColumns} = useOrders()
const {data: currentWorkspace} = useNuxtData('currentWorkspace')
const {addColumn, removeColumn, renameColumn} = useColumns()
const {$kanbanWs} = useNuxtApp()

const newButtonDropdownItems = computed(_ => [
  {
    label: 'Order',
    onSelect: _ => newOrderSlideoverOpened.value = true
  },
  {
    label: 'Column',
    onSelect: _ => {
      if (cachedOrderColumns.value.length === 7) {
        notif.info("You cannot add more than 7 columns. Sorry, we're really broke.")
        return
      }
      newColumnSlideoverOpened.value = true
    },
    disabled: currentWorkspace.value?.workspaceMember?.role !== 'admin'
  },
])
const getColumnDropdownItems = columnId => [
  {
    label: 'Hide',
    icon: 'i-ri-eye-off-fill',
    onSelect: _ => {
    },
    class: 'cursor-pointer'
  },
  {
    label: 'Rename',
    icon: 'i-ri-edit-2-fill',
    onSelect: _ => {
      columnToRenameId.value = columnId
      updatedColumnTitle.value = cachedOrderColumns.value.find(column => column.id === columnId).title
      renameColumnSlideoverOpened.value = true
    },
    disabled: currentWorkspace.value?.workspaceMember?.role !== 'admin',
    class: 'cursor-pointer',
  },
  {
    label: 'Remove',
    icon: 'i-ri-delete-bin-6-fill',
    color: 'error',
    onSelect: _ => {
      const column = cachedOrderColumns.value.find(column => column.id === columnId)
      if (column.isSystem) {
        notif.warning('You can NEVER remove a system column. Rules are rules.')
        return
      }
      if (column.orders.length > 0) {
        notif.warning('You cannot remove a column that still has orders in it. Please remove them beforehand.')
        return
      }
      columnToRemoveId.value = columnId
      removeColumnSlideoverOpened.value = true
    },
    disabled: currentWorkspace.value?.workspaceMember?.role !== 'admin',
    class: 'cursor-pointer'
  },
]

const searchQuery = ref("")
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
const columnColors = ['bg-secondary outline-secondary', 'bg-primary outline-primary', 'bg-tertiary outline-tertiary', 'bg-quaternary outline-quaternary', 'bg-quinary outline-quinary']
const searchExpanded = ref(false)

const newOrderSlideoverOpened = ref(false)
const settingsSlideoverOpened = ref(false)
const newColumnSlideoverOpened = ref(false)
const removeColumnSlideoverOpened = ref(false)
const renameColumnSlideoverOpened = ref(false)

const newColumnTitle = ref('')
const columnToRemoveId = ref(null)
const updatedColumnTitle = ref('')
const columnToRenameId = ref(null)

const addingColumn = ref(false)
const removingColumn = ref(false)
const renamingColumn = ref(false)

const handleRemoveColumn = async _ => {
  removingColumn.value = true
  try {
    await removeColumn(columnToRemoveId.value, wsId.value)
    notif.success("Successfully removed column!")
    $kanbanWs.columnActions.delete(columnToRemoveId.value)
  } catch {
    notif.error("An issue occurred while removing column. Try again later.")
  } finally {
    removingColumn.value = false
    removeColumnSlideoverOpened.value = false
  }
}

const handleAddColumn = async _ => {
  if (newColumnTitle.value.trim() === '') return
  addingColumn.value = true
  try {
    const newColumn = await addColumn(newColumnTitle.value, wsId.value)
    notif.success("Successfully added new column!")
    $kanbanWs.columnActions.create(newColumn)
  } catch {
    notif.error("An issue occurred while adding new column. Try again later.")
  } finally {
    addingColumn.value = false
    newColumnTitle.value = ''
    newColumnSlideoverOpened.value = false
  }
}

const handleRenameColumn = async _ => {
  if (updatedColumnTitle.value.trim() === '') return
  const column = cachedOrderColumns.value.find(column => column.id === columnToRenameId.value)
  if (column.title === updatedColumnTitle.value) {
    renameColumnSlideoverOpened.value = false
    return
  }

  renamingColumn.value = true
  try {
    await renameColumn(columnToRenameId.value, updatedColumnTitle.value, wsId.value)
    notif.success("Successfully renamed column!")
    $kanbanWs.columnActions.update(columnToRenameId.value, {title: updatedColumnTitle.value})
  } catch {
    notif.error("An issue occurred while renaming a column. Try again later.")
  } finally {
    renamingColumn.value = false
    updatedColumnTitle.value = ''
    renameColumnSlideoverOpened.value = false
  }
}


const foundOrders = computed(() => {
  if (!cachedOrderColumns.value) return [];

  return cachedOrderColumns.value.flatMap(column =>
    column.orders
      .filter(order => {
        return order.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          order.customer.fullName.toLowerCase().includes(searchQuery.value.toLowerCase())
      })
      .map(order => order.id)
  );
})
const onlineIndicatorClasses = computed(_ => {
  const color = $kanbanWs.semanticStatus.value === 'online' ? 'success' :
    $kanbanWs.semanticStatus.value === 'offline' ? 'error' : 'warning'
  return [
    $kanbanWs.semanticStatus.value === 'online' && 'animate-pulse',
    `bg-${color}`,
  ]
})
const isMobile = computed(_ => {
  if (import.meta.client) return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})
const getCurrencySymbol = computed(_ => {
  if (!currentWorkspace.value) return ""
  const currencyObject = currencies.find(currency => currency.code === currentWorkspace.value?.workspace?.currency)
  if (!currencyObject) return currentWorkspace.value?.workspace?.currency
  return currencyObject.symbol_native
})

watch(searchQuery, async _ => {
  searchExpanded.value = searchQuery.value.length > 0
})

</script>

<template>
  <div :class="{'h-fit': !loadingOrders && cachedOrderColumns?.length > 0}"
       class="flex flex-col gap-4 pb-0 size-full">
    <header class="flex max-lg:flex-col-reverse lg:justify-between gap-4 lg:items-center w-full">
      <div class="flex items-center gap-2">
        <UTabs v-model="activeTab" :content="false" :items="tabItems"
               class="**:cursor-pointer max-lg:w-full max-lg:*:*:nth-3:w-full max-lg:*:*:nth-2:w-full *:*:ease-out"
               variant="link"/>
      </div>
      <div class="flex w-full items-center justify-between gap-2">
        <UInput v-model="searchQuery"
                class="w-full lg:max-w-md [&>input]:rounded-xl [&>input]:ps-10 [&>input]:pe-10 [&>input]:py-2"
                leadingIcon="i-ri-search-line"
                placeholder="Search..."
                variant="soft">
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
        <div :class="{'max-xs:hidden': searchExpanded}" class="flex gap-2 items-center">
          <UButton class="p-2.25 cursor-pointer opacity-60 rounded-xl" color="neutral" variant="outline"
                   @click="settingsSlideoverOpened = true">
            <template #trailing>
              <UIcon class="size-4.5" name="i-ri-settings-2-fill"/>
            </template>
          </UButton>
          <ClientOnly>
            <div
              class="px-2.25 py-2.5 flex items-center gap-2 ring ring-default rounded-xl bg-muted/50 select-none">
              <div :class="onlineIndicatorClasses" class="size-2 rounded-full"/>
              <span class="uppercase text-xs text-toned ">{{ $kanbanWs.semanticStatus }}</span>
            </div>
          </ClientOnly>
          <UDropdownMenu
            :content="{
            align: 'end',
            side: 'bottom',
            sideOffset: 8,
            class: '*:*:*:pe-8 *:*:*:ps-2 *:*:*:py-2 *:*:*:cursor-pointer *:*:*:min-w-32 rounded-xl'
          }"
            :items="newButtonDropdownItems">
            <UButton class="xs:px-4 px-2.5 xs:py-2 py-2.5 rounded-xl cursor-pointer" color="primary">
              <template #trailing>
                <UIcon class="size-4.5" name="i-ri-add-fill"/>
              </template>
              <template #default>
                <span class="max-xs:hidden">New</span>
              </template>
            </UButton>
          </UDropdownMenu>
        </div>
      </div>
    </header>
    <UAlert
      v-if="searchQuery.length > 0"
      :title="`Found ${foundOrders.length} orders for '${searchQuery}'`"
      class="rounded-xl"
      color="neutral"
      icon="i-ri-search-2-line"
      variant="subtle"
    />
    <section v-if="cachedOrderColumns && !loadingOrders && currentWorkspace" class="size-full">
      <div v-if="activeTab === 'kanban'" class="size-full">
        <div
          class="size-full xs:divide-x divide-accented/50 dark:bg-muted bg-accented/50 rounded-2xl animate-fade-up animate-ease-out flex overflow-x-auto snap-x *:snap-start snap-mandatory">
          <div v-for="(column, columnIndex) in cachedOrderColumns"
               class="flex flex-col 2xl:min-w-1/6 2xl:w-full xl:min-w-1/4 lg:min-w-1/3 sm:min-w-1/2 min-w-full relative group snap-always">
            <div class="w-full max-w-full ps-4 pe-2 py-3 select-none flex flex-row items-center justify-between gap-2">
              <div class="flex gap-3 items-center max-w-[calc(100%-2.5rem)]">
                <div :class="[columnColors[columnIndex % columnColors.length]]"
                     class="rounded-full min-h-2 min-w-2 max-h-2 max-w-2 outline outline-offset-2"/>
                <span class="font-semibold text-sm text-muted whitespace-nowrap truncate cursor-pointer"
                      @click="_ => {
                        columnToRenameId = column.id
                        updatedColumnTitle = cachedOrderColumns.find(c => c.id === column.id).title
                        renameColumnSlideoverOpened = true
                      }">{{ column.title }}</span>
                <div class="dark:bg-elevated/50 bg-muted rounded-lg px-2 py-0.5 text-sm font-semibold text-muted">
                  {{ column.orders.length }}
                </div>
              </div>
              <UDropdownMenu
                :content="{
                  align: 'end',
                  side: 'bottom',
                  sideOffset: 8,
                  class: '*:*:*:pe-8 *:*:*:ps-2 *:*:*:py-2  *:*:*:min-w-32 rounded-xl'
                }"
                :items="getColumnDropdownItems(column.id)">
                <UButton class="cursor-pointer" color="neutral" icon="i-ri-more-fill"
                         variant="link"/>
              </UDropdownMenu>
            </div>
            <Draggable
              v-if="cachedOrderColumns.some(column => column.orders.length > 0)"
              v-model="column.orders"
              :disabled="isMobile"
              class="h-full px-2 pb-2 space-y-3"
              drag-class="dragged"
              ghost-class="ghost"
              group="cards"
              item-key="id">
              <template #item="{element}">
                <OrderCard :key="element.id"
                           :currencySymbol="getCurrencySymbol"
                           :customerName="element.customer.fullName"
                           :dimmed="!foundOrders.includes(element.id) && searchQuery.length > 0"
                           :due="element.deadline" :items="element.items" :numberOfLinks="element.links.length"
                           :priority="element.priority" :source="element.source" :title="element.title"
                           :totalCost="element.totalCost"/>
              </template>
            </Draggable>
            <!-- if no orders at all -->
            <div v-else class="size-full min-h-32 p-2">
              <div
                class="size-full outline outline-neutral-500/50 rounded-xl outline-dashed min-h-47 grid place-content-center">
                <span class="text-dimmed/50 select-none">ᗜ˰ᗜ</span>
              </div>
            </div>
            <!-- if no orders in this column but some in other ones -->
            <div v-if="column.orders.length < 1 && cachedOrderColumns.some(column => column.orders.length > 0)"
                 class="absolute top-12 w-full p-2">
              <div
                class="w-full min-h-47 outline outline-neutral-500/50 rounded-xl outline-dashed  grid place-content-center">
                <span class="text-dimmed/50 select-none">ᗜ˰ᗜ</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div v-else-if="activeTab === 'table'" class="size-full">

      </div>
    </section>
    <section v-else class="size-full flex max-md:flex-col gap-2">
      <USkeleton v-for="(_, i) in 5" :style="{'animationDelay': `${i * 300}ms`}"
                 class="max-md:w-full w-1/5 max-md:h-56 h-full rounded-lg"/>
    </section>
    <USlideover v-model:open="newColumnSlideoverOpened" title="New kanban column">
      <template #body="{close}">
        <UFormField label="Column title" name="title">
          <UInput v-model="newColumnTitle" :maxlength="42"
                  class="w-full [&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2"/>
        </UFormField>
        <div
          class="flex mt-4 justify-end w-full max-sm:*:w-full gap-2 *:cursor-pointer *:select-none *:justify-center">
          <UButton class="rounded-xl px-4 py-2" color="neutral" label="Cancel" variant="outline" @click="_ => {
                  close()
                  newColumnTitle = ''
                }"/>
          <UButton :disabled="newColumnTitle.trim().length < 1" :loading="addingColumn" class="rounded-xl px-6 py-2"
                   label="Add" @click="handleAddColumn"/>
        </div>
      </template>
    </USlideover>
    <USlideover v-model:open="removeColumnSlideoverOpened" title="Are you sure?">
      <template #body="{close}">
        <p class="text">You're about to entirely delete a column from this workspace scope.</p>
        <div class="flex mt-4 justify-end w-full max-sm:*:w-full gap-2 *:cursor-pointer *:select-none *:justify-center">
          <UButton class="rounded-xl px-4 py-2" color="neutral" label="Cancel" variant="outline" @click="close"/>
          <UButton :loading="removingColumn" class="rounded-xl px-6 py-2" color="error"
                   label="Delete" @click="handleRemoveColumn"/>
        </div>
      </template>
    </USlideover>
    <USlideover v-model:open="renameColumnSlideoverOpened" title="Rename existing column">
      <template #body="{close}">
        <div class="flex flex-col space-y-4"><p>You're updating column's name from
          <span
            class="break-keep whitespace-nowrap px-1 py-0.2 rounded-md border border-primary bg-muted text-primary border-dashed">
            {{ columnToRenameId ? cachedOrderColumns.find(c => c.id === columnToRenameId).title : '-' }}</span> to&nbsp;<span
            class="break-keep whitespace-nowrap px-1 py-0.2 rounded-md border border-primary bg-muted text-primary border-dashed">
            {{ updatedColumnTitle ? updatedColumnTitle : '-' }}</span>
        </p>
          <UFormField label="Updated title" name="updatedTitle">
            <UInput v-model="updatedColumnTitle" :maxlength="42"
                    class="w-full [&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2"/>
          </UFormField>
          <div
            class="flex justify-end w-full max-sm:*:w-full gap-2 *:cursor-pointer *:select-none *:justify-center">
            <UButton class="rounded-xl px-4 py-2" color="neutral" label="Cancel" variant="outline" @click="_ => {
                  close()
                  updatedColumnTitle = ''
                }"/>
            <UButton
              :disabled="updatedColumnTitle.trim().length < 1"
              :loading="renamingColumn"
              class="rounded-xl px-6 py-2"
              label="Save" @click="handleRenameColumn"/>
          </div>
        </div>
      </template>
    </USlideover>
    <USlideover v-model:open="newOrderSlideoverOpened" :ui="{content: 'max-w-lg'}">
      <template #body>
        <div class="">bruh</div>
      </template>
    </USlideover>
  </div>
</template>

<style>
.ghost > * > * {
  opacity: 0;
}

.ghost {
  opacity: 80%;

  & > * {
    mask: none;
  }
}


.dragged > * {
  @apply rotate-6;
}
</style>
