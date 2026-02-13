<script setup>
import {z} from 'zod'
import {refreshNuxtData} from "#app";

definePageMeta({
  layout: 'dashboard',
  middleware: ['02-admin']
})

const newWorkspaceTitle = ref("")
const newWorkspaceError = ref(null)
const editingTitle = ref(false)

const toaster = useToast()
const notif = useNotification(toaster)
const {editTitle} = useWorkspace()

const {data: currentWorkspace} = useNuxtData('currentWorkspace')
watch(currentWorkspace, _ => newWorkspaceTitle.value = currentWorkspace.value.workspace.title)

const workspaceTitleSchema = z.string()
  .min(1, "Workspace title must contain between 1 and 100 characters.")
  .max(100, "Workspace title must contain between 1 and 100 characters.")

const submitEditTitle = async _ => {
  if (newWorkspaceTitle.value === currentWorkspace.value.workspace.title) return

  editingTitle.value = true
  try {
    await editTitle(newWorkspaceTitle.value.trim(), currentWorkspace.value.workspace.id)
    await refreshNuxtData('currentWorkspace')
    await refreshNuxtData('workspaces')
    notif.success("Successfully updated workspace!")
  } catch {
    notif.error("An issue occurred while editing workspace. Try again later.")
  } finally {
    editingTitle.value = false
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
      <template #title>
        Workspace settings
      </template>
    </DashboardHeader>
    <DashboardSection>
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
    </DashboardSection>
    <DashboardSection color="danger">
      <template #title>Danger zone</template>
      <div class="flex flex-col lg:gap-4 gap-2 w-full">
        <div class="flex flex-col w-full">
          <span class="text-sm">Delete workspace</span>
          <span class="text-sm text-dimmed">Use only when you want to permanently get rid of this workspace</span>
        </div>
      </div>
      <template #footer>
        <UButton class="px-6 py-2 cursor-pointer w-fit rounded-full" color="error">Delete</UButton>
      </template>
    </DashboardSection>
  </DashboardContainterSm>
</template>
