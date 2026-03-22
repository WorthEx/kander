export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const {userId} = await checkWorkspaceAccess(event, wsId)

  const {item, orderId} = await readBody(event)
  if (!item.serviceId || !item.quantity || !item.price || !orderId) return createError({
    statusCode: 400,
    statusText: 'No serviceId, quantity, price or orderId provided.'
  })

  const order = await prisma.order.findUnique({
    where: {
      id: orderId
    },
    include: {
      responsibles: true
    }
  })
  if (!order) return createError({
    statusCode: 404,
    statusText: 'Order not found.'
  })
  if (!order.responsibles.some(user => user.id === userId)) return createError({
    statusCode: 403,
    statusText: 'User is not responsible for this order.'
  })

  return prisma.orderItem.create({
    data: {
      serviceId: item.serviceId,
      quantity: item.quantity,
      price: item.price,
      orderId,
    },
    include: {
      service: true
    }
  })
})
