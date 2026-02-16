export default defineEventHandler(async (event) => {
  checkUser(event)

  const {email} = getQuery(event)
  if (!email) throw createError({statusCode: 400, statusMessage: 'No email provided.'})

  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const userWithProvidedEmail = await prisma.user.findUnique({
    where: {
      email: email as string
    }
  })
  if (!userWithProvidedEmail) throw createError({
    statusCode: 404,
    statusText: 'User with provided email doesn\'t exist.'
  })

  const wsMemberWithProvidedEmail = await prisma.workspaceMember.findFirst({
    where: {
      user: {
        email: email as string
      },
      workspaceId: wsId
    }
  })
  if (wsMemberWithProvidedEmail) return {
    error: true,
    message: 'User with provided email is already a member of this workspace.'
  }

  await prisma.workspaceMember.create({
    data: {
      role: 'manager',
      userId: userWithProvidedEmail.id,
      workspaceId: wsId
    }
  })

  return {ok: true}
})
