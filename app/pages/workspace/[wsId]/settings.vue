<script setup>
import {z} from 'zod'
import {useClipboard} from "@vueuse/core";

definePageMeta({
  layout: 'dashboard',
})

const newWorkspaceTitle = ref("")
const newWorkspaceError = ref(null)
const editingTitle = ref(false)

const wsDeleteConfirmation = ref("")
const deletingWorkspace = ref(false)

const auth = useAuth()
const toaster = useToast()
const notif = useNotification(toaster)
const {editTitle, deleteWorkspace} = useWorkspace()
const {copy} = useClipboard()

const {data: currentWorkspace} = useNuxtData('currentWorkspace')
watch(currentWorkspace, _ => newWorkspaceTitle.value = currentWorkspace.value ? currentWorkspace.value.workspace.title : '')

const workspaceTitleSchema = z.string()
  .min(1, "Workspace title must contain between 1 and 100 characters.")
  .max(100, "Workspace title must contain between 1 and 100 characters.")

const submitEditTitle = async _ => {
  if (newWorkspaceTitle.value === currentWorkspace.value.workspace.title) return

  if (auth.user.value && auth.user.value.role !== 'admin') {
    notif.info('You don\'t have permission for this operation. Please contact workspace supervisor.')
    return
  }

  editingTitle.value = true
  try {
    await editTitle(newWorkspaceTitle.value.trim(), currentWorkspace.value.workspace.id)
    clearNuxtState(['cachedWorkspaces'])
    await refreshNuxtData('currentWorkspace')
    await refreshNuxtData('workspaces')
    notif.success("Successfully updated workspace!")
  } catch {
    notif.error("An issue occurred while editing workspace. Try again later.")
  } finally {
    editingTitle.value = false
  }
}

const copyWorkspaceTitle = _ => {
  copy(currentWorkspace.value.workspace.title)
  notif.info('Workspace title copied to clipboard!')
}

const submitDeleteWorkspace = async _ => {
  if (auth.user.value && auth.user.value.role !== 'admin') {
    notif.info('You don\'t have permission for this operation. Please contact workspace supervisor.')
    return
  }

  deletingWorkspace.value = true
  try {
    await deleteWorkspace(currentWorkspace.value.workspace.id)
    clearNuxtState(['cachedWorkspaces', 'workspaces'])
    navigateTo('/overview')
    clearNuxtData('currentWorkspace')
    notif.success("Successfully deleted workspace. Off you go fella...")
  } catch {
    notif.error("An issue occurred while deleting this workspace. Try again later.")
  } finally {
    deletingWorkspace.value = false
  }
}

watch(newWorkspaceTitle, (newTitle) => {
  const result = workspaceTitleSchema.safeParse(newTitle)

  if (!result.success) {
    newWorkspaceError.value = result.error.issues[0].message
  } else {
    newWorkspaceError.value = null
  }
})

onMounted(_ => {
  if (currentWorkspace.value) {
    newWorkspaceTitle.value = currentWorkspace.value.workspace.title
  }
})
</script>

<template>
  <DashboardContainterSm>
    <DashboardHeader>
      <template #title>Settings</template>
      <template #description>Feel free to customize your workspace just the way you like</template>
    </DashboardHeader>
    <SettingsSection v-if="currentWorkspace">
      <template #title>General</template>
      <div class="flex lg:flex-row flex-col lg:gap-4 gap-2 w-full">
        <div class="flex flex-col w-full">
          <span class="text-sm">Workspace title</span>
          <span class="text-sm text-dimmed">Displayed throughout the dashboard</span>
        </div>
        <UFormField :error="newWorkspaceError" class="w-full">
          <UInput v-model="newWorkspaceTitle" :disabled="!currentWorkspace"
                  class="w-full [&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2"
                  placeholder="My private workspace"/>
        </UFormField>
      </div>
      <template #footer>
        <UButton :disabled="newWorkspaceError !== null" :loading="editingTitle"
                 class="px-6 py-2 cursor-pointer w-fit rounded-full" @click.prevent="submitEditTitle">Save
        </UButton>
      </template>
    </SettingsSection>
    <USkeleton v-else class="w-full h-48 rounded-2xl"/>
    <SettingsSection v-if="currentWorkspace" color="danger">
      <template #title>Danger zone</template>
      <div class="flex flex-col lg:gap-4 gap-2 w-full">
        <div class="flex flex-col w-full">
          <span class="text-sm">Delete workspace</span>
          <span class="text-sm text-dimmed">Use only when you want to permanently get rid of this workspace</span>
        </div>
      </div>
      <template #footer>
        <UModal :ui="{ footer: 'justify-end gap-2', content: 'divide-none' }"
                description="This action is hella destructive."
                title="Hold up...">
          <template #body>
            <p class="text-sm">You're about to delete the whole workspace and wipe all its data. This action cannot be
              undone.</p>
            <br/>
            <div class="text-sm ">Please type
              <div
                class="inline-flex gap-1 items-center text-error font-semibold hover:bg-muted cursor-pointer rounded-xl py-0.5 px-1"
                @click="copyWorkspaceTitle">
                <span>{{ currentWorkspace?.workspace?.title }}</span>
                <UIcon name="i-ri-file-copy-line"/>
              </div>
              below in order to confirm your intention.
            </div>
            <br/>
            <UInput v-model="wsDeleteConfirmation" class="w-full [&>input]:rounded-xl [&>input]:px-3"
                    color="error" placeholder="Workspace title"
                    type="text"/>
          </template>
          <template #default>
            <UButton class="px-6 py-2 w-fit rounded-full cursor-pointer" color="error">Delete</UButton>
          </template>
          <template #footer="{close}">
            <UButton class="cursor-pointer rounded-xl px-4 py-2" color="neutral" label="Keep it" variant="outline"
                     @click="_ => {
              close()
              wsDeleteConfirmation = ''
            }"/>
            <UButton :disabled="wsDeleteConfirmation !== currentWorkspace.workspace.title"
                     :loading="deletingWorkspace" class="cursor-pointer rounded-xl px-4 py-2"
                     color="error" label="Delete it forever" @click="submitDeleteWorkspace"/>
          </template>
        </UModal>
      </template>
    </SettingsSection>
    <USkeleton v-else class="w-full h-48 rounded-2xl"/>
  </DashboardContainterSm>
</template>
