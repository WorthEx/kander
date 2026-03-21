export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  const {orderId, newPosition, newColumnId} = await readBody(event)
  if (!orderId || !newPosition || !newColumnId) return createError({
    statusCode: 400,
    statusText: 'No orderId or newPosition provided.'
  })

  await prisma.order.update({
    where: {id: orderId},
    data: {
      position: newPosition,
      columnId: newColumnId,
    }
  })
  //
  // publishToWorkspace(wsId, {
  //   type: 'kanban',
  //   workspaceId: wsId,
  //   action: 'move',
  //   entity: 'order',
  //   entityId: orderId,
  //   data: {
  //     newPosition,
  //     newColumnId
  //   }
  // })
})
