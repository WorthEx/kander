export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  // monthly revenue chart
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

  // bestsellers chart

  const revenueStats = await prisma.$queryRaw<{ serviceId: string, revenue: number, quantity: number }[]>`
    SELECT oi."serviceId",
           SUM(oi.price * oi.quantity) as revenue,
           SUM(oi.quantity)            as quantity
    FROM "order_items" oi
           INNER JOIN "orders" o ON oi."orderId" = o.id
           INNER JOIN "columns" c ON o."columnId" = c.id
    WHERE c."workspaceId" = ${wsId}
    GROUP BY oi."serviceId"
  `
  const totalQuantity = revenueStats.reduce((sum, s) => sum + Number(s.quantity), 0)

  // services titles
  const serviceIds = revenueStats.map(s => s.serviceId)
  const services = await prisma.service.findMany({
    where: {id: {in: serviceIds}},
    select: {id: true, title: true}
  })
  const serviceMap = Object.fromEntries(services.map(s => [s.id, s.title]))

  // top 5
  const sorted = revenueStats
    .map(s => ({
      label: serviceMap[s.serviceId],
      quantity: Number(s.quantity),
      revenue: Number(s.revenue),
    }))
    .sort((a, b) => b.quantity - a.quantity)

  const top = sorted.slice(0, 5)
  const rest = sorted.slice(5)

  const doughnutData = top.map(s => ({
    label: s.label,
    percent: totalQuantity > 0 ? Math.round(s.quantity / totalQuantity * 100) : 0,
    revenue: s.revenue,
  }))

  if (rest.length > 0) {
    const otherQuantity = rest.reduce((sum, s) => sum + s.quantity, 0)
    const otherRevenue = rest.reduce((sum, s) => sum + s.revenue, 0)
    doughnutData.push({
      label: 'Other',
      percent: totalQuantity > 0 ? Math.round(otherQuantity / totalQuantity * 100) : 0,
      revenue: otherRevenue,
    })
  }

  return {
    monthlyRevenue: months,
    annualRevenue: totalRevenue,
    doughnutData
  }
})
