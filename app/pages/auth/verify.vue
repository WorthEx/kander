<script setup>
definePageMeta({
  auth: false,
})

const route = useRoute()
const token = route.query.token
const toast = useToast()
const notif = useNotification(toast)
const auth = useAuth()

onMounted(async _ => {
  if (!token) return
  try {
    await $fetch('/api/auth/verify', {
      query: {token},
    })
    auth.user.value = await $fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    })
    auth.initialized.value = true
    navigateTo('/overview')
  } catch (_) {
    notif.error('We couldn\'t verify your token: it\'s either invalid or expired.')
    navigateTo('/auth/login')
  }
})

</script>

<template>
  <LoginSplash/>
</template>
