export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const {userId} = await checkWorkspaceAccess(event, wsId)

  const {responsibleId, orderId} = await readBody(event)
  if (!responsibleId || !orderId) return createError({
    statusCode: 400,
    statusText: 'No responsibleId or orderId provided.'
  })

  await checkOrderAccess(orderId, userId)

  await prisma.order.update({
    where: {
      id: orderId
    },
    data: {
      responsibles: {
        disconnect: {
          id: responsibleId
        }
      }
    }
  })
})
