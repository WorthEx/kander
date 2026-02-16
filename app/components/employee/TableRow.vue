<script setup>
import {useClipboard} from "@vueuse/core";

const props = defineProps({
  employee: Object,
  isCurrentUserAdmin: {
    type: Boolean,
    default: false
  },
  index: Number
})

const emit = defineEmits(['update-employee'])

const {updateEmployee} = useEmployees()
const {copy} = useClipboard()
const toaster = useToast()
const notif = useNotification(toaster)

const roleItems = ref([
  {
    label: 'Admin',
    value: 'admin'
  },
  {
    label: 'Manager',
    value: 'manager'
  }
])
const statusItems = ref([
  {
    label: 'Active',
    value: false
  },
  {
    label: 'Dismissed',
    value: true
  }
])
const employeeRole = ref(props.employee.role)
const statusValue = ref(props.employee.isFired)
const savingEmployee = ref(false)
const editEmployeeModalOpened = ref(false)

const handleCopyEmail = _ => {
  copy(props.employee.user.email)
  notif.info('Employee email copied to clipboard!')
}

const saveEmployee = async _ => {
  savingEmployee.value = true
  try {
    await updateEmployee(statusValue.value, employeeRole.value, props.employee.id, props.employee.workspaceId)
    editEmployeeModalOpened.value = false
    emit('update-employee')
    notif.success("Successfully updated employee!")
  } catch {
    notif.error("An issue occurred while updating employee. Try again later.")
  } finally {
    savingEmployee.value = false
  }
}
</script>

<template>
  <tr class="*:py-4 animate-fade-up animate-ease-out animate-duration-500">
    <td class="select-none ps-4 pe-8">
      {{ index }}
    </td>
    <td class="flex gap-4 items-center select-none pe-10">
      <img :class="[employee.user.avatar.includes('ssl.gstatic.com/docs/common/profile') && 'light:brightness-0']"
           :src="employee.user.avatar"
           alt=""
           class="block object-cover rounded-full pointer-events-none size-8"
           @error="e => { e.target.src='https://ssl.gstatic.com/docs/common/profile/capybara_lg.png' }">
      <span class="text-sm text-nowrap">{{ employee.user.fullName }}</span>
    </td>
    <td class="select-none ps-4 pe-10">
      <div class="group flex items-center gap-2 w-fit cursor-pointer"
           @click="handleCopyEmail">
        <span>{{ employee.user.email }}</span>
        <UIcon class="size-3 group-hover:opacity-100 opacity-0 transition-all text-dimmed" name="i-ri-file-copy-line"/>
      </div>
    </td>
    <td class="select-none capitalize ps-4 pe-10">
      <div class="flex items-center gap-2">
        <span>{{ employee.role }}</span>
        <UIcon v-if="employee.role === 'admin'" class="size-4 text-primary" name="i-ri-vip-crown-fill"/>
      </div>
    </td>
    <td class="select-none ps-4 pe-10">
      <UBadge :color="employee.isFired ? 'neutral' : 'success'" :label="employee.isFired ? 'Dismissed' : 'Active'"
              class="w-20 flex justify-center"
              variant="soft"/>
    </td>
    <td v-if="isCurrentUserAdmin" class="select-none ps-0 pe-4">
      <UModal v-model:open="editEmployeeModalOpened" :ui="{ footer: 'justify-end gap-2', content: 'divide-none' }"
              title="Edit employee">
        <template #body>
          <div class="flex gap-4 items-center justify-center select-none">
            <div
              class="size-8 min-h-8 min-w-8 xs:size-10 xs:min-h-10 xs:min-w-10 rounded-full overflow-hidden ring-2 ring-tertiary">
              <img
                :class="[employee.user.avatar.includes('ssl.gstatic.com/docs/common/profile') && 'light:brightness-0']"
                :src="employee.user.avatar"
                alt=""
                class="block object-cover pointer-events-none w-full"
                @error="e => { e.target.src='https://ssl.gstatic.com/docs/common/profile/capybara_lg.png' }">
            </div>
            <div class="flex flex-col">
              <span class="text-sm text-nowrap">{{ employee.user.fullName }}</span>
              <span class="text-xs text-dimmed text-nowrap">{{ employee.user.email }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-4 mt-6">
            <UFormField class="w-full" label="Role" name="role" required>
              <USelect v-model="employeeRole"
                       :items="roleItems"
                       class="w-full rounded-xl px-3 py-2"/>
            </UFormField>
            <UFormField class="w-full" label="Status" name="status" required>
              <USelect v-model="statusValue"
                       :items="statusItems"
                       class="w-full rounded-xl px-3 py-2"/>
            </UFormField>
          </div>
        </template>
        <template #default>
          <UTooltip text="Edit employee">
            <UButton class="cursor-pointer" color="neutral" icon="i-ri-edit-2-fill" variant="ghost"/>
          </UTooltip>
        </template>
        <template #footer="{close}">
          <UButton class="cursor-pointer rounded-xl px-4 py-2" color="neutral" label="Cancel" variant="outline"
                   @click="_ => {
              close()
            }"/>
          <UButton :loading="savingEmployee"
                   class="cursor-pointer rounded-xl px-6 py-2" label="Save" @click="saveEmployee"/>
        </template>
      </UModal>
    </td>
  </tr>
</template>
