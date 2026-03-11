export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkAdminAccess(event, wsId)

  const {title} = await readBody(event)
  if (!title) throw createError({statusCode: 400, statusMessage: 'No title provided.'})

  const numberOfColumns = await prisma.column.count({where: {workspaceId: wsId}})
  if (numberOfColumns >= 7) throw createError({statusCode: 400, statusMessage: 'Maximum number of columns reached.'})

  const columnWithMaxPosition = await prisma.column.findFirst({
    where: {
      workspaceId: wsId,
    },
    orderBy: {
      position: 'desc'
    }
  })
  if (!columnWithMaxPosition) throw createError({statusCode: 400, statusMessage: 'No columns found.'})

  const createdColumn = await prisma.column.create({
    data: {
      workspaceId: wsId,
      title,
      position: columnWithMaxPosition.position + 1
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
  })

  return {
    ...createdColumn,
    orders: createdColumn.orders.map(({items, ...order}) => ({
      ...order,
      items,
      totalCost: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    })),
  }
})
