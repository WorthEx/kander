export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  const orderId = getRouterParam(event, 'orderId')
  if (!orderId) throw createError({statusCode: 400, statusText: 'Order ID not provided.'})

  await prisma.order.delete({
    where: {id: orderId},
  })

  return {ok: true}
})
