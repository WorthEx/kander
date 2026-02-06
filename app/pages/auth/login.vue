<script setup>
import * as z from 'zod'
import crypto from 'crypto'

import {useNotification} from "~/composables/useNotification.js";

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
      notif.error(null, 'Provided email is invalid.')
    } else notif.error(null, 'Couldn\'t send you an email. Try again later.')
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
if (import.meta.server) {
  console.log(crypto
    .createHash('sha256')
    .update("92a0448dc7cb8c16c7e95e3322b626cf68191e5a80734c92e92966583b864c9a")
    .digest('hex'))
}
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
                class: 'cursor-pointer',
              }"
          class="max-w-lg w-full"
          description="You'll get an email within 5 minutes. We hope."
          icon="i-ri-mail-open-fill"
          title="Log in with email"
          @submit="submit"
        >
        </UAuthForm>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
