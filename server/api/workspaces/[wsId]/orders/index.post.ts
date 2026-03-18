import {generateNextOrderPosition} from "#server/utils/generateNextOrderPosition";
import {publishToWorkspace} from "#server/utils/websocket";

export default defineEventHandler(async (event) => {
  const wsId = getRouterParam(event, 'wsId')
  if (!wsId) throw createError({statusCode: 400, statusText: 'Workspace ID not provided.'})

  const {userId} = await checkWorkspaceAccess(event, wsId)

  const {
    title, description, priority, customerId, items, deadline
  } = await readBody(event)
  if (!title || !priority || !customerId || !items) return createError({
    statusCode: 400,
    statusText: 'No title, customerId, priority or order items provided.'
  })

  const {systemColumnId, newOrderPosition} = await generateNextOrderPosition(wsId)

  try {
    const createdOrder = await prisma.order.create({
      data: {
        title,
        description,
        customerId,
        creatorId: userId,
        columnId: systemColumnId,
        position: newOrderPosition ?? null,
        items: {
          createMany: {
            data: [...items]
          }
        },
        responsibles: {
          connect: [{id: userId}]
        },
        source: 'manual',
        priority,
        deadline
      },
      include: {
        items: {
          include: {
            service: true
          }
        },
        responsibles: true,
        customer: {
          select: {
            id: true, fullName: true, phone: true
          },
        },
        links: true,
      }
    })
    const totalCost = createdOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    publishToWorkspace(wsId, {
      type: 'kanban',
      workspaceId: wsId,
      action: 'create',
      entity: 'order',
      data: {
        ...createdOrder,
        totalCost
      }
    })
    return {
      ...createdOrder,
      totalCost,
    }
  } catch {
    throw createError({statusCode: 400, statusMessage: 'Bad request. Check if provided ID\'s are valid.'})
  }
})
