import {publishToWorkspace} from "#server/utils/websocket";

export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  await checkWorkspaceAccess(event, wsId)

  const orderId = getRouterParam(event, 'orderId')
  if (!orderId) throw createError({statusCode: 400, statusText: 'orderId not provided.'})

  const updatedOrder = await prisma.order.update({
    where: {id: orderId},
    data: {
      isArchived: false
    },
    include: {
      items: {
        include: {
          service: true
        }
      },
      responsibles: true,
      customer: true,
      links: true,
      creator: true
    }
  })

  const totalCost = updatedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  publishToWorkspace(wsId, {
    type: 'kanban',
    workspaceId: wsId,
    action: 'create',
    entity: 'order',
    data: {
      ...updatedOrder,
      totalCost
    }
  })
})
