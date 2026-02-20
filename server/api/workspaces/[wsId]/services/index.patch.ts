export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const {basePrice, status, id} = await readBody(event)
  if (!basePrice || !id) return createError({
    statusCode: 400,
    statusText: 'No basePrice, status or service id provided.'
  })

  await checkAdminAccess(event, wsId)

  await prisma.service.update({
    where: {
      id
    },
    data: {
      isArchived: status,
      basePrice,
    }
  })

  return {ok: true}
})
