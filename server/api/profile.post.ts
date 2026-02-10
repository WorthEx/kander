export default defineEventHandler(async (event) => {
  checkUser(event)

  const body = await readBody(event)
  if (!body.fullName) throw createError({statusCode: 400, statusMessage: 'No full name provided.'})
  if (!body.avatar) throw createError({statusCode: 400, statusMessage: 'No avatar url provided.'})

  await prisma.user.update({
    where: {
      id: event.context.user.userId
    },
    data: {
      fullName: body.fullName,
      avatar: body.avatar
    }
  })

  return {ok: true}
})
