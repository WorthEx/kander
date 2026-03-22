<script setup>
const props = defineProps({
  service: Object,
  index: Number,
  isCurrentUserAdmin: {
    type: Boolean,
    default: false
  },
  currency: {
    type: String,
    required: false
  }
})
const emit = defineEmits(['update-service'])

const route = useRoute()
const wsId = computed(() => route.params.wsId)
const {updateService} = useServices()
const toaster = useToast()
const notif = useNotification(toaster)

const editModalOpened = ref(false)
const savingService = ref(false)
const newBasePrice = ref(Number(props.service.basePrice))
const newStatusValue = ref(props.service.isArchived)
const statusItems = ref([
  {
    label: 'Active',
    value: false
  },
  {
    label: 'Archived',
    value: true
  }
])

const saveService = async _ => {
  savingService.value = true
  try {
    await updateService(props.service.id, newBasePrice.value, newStatusValue.value, wsId.value)
    editModalOpened.value = false
    emit('update-service')
    notif.success("Successfully updated service!")
  } catch {
    notif.error("An issue occurred while updating service. Try again later.")
  } finally {
    savingService.value = false
  }
}

const formattedPrice = computed(_ => formatPrice(props.service.basePrice))
</script>

<template>
  <tr class="*:py-4 animate-fade-up animate-ease-out animate-duration-500">
    <td class="select-none ps-4">
      {{ index }}
    </td>
    <td class="select-none ps-4 pe-4">
      <span class="text-sm text-nowrap">{{ service.title }}</span>
    </td>
    <td class="select-none ps-4 pe-10">
      <div class="inline-flex items-end gap-1.5 text-sm">
        <span class="text-sm text-nowrap">{{ formattedPrice }}</span>
        <span>{{ currency }}</span>
      </div>
    </td>
    <td class="select-none ps-4 pe-4">
      <UBadge :color="service.isArchived ? 'neutral' : 'success'" :label="service.isArchived ? 'Archived' : 'Active'"
              class="w-20 flex justify-center"
              variant="soft"/>
    </td>
    <td v-if="isCurrentUserAdmin" class="select-none ps-4 pe-4">
      <UModal v-model:open="editModalOpened"
              :ui="{ footer: 'justify-end gap-2', content: 'divide-none' }">
        <template #title>
          <span class="text-highlighted font-semibold">Edit service <span
            class="text-primary">"{{ service.title }}"</span></span>
        </template>
        <template #body>
          <div class="flex flex-col gap-4">
            <UFormField label="Base price" name="basePrice" required>
              <UInputNumber v-model="newBasePrice"
                            :format-options="{minimumFractionDigits: 2, maximumFractionDigits: 2, roundingIncrement: 1}"
                            :step="0.01"
                            class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full **:text-center"
              />
            </UFormField>

            <UFormField class="w-full" label="Status" name="status" required>
              <USelect v-model="newStatusValue"
                       :items="statusItems"
                       class="w-full rounded-xl px-3 py-2"/>
            </UFormField>
          </div>
        </template>
        <template #default>
          <UTooltip text="Edit service">
            <UButton class="cursor-pointer" color="neutral" icon="i-ri-edit-2-fill" variant="ghost"/>
          </UTooltip>
        </template>
        <template #footer="{close}">
          <UButton class="cursor-pointer rounded-xl px-4 py-2" color="neutral" label="Cancel" variant="outline"
                   @click="close"/>
          <UButton :loading="savingService"
                   class="cursor-pointer rounded-xl px-6 py-2" label="Save" @click="saveService"/>
        </template>
      </UModal>
    </td>
  </tr>
</template>

<style scoped>

</style>
