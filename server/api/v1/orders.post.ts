export default defineEventHandler(async (event) => {
  const wsId = await checkApiKey(event)

  const body = await readBody(event)
  if (!body.title) throw createError({statusCode: 400, statusMessage: 'No title provided.'})
  if (!body.customerId) throw createError({statusCode: 400, statusMessage: 'No customer id provided.'})

  const systemColumn = await prisma.column.findFirst({
    where: {
      workspaceId: wsId,
      isSystem: true
    }
  })
  if (!systemColumn) throw createError({statusCode: 400, statusMessage: 'No system column found.'})

  try {
    return await prisma.order.create({
      data: {
        title: body.title,
        description: body.description,
        customerId: body.customerId,
        columnId: systemColumn.id,
        items: {
          createMany: {
            data: [...body.items]
          }
        },
      },
      include: {
        items: {
          include: {
            service: true
          }
        }
      }
    })
  } catch {
    throw createError({statusCode: 400, statusMessage: 'Bad request. Check if provided ID\'s are valid.'})
  }

  // todo push order to kanban (websocket event bus)
})
