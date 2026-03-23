export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const {userId} = await checkWorkspaceAccess(event, wsId)

  const {itemId, orderId, done} = await readBody(event)
  if (!itemId || !orderId || done === undefined || done === null) return createError({
    statusCode: 400,
    statusText: 'No itemId, orderId or done provided.'
  })

  await checkOrderAccess(orderId, userId)

  await prisma.orderItem.update({
    where: {
      id: itemId
    },
    data: {
      isDone: done
    }
  })
})
