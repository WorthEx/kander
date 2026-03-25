export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const {userId} = await checkWorkspaceAccess(event, wsId)

  const {linkId, orderId} = await readBody(event)
  if (!linkId || !orderId) return createError({
    statusCode: 400,
    statusText: 'No linkId or orderId provided.'
  })

  await checkOrderAccess(orderId, userId)

  await prisma.orderLink.delete({
    where: {
      id: linkId
    }
  })
})
