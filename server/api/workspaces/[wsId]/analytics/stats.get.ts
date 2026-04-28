export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [allItems, thisMonthItems, lastMonthItems, allOrders, thisMonthOrders, allCustomers, newCustomers] = await Promise.all([
    // Все позиции для выручки
    prisma.orderItem.findMany({
      where: {
        order: {
          column: {workspaceId: wsId}
        }
      },
      select: {price: true, quantity: true}
    }),

    // Позиции этого месяца для выручки текущего месяца
    prisma.orderItem.findMany({
      where: {
        order: {
          column: {workspaceId: wsId},
          createdAt: {gte: startOfMonth}
        }
      },
      select: {price: true, quantity: true}
    }),

    // Позиции прошлого месяца для сравнения
    prisma.orderItem.findMany({
      where: {order: {column: {workspaceId: wsId}, createdAt: {gte: startOfLastMonth, lte: endOfLastMonth}}},
      select: {price: true, quantity: true}
    }),

    // Всего заказов
    prisma.order.count({where: {column: {workspaceId: wsId}}}),

    // Заказов в этом месяце
    prisma.order.count({where: {column: {workspaceId: wsId}, createdAt: {gte: startOfMonth}}}),

    // Всего клиентов
    prisma.customer.count({where: {workspaceId: wsId}}),

    // Новые клиенты за 30 дней — по createdAt самого Customer
    prisma.customer.count({where: {workspaceId: wsId, createdAt: {gte: thirtyDaysAgo}}}),
  ])

  const totalRevenue = allItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const thisMonthRevenue = thisMonthItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const lastMonthRevenue = lastMonthItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const revenueGrowth = lastMonthRevenue > 0
    ? Number(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1))
    : null

  const avgCheck = allOrders > 0 ? totalRevenue / allOrders : 0

  const thisMonthAvgCheck = thisMonthOrders > 0
    ? thisMonthRevenue / thisMonthOrders
    : 0


  return {
    revenue: {
      total: totalRevenue,
      growth: revenueGrowth,
    },
    orders: {
      total: allOrders,
      thisMonth: thisMonthOrders,
    },
    customers: {
      total: allCustomers,
      newLast30Days: newCustomers,
    },
    avgCheck: {
      value: avgCheck,
      thisMonthAvgCheck
    },
  }
})
