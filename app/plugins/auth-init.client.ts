export default defineNuxtPlugin(async () => {
  const auth = useAuth()

  if (auth.initialized.value === true) return

  try {
    auth.user.value = await $fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    })
  } catch {
    auth.user.value = null
  } finally {
    auth.initialized.value = true
  }
})
