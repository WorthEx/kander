export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  return prisma.service.findMany({
    where: {
      workspaceId: wsId
    },
    orderBy: {
      isArchived: 'asc'
    }
  })
})
