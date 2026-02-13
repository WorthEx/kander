export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth()
  const toaster = useToast()
  const notif = useNotification(toaster)
  if (!auth.initialized.value) return

  const adminOnlyRoutes = ['workspace-wsId-settings', 'workspace-wsId-integration']

  if (adminOnlyRoutes.includes(to.name as string)) {
    const wsId = to.params.wsId
    const isAdmin = await $fetch(`/api/workspaces/${wsId}/is-admin`, {
      credentials: 'include',
    })
    if (!isAdmin) {
      notif.error('You can\'t access this page without admin rights. Please contact the workspace supervisor.')
      return navigateTo(`/workspace/${wsId}/board`)
    }
  }
})
