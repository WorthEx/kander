export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth()
  const isPublic = to.meta.auth === false

  if (isPublic) {
    return
  }

  if (!auth.initialized.value) return

  if (!auth.user.value) {
    console.log('no access, navigating to log in')
    return navigateTo('/auth/login')
  }
})
