export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  const {orderId} = await readBody(event)
  if (!orderId) return createError({
    statusCode: 400,
    statusText: 'No orderId provided.'
  })

  await prisma.order.update({
    where: {id: orderId},
    data: {
      isArchived: true
    }
  })
})
