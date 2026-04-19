import {publishToWorkspace} from "#server/utils/websocket";
import {generateNextOrderPosition} from "#server/utils/generateNextOrderPosition";

export default defineEventHandler(async (event) => {
  const wsId = await checkApiKey(event)

  const body = await readBody(event)
  if (!body.title) throw createError({statusCode: 400, statusMessage: 'No title provided.'})
  if (!body.customerId) throw createError({statusCode: 400, statusMessage: 'No customer id provided.'})

  const assignedManagerId = await assignNextManager(wsId) // user.id of assigned manager

  const {systemColumnId, newOrderPosition} = await generateNextOrderPosition(wsId)

  try {
    const createdOrder = await prisma.order.create({
      data: {
        title: body.title,
        description: body.description,
        customerId: body.customerId,
        columnId: systemColumnId,
        position: newOrderPosition ?? null,
        items: body.items?.length > 0 ? {
          createMany: {
            data: [...body.items]
          }
        } : {},
        responsibles: assignedManagerId ? {
          connect: [{id: assignedManagerId}]
        } : {connect: []},
        source: 'api'
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
