export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  const {title, basePrice} = await readBody(event)
  if (!title || !basePrice) return createError({
    statusCode: 400,
    statusText: 'No title or basePrice provided.'
  })


  await prisma.service.create({
    data: {
      title,
      basePrice,
      workspaceId: wsId
    }
  })

  return {ok: true}
})
