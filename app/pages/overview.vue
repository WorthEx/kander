<script setup>
import {z} from 'zod'

const {user, logout} = useAuth()
const toaster = useToast()
const notif = useNotification(toaster)
const workspaces = useWorkspaces()

const shownWorkspaces = ref([])
const workspaceModalOpened = ref(false)
const creatingWorkspace = ref(false)
const fetchingWorkspaces = ref(true)
const userEditModalOpened = ref(false)

const newWorkspaceSchema = z.object({
  title: z.string()
    .min(1, "Workspace title must contain between 1 and 255 characters.")
    .max(255, "Workspace title must contain between 1 and 255 characters."),
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
    notif.error("An issue occurred while fetching workspaces. Try again later.")
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
    notif.success("A new workspace has been set up!")
  } catch {
    notif.error("An issue occurred while creating the workspace. Try again later.")
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
            class="spinner hover:scale-105 active:scale-100 ease-in-out origin-center transition-all duration-200 xs:block hidden"
            to="/">
            <img alt="Kander logo" class="h-7 min-h-7 min-w-7 object-fit select-none pointer-events-none rounded-lg"
                 src="/images/kander_192.png">
          </NuxtLink>
        </template>
        <template #title>
          <ClientOnly>
            <div class="xs:ms-2 font-semibold text-sm text-highlighted truncate">{{ user.email }}</div>
            <template #fallback>
              <USkeleton class="ms-2 h-4 w-48 rounded-full"/>
            </template>
          </ClientOnly>
        </template>
        <template #right>
          <UTooltip text="Switch theme">
            <UColorModeButton class="cursor-pointer" variant="link"/>
          </UTooltip>
          <ProfileEditModal v-model:modalOpened="userEditModalOpened">
            <UTooltip text="Edit profile">
              <UButton class="cursor-pointer" color="neutral" icon="i-ri-user-line" variant="link"
                       @click="_ => userEditModalOpened = true"/>
            </UTooltip>
          </ProfileEditModal>
          <UTooltip text="Logout">
            <UButton class="cursor-pointer" color="neutral" icon="i-ri-shut-down-line" variant="link"
                     @click="logout"/>
          </UTooltip>
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
            <UModal v-model:open="workspaceModalOpened" :close="false" description="Feeling like a founder today eh?"
                    title="New workspace">
              <DashboardHeaderButton icon="i-ri-add-fill" label="Create"/>
              <template #body>
                <UForm :schema="newWorkspaceSchema" :state="newWorkspaceState" :validate-on="['change', 'input']"
                       @submit="createWorkspace">
                  <UFormField label="Title" name="title" required>
                    <UInput v-model="newWorkspaceState.title"
                            class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full"/>
                  </UFormField>
                  <div
                    class="flex mt-6 justify-end max-sm:flex-col max-sm:w-full gap-2 *:cursor-pointer *:select-none *:px-4 *:py-2 *:justify-center">
                    <UButton class=" rounded-xl px-4 py-2" color="neutral" label="Cancel" variant="outline" @click="_ => {
                      workspaceModalOpened = false
                      newWorkspaceState.title = ''
                    }"/>
                    <UButton :loading="creatingWorkspace" class=" rounded-xl px-4 py-2" label="Submit" type="submit"/>
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
                         :numberOfMembers="ws._count.members"
                         :role="ws.members[0].role" :style="{'animationDelay': `${index * 200}ms`}"
                         :title="ws.title"
                         :wsId="ws.id"
                         class="animate-fade-up animate-ease-out"/>
        </div>
        <div v-else-if="fetchingWorkspaces" class="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 pb-4">
          <div v-for="(_, index) in 12" :style="{'animationDelay': `${index * 200}ms`}"
               class="w-full h-32 bg-elevated rounded-lg animate-fade-up animate-ease-out animate-once"/>
        </div>
        <div v-else-if="!fetchingWorkspaces && shownWorkspaces.length === 0"
             class="w-full py-2 flex justify-center text-muted">
          You haven't joined the workspace yet. Maybe today is the right day to create one?
        </div>
      </DashboardContainer>
    </template>
  </UDashboardPanel>
</template>

