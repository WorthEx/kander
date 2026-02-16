export default defineEventHandler(async (event) => {
  checkUser(event)

  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

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
