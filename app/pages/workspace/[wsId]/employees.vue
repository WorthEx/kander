<script setup>
import {z} from "zod";

definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const wsId = computed(() => route.params.wsId)
const toaster = useToast()
const notif = useNotification(toaster)
const {addEmployee} = useEmployees()
const workspaces = useWorkspaces()
const {data: currentWorkspace} = useNuxtData('currentWorkspace')

const addEmployeeModalOpened = ref(false)
const addEmployeeError = ref(null)
const addEmployeeEmail = ref("")
const addingEmployee = ref(false)
const searchQuery = ref("")

const addEmployeeEmailSchema = z.email({error: 'Invalid email address.'})

const submitAddEmployee = async _ => {
  if (employees.value.map(employee => employee.user.email).includes(addEmployeeEmail.value)) {
    notif.info("An employee with this email already exists.")
    return
  }
  addingEmployee.value = true
  try {
    await addEmployee(addEmployeeEmail.value, wsId.value)
    workspaces.cachedWorkspaces.value = []
    await refreshNuxtData(`employees-${wsId.value}`)
    addEmployeeModalOpened.value = false
    notif.success("Successfully added new employee!")
  } catch {
    notif.error("An issue occurred while adding new employee. Try again later.")
  } finally {
    addingEmployee.value = false
  }
}

const onUpdateEmployee = async _ => {
  await refreshEmployees()
}

const {
  data: employees,
  pending: loadingEmployees,
  refresh: refreshEmployees,
} = await useLazyFetch(_ => `/api/workspaces/${wsId.value}/employees`, {
  server: false,
  key: `employees-${wsId.value}`,
  watch: [wsId]
})
const shownEmployees = computed(_ => {
  if (!employees.value) return []
  return employees.value.filter(employee => employee.user.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

// email validation for adding employee
watch(addEmployeeEmail, (newEmail) => {
  const result = addEmployeeEmailSchema.safeParse(newEmail)

  if (!result.success) {
    addEmployeeError.value = result.error.issues[0].message
  } else {
    addEmployeeError.value = null
  }
})
</script>

<template>
  <DashboardContainer>
    <DashboardHeader>
      <template #title>
        Employees
      </template>
      <template #right>
        <UModal v-model:open="addEmployeeModalOpened" :close="false"
                :ui="{ footer: 'justify-end gap-2', content: 'divide-none' }"
                description="The more the merrier!" title="Add employee to workspace">
          <DashboardHeaderButton :disabled="!currentWorkspace || !employees" icon="i-ri-add-fill" label="Add"/>
          <template #body>
            <UFormField :error="addEmployeeError" class="w-full" label="Employee email" name="email" required>
              <UInput v-model="addEmployeeEmail"
                      class="w-full [&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2"
                      placeholder="hotnagets@mcds.kz"/>
            </UFormField>
          </template>
          <template #footer="{ close }">
            <UButton class="cursor-pointer rounded-xl px-4 py-2" color="neutral" label="Cancel" variant="outline"
                     @click="_ => {
              close()
              addEmployeeEmail = ''
              addEmployeeError = null
            }"/>
            <UButton :disabled="addEmployeeError !== null" :loading="addingEmployee"
                     class="px-6 py-2 cursor-pointer w-fit rounded-xl" label="Add"
                     @click.prevent="submitAddEmployee"/>
          </template>
        </UModal>
      </template>
    </DashboardHeader>
    <section>
      <ClientOnly>
        <div class="pb-4">
          <UInput v-model="searchQuery" class="w-full [&>input]:rounded-xl [&>input]:px-10 [&>input]:py-2"
                  leadingIcon="i-ri-search-line"
                  placeholder="Start typing employee name..."/>
        </div>
        <div v-if="!employees || loadingEmployees"
             class="rounded-lg overflow-hidden w-full flex flex-col">
          <!--          <USkeleton v-for="(_, index) in 8"-->
          <!--                     :style="{'animationDelay': `${index * 100}ms`}" class="w-full h-15 rounded-none opacity-40"/>-->
          <div v-for="(_, index) in 8" :style="{'animationDelay': `${index * 100}ms`}"
               class="bg-muted w-full h-15 animate-fade-up animate-ease-out animate-duration-500"/>
        </div>
        <div v-else
             class="relative overflow-x-auto max-h-180 rounded-lg border border-default **:text-start no-scrollbar">
          <table class="table-auto border-collapse w-full text-sm">
            <thead class="border-b border-default bg-elevated select-none sticky top-0 z-1">
            <tr class="*:py-3">
              <th class="ps-4 pe-8">#</th>
              <th class="">Name</th>
              <th class="ps-4">Email <span class="text-dimmed font-normal text-xs">(click to copy)</span></th>
              <th class="ps-4">Role</th>
              <th class="ps-4">Status</th>
              <th v-if="currentWorkspace.workspaceMember.role === 'admin'"/>
            </tr>
            </thead>
            <tbody class="divide-y divide-default *:even:bg-muted">
            <EmployeeTableRow v-for="(employee, index) in shownEmployees" :key="employee.id"
                              :employee="employee"
                              :index="index + 1"
                              :isCurrentUserAdmin="currentWorkspace.workspaceMember.role === 'admin'"
                              :style="{'animationDelay': `${index * 100}ms`}"
                              @updateEmployee="onUpdateEmployee"/>
            </tbody>
          </table>
          <div v-if="searchQuery && shownEmployees.length < 1"
               class="w-full h-32 flex justify-center items-center text-sm select-none">
            No employees found
          </div>
        </div>
        <template #fallback>
          <div class="rounded-lg overflow-hidden w-full flex flex-col">
            <div v-for="(_, index) in 8" :style="{'animationDelay': `${index * 100}ms`}"
                 class="bg-muted w-full h-15 animate-fade-up animate-ease-out animate-duration-500"/>
          </div>
        </template>
      </ClientOnly>
    </section>
  </DashboardContainer>
</template>
