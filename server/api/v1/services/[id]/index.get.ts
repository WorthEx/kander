export default defineEventHandler(async (event) => {
  await checkApiKey(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({statusCode: 400, statusText: 'Service ID not provided.'})

  return prisma.service.findMany({
    where: {
      isArchived: false,
      id
    }
  })
})
