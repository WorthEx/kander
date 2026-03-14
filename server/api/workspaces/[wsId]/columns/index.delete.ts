export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkAdminAccess(event, wsId)

  const {columnId} = await readBody(event)
  if (!columnId) throw createError({statusCode: 400, statusMessage: 'No columnId provided.'})

  const columnToDelete = await prisma.column.findUnique({
    where: {id: columnId},
    include: {
      orders: true
    }
  })
  if (!columnToDelete) throw createError({statusCode: 404, statusMessage: 'Column not found.'})

  if (columnToDelete.orders.length > 0) throw createError({
    statusCode: 400,
    statusMessage: 'Deleting columns with orders is not allowed.'
  })
  if (columnToDelete.isSystem === true) throw createError({
    statusCode: 400,
    statusMessage: 'Deleting system columns is not allowed.'
  })

  await prisma.column.delete({
    where: {
      id: columnId
    }
  })
})
