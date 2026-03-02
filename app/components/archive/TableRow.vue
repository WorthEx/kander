<script setup>
import {useArchive} from "~/composables/useArchive.js";
import {useClipboard} from "@vueuse/core";

const props = defineProps({
  order: Object,
  index: Number,
  currency: {
    type: String,
    required: false
  }
})
const emit = defineEmits(['delete-order'])

const route = useRoute()
const wsId = computed(() => route.params.wsId)
const toaster = useToast()
const notif = useNotification(toaster)
const {deleteOrder} = useArchive()
const {copy} = useClipboard()

const deleteModalOpened = ref(false)
const deletingOrder = ref(false)

const handleCopyCustomer = _ => {
  copy(`${props.order.customerName} (${props.order.customerPhone})`)
  notif.info('Customer data copied to clipboard!')
}

const handleDeleteOrder = async _ => {
  deletingOrder.value = true
  try {
    await deleteOrder(wsId.value, props.order.id)
    deleteModalOpened.value = false
    emit('delete-order')
    notif.success("Successfully deleted an order!")
  } catch {
    notif.error("An issue occurred while deleting an order. Try again later.")
  } finally {
    deletingOrder.value = false
  }
}

const formattedDate = computed(_ => {
  const createdAt = new Date(props.order.createdAt)
  const day = String(createdAt.getDate()).padStart(2, '0')

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const month = months[createdAt.getMonth()]
  const year = createdAt.getFullYear()

  return `${day} ${month} ${year}`
})

const formattedTotalCost = computed(_ => formatPrice(props.order.totalCost))
</script>

<template>
  <tr class="*:py-4 animate-fade-up animate-ease-out animate-duration-500">
    <td class="select-none ps-4">
      {{ index }}
    </td>
    <td class="select-none px-4">
      <span class="text-sm text-nowrap">{{ order.title }}</span>
    </td>
    <td class="select-none ps-4 pe-4">
      <div
        class="flex sm:gap-8 gap-4 w-fit items-center group cursor-pointer"
        @click="handleCopyCustomer">
        <div class="flex flex-col gap-1">
          <span class="text-sm text-nowrap">{{ order.customerName }}</span>
          <span class="text-xs text-nowrap text-dimmed">{{ order.customerPhone }}</span>
        </div>
        <UIcon class="size-4 text-muted opacity-0 group-hover:opacity-100 transition-all" name="i-ri-file-copy-line"/>
      </div>
    </td>
    <td class="select-none ps-4 pe-4">
      <div class="inline-flex items-end gap-1.5 text-sm">
        <span class="text-nowrap">{{ formattedTotalCost }}</span>
        <span class="text-dimmed">{{ currency }}</span>
      </div>
    </td>
    <td class="select-none ps-4 pe-4">
      <span class="text-sm text-nowrap">{{ formattedDate }}</span>
    </td>
    <td class="select-none ps-4 pe-2">
      <UModal v-model:open="deleteModalOpened"
              :ui="{ footer: 'justify-end gap-2', content: 'divide-none', body: 'py-2 sm:py-2' }"
              description="This operation is kinda risky"
              title="Hold up...">
        <template #body>
          <p class="text-sm">You are completely deleting this order from the database. Subsequently, <span
            class="text-error font-semibold">it will not be
            included in any reports</span>. This action cannot be undone.</p>
        </template>

        <template #default>
          <ULink class="cursor-pointer text-error">Delete</ULink>
        </template>

        <template #footer="{close}">
          <UButton class="cursor-pointer rounded-xl px-4 py-2" color="neutral" label="Cancel" variant="outline"
                   @click="close"/>
          <UButton :loading="deletingOrder"
                   class="cursor-pointer rounded-xl px-4 py-2" color="error" label="Delete" @click="handleDeleteOrder"/>
        </template>
      </UModal>
    </td>
  </tr>
</template>
