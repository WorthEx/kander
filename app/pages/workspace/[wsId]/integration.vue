<script setup>
import {useClipboard} from "@vueuse/core";

definePageMeta({
  layout: 'dashboard',
})

const toaster = useToast()
const notif = useNotification(toaster)
const route = useRoute()
const wsId = computed(() => route.params.wsId)
const {cachedApiKey, fetchKey, apiKeyFetched, generateKey, revokeKey} = useApiKey()
const {copy} = useClipboard()
const {initialized, user} = useAuth()
const {data: currentWorkspace} = useNuxtData('currentWorkspace')

const keyHidden = ref(true)
const actionInProgress = ref(false)
const confirmRegenerateModalOpened = ref(false)
const confirmRevokeModalOpened = ref(false)

const handleCopyApiKey = _ => {
  copy(cachedApiKey.value)
  notif.info('API key copied to clipboard!')
}

const handleGenerateKey = async _ => {
  if (user.value?.role !== 'admin') {
    notif.info('You don\'t have permission for this operation. Please contact workspace supervisor.')
    return
  }

  actionInProgress.value = true
  try {
    await generateKey()
    notif.success("Successfully generated a new API key.")
  } catch {
    notif.error("An issue occurred while generating an API key. Try again later.")
  } finally {
    actionInProgress.value = false
    confirmRegenerateModalOpened.value = false
  }
}

const handleRevokeKey = async _ => {
  if (user.value?.role !== 'admin') {
    notif.info('You don\'t have permission for this operation. Please contact workspace supervisor.')
    return
  }

  actionInProgress.value = true
  try {
    await revokeKey()
    notif.success("Successfully revoked an API key.")
  } catch {
    notif.error("An issue occurred while revoking an API key. Try again later.")
  } finally {
    actionInProgress.value = false
    confirmRevokeModalOpened.value = false
  }
}


onMounted(async _ => {
  if (user.value?.role === 'admin') {
    await fetchKey()
  }
})

watch(user, async newUser => {
  if (newUser.role === 'admin') {
    await fetchKey()
  }
}, {deep: true})
</script>

<template>
  <DashboardContainterSm>
    <DashboardHeader>
      <template #title>
        Workspace integration
      </template>
    </DashboardHeader>
    <section class="flex flex-col gap-4">
      <div class="flex flex-col w-full">
        <span class="text-lg">API Key</span>
        <p class="text-dimmed text-sm">Use this to authenticate requests to your workspace</p>
      </div>
      <div
        class="w-full rounded-xl bg-muted px-3 py-2 h-fit text-sm ring ring-accented flex gap-2 items-center">
        <USkeleton v-if="!apiKeyFetched || actionInProgress" class="h-6 rounded-lg w-full"/>
        <div v-else-if="cachedApiKey.length < 1"
             class="">You haven't generated an API key yet.
        </div>
        <UTooltip v-else text="Copy API key">
          <div :class="keyHidden ? 'blur-sm' : 'hover:bg-accented'"
               class="py-1 px-1.5 rounded-xl break-all cursor-pointer font-mono transition-all select-none"
               @click="handleCopyApiKey">
            {{ cachedApiKey }}
          </div>
        </UTooltip>

        <UButton v-if="apiKeyFetched && cachedApiKey?.length > 1"
                 :icon="keyHidden ? 'i-ri-eye-off-line' : 'i-ri-eye-line'"
                 class="cursor-pointer ms-auto"
                 color="neutral"
                 variant="link" @click="keyHidden = !keyHidden"/>
      </div>
      <div v-if="apiKeyFetched && cachedApiKey?.length > 1"
           class="flex gap-2 justify-end *:rounded-full *:py-2 *:px-4 *:cursor-pointer *:max-sm:w-full *:max-sm:justify-center">
        <UModal v-model:open="confirmRevokeModalOpened"
                :ui="{ footer: 'justify-end gap-2', content: 'divide-none', body: 'sm:py-4 py-2' }"
                description="This action is implicitly destructive."
                title="Confirm key revocation">
          <template #body>
            <p class="text-sm">You're trying to revoke the current API key. Any service using it will lose the ability
              to function properly.</p>
          </template>
          <template #default>
            <UButton color="error" label="Revoke" variant="subtle"/>
          </template>
          <template #footer="{close}">
            <UButton class="cursor-pointer rounded-xl px-4 py-2" color="neutral" label="Cancel"
                     variant="outline"
                     @click="close"/>
            <UButton :loading="actionInProgress"
                     class="cursor-pointer rounded-xl px-4 py-2"
                     color="error"
                     label="Revoke current key" @click="handleRevokeKey"/>
          </template>
        </UModal>
        <UModal v-model:open="confirmRegenerateModalOpened"
                :ui="{ footer: 'justify-end gap-2', content: 'divide-none', body: 'sm:py-4 py-2' }"
                description="This action is implicitly destructive."
                title="Confirm regeneration">
          <template #body>
            <p class="text-sm">You're trying to generate a brand new API key. Previous key cannot be recovered. Any
              service using it should be updated accordingly.</p>
          </template>
          <template #default>
            <UButton label="Regenerate" leadingIcon="i-ri-refresh-line"/>
          </template>
          <template #footer="{close}">
            <UButton class="cursor-pointer rounded-xl px-4 py-2" color="neutral" label="Cancel"
                     variant="outline"
                     @click="close"/>
            <UButton :loading="actionInProgress"
                     class="cursor-pointer rounded-xl px-4 py-2"
                     label="Generate new key" @click="handleGenerateKey"/>
          </template>
        </UModal>
      </div>
      <div v-else-if="apiKeyFetched"
           class="flex gap-2 justify-end *:rounded-full *:py-2 *:px-4 *:cursor-pointer *:max-sm:w-full *:max-sm:justify-center">
        <UButton :loading="actionInProgress" label="Generate key" leadingIcon="i-ri-key-2-fill"
                 @click="handleGenerateKey"/>
      </div>
    </section>
  </DashboardContainterSm>
</template>
