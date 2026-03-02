export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)


  await prisma.order.deleteMany({
    where: {
      column: {
        workspaceId: wsId
      },
      isArchived: true
    },
  })

  return {ok: true}
})
