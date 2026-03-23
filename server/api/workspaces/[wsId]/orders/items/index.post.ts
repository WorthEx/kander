export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const {userId} = await checkWorkspaceAccess(event, wsId)

  const {item, orderId} = await readBody(event)
  if (!item.serviceId || !item.quantity || !item.price || !orderId) return createError({
    statusCode: 400,
    statusText: 'No serviceId, quantity, price or orderId provided.'
  })

  await checkOrderAccess(orderId, userId)

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
