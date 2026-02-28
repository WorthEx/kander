<script setup>
import {z} from 'zod'

definePageMeta({
  layout: 'dashboard',
})

const {data: currentWorkspace} = useNuxtData('currentWorkspace')
const route = useRoute()
const wsId = computed(() => route.params.wsId)
const toaster = useToast()
const notif = useNotification(toaster)
const {addCustomer} = useCustomers()

const addModalOpened = ref(false)
const searchQuery = ref('')
const addingCustomer = ref(false)
const addCustomerSchema = z.object({
  fullName: z.string().min(1, "Customer name is required.")
    .max(100, "Customer name must contain under 255 characters."),
  phone: z.e164({error: 'Invalid phone number.'}),
  countryCode: z.string().length(2, 'Country is required'),
  city: z.string()
    .min(2, "City is required.")
    .max(100, "City must contain between 2 and 100 characters."),

  region: z.string()
    .max(100, "Region name must contain under 100 characters.")
    .optional(),
  addressLine1: z.string()
    .max(100, "Address line must contain under 100 characters.")
    .optional(),
  addressLine2: z.string()
    .max(255, "Address line must contain under 255 characters.")
    .optional(),
  postalCode: z.string()
    .max(12, "Postal code must contain under 12 characters.")
    .optional(),
})
const addCustomerState = reactive({
  fullName: "",
  phone: "",
  countryCode: "",
  city: "",
  region: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
})

const resetAddForm = () => {
  addCustomerState.fullName = ""
  addCustomerState.phone = ""
  addCustomerState.countryCode = ""
  addCustomerState.city = ""
  addCustomerState.region = ""
  addCustomerState.addressLine1 = ""
  addCustomerState.addressLine2 = ""
  addCustomerState.postalCode = ""
}

const submitAddCustomer = async event => {
  if (!event.data || !event.data.fullName.trim() || !event.data.phone || !event.data.countryCode || !event.data.city.trim()) return
  if (customers.value.map(customer => customer.phone).includes(event.data.phone)) {
    notif.info("A customer with this phone number already exists.")
    return
  }

  addingCustomer.value = true
  try {
    await addCustomer({
      fullName: event.data.fullName.trim(),
      phone: event.data.phone,
      countryCode: event.data.countryCode,
      city: event.data.city.trim(),
      region: event.data.region.trim(),
      addressLine1: event.data.addressLine1.trim(),
      addressLine2: event.data.addressLine2.trim(),
      postalCode: event.data.postalCode.trim(),
    }, wsId.value)
    resetAddForm()
    await refreshCustomers()
    addModalOpened.value = false
    notif.success("A new customer has been added!")
  } catch {
    notif.error("An issue occurred while adding a customer. Try again later.")
  } finally {
    addingCustomer.value = false
  }
}

const {
  data: customers,
  pending: loadingCustomers,
  refresh: refreshCustomers,
} = await useLazyFetch(_ => `/api/workspaces/${wsId.value}/customers`, {
  server: false,
  key: `customers-${wsId.value}`,
  watch: [wsId],
  getCachedData: (key, nuxtApp, _) => {
    return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
  },
})

const shownCustomers = computed(_ => {
  if (!customers.value) return []
  let found = customers.value.filter(customer => customer.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()))
  if (found.length > 0) return found
  found = customers.value.filter(customer => customer.phone.includes(searchQuery.value))
  return found
})

</script>

<template>
  <DashboardContainer>
    <DashboardHeader>
      <template #title>
        Customers
      </template>
      <template #right>
        <UModal v-model:open="addModalOpened" :close="false" :ui="{ content: 'divide-none' }"
                description="...and make 'em spend!"
                scrollable title="Add new customer">
          <DashboardHeaderButton :disabled="!currentWorkspace || !customers" icon="i-ri-add-fill"
                                 label="Add"/>
          <template #body="{close}">
            <UForm :schema="addCustomerSchema" :state="addCustomerState" :validate-on="['change', 'input']"
                   class="space-y-4" @submit="submitAddCustomer">
              <UFormField label="Full name" name="fullName" required>
                <UInput v-model="addCustomerState.fullName"
                        class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full"/>
              </UFormField>
              <UFormField label="Phone number" name="phone" required>
                <UInput v-model="addCustomerState.phone"
                        class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full"/>
              </UFormField>
              <UFormField label="Country" name="countryCode" required>
                <USelect v-model="addCustomerState.countryCode" :items="countries"
                         class="rounded-xl px-3 py-2 w-full"/>
              </UFormField>
              <UFormField label="City" name="city" required>
                <UInput v-model="addCustomerState.city"
                        class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full"/>
              </UFormField>
              <UFormField label="Region" name="region">
                <UInput v-model="addCustomerState.region"
                        class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full"/>
              </UFormField>
              <UFormField label="Address line 1" name="addressLine1">
                <UInput v-model="addCustomerState.addressLine1"
                        class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full"/>
              </UFormField>
              <UFormField label="Address line 2" name="addressLine2">
                <UInput v-model="addCustomerState.addressLine2"
                        class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full"/>
              </UFormField>
              <UFormField label="Postal code" name="postalCode">
                <UInput v-model="addCustomerState.postalCode"
                        class="[&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2 w-full"/>
              </UFormField>
              <div
                class="flex mt-8 justify-end max-sm:flex-col max-sm:w-full gap-2 *:cursor-pointer *:select-none *:justify-center">
                <UButton class=" rounded-xl px-4 py-2" color="neutral" label="Cancel" variant="outline" @click="_ => {
                  close()
                  resetAddForm()
                }"/>
                <UButton :loading="addingCustomer" class="rounded-xl px-6 py-2" label="Add" type="submit"/>
              </div>
            </UForm>
          </template>
        </UModal>
      </template>
    </DashboardHeader>
    <section>
      <ClientOnly>
        <div class="pb-4">
          <UInput v-model="searchQuery" class="w-full [&>input]:rounded-xl [&>input]:px-10 [&>input]:py-2"
                  leadingIcon="i-ri-search-line"
                  placeholder="Start typing customer's name or phone..."/>
        </div>
        <div v-if="!customers || loadingCustomers"
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
              <th class="ps-4 pe-4">Name</th>
              <th class="ps-4 pe-4">Phone&nbsp;<span
                class="text-dimmed font-normal text-xs">(click&nbsp;to&nbsp;copy)</span>
              </th>
              <th class="ps-4 pe-4">Address&nbsp;<span
                class="text-dimmed font-normal text-xs">(click&nbsp;to&nbsp;copy)</span>
              </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-default *:even:bg-muted">
            <CustomerTableRow v-for="(customer, index) in shownCustomers" :key="customer.id"
                              :customer
                              :index="index + 1"
                              :style="{'animationDelay': `${index * 100}ms`}"/>
            </tbody>
          </table>
          <div v-if="shownCustomers.length < 1"
               class="w-full h-32 flex justify-center items-center text-sm select-none">
            No customers found
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
