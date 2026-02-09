<script setup>
import {z} from 'zod'

const {user} = useAuth()
const toaster = useToast()
const notif = useNotification(toaster)
const workspaces = useWorkspaces()
const shownWorkspaces = ref([])

const workspaceModalOpened = ref(false)
const creatingWorkspace = ref(false)
const fetchingWorkspaces = ref(true)

const newWorkspaceSchema = z.object({
  title: z.string()
    .min(1, "Workspace title must contain 1 to 255 symbols.")
    .max(255, "Workspace title must contain 1 to 255 symbols."),
})

const newWorkspaceState = reactive({
  title: ""
})

const fetchWorkspaces = async _ => {
  fetchingWorkspaces.value = true
  try {
    await workspaces.getAll()
    shownWorkspaces.value = workspaces.cachedWorkspaces.value
  } catch {
    notif.error("", "An issue occurred while fetching workspaces. Try again later.")
  } finally {
    fetchingWorkspaces.value = false
  }
}

const createWorkspace = async event => {
  if (!event.data || !event.data.title.trim()) return
  creatingWorkspace.value = true
  try {
    await workspaces.create(event.data.title.trim())
    await fetchWorkspaces()
    workspaceModalOpened.value = false
    notif.success("", "A new workspace has been set up!")
  } catch {
    notif.error("", "An issue occurred while creating the workspace. Try again later.")
  } finally {
    creatingWorkspace.value = false
  }
}

onMounted(async () => {
  if (workspaces.cachedWorkspaces.value.length < 1) {
    await fetchWorkspaces()
  } else {
    fetchingWorkspaces.value = false
    shownWorkspaces.value = workspaces.cachedWorkspaces.value
  }
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :toggle="false">
        <template #leading>
          <NuxtLink
            class="sm:hover:rotate-360 hover:scale-110 ease-in-out origin-center transition-all duration-500"
            to="/">
            <img alt="Kander logo" class="h-7 object-fit select-none pointer-events-none rounded-lg"
                 src="/images/kander_192.png">
          </NuxtLink>
        </template>
        <template #title>
          <ClientOnly>
            <div class="ms-2 font-semibold text-sm text-highlighted truncate">{{ user.email }}</div>
            <template #fallback>
              <USkeleton class="ms-2 h-4 w-48 rounded-full"/>
            </template>
          </ClientOnly>
        </template>
        <template #right>
          <UColorModeButton class="cursor-pointer" variant="link"/>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <DashboardContainer>
        <DashboardHeader>
          <template #title>
            Workspaces
          </template>
          <template #right>
            <UModal v-model:open="workspaceModalOpened" :close="false" title="New workspace">
              <DashboardHeaderButton icon="i-ri-add-fill" label="Create"/>
              <template #body>
                <UForm :schema="newWorkspaceSchema" :state="newWorkspaceState" :validate-on="['change', 'input']"
                       @submit="createWorkspace">
                  <UFormField label="Title" name="title" required>
                    <UInput v-model="newWorkspaceState.title" class="w-full"/>
                  </UFormField>
                  <USeparator/>
                  <div
                    class="flex mt-6 justify-end max-sm:flex-col max-sm:w-full gap-2 *:cursor-pointer *:select-none *:px-4 *:py-2 *:justify-center">
                    <UButton class="rounded-lg" color="neutral" label="Cancel" variant="outline" @click="_ => {
                      workspaceModalOpened = false
                      newWorkspaceState.title = ''
                    }"/>
                    <UButton :loading="creatingWorkspace" class="rounded-lg" label="Submit" type="submit"/>
                  </div>
                </UForm>
              </template>
            </UModal>
          </template>
        </DashboardHeader>
        <div v-if="shownWorkspaces.length > 0 && !fetchingWorkspaces"
             class="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 pb-4">
          <WorkspaceCard v-for="(ws, index) in shownWorkspaces"
                         :key="ws.id"
                         :numberOfMembers="ws._count.members" :role="ws.members[0].role"
                         :style="{'animationDelay': `${index * 200}ms`}"
                         :title="ws.title"
                         class="animate-fade-up animate-ease-out"/>
        </div>
        <div v-else-if="fetchingWorkspaces" class="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 pb-4">
          <div v-for="(_, index) in 12" :style="{'animationDelay': `${index * 200}ms`}"
               class="w-full h-32 bg-muted rounded-lg animate-fade-up animate-ease-out animate-once"/>
        </div>
        <div v-else-if="!fetchingWorkspaces && shownWorkspaces.length === 0"
             class="w-full py-2 flex justify-center text-muted">
          You haven't joined the workspace yet. Maybe today is the right day to create one?
        </div>
      </DashboardContainer>
    </template>
  </UDashboardPanel>
</template>

