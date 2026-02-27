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
const {user} = useAuth()
const {apiBaseUrl} = useConstants()

const keyHidden = ref(true)
const actionInProgress = ref(false)
const confirmRegenerateModalOpened = ref(false)
const confirmRevokeModalOpened = ref(false)

const handleCopyApiKey = _ => {
  copy(cachedApiKey.value)
  notif.info('API key copied to clipboard!')
}

const handleCopyBaseUrl = _ => {
  copy(apiBaseUrl.value)
  notif.info('Base URL copied to clipboard!')
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

const accessError = _ => {
  notif.info('You don\'t have permission to operate with this page. Please contact workspace supervisor.')
  navigateTo(`/workspace/${wsId.value}/board`)
}

onMounted(async _ => {
  if (user.value?.role === 'admin') {
    await fetchKey()
  }
})

watch(user, async newUser => {
  if (newUser.role === 'admin') {
    await fetchKey()
  } else accessError()
}, {deep: true})

const apiDocs = computed(_ => [
  {
    title: 'Get all active services',
    description: 'Use it to display available services',
    method: 'GET',
    route: '/services',
    curl: {
      method: 'GET',
      url: `${apiBaseUrl.value}/services`,
      headers: {
        'X-API-KEY': 'API_KEY',
      }
    },
    status: 'ready'
  },
  {
    title: 'Add new customer',
    description: 'Use it to save a customer for future orders',
    method: 'POST',
    route: '/customers',
    curl: {
      method: 'POST',
      url: `${apiBaseUrl.value}/customers`,
      headers: {
        'X-API-KEY': 'API_KEY',
      },
      body: {
        fullName: "Jane Doe",
        phone: "+77756485746",
        countryCode: "JP",
        city: "Tokyo"
      }
    },
    bodySchema: {
      "fullName": "String",
      "phone": "String",
      "countryCode": "String",
      "city": "String",
      "region?": "String",
      "addressLine1?": "String",
      "addressLine2?": "String",
      "postalCode?": "String",
    },
    status: 'tbd'
  },
  {
    title: 'Add new order',
    description: 'Use it to place an order with optional items',
    method: 'POST',
    route: '/orders',
    curl: {
      method: 'POST',
      url: `${apiBaseUrl.value}/orders`,
      headers: {
        'X-API-KEY': 'API_KEY',
      },
      body: {
        title: "Spaceship 3D model",
        description: "A 3D model of a spaceship",
        customerId: "5a48d232-bb95-4a99-ab11-84cf299dd3b7",
        items: [
          {
            price: 4.20,
            quantity: 6,
            serviceId: "ed458569-37a4-4516-8747-b4aed411f5ec"
          },
          {
            price: 14.88,
            quantity: 7,
            serviceId: "1c226d7c-5b48-4270-8332-55567b8c1f3a"
          }
        ]
      }
    },
    bodySchema: {
      "title": "String",
      "description?": "String",
      "customerId": "String",
      "items?": [
        {
          price: "Float",
          quantity: "Integer",
          serviceId: "String"
        }
      ]
    },
    status: 'tbd'
  }
])
</script>

<template>
  <DashboardContainterSm class="lg:pb-12 pb-6">
    <DashboardHeader>
      <template #title>
        <div class="inline-flex gap-2 items-center">
          <span>Integration</span>
          <UBadge class="rounded-full" color="info" variant="subtle">Experimental</UBadge>
        </div>
      </template>
      <template #description>Kander provides an API for integration with your applications and chatbots.</template>
      <UTooltip text="Copy base URL">
        <div
          class="mt-2 bg-muted/50 ring-default ring overflow-hidden w-full rounded-xl px-3 py-2 text-sm
        flex items-center justify-between gap-2 group hover:bg-muted transition-all cursor-pointer"
          @click="handleCopyBaseUrl">
          <span class="break-all font-mono select-none">{{ apiBaseUrl }}</span>
          <UIcon class="size-4 group-hover:opacity-100 lg:opacity-0 transition-all text-muted"
                 name="i-ri-file-copy-line"/>
        </div>
      </UTooltip>
    </DashboardHeader>

    <section class="flex flex-col gap-4">
      <div class="flex flex-col gap-1 w-full">
        <span class="text-lg">API Key</span>
        <p class="text-dimmed text-sm">For authentication purposes, all endpoints require the <span
          class="font-mono text-primary whitespace-nowrap">X-API-KEY</span> header to be provided</p>
      </div>
      <div
        class="bg-muted/50 ring-default ring w-full rounded-xl px-2 py-2 h-fit text-sm flex gap-2 items-center">
        <USkeleton v-if="!apiKeyFetched || actionInProgress"
                   class="min-h-6 py-1 rounded-lg w-full flex items-center justify-center text-muted">
          Fetching API key...
        </USkeleton>
        <div v-else-if="!cachedApiKey || cachedApiKey?.length < 1"
             class="">You haven't generated an API key yet.
        </div>
        <UTooltip v-else text="Copy API key">
          <div :class="keyHidden ? 'blur-sm' : 'hover:bg-elevated/50'"
               class="py-1 px-1 rounded-lg break-all cursor-pointer font-mono transition-all select-none"
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

    <section class="flex flex-col gap-4">
      <div class="flex flex-col gap-1 w-full">
        <span class="text-lg">Endpoints</span>
        <p class="text-dimmed text-sm">List of all available endpoints</p>
      </div>
      <div class="flex flex-col gap-4 w-full">
        <ApiDocsListItem v-for="(item, index) in apiDocs" :key="index" :bodySchema="item.bodySchema" :curl="item.curl"
                         :description="item.description" :method="item.method" :route="item.route" :status="item.status"
                         :title="item.title"/>
      </div>
    </section>
  </DashboardContainterSm>
</template>
