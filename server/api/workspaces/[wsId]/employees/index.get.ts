export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  return prisma.workspaceMember.findMany({
    where: {
      workspaceId: wsId
    },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          avatar: true
        }
      }
    },
    orderBy: {
      isFired: 'asc'
    }
  })
})
