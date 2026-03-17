import {publishToWorkspace} from "#server/utils/websocket";
import {LexoRank} from "lexorank";

export default defineEventHandler(async (event) => {
  const wsId = await checkApiKey(event)

  const body = await readBody(event)
  if (!body.title) throw createError({statusCode: 400, statusMessage: 'No title provided.'})
  if (!body.customerId) throw createError({statusCode: 400, statusMessage: 'No customer id provided.'})

  const systemColumn = await prisma.column.findFirst({
    where: {
      workspaceId: wsId,
      isSystem: true
    },
    include: {
      orders: {
        orderBy: {
          position: 'desc'
        },
        take: 1
      }
    }
  })
  if (!systemColumn) throw createError({statusCode: 400, statusMessage: 'No system column found.'})

  const assignedManagerId = await assignNextManager(wsId) // user.id of assigned manager

  let newOrderPosition = null
  const lastOrder = systemColumn.orders.at(0)
  if (lastOrder && lastOrder.position) {
    newOrderPosition = LexoRank.parse(lastOrder.position).genNext().toString()
  } else if (!lastOrder) newOrderPosition = LexoRank.middle().toString()

  try {
    const createdOrder = await prisma.order.create({
      data: {
        title: body.title,
        description: body.description,
        customerId: body.customerId,
        columnId: systemColumn.id,
        position: newOrderPosition ?? null,
        items: body.items?.length > 1 ? {
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
        customer: {
          select: {
            id: true, fullName: true, phone: true
          },
        },
        links: true,
      }
    })
    publishToWorkspace(wsId, {
      type: 'kanban',
      workspaceId: wsId,
      action: 'create',
      entity: 'order',
      data: {
        ...createdOrder,
        totalCost: createdOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
    })
    return {
      ...createdOrder,
      totalCost: createdOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }
  } catch {
    throw createError({statusCode: 400, statusMessage: 'Bad request. Check if provided ID\'s are valid.'})
  }
})
