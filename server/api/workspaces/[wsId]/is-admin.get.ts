export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  try {
    await checkAdminAccess(event, wsId)
    return true
  } catch {
    return false
  }
})
