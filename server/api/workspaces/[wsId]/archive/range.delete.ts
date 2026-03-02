export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)
  const {from, to} = await readBody(event)
  if (!from || !to) return createError({
    statusCode: 400,
    statusText: 'No date range provided.'
  })

  const toNextDay = new Date(to)
  toNextDay.setDate(toNextDay.getDate() + 1)
  toNextDay.setHours(0, 0, 0, 0)

  await prisma.order.deleteMany({
    where: {
      createdAt: {
        gte: new Date(from),
        lte: toNextDay
      },
      isArchived: true,
      column: {
        workspaceId: wsId
      }
    },
  })

  return {ok: true}
})
