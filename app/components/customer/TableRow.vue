<script setup>
import {useClipboard} from "@vueuse/core";

const props = defineProps({
  customer: Object,
  index: Number
})

const {copy} = useClipboard()
const toaster = useToast()
const notif = useNotification(toaster)

const handleCopyPhoneNumber = _ => {
  copy(props.customer.phone)
  notif.info('Customer\'s phone number copied to clipboard!')
}

const handleCopyAddress = _ => {
  copy(addressString.value)
  notif.info('Customer\'s address copied to clipboard!')
}

const addressString = computed(_ => buildAddressString(
  props.customer.countryCode,
  props.customer.city,
  props.customer.region,
  props.customer.addressLine1,
  props.customer.addressLine2,
  props.customer.postalCode,
))

</script>

<template>
  <tr class="*:py-4 animate-fade-up animate-ease-out animate-duration-500">
    <td class="select-none ps-4">
      {{ index }}
    </td>
    <td class="select-none ps-4 pe-4">
      <span class="text-sm text-nowrap">{{ customer.fullName }}</span>
    </td>
    <td class="select-none ps-4 pe-4">
      <div class="group flex items-center gap-2 w-fit cursor-pointer"
           @click="handleCopyPhoneNumber">
        <span class="text-sm text-nowrap">{{ customer.phone }}</span>
        <UIcon class="size-3 group-hover:opacity-100 opacity-0 transition-all text-dimmed" name="i-ri-file-copy-line"/>
      </div>
    </td>
    <td class="select-none ps-4 pe-4">
      <div class="group flex items-center gap-2 w-fit cursor-pointer"
           @click="handleCopyAddress">
        <span class="text-sm text-nowrap">{{ addressString }}</span>
        <UIcon class="size-3 group-hover:opacity-100 opacity-0 transition-all text-dimmed" name="i-ri-file-copy-line"/>
      </div>
    </td>
  </tr>
</template>

<style scoped>

</style>
