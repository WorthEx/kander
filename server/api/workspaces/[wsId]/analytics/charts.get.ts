export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  const year = new Date().getFullYear()

  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999)

  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        column: {workspaceId: wsId},
        createdAt: {gte: startOfYear, lte: endOfYear}
      }
    },
    select: {
      price: true,
      quantity: true,
      order: {select: {createdAt: true}}
    }
  })

  const months = Array.from({length: 12}, () => 0)

  for (const item of items) {
    const month = item.order.createdAt.getMonth()
    if (month >= 12 || month < 0) continue
    months[month]!! += item.price * item.quantity
  }

  const totalRevenue = months.reduce((sum, m) => sum + m, 0)

  return {
    monthlyRevenue: months,
    annualRevenue: totalRevenue
  }
})
