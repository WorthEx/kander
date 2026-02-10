<script setup>
import * as z from 'zod'
import {useNotification} from "~/composables/useNotification.js";

definePageMeta({
  layout: 'default',
  auth: false,
})

const loading = ref(false)
const emailSent = ref(false)
const toast = useToast()
const notif = useNotification(toast)

const fields = computed(() => [{
  name: 'email',
  type: 'email',
  label: 'Email address',
  placeholder: 'satoshi@crypto.net',
  disabled: emailSent.value,
  required: true,
  class: '*:py-2'
}])

const schema = z.object({
  email: z.email("Invalid email"),
})

const sendAuthEmail = async (payload) => {
  emailSent.value = false
  if (!payload) return
  if (document.activeElement) {
    document.activeElement.blur();
  }
  loading.value = true
  const email = payload.data.email
  try {
    await $fetch('/api/auth/send-auth-link', {method: 'POST', body: {email}})
    emailSent.value = true
  } catch (e) {
    if (e.statusCode === 400) {
      notif.error('Provided email is invalid.')
    } else notif.error('Couldn\'t send you an email. Try again later.')
  } finally {
    loading.value = false
  }
}

const submit = async payload => {
  if (!emailSent.value) {
    await sendAuthEmail(payload)
  }
}

defineShortcuts({
  enter: () => {
    submit()
  }
})

</script>

<template>
  <UContainer>
    <UPage>
      <UPageBody class="flex justify-center items-center h-full">
        <UAuthForm
          :fields="fields"
          :schema="schema"
          :submit="{
                label: emailSent ? 'Check your inbox' : 'Send email',
                color: 'primary',
                loading,
                disabled: emailSent,
                class: 'cursor-pointer py-2 rounded-full',
                leadingIcon: emailSent ? '' : 'i-ri-send-plane-fill'
              }"
          class="max-w-lg w-full"
          description="You'll get an email with magic link to sign in. The link expires in 30 minutes, make sure to use it soon!"
          icon="i-ri-mail-open-fill"
          title="Log in via magic link"
          @submit="submit"
        >
        </UAuthForm>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
