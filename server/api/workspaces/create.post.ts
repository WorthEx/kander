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
            // marking a system column that must never(!) be deleted
            {title: 'Backlog', position: 1, isSystem: true},
            {title: 'Under review', position: 2,},
            {title: 'Payment', position: 3,},
            {title: 'In progress', position: 4,},
            {title: 'Done', position: 5,}
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
