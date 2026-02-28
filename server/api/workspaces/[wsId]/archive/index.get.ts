export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  const orders = await prisma.order.findMany({
    where: {
      isArchived: true,
      column: {
        workspaceId: wsId
      }
    },
    select: {
      title: true,
      id: true,
      customer: true,
      items: true,
      createdAt: true,
    },
  })

  return orders.map(({items, customer, ...order}) => ({
      ...order,
      totalCost: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      customerName: customer.fullName,
      customerPhone: customer.phone,
    }
  ))
})
