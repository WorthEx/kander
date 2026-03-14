export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkAdminAccess(event, wsId)

  const {columnId} = await readBody(event)
  if (!columnId) throw createError({statusCode: 400, statusMessage: 'No columnId provided.'})

  await prisma.column.delete({
    where: {
      id: columnId
    }
  })
})
