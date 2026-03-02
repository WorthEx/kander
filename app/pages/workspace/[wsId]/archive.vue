<script setup>

import {useArchive} from "~/composables/useArchive.js";

definePageMeta({
  layout: 'dashboard',
  pageTransition: {
    name: 'blurry',
  },
})

const {data: currentWorkspace} = useNuxtData('currentWorkspace')
const route = useRoute()
const wsId = computed(() => route.params.wsId)
const toaster = useToast()
const notif = useNotification(toaster)
const {sortState, toggleSort} = useSort()
const nuxtApp = useNuxtApp()
const {deleteAllOrders} = useArchive()

const purgeDropdownItems = ref([
  {
    label: 'Delete all',
    onSelect: _ => deleteAllModalOpened.value = true
  },
  {
    label: 'Delete all in range'
  }
])
const searchQuery = ref('')
const deleteAllModalOpened = ref(false)
const deletingAllOrders = ref(false)

// refreshes the archive after every operation
const onDeleteOrder = async _ => {
  nuxtApp.payload.data[`archive-${wsId.value}`] = undefined
  await refreshArchive()
}

const handleDeleteAllOrders = async _ => {
  deletingAllOrders.value = true
  try {
    await deleteAllOrders(wsId.value)
    deleteAllModalOpened.value = false
    notif.success("Successfully wiped order archive!")
    await onDeleteOrder()
  } catch {
    notif.error("An issue occurred while wiping the archive. Try again later.")
  } finally {
    deletingAllOrders.value = false
  }
}

const {
  data: archive,
  pending: loadingArchive,
  refresh: refreshArchive,
} = await useLazyFetch(_ => `/api/workspaces/${wsId.value}/archive`, {
  server: false,
  key: `archive-${wsId.value}`,
  watch: [wsId],
  getCachedData: (key, nuxtApp, _) => {
    return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
  },
})

const shownOrders = computed(() => {
  if (!archive.value) return [];

  // search
  let result = archive.value.filter(order =>
    order.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  // sort
  const {key, direction} = sortState.value
  if (key && direction) {
    const modifier = direction === 'asc' ? 1 : -1

    result = [...result].sort((a, b) => {
      let valA = a[key]
      let valB = b[key]

      // if comparing numbers
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * modifier
      }

      // if comparing NOT numbers
      return String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
        sensitivity: 'base'
      }) * modifier;
    })
  }

  return result
})

const currency = computed(() => currentWorkspace.value?.workspace?.currency)
</script>

<template>
  <DashboardContainer>
    <UModal v-model:open="deleteAllModalOpened"
            :ui="{ footer: 'justify-end gap-2', content: 'divide-none', body: 'py-2 sm:py-2' }"
            description="This operation is really risky"
            title="Hold up...">
      <template #body>
        <p class="text-sm">You are completely wiping order archive. Subsequently, <span
          class="text-error font-semibold">these orders will not be included in any reports</span>. This action cannot
          be
          undone.</p>
      </template>

      <template #footer="{close}">
        <UButton class="cursor-pointer rounded-xl px-4 py-2" color="neutral" label="Cancel" variant="outline"
                 @click="close"/>
        <UButton :loading="deletingAllOrders"
                 class="cursor-pointer rounded-xl px-4 py-2" color="error" label="Delete"
                 @click="handleDeleteAllOrders"/>
      </template>
    </UModal>
    <DashboardHeader>
      <template #title>
        Order archive
      </template>
      <template #right>
        <UDropdownMenu
          :content="{
            align: 'end',
            side: 'bottom',
            sideOffset: 8,
            class: '*:*:*:pe-4 *:*:*:py-2 *:*:*:cursor-pointer'
          }"
          :items="purgeDropdownItems">
          <UButton :disabled="!currentWorkspace || !archive" class="cursor-pointer px-4 py-2 rounded-full gap-2"
                   color="error"
                   label="Purge">
            <template #trailing>
              <UIcon class="size-4.5" name="i-ri-delete-bin-6-fill"/>
            </template>
          </UButton>
        </UDropdownMenu>
      </template>
    </DashboardHeader>
    <section>
      <ClientOnly>
        <div class="pb-4 flex items-center gap-2">
          <UInput v-model="searchQuery" class="w-full [&>input]:rounded-xl [&>input]:px-10 [&>input]:py-2"
                  leadingIcon="i-ri-search-line"
                  placeholder="Start typing order's title..."/>
          <UButton v-if="searchQuery.length > 0" class="p-2 rounded-xl cursor-pointer" color="error"
                   icon="i-ri-close-fill"
                   variant="soft" @click="_ => searchQuery = ''"/>
        </div>
        <div v-if="!archive || loadingArchive"
             class="rounded-lg overflow-hidden w-full flex flex-col">
          <div v-for="(_, index) in 8" :style="{'animationDelay': `${index * 200}ms`}"
               class="bg-muted w-full h-15 animate-fade-up animate-ease-out animate-duration-500"/>
        </div>
        <div v-else
             class="relative overflow-x-auto max-h-180 rounded-lg border border-default **:text-start no-scrollbar">
          <table class="table-auto border-collapse w-full text-sm">
            <thead class="border-b border-default bg-elevated select-none sticky top-0 z-1">
            <tr class="*:py-3">
              <th class="ps-4">#</th>
              <th :class="sortState.key === 'title' && 'bg-muted text-primary'"
                  class="px-4 transition-all hover:bg-muted hover:text-primary cursor-pointer"
                  @click="toggleSort('title')">
                <div class="flex gap-2 items-center">
                  <span>Title</span>
                  <UIcon v-if="sortState.key === 'title'"
                         :name="sortState.direction === 'asc' ? 'i-ri-arrow-up-s-fill' : 'i-ri-arrow-down-s-fill'"
                         class="size-4"/>
                </div>
              </th>
              <th :class="sortState.key === 'customerName' && 'bg-muted text-primary'"
                  class="px-4 transition-all hover:bg-muted hover:text-primary cursor-pointer"
                  @click="toggleSort('customerName')">
                <div class="flex gap-2 items-center">
                  <span>Customer</span>
                  <UIcon v-if="sortState.key === 'customerName'"
                         :name="sortState.direction === 'asc' ? 'i-ri-arrow-up-s-fill' : 'i-ri-arrow-down-s-fill'"
                         class="size-4"/>
                </div>
              </th>
              <th :class="sortState.key === 'totalCost' && 'bg-muted text-primary'"
                  class="px-4 transition-all hover:bg-muted hover:text-primary cursor-pointer"
                  @click="toggleSort('totalCost')">
                <div class="flex gap-2 items-center">
                  <span>Total&nbsp;cost</span>
                  <UIcon v-if="sortState.key === 'totalCost'"
                         :name="sortState.direction === 'asc' ? 'i-ri-arrow-up-s-fill' : 'i-ri-arrow-down-s-fill'"
                         class="size-4"/>
                </div>
              </th>
              <th :class="sortState.key === 'createdAt' && 'bg-muted text-primary'"
                  class="px-4 transition-all hover:bg-muted hover:text-primary cursor-pointer"
                  @click="toggleSort('createdAt')">
                <div class="flex gap-2 items-center">
                  <span>Created&nbsp;at</span>
                  <UIcon v-if="sortState.key === 'createdAt'"
                         :name="sortState.direction === 'asc' ? 'i-ri-arrow-up-s-fill' : 'i-ri-arrow-down-s-fill'"
                         class="size-4"/>
                </div>
              </th>
              <th class="ps-4 pe-4">Actions</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-default *:even:bg-muted">
            <ArchiveTableRow v-for="(order, index) in shownOrders" :key="order.id"
                             :currency
                             :index="index + 1"
                             :order
                             :style="{'animationDelay': `${index * 100}ms`}"
                             @delete-order="onDeleteOrder"/>
            </tbody>
          </table>
          <div v-if="shownOrders.length < 1"
               class="w-full h-32 flex justify-center items-center text-sm select-none">
            No archived orders found
          </div>
        </div>
        <template #fallback>
          <div class="rounded-lg overflow-hidden w-full flex flex-col">
            <div v-for="(_, index) in 8" :style="{'animationDelay': `${index * 200}ms`}"
                 class="bg-muted w-full h-15 animate-fade-up animate-ease-out animate-duration-500"/>
          </div>
        </template>
      </ClientOnly>
    </section>
  </DashboardContainer>
</template>

<style scoped>

</style>
