<script setup>
import {z} from "zod";

const toaster = useToast()
const notif = useNotification(toaster)
const {editProfile} = useProfile()
const {user} = useAuth()

const editingProfile = ref(false)
const modalOpened = defineModel({type: Boolean})

const newProfileDataSchema = z.object({
  fullName: z.string()
    .min(1, "Full name must contain between 1 and 100 characters.")
    .max(100, "Full name must contain between 1 and 100 characters."),
  avatar: z.url("Avatar field must be a valid URL.")
})

const newProfileDataState = reactive({
  fullName: "",
  avatar: "",
})

const closeModal = () => {
  newProfileDataState.fullName = user.value.fullName
  newProfileDataState.avatar = user.value.avatar
  modalOpened.value = false
}

const submitEditProfile = async event => {
  if (!event.data || !event.data.fullName.trim() || !event.data.avatar.trim()) return
  if (newProfileDataState.fullName === user.value.fullName && newProfileDataState.avatar === user.value.avatar) {
    closeModal()
    return
  }
  editingProfile.value = true
  try {
    await editProfile(event.data.fullName.trim(), event.data.avatar.trim())
    closeModal()
    notif.success("Successfully updated your profile!")
  } catch {
    notif.error("An issue occurred while editing your profile. Try again later.")
  } finally {
    editingProfile.value = false
  }
}

onMounted(_ => {
  newProfileDataState.fullName = user.value.fullName
  newProfileDataState.avatar = user.value.avatar
})
</script>

<template>
  <UModal v-model:open="modalOpened" :close="false"
          description="'To improve is to change; to be perfect is to change often.' — Winston Churchill. "
          title="Edit profile">
    <slot/>
    <template #body>
      <UForm :schema="newProfileDataSchema" :state="newProfileDataState"
             :validate-on="['change', 'input']" class="space-y-4"
             @submit="submitEditProfile">
        <UFormField label="Full name" name="fullName">
          <UInput v-model="newProfileDataState.fullName" class="w-full"/>
        </UFormField>
        <UFormField label="Avatar url" name="avatar">
          <UInput v-model="newProfileDataState.avatar" class="w-full"/>
        </UFormField>
        <div class=" flex flex-col gap-1">
          <span class="text-sm">Avatar preview</span>
          <img
            :class="newProfileDataState.avatar.includes('ssl.gstatic.com/docs/common/profile') && 'light:brightness-0'"
            :src="newProfileDataState.avatar"
            alt=""
            class="size-24 object-cover rounded-full pointer-events-none mx-auto select-none"
            @error="e => { e.target.src='https://ssl.gstatic.com/docs/common/profile/capybara_lg.png'}">
        </div>
        <div
          class="flex mt-6 justify-end max-sm:flex-col max-sm:w-full gap-2 *:cursor-pointer *:select-none *:px-4 *:py-2 *:justify-center">
          <UButton class="rounded-lg" color="neutral" label="Cancel" variant="outline" @click="closeModal"/>
          <UButton :loading="editingProfile" class="rounded-lg" label="Submit" type="submit"/>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
