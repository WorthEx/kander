<script setup>
import {z} from "zod";
import {useServices} from "~/composables/useServices.js";

definePageMeta({
  layout: 'dashboard',
})

const {data: currentWorkspace} = useNuxtData('currentWorkspace')
const route = useRoute()
const wsId = computed(() => route.params.wsId)
const toaster = useToast()
const notif = useNotification(toaster)
const {addService} = useServices()
const {sortState, toggleSort} = useSort()


const addModalOpened = ref(false)
const searchQuery = ref('')
const addingService = ref(false)
const addServiceSchema = z.object({
  title: z.string().min(1, "Service title is required.")
    .max(100, "Service title must contain under 100 characters."),
  basePrice: z.float64().min(0.01, "Base price is required."),
})
const addServiceState = reactive({
  title: "",
  basePrice: 0.00,
})

const resetAddForm = () => {
  addServiceState.title = ""
  addServiceState.basePrice = 0.0
}

const submitAddService = async event => {
  if (!event.data || !event.data.title.trim() || !event.data.basePrice) return

  addingService.value = true
  try {
    await addService({
      title: event.data.title.trim(),
      basePrice: event.data.basePrice,
    }, wsId.value)
    resetAddForm()
    await refreshServices()
    addModalOpened.value = false
    notif.success("A service has been added!")
  } catch {
    notif.error("An issue occurred while adding a service. Try again later.")
  } finally {
    addingService.value = false
  }
}

const onUpdateService = async _ => {
  await refreshServices()
}

const {
  data: services,
  pending: loadingServices,
  refresh: refreshServices,
} = await useLazyFetch(_ => `/api/workspaces/${wsId.value}/services`, {
  server: false,
  key: `services-${wsId.value}`,
  watch: [wsId],
  getCachedData: (key, nuxtApp, _) => {
    return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
  },
})

const shownServices = computed(() => {
  if (!services.value) return [];

  // search
  let result = services.value.filter(service =>
    service.title.toLowerCase().includes(searchQuery.value.toLowerCase())
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
</script>

<template>
  <DashboardContainer>
    <DashboardHeader>
      <template #title>
        Services
      </template>
      <template #right>
        <UModal v-model:open="addModalOpened" :close="false" :ui="{ content: 'divide-none' }"
                description="Sell water to a fish, sell the time to a clock"
                scrollable title="Add new service">
          <DashboardHeaderButton :disabled="!currentWorkspace || !services" icon="i-ri-add-fill"
                                 label="Add"/>
          <template #body="{close}">
            <UForm :schema="addServiceSchema" :state="addServiceState" :validate-on="['change', 'input']"
                   class="space-y-4" @submit="submitAddService">
              <UFormField label="Title" name="title" required>
                <UInput v-model="addServiceState.title"
                        class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full"
                        placeholder="Dr. Web installation"/>
              </UFormField>
              <UFormField help="Set the default price for this service" label="Base price" name="basePrice" required>
                <UInputNumber v-model="addServiceState.basePrice"
                              :format-options="{minimumFractionDigits: 2, maximumFractionDigits: 2, roundingIncrement: 1}"
                              :step="0.01"
                              class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full **:text-center"
                />
              </UFormField>
              <div
                class="flex mt-8 justify-end max-sm:flex-col max-sm:w-full gap-2 *:cursor-pointer *:select-none *:justify-center">
                <UButton class=" rounded-xl px-4 py-2" color="neutral" label="Cancel" variant="outline" @click="_ => {
                            close()
                            resetAddForm()
                          }"/>
                <UButton :loading="addingService" class="rounded-xl px-6 py-2" label="Add" type="submit"/>
              </div>
            </UForm>
          </template>
        </UModal>
      </template>
    </DashboardHeader>
    <section>
      <ClientOnly>
        <div class="pb-4 flex items-center gap-2">
          <UInput v-model="searchQuery" class="w-full [&>input]:rounded-xl [&>input]:px-10 [&>input]:py-2"
                  leadingIcon="i-ri-search-line"
                  placeholder="Start typing service's title..."/>
          <UButton v-if="searchQuery.length > 0" class="p-2 rounded-xl cursor-pointer" color="error"
                   icon="i-ri-close-fill"
                   variant="soft" @click="_ => searchQuery = ''"/>
        </div>
        <div v-if="!services || loadingServices"
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
              <th :class="sortState.key === 'title' ? 'bg-muted text-primary' : ''"
                  class="ps-4 pe-4 lg:min-w-120 transition-all hover:bg-muted hover:text-primary cursor-pointer"
                  @click="toggleSort('title')">
                <div class="flex gap-2 items-center">
                  <span>Title</span>
                  <UIcon v-if="sortState.key === 'title'"
                         :name="sortState.direction === 'asc' ? 'i-ri-arrow-up-s-fill' : 'i-ri-arrow-down-s-fill'"
                         class="size-4"/>
                </div>
              </th>
              <th :class="sortState.key === 'basePrice' && 'bg-muted text-primary'"
                  class="ps-4 pe-10 transition-all hover:bg-muted hover:text-primary cursor-pointer"
                  @click="toggleSort('basePrice')">
                <div class="flex gap-2 items-center">
                  <span>Base&nbsp;price</span>
                  <UIcon v-if="sortState.key === 'basePrice'"
                         :name="sortState.direction === 'asc' ? 'i-ri-arrow-up-s-fill' : 'i-ri-arrow-down-s-fill'"
                         class="size-4"/>
                </div>
              </th>
              <th :class="sortState.key === 'isArchived' ? 'bg-muted text-primary' : ''"
                  class="ps-4 pe-4 transition-all hover:bg-muted hover:text-primary cursor-pointer"
                  @click="toggleSort('isArchived')">
                <div class="flex gap-2 items-center">
                  <span>Status</span>
                  <UIcon v-if="sortState.key === 'isArchived'"
                         :name="sortState.direction === 'asc' ? 'i-ri-arrow-up-s-fill' : 'i-ri-arrow-down-s-fill'"
                         class="size-4"/>
                </div>
              </th>
              <th v-if="currentWorkspace.workspaceMember.role === 'admin'"></th>
            </tr>
            </thead>
            <tbody class="divide-y divide-default *:even:bg-muted">
            <ServiceTableRow v-for="(service, index) in shownServices" :key="service.id"
                             :index="index + 1"
                             :isCurrentUserAdmin="currentWorkspace.workspaceMember.role === 'admin'"
                             :service
                             :style="{'animationDelay': `${index * 100}ms`}"
                             @updateService="onUpdateService"/>
            </tbody>
          </table>
          <div v-if="shownServices.length < 1"
               class="w-full h-32 flex justify-center items-center text-sm select-none">
            No services found
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
