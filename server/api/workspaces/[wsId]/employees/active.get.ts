export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  const {exclude} = getQuery(event)

  const idsToExclude = (exclude as string).split(',')

  if (idsToExclude && idsToExclude.length > 0) {
    return prisma.workspaceMember.findMany({
      where: {
        workspaceId: wsId,
        isFired: false,
        userId: {
          notIn: idsToExclude
        }
      },
      include: {
        user: true
      },
    })
  }

  return prisma.workspaceMember.findMany({
    where: {
      workspaceId: wsId,
      isFired: false
    },
    include: {
      user: true
    },
  })
})
