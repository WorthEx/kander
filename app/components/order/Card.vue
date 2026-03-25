<script setup>
import {z} from "zod";
import {useClipboard} from "@vueuse/core";
import {LexoRank} from "lexorank";

const props = defineProps({
  order: Object,
  dimmed: Boolean,
  currencySymbol: String
})

const columnColors = ['secondary', 'primary', 'tertiary', 'quaternary', 'quinary']

const cachedOrderColumns = useState('cachedOrderColumns')
const {preferences} = usePreferences()
const route = useRoute()
const wsId = computed(() => route.params.wsId)
const toaster = useToast()
const notif = useNotification(toaster)
const {copy} = useClipboard()
const {addItem, removeItem, switchItem, moveOrder, archiveOrder, addResponsible, removeResponsible} = useOrders()
const {$kanbanWs} = useNuxtApp()
const {user} = useAuth()

const descExpanded = ref(false)
const selectedColumn = ref(null)
const servicesList = ref([])
const employeeList = ref([])
const newItemErrorState = ref(false)
const newItemState = reactive({
  serviceId: null,
  quantity: 1,
  price: 0.00,
})
const newResponsibleId = ref(null)

const addingItem = ref(false)
const addingResponsible = ref(false)
const addItemModalOpened = ref(false)
const addResponsibleModalOpened = ref(false)

const newItemSchema = z.object({
  serviceId: z.string({error: 'Service is required.'}),
  price: z.float64().min(0.01, "Price is required."),
  quantity: z.int().min(1, "C'mon, you need at least one."),
})

const getDeadline = computed(_ => {
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
  const doneItems = [...props.order.items.filter(item => item.isDone === true)]
  return doneItems.length / props.order.items.length * 100
})

const slideoverTitle = computed(() => {
  const lastIdSection = props.order?.id ? props.order.id.split('-').at(-1) : ''
  return `Order #${lastIdSection}`
})

const columnItems = computed(() => cachedOrderColumns.value
  .filter(column => !preferences.value.hiddenColumnIds.includes(column.id))
  .map((column, index) => ({
      label: column.title,
      value: column.id,
      chip: {
        color: getColumnColor(index),
        label: column.title,
      }
    }
  )))

const customerFullAddress = computed(_ => buildAddressString(
  props.order.customer.countryCode,
  props.order.customer.city,
  props.order.customer.region,
  props.order.customer.addressLine1,
  props.order.customer.addressLine2,
  props.order.customer.postalCode,
))

const isResponsible = computed(_ => {
  if (!user.value.id) return false
  return props.order.responsibles.some(r => r.id === user.value.id)
})


const getColumnColor = index => columnColors[index % columnColors.length]

const handleSlideoverOpened = async opened => {
  if (opened) {
    selectedColumn.value = props.order.columnId
    await fetchServices()
    await fetchEmployees()
  }
}

const fetchServices = async _ => {
  servicesList.value = await $fetch(`/api/workspaces/${wsId.value}/services/active`, {
    method: 'GET',
    credentials: 'include',
  })
}

const fetchEmployees = async _ => {
  const currentResponsibles = props.order.responsibles.map(r => r.id)
  employeeList.value = await $fetch(`/api/workspaces/${wsId.value}/employees/active`, {
    method: 'GET',
    credentials: 'include',
    query: {
      exclude: currentResponsibles.join(',')
    }
  })
}

const handleAddItem = async _ => {
  // validation
  try {
    newItemSchema.parse(newItemState)
    newItemErrorState.value = false
  } catch {
    newItemErrorState.value = true
    return
  }

  addingItem.value = true
  try {
    const createdItem = await addItem(newItemState, props.order.id, wsId.value)
    // notif.success("Successfully updated order!")
    // local change
    const order = cachedOrderColumns.value.find(column => column.id === props.order.columnId).orders.find(order => order.id === props.order.id)
    order.items.push(createdItem)
    order.totalCost = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    // send ws event
    $kanbanWs.orderActions.update(props.order.id, props.order.columnId, {...order})

    newItemState.quantity = 1

    newItemErrorState.value = false
    addItemModalOpened.value = false
  } catch {
    notif.error("An issue occurred while updating order. Try again later.")
  } finally {
    addingItem.value = false
  }
}

const handleRemoveItem = async itemIndex => {
  try {
    const itemToRemove = props.order.items[itemIndex]
    if (!itemToRemove) return
    await removeItem(itemToRemove.id, props.order.id, wsId.value)
    // notif.success("Successfully updated order!")
    // local change
    const order = cachedOrderColumns.value.find(column => column.id === props.order.columnId).orders.find(order => order.id === props.order.id)
    order.items.splice(itemIndex, 1)
    order.totalCost = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    // send ws event
    $kanbanWs.orderActions.update(props.order.id, props.order.columnId, {...order})
  } catch {
    notif.error("An issue occurred while updating order. Try again later.")
  }
}

const handleSwitchItem = async (itemIndex, done) => {
  try {
    const itemToSwitch = props.order.items[itemIndex]
    if (!itemToSwitch) return
    await switchItem(itemToSwitch.id, props.order.id, done, wsId.value)
    // notif.success("Successfully updated order!")
    // local change
    const order = cachedOrderColumns.value.find(column => column.id === props.order.columnId).orders.find(order => order.id === props.order.id)
    order.items[itemIndex].isDone = done
    // send ws event
    $kanbanWs.orderActions.update(props.order.id, props.order.columnId, {...order})
  } catch {
    notif.error("An issue occurred while updating order. Try again later.")
  }
}

const handleCopyCustomerPhone = _ => {
  copy(props.order.customer.phone)
  notif.success("Phone number copied to clipboard!")
}

const handleChangeColumn = async _ => {
  if (props.order.columnId === selectedColumn.value) return

  const targetColumnOrders = [...cachedOrderColumns.value.find(column => column.id === props.order.columnId)?.orders]
  if (!targetColumnOrders) return
  targetColumnOrders.sort((a, b) => {
    try {
      const rankA = LexoRank.parse(a.position)
      const rankB = LexoRank.parse(b.position)
      return rankA.compareTo(rankB)
    } catch {
      return 0
    }
  })

  let newPosition

  if (targetColumnOrders.length === 0) {
    // empty column
    newPosition = LexoRank.middle().toString()
  } else {
    // non-empty column => generate LexoRank
    const lastOrder = targetColumnOrders.at(-1)
    const lastRank = LexoRank.parse(lastOrder.position)
    newPosition = lastRank.genNext().toString()
  }

  if (newPosition) {
    try {
      await moveOrder(props.order.id, newPosition, selectedColumn.value, wsId.value, true)
    } catch {
      notif.error("An issue occurred while board updating. Try again later.")
    }
  }
}

const handleArchiveOrder = async _ => {
  try {
    await archiveOrder(props.order.id, wsId.value)
    // local change
    const columnOrders = cachedOrderColumns.value.find(column => column.id === props.order.columnId).orders
    const orderIndex = columnOrders.findIndex(order => order.id === props.order.id)
    if (orderIndex === -1) return
    columnOrders.splice(orderIndex, 1)
    // send ws event
    $kanbanWs.orderActions.delete(props.order.id, props.order.columnId)
  } catch (e) {
    notif.error("An issue occurred while updating order. Try again later.")
    console.log(e)
  }
}

const handleAddResponsible = async _ => {
  addingResponsible.value = true
  try {
    await addResponsible(newResponsibleId.value, props.order.id, wsId.value)
    // local change
    const order = cachedOrderColumns.value.find(column => column.id === props.order.columnId).orders.find(order => order.id === props.order.id)
    const newResponsible = employeeList.value.find(e => e.user.id === newResponsibleId.value)
    if (!newResponsible) return
    order.responsibles.push(newResponsible.user)
    employeeList.value = employeeList.value.filter(e => e.user.id !== newResponsibleId.value)
    // send ws event
    $kanbanWs.orderActions.update(props.order.id, props.order.columnId, {...order})

    newResponsibleId.value = null
    addResponsibleModalOpened.value = false
  } catch {
    notif.error("An issue occurred while updating order. Try again later.")
  } finally {
    addingResponsible.value = false
  }
}

const handleRemoveResponsible = async responsibleId => {
  try {
    await removeResponsible(responsibleId, props.order.id, wsId.value)
    // local change
    const order = cachedOrderColumns.value.find(column => column.id === props.order.columnId).orders.find(order => order.id === props.order.id)
    order.responsibles = order.responsibles.filter(r => r.id !== responsibleId)
    // send ws event
    $kanbanWs.orderActions.update(props.order.id, props.order.columnId, {...order})

    newResponsibleId.value = null
    addResponsibleModalOpened.value = false
  } catch {
    notif.error("An issue occurred while updating order. Try again later.")
  }
}

watch(_ => props.order.columnId, _ => {
  selectedColumn.value = props.order.columnId
})

watch(_ => newItemState.serviceId, (newServiceId, oldServiceId) => {
  // automatically fetch this service base price
  if (oldServiceId !== newServiceId) {
    newItemState.price = servicesList.value.find(s => s.id === newItemState.serviceId)?.basePrice || 0.00
  }
})

watch(newItemState, newItem => {
  try {
    newItemSchema.parse(newItem)
    newItemErrorState.value = false
  } catch {
    newItemErrorState.value = true
  }
})

watch(addResponsibleModalOpened, isOpened => {
  if (!isOpened) newResponsibleId.value = null
})

watch(_ => props.order.responsibles, async _ => {
  await fetchEmployees()
})
</script>

<template>
  <div>
    <USlideover :title="slideoverTitle" :ui="{content: 'max-w-xl'}"
                @update:open="handleSlideoverOpened">
      <template #body="{close}">
        <div class="flex flex-col gap-4 divide-y divide-default">
          <!--    order info      -->
          <section class="flex flex-col gap-2 pb-4">
            <UBadge :color="overdue ? 'error' : 'info'" :label="getDeadline ?? 'No deadline'" class="w-fit rounded-full"
                    variant="subtle">
              <template #leading>
                <UIcon name="i-ri-flag-line"/>
              </template>
            </UBadge>
            <span class="text-2xl font-bold text-pretty text-highlighted">{{ order.title }}</span>
            <div class="flex flex-col">
              <p :class="[(!descExpanded && order.description?.length > 200) && 'line-clamp-3']"
                 class="text-sm text-pretty">{{ order.description }}</p>
              <UButton v-if="order.description?.length > 200" :label="descExpanded ? 'Collapse' : 'Expand'"
                       class="cursor-pointer self-end" color="neutral"
                       variant="link" @click="descExpanded = !descExpanded"></UButton>
            </div>
            <div class="grid grid-cols-2 gap-y-4 gap-x-6 w-full">
              <OrderLabelled label="Created at">
                <span>{{ formatDate(order.createdAt) }}</span>
              </OrderLabelled>
              <OrderLabelled label="Priority">
                <OrderPriorityChip :priority="order.priority"/>
              </OrderLabelled>
              <!--      todo: ACTUALLY change status with position recalculation        -->
              <OrderLabelled label="Status">
                <USelect v-model="selectedColumn" :disabled="!isResponsible" :items="columnItems"
                         class="cursor-pointer w-full rounded-xl px-3 py-2 capitalize h-fit"
                         variant="soft" @change="handleChangeColumn">
                  <template #leading="{ modelValue, ui }">
                    <UChip
                      v-if="modelValue"
                      :class="ui.itemLeadingChip()"
                      :size="ui.itemLeadingChipSize()"
                      inset
                      standalone
                      v-bind="columnItems.find(c => c.value === modelValue)?.chip"
                    />
                  </template>
                </USelect>
              </OrderLabelled>
              <OrderLabelled label="Source">
                <OrderSourceChip :source="order.source"/>
              </OrderLabelled>
            </div>
          </section>
          <!--    customer info      -->
          <section class="flex flex-col gap-4 pb-4">
            <OrderLabelled display label="Customer">
              <div class="flex flex-col gap-1">
                <span>{{ order.customer.fullName }}</span>
                <div
                  class="group flex items-center gap-1 w-fit cursor-pointer"
                  @click="handleCopyCustomerPhone">
                  <span class="text-info group-hover:text-info/80 transition-all">{{ order.customer.phone }}</span>
                  <UIcon class="size-3 xs:opacity-0 group-hover:opacity-100 transition-all text-info"
                         name="i-ri-file-copy-line"/>
                </div>
                <span>{{ customerFullAddress }}</span>
              </div>
            </OrderLabelled>
          </section>
          <!--    order items      -->
          <section class="flex flex-col gap-4 pb-4">
            <OrderLabelled display label="Items">
              <div class="flex flex-col gap-2">
                <UModal v-model:open="addItemModalOpened" :ui="{ footer: 'justify-end' }" title="New order item">
                  <UButton :disabled="!isResponsible || !servicesList"
                           class="w-full justify-center cursor-pointer rounded-xl px-3 py-2"
                           color="neutral"
                           icon="i-ri-add-fill" variant="soft"/>
                  <template #body>
                    <div class="flex flex-col gap-2">
                      <UFormField label="Service" required>
                        <USelect v-model="newItemState.serviceId" :color="newItemErrorState ? 'error' : 'primary'"
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
                    </div>
                  </template>
                  <template #footer="{close: closeNewItemModal}">
                    <UButton class="cursor-pointer rounded-xl px-4 py-2" color="neutral" label="Cancel"
                             variant="outline"
                             @click="closeNewItemModal"/>
                    <UButton :loading="addingItem" class="cursor-pointer rounded-xl px-4 py-2" label="Add"
                             leading-icon="i-ri-add-fill" @click="handleAddItem"/>
                  </template>
                </UModal>
                <OrderFormItem v-for="(item, itemIndex) in order.items" :currencySymbol="currencySymbol"
                               :disabled="!isResponsible"
                               :done="item.isDone"
                               :index="itemIndex"
                               :price="item.price"
                               :quantity="item.quantity"
                               :serviceId="item.serviceId"
                               :title="item.service.title"
                               active
                               @remove="handleRemoveItem"
                               @switch="handleSwitchItem"/>
              </div>
            </OrderLabelled>
          </section>
          <!--    responsible users for this order      -->
          <section class="flex flex-col gap-4 pb-4">
            <OrderLabelled display label="Responsibles">
              <div class="flex flex-col gap-2">
                <UModal v-model:open="addResponsibleModalOpened" :ui="{ footer: 'justify-end' }"
                        title="Add responsible">
                  <UButton :disabled="!isResponsible || !servicesList"
                           class="w-full justify-center cursor-pointer rounded-xl px-3 py-2"
                           color="neutral"
                           icon="i-ri-add-fill" variant="soft"/>
                  <template #body>
                    <UFormField label="Employee" required>
                      <USelect v-model="newResponsibleId"
                               :items="employeeList" class="w-full rounded-xl px-3 py-2"
                               labelKey="user.fullName" valueKey="user.id"/>
                    </UFormField>
                  </template>
                  <template #footer="{close: closeAddResponsibleModal}">
                    <UButton class="cursor-pointer rounded-xl px-4 py-2" color="neutral" label="Cancel"
                             variant="outline"
                             @click="closeAddResponsibleModal"/>
                    <UButton :disabled="!newResponsibleId" :loading="addingResponsible"
                             class="cursor-pointer rounded-xl px-4 py-2" label="Add"
                             leading-icon="i-ri-add-fill" @click="handleAddResponsible"/>
                  </template>
                </UModal>
                <div
                  v-for="responsible in order.responsibles"
                  class="flex items-center justify-between overflow-hidden p-3 dark:bg-muted bg-elevated/80 rounded-xl">
                  <div class="flex items-center gap-3">
                    <img
                      :class="[responsible.avatar.includes('ssl.gstatic.com/docs/common/profile') && 'light:brightness-0']"
                      :src="responsible.avatar"
                      alt=""
                      class="block object-cover rounded-full pointer-events-none size-8"
                      @error="e => { e.target.src='https://ssl.gstatic.com/docs/common/profile/capybara_lg.png' }">
                    <div class="flex flex-col overflow-hidden">
                      <span class="truncate text-highlighted">{{ responsible.fullName }}
                        <span v-if="responsible.id === user.id" class="text-primary">(You)</span>
                      </span>
                      <span class="truncate text-muted/80">{{ responsible.email }}</span>
                    </div>
                  </div>
                  <UButton v-if="responsible.id !== user.id" :disabled="!isResponsible || responsible.id === user.id"
                           class="cursor-pointer"
                           color="error"
                           icon="i-ri-delete-bin-6-fill" variant="soft"
                           @click="handleRemoveResponsible(responsible.id)"/>
                </div>
              </div>
            </OrderLabelled>
          </section>
          <!--    attached links      -->
          <section class="flex flex-col gap-4 pb-4">
            <OrderLabelled display label="Links">

            </OrderLabelled>
          </section>
          <section class="hidden">
            <pre>{{ order }}</pre>
          </section>
          <section class="flex justify-end gap-2">
            <UButton class="px-6 py-2.5 rounded-xl justify-center cursor-pointer" color="neutral" label="Close"
                     variant="ghost"
                     @click="close"/>
            <UButton :disabled="!isResponsible" class="px-6 py-2.5 rounded-xl justify-center gap-2 cursor-pointer"
                     color="error" label="Archive order"
                     @click="handleArchiveOrder">
              <template #leading>
                <UIcon name="i-ri-archive-2-fill"/>
              </template>
            </UButton>
          </section>
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
            {{ getDeadline }}
          </UBadge>
          <div v-else class="text-xs text-muted flex items-center gap-1">
            <UIcon class="text-dimmed size-3" name="i-ri-flag-line"/>
            <span>{{ getDeadline ?? 'No deadline' }}</span>
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
          <OrderDoneChip :progress="progressPercent"/>
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
