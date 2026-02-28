<script setup>
import {useArchive} from "~/composables/useArchive.js";

const props = defineProps({
  order: Object,
  index: Number,
})
const emit = defineEmits(['delete-order'])

const route = useRoute()
const wsId = computed(() => route.params.wsId)
const toaster = useToast()
const notif = useNotification(toaster)
const {deleteOrder} = useArchive()

const deleteModalOpened = ref(false)
const deletingOrder = ref(false)

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
</script>

<template>
  <tr class="*:py-4 animate-fade-up animate-ease-out animate-duration-500">
    <td class="select-none ps-4">
      {{ index }}
    </td>
    <td class="select-none ps-4 pe-4">
      <span class="text-sm text-nowrap">{{ order.title }}</span>
    </td>
    <td class="select-none ps-4 pe-4">
      <div class="flex flex-col gap-2">
        <span class="text-sm text-nowrap">{{ order.customerName }}</span>
        <span class="text-xs text-nowrap text-dimmed">{{ order.customerPhone }}</span>
      </div>
    </td>
    <td class="select-none ps-4 pe-4">
      <span class="text-sm text-nowrap">{{ order.totalCost }}</span>
      <!--  todo: add currency symbol    -->
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
