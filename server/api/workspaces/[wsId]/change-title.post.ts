export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const {title} = await readBody(event)
  if (!title) throw createError({statusCode: 400, statusMessage: 'No title provided.'})

  await checkAdminAccess(event, wsId)

  await prisma.workspace.update({
    where: {id: wsId},
    data: {
      title
    }
  })
  return {ok: true}
})
