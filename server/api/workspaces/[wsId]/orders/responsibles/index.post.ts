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

  const order = await prisma.order.findUnique({
    where: {id: orderId},
    include: {responsibles: true},
  })
  if (!order) throw createError({statusCode: 404, statusText: 'Order not found.'})

  const alreadyExists = order.responsibles.some(u => u.id === responsibleId)
  if (alreadyExists) throw createError({statusCode: 409, statusText: 'User is already responsible for this order.'})

  return prisma.order.update({
    where: {
      id: orderId
    },
    data: {
      responsibles: {
        connect: {
          id: responsibleId
        }
      }
    }
  })
})
