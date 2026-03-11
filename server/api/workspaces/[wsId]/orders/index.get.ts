export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  const columns = await prisma.column.findMany({
    where: {
      workspaceId: wsId,
    },
    include: {
      orders: {
        where: {
          isArchived: false,
        },
        orderBy: {
          position: 'asc',
        },
        include: {
          responsibles: true,
          customer: {
            select: {
              id: true, fullName: true, phone: true
            },
          },
          links: true,
          items: true
        },
      },
    },
    orderBy: [
      {isSystem: 'desc'},
      {position: 'asc'}
    ],
  })

  return columns.map(column => ({
    ...column,
    orders: column.orders.map(({items, ...order}) => ({
      ...order,
      items,
      totalCost: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    })),
  }))
})
