export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const {userId} = await checkWorkspaceAccess(event, wsId)

  const {itemId, orderId} = await readBody(event)
  if (!itemId || !orderId) return createError({
    statusCode: 400,
    statusText: 'No itemId or orderId provided.'
  })

  await checkOrderAccess(orderId, userId)

  await prisma.orderItem.delete({
    where: {
      id: itemId
    }
  })
})
