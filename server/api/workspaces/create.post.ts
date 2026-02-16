export default defineEventHandler(async (event) => {
  checkUser(event)
  const query = getQuery(event)
  if (!query.title) throw createError({statusCode: 400, statusMessage: 'No title provided.'})

  const workspace = await prisma.workspace.create({
    data: {
      title: query.title as string,
      members: {
        create: {
          role: "admin",
          userId: event.context.user.userId
        }
      },
      columns: {
        createMany: {
          data: [
            // creating a system column that must never(!) be deleted
            {title: 'Backlog', isSystem: true},
            {title: 'Under review'},
            {title: 'Payment'},
            {title: 'In progress'},
            {title: 'Done'}
          ]
        }
      }
    },
  })

  return {
    id: workspace.id,
    title: workspace.title
  }
})
