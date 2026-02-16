export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const {status, role, wsMemberId} = await readBody(event)
  if (!role || !wsMemberId) return createError({
    statusCode: 400,
    statusText: 'No status, role or wsMemberId provided.'
  })

  await checkAdminAccess(event, wsId)

  await prisma.workspaceMember.update({
    where: {
      id: wsMemberId
    },
    data: {
      isFired: status,
      role: role
    }
  })

  return {ok: true}
})
