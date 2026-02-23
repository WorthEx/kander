export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkAdminAccess(event, wsId)

  await prisma.workspace.update({
    where: {
      id: wsId
    },
    data: {
      apiKey: ''
    }
  })
})
