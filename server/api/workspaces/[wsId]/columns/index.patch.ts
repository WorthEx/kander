export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkAdminAccess(event, wsId)

  const {columnId, updatedTitle} = await readBody(event)
  if (!columnId || !updatedTitle) throw createError({
    statusCode: 400,
    statusMessage: 'No columnId or updatedTitle provided.'
  })

  if (updatedTitle.length > 42) throw createError({
    statusCode: 400,
    statusMessage: 'Column title cannot be longer than 42 characters.'
  })

  await prisma.column.update({
    where: {
      id: columnId
    },
    data: {
      title: updatedTitle
    }
  })

  return {ok: true}
})
