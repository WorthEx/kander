export default defineEventHandler(async (event) => {
  checkUser(event)

  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  return prisma.service.findMany({
    where: {
      workspaceId: wsId
    },
    orderBy: {
      isArchived: 'asc'
    }
  })
})
