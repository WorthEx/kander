export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const {status, role, wsMemberId, userId} = await readBody(event)
  if (!role || !wsMemberId || !userId) return createError({
    statusCode: 400,
    statusText: 'No status, role, wsMemberId or userId provided.'
  })
  console.log(event.context.user)

  await checkAdminAccess(event, wsId)

  // checking if user who performs the update is NOT the one changes are applied to
  if (event.context.user.userId === userId) {
    return createError({
      statusCode: 400,
      statusText: 'Changing your own workspace member entity is not allowed.'
    })
  }

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
