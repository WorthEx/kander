export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const {userId} = await checkWorkspaceAccess(event, wsId)

  const {title, url, orderId} = await readBody(event)
  if (!title || !url || !orderId) return createError({
    statusCode: 400,
    statusText: 'No title, url or orderId provided.'
  })

  await checkOrderAccess(orderId, userId)

  return prisma.orderLink.create({
    data: {
      title,
      url,
      orderId,
    }
  })
})
