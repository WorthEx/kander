<script setup>
definePageMeta({
  layout: 'dashboard',
})
const {data: currentWorkspace} = useNuxtData('currentWorkspace')
const route = useRoute()
const wsId = computed(() => route.params.wsId)
const toaster = useToast()
const notif = useNotification(toaster)
const nuxtApp = useNuxtApp()

const searchQuery = ref("")
const newOrderModalOpened = ref(false)
const activeTab = ref('kanban')
const tabItems = [
  {
    label: 'Kanban',
    icon: 'i-ri-kanban-view-2',
    value: 'kanban'
  },
  {
    label: 'Table',
    icon: 'i-ri-table-view',
    value: 'table'
  }
]

const {
  data: employees,
  pending: loadingEmployees
} = await useLazyFetch(_ => `/api/workspaces/${wsId.value}/employees`, {
  server: false,
  key: `employees-${wsId.value}`,
  watch: [wsId],
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <header class="flex max-md:flex-col sm:justify-between gap-4 md:items-center w-full">
      <div class="flex items-center gap-2">
        <UInput v-model="searchQuery"
                class="w-full sm:min-w-xs md:max-w-md [&>input]:rounded-xl [&>input]:ps-10 [&>input]:py-2"
                leadingIcon="i-ri-search-line"
                placeholder="Search..." variant="soft">
          <template v-if="searchQuery?.length" #trailing>
            <UButton
              aria-label="Clear input"
              class="cursor-pointer"
              color="neutral"
              icon="i-ri-close-fill"
              size="sm"
              variant="link"
              @click="searchQuery = ''"
            />
          </template>
        </UInput>
      </div>
      <div class="flex w-full items-center justify-between gap-2">
        <UTabs v-model="activeTab" :content="false" :items="tabItems"
               class="**:cursor-pointer" variant="link"/>
        <UButton class="sm:px-4 px-2.5 sm:py-2 py-2.5 rounded-xl cursor-pointer" color="primary"
                 @click="newOrderModalOpened = true">
          <template #trailing>
            <UIcon class="size-4.5" name="i-ri-add-fill"/>
          </template>
          <template #default>
            <span class="max-sm:hidden">New</span>
          </template>
        </UButton>
      </div>
    </header>
    <section class="w-full">
      <div v-if="activeTab === 'kanban'" class="size-full">

      </div>
      <div v-else-if="activeTab === 'table'" class="size-full">

      </div>
    </section>
  </div>
</template>

