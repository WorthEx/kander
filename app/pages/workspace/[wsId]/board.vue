<script setup>
import Draggable from 'vuedraggable'
import {z} from "zod";
import {CalendarDate, getLocalTimeZone, today} from '@internationalized/date'
import {LexoRank} from "lexorank";
import {useDebounceFn} from "@vueuse/core";

definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const wsId = computed(() => route.params.wsId)
const toaster = useToast()
const notif = useNotification(toaster)
const {loadingOrders, cachedOrderColumns, createOrder, moveOrder} = useOrders()
const {data: currentWorkspace} = useNuxtData('currentWorkspace')
const {addColumn, removeColumn, renameColumn} = useColumns()
const {$kanbanWs} = useNuxtApp()
const {showColumn, hideColumn, preferences} = usePreferences()

const newButtonDropdownItems = computed(_ => [
  {
    label: 'Order',
    onSelect: async _ => {
      newOrderSlideoverOpened.value = true
      if (customerList.value?.length < 1) await fetchCustomers()
      if (servicesList.value?.length < 1) await fetchServices()
    }
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
    label: preferences.value.hiddenColumnIds.includes(columnId) ? 'Show' : 'Hide',
    icon: preferences.value.hiddenColumnIds.includes(columnId) ? 'i-ri-eye-fill' : 'i-ri-eye-off-fill',
    onSelect: _ => {
      preferences.value.hiddenColumnIds.includes(columnId) ? showColumn(columnId) : hideColumn(columnId)
    },
    class: 'cursor-pointer',
    disabled: (_ => {
      const column = cachedOrderColumns.value.find(column => column.id === columnId)
      return column.isSystem === true
    })()
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
  // {
  //   label: 'Table',
  //   icon: 'i-ri-table-view',
  //   value: 'table',
  //   class: '**:w-full ring'
  // }
]
const columnColors = ['bg-secondary outline-secondary', 'bg-primary outline-primary', 'bg-tertiary outline-tertiary', 'bg-quaternary outline-quaternary', 'bg-quinary outline-quinary']
const searchExpanded = ref(false)
const customerList = ref([])
const servicesList = ref([])
const newItemErrorState = ref(false)
const deadlineDateInput = useTemplateRef('deadlineDateInput')

const newOrderSlideoverOpened = ref(false)
const newColumnSlideoverOpened = ref(false)
const removeColumnSlideoverOpened = ref(false)
const renameColumnSlideoverOpened = ref(false)

const newColumnTitle = ref('')
const columnToRemoveId = ref(null)
const updatedColumnTitle = ref('')
const columnToRenameId = ref(null)
const newOrderState = reactive({
  title: "",
  description: "",
  customerId: null,
  priority: "medium",
  deadline: today(getLocalTimeZone()).add({days: 1}),
  items: [],
})
const newItemState = reactive({
  serviceId: null,
  quantity: 1,
  price: 0.00,
})

const addingColumn = ref(false)
const removingColumn = ref(false)
const renamingColumn = ref(false)
const creatingOrder = ref(false)

const newOrderSchema = z.object({
  title: z.string()
    .min(1, "Order title is required.")
    .max(255, "Order title must contain under 255 characters."),
  description: z.string()
    .max(512, "Order description must contain under 512 characters.")
    .optional(),
  deadline: z.custom(
    (data) => data instanceof CalendarDate,
    {message: 'Invalid deadline date'}
  ),
  customerId: z.string({error: 'Customer is required.'}),
  priority: z.enum(['low', 'medium', 'high']),
  items: z.array(z.object({
    serviceId: z.string({error: 'Service is required.'}),
    quantity: z.number().min(1, "Item quantity must be greater than 0."),
    price: z.float64().min(0.01, "Item price is required."),
  })).nonempty("Order must have at least one item."),
})

const newItemSchema = z.object({
  serviceId: z.string({error: 'Service is required.'}),
  price: z.float64().min(0.01, "Price is required."),
  quantity: z.int().min(1, "C'mon, you need at least one."),
})

const fetchCustomers = async _ => {
  customerList.value = await $fetch(`/api/workspaces/${wsId.value}/customers`, {
    method: 'GET',
    credentials: 'include',
  })
}

const fetchServices = async _ => {
  servicesList.value = await $fetch(`/api/workspaces/${wsId.value}/services/active`, {
    method: 'GET',
    credentials: 'include',
  })
}

const clearNewOrderState = _ => {
  newOrderState.title = ""
  newOrderState.description = ""
  newOrderState.customerId = ""
  newOrderState.priority = "medium"
  newOrderState.deadline = today(getLocalTimeZone()).add({days: 1})
  newOrderState.items = []
}

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

const handleAddItem = _ => {
  try {
    newItemSchema.parse(newItemState)
    newItemErrorState.value = false
    newOrderState.items.push({
      ...newItemState,
      title: servicesList.value.find(s => s.id === newItemState.serviceId)?.title
    })
    newItemState.serviceId = null
    newItemState.quantity = 1
    newItemState.price = 0.00
    newItemErrorState.value = false
  } catch {
    newItemErrorState.value = true
  }
}

const handleRemoveItem = (itemIndex) => {
  newOrderState.items = newOrderState.items.filter((_, i) => i !== itemIndex)
}

const handleCreateOrder = async event => {
  if (!event.data) return
  creatingOrder.value = true
  try {
    await createOrder({
      ...event.data,
      deadline: event.data.deadline.toString()
    }, wsId.value)
    notif.success("A new order has been placed!")
    newOrderSlideoverOpened.value = false
    clearNewOrderState()
  } catch {
    notif.error("An issue occurred while creating an order. Try again later.")
  } finally {
    creatingOrder.value = false
  }
}

const getColumnOrders = (columnId) => {
  const columnOrders = [...cachedOrderColumns.value.find(column => column.id === columnId)?.orders]
  if (!columnOrders) return []
  return columnOrders
    .sort((a, b) => {
      try {
        const rankA = LexoRank.parse(a.position)
        const rankB = LexoRank.parse(b.position)
        return rankA.compareTo(rankB)
      } catch {
        return 0
      }
    })
}

const calculateNewPosition = (orders, newIndex, movedOrderId) => {
  const cardsWithoutMoved = orders.filter(o => o.id !== movedOrderId)

  try {
    // Case 1: First order in column or moved to first position
    if (cardsWithoutMoved.length === 0 || newIndex === 0) {
      if (cardsWithoutMoved.length === 0) {
        return LexoRank.middle().toString()
      } else {
        const nextRank = LexoRank.parse(cardsWithoutMoved[0].position)
        return nextRank.genPrev().toString()
      }
    }

    // Case 2: Moved to the last position
    if (newIndex >= cardsWithoutMoved.length) {
      const prevRank = LexoRank.parse(cardsWithoutMoved[cardsWithoutMoved.length - 1].position)
      return prevRank.genNext().toString()
    }

    // Case 3: Order between some others
    const prevRank = LexoRank.parse(cardsWithoutMoved[newIndex - 1].position)
    const nextRank = LexoRank.parse(cardsWithoutMoved[newIndex].position)
    return prevRank.between(nextRank).toString()

  } catch (error) {
    console.error('LexoRank calculation error:', error)
    return LexoRank.middle().toString()
  }
}

const handleOrderMoved = (event, targetColumn) => {
  if (event.removed) return
  debouncedOrderMoved(event, targetColumn)
}

const debouncedOrderMoved = useDebounceFn(async (event, targetColumn) => {
  let movedCard = null
  let newIndex = -1

  // Case 1: Moved between columns
  if (event.added) {
    movedCard = event.added.element
    newIndex = event.added.newIndex
  }
  // Case 2: Moved within one column
  else if (event.moved) {
    movedCard = event.moved.element
    newIndex = event.moved.newIndex
  }

  // Process if move confirmed
  if (movedCard && newIndex !== -1) {
    const targetOrders = getColumnOrders(targetColumn.id)
    const newPosition = calculateNewPosition(targetOrders, newIndex, movedCard.id)
    // local change
    const order = targetColumn.orders.find(order => order.id === movedCard.id)
    if (order) {
      order.position = newPosition
      order.columnId = targetColumn.id
    }
    // remote change
    // console.log(`moved card id: ${movedCard.id} to column ${targetColumn.id} with position: ${newPosition}`)
    try {
      await moveOrder(movedCard.id, newPosition, targetColumn.id, wsId.value)
      $kanbanWs.orderActions.move(movedCard.id, newPosition, targetColumn.id)
    } catch {
      notif.error("An issue occurred while board updating. Try again later.")
    }
  }
}, 300, {
  maxWait: 3000,
})


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
const shownColumns = computed(() => {
  return cachedOrderColumns.value?.filter(column => !preferences.value.hiddenColumnIds.includes(column.id) || column.isSystem === true) || []
})
const hiddenColumns = computed(() => {
  return cachedOrderColumns.value?.filter(column => preferences.value.hiddenColumnIds.includes(column.id) && column.isSystem !== true) || []
})
const prioritiesList = computed(_ => {
  const values = Object.values(Priority).splice(0, Object.values(Priority).length / 2).map(p => p.toLowerCase())
  return values.map(value => ({
    label: value.charAt(0).toUpperCase() + value.slice(1),
    value,
    chip: {
      color: value === 'low' ? 'info' :
        value === 'medium' ? 'warning' :
          'error',
      label: value.charAt(0).toUpperCase() + value.slice(1),
    }
  }))
})

watch(searchQuery, async _ => {
  searchExpanded.value = searchQuery.value.length > 0
})

watch(_ => newItemState.serviceId, (newServiceId, oldServiceId) => {
  // automatically fetch this service base price
  if (oldServiceId !== newServiceId) {
    newItemState.price = servicesList.value.find(s => s.id === newItemState.serviceId)?.basePrice || 0.00
  }
})

</script>

<template>
  <div :class="{'h-fit': !loadingOrders && cachedOrderColumns?.length > 0}"
       class="flex flex-col gap-4 pb-0 size-full">
    <header class="flex max-lg:flex-col-reverse lg:justify-between gap-4 lg:items-center w-full">
      <!--      <div class="flex items-center gap-2">-->
      <!--        <UTabs v-model="activeTab" :content="false" :items="tabItems"-->
      <!--               class="**:cursor-pointer max-lg:w-full max-lg:*:*:nth-3:w-full max-lg:*:*:nth-2:w-full *:*:ease-out"-->
      <!--               variant="link"/>-->
      <!--      </div>-->
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
          <!--          <UButton class="p-2.25 cursor-pointer opacity-60 rounded-xl" color="neutral" variant="outline"-->
          <!--                   @click="settingsSlideoverOpened = true">-->
          <!--            <template #trailing>-->
          <!--              <UIcon class="size-4.5" name="i-ri-settings-2-fill"/>-->
          <!--            </template>-->
          <!--          </UButton>-->
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
      <div v-if="activeTab === 'kanban'" class="size-full flex gap-4">
        <div
          class="size-full xs:divide-x divide-accented/50 dark:bg-muted bg-accented/50 rounded-2xl animate-fade-up animate-ease-out flex overflow-x-auto snap-x *:snap-start snap-mandatory">
          <div v-for="(column, columnIndex) in shownColumns"
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
              item-key="id"
              @change="handleOrderMoved($event, column)">
              <template #item="{element}">
                <OrderCard :key="element.id"
                           :currencySymbol="getCurrencySymbol"
                           :dimmed="!foundOrders.includes(element.id) && searchQuery.length > 0"
                           :order="element"/>
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
          <div class="flex ms-auto divide-x divide-default">
            <div v-for="(hiddenColumn, columnIndex) in hiddenColumns"
                 class="flex flex-col py-6">
              <div
                class="w-full px-2 select-none flex flex-col items-center gap-4">
                <div :class="[columnColors[columnIndex % columnColors.length]]"
                     class="rounded-full min-h-2 min-w-2 max-h-2 max-w-2 outline outline-offset-2"/>
                <div class="dark:bg-elevated/50 bg-muted rounded-lg px-2 py-0.5 text-sm font-semibold text-muted">
                  {{ hiddenColumn.orders.length }}
                </div>
                <UDropdownMenu
                  :content="{
                  align: 'end',
                  side: 'bottom',
                  sideOffset: 8,
                  class: '*:*:*:pe-8 *:*:*:ps-2 *:*:*:py-2  *:*:*:min-w-32 rounded-xl'
                }"
                  :items="getColumnDropdownItems(hiddenColumn.id)">
                  <UButton class="cursor-pointer" color="neutral" icon="i-ri-more-fill"
                           variant="link"/>
                </UDropdownMenu>
              </div>
              <span class="[writing-mode:vertical-lr] mt-6 my-auto text-sm text-muted">{{ hiddenColumn.title }}</span>
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
        <p class="text">You're about to entirely delete column <span
          class="break-keep whitespace-nowrap px-1 py-0.5 rounded-md border border-primary bg-muted text-primary border-dashed">
            {{ cachedOrderColumns.find(c => c.id === columnToRemoveId)?.title }}</span> from this workspace scope.</p>
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
    <USlideover v-model:open="newOrderSlideoverOpened" :ui="{content: 'max-w-lg'}" title="New order">
      <template #body="{close}">
        <UForm :schema="newOrderSchema" :state="newOrderState" :validate-on="['change', 'input']"
               class="space-y-4" @submit="handleCreateOrder">
          <UFormField label="Title" name="title" required>
            <UInput v-model="newOrderState.title" class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full"
                    placeholder="Promotion video for Crunchyroll"/>
          </UFormField>
          <UFormField autoresize label="Description" name="description">
            <UTextarea v-model="newOrderState.description" :rows="3"
                       class="*:rounded-xl *:px-3 *:py-2 w-full"
                       placeholder="The project is really complicated. GL HF!"/>
          </UFormField>
          <UFormField class="w-full" label="Customer" name="customerId" required>
            <USelect v-model="newOrderState.customerId"
                     :disabled="!customerList"
                     :items="customerList" class="w-full rounded-xl px-3 py-2"
                     labelKey="fullName" valueKey="id">
              <template #default="{modelValue}">
                <div v-if="modelValue" class="flex flex-col gap-1 text-start">
                  <span>{{ customerList.find(c => c.id === modelValue)?.fullName }}</span>
                  <span class="text-dimmed text-xs">{{
                      customerList.find(c => c.id === modelValue)?.phone
                    }}</span>
                </div>
                <span v-else class="text-dimmed">Select customer</span>
              </template>
            </USelect>
          </UFormField>
          <UFormField class="w-full" label="Items" name="items" required>
            <div class="flex flex-col gap-2">
              <section class="rounded-xl border border-default p-2 flex flex-col gap-2">
                <UFormField label="Service" required>
                  <USelect v-model="newItemState.serviceId" :color="newItemErrorState ? 'error' : 'primary'"
                           :disabled="!servicesList"
                           :highlight="newItemErrorState"
                           :items="servicesList" class="w-full rounded-xl px-3 py-2"
                           labelKey="title" valueKey="id"/>
                </UFormField>
                <div class="w-full flex gap-2 *:basis-1/2">
                  <UFormField label="Single service price" required>
                    <UInputNumber v-model="newItemState.price" :color="newItemErrorState ? 'error' : 'primary'"
                                  :format-options="{minimumFractionDigits: 2, maximumFractionDigits: 2, roundingIncrement: 1}"
                                  :highlight="newItemErrorState"
                                  :min="0.01"
                                  :step="0.01"
                                  class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full **:text-center"
                    />
                  </UFormField>
                  <UFormField label="Quantity of services" required>
                    <UInputNumber v-model="newItemState.quantity" :color="newItemErrorState ? 'error' : 'primary'"
                                  :highlight="newItemErrorState"
                                  :min="1"
                                  :step="1"
                                  class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full **:text-center"
                    />
                  </UFormField>
                </div>
                <UButton class="w-full justify-center cursor-pointer rounded-xl px-3 py-2" color="secondary"
                         icon="i-ri-add-fill"
                         label="Add"
                         variant="soft"
                         @click="handleAddItem"/>
              </section>
              <OrderFormItem v-for="(item, itemIndex) in newOrderState.items"
                             :currencySymbol="getCurrencySymbol"
                             :index="itemIndex"
                             :price="item.price"
                             :quantity="item.quantity"
                             :serviceId="item.serviceId"
                             :title="item.title"
                             @remove="handleRemoveItem"/>
            </div>
          </UFormField>
          <div class="w-full flex gap-2 *:basis-1/2">
            <UFormField class="w-full" label="Priority" name="priority" required>
              <USelect v-model="newOrderState.priority"
                       :items="prioritiesList" class="w-full rounded-xl px-3 py-2 capitalize">
                <template #leading="{ modelValue, ui }">
                  <UChip
                    v-if="modelValue"
                    :class="ui.itemLeadingChip()"
                    :size="ui.itemLeadingChipSize()"
                    inset
                    standalone
                    v-bind="prioritiesList.find(p => p.value === modelValue)?.chip"
                  />
                </template>
              </USelect>
            </UFormField>
            <UFormField class="w-full" label="Deadline" name="deadline" required>
              <UInputDate ref="deadlineDateInput" v-model="newOrderState.deadline" class="rounded-xl py-2 w-full">
                <template #trailing>
                  <UPopover :content="{
                      side: 'bottom',
                      sideOffset: 8,
                      align:'center'
                    }" :reference="deadlineDateInput?.inputsRef[3]?.$el">
                    <UButton
                      class="px-0"
                      color="neutral"
                      icon="i-ri-calendar-fill"
                      size="sm"
                      variant="link"
                    />
                    <template #content>
                      <UCalendar v-model="newOrderState.deadline" class="p-2"/>
                    </template>
                  </UPopover>
                </template>
              </UInputDate>
            </UFormField>
          </div>
          <div
            class="flex mt-6 justify-end *:max-sm:w-full w-full gap-2 *:cursor-pointer *:select-none *:px-4 *:py-2 *:justify-center">
            <UButton class=" rounded-xl px-4 py-2" color="neutral" label="Cancel" variant="outline" @click="_ => {
                      close()
                      clearNewOrderState()
            }"/>
            <UButton :loading="creatingOrder" class=" rounded-xl px-4 py-2" label="Create" type="submit"/>
          </div>
        </UForm>
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
