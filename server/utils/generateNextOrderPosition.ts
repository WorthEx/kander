import {LexoRank} from "lexorank";

export const generateNextOrderPosition = async (wsId: string) => {
  const systemColumn = await prisma.column.findFirst({
    where: {
      workspaceId: wsId,
      isSystem: true
    },
    include: {
      orders: {
        where: {
          isArchived: false
        },
        orderBy: {
          position: 'desc'
        },
        take: 1
      }
    }
  })
  if (!systemColumn) throw createError({statusCode: 400, statusMessage: 'No system column found.'})

  let newOrderPosition = null
  const lastOrder = systemColumn.orders.at(0)
  if (lastOrder && lastOrder.position) {
    newOrderPosition = LexoRank.parse(lastOrder.position).genNext().toString()
  } else if (!lastOrder) newOrderPosition = LexoRank.middle().toString()

  return {systemColumnId: systemColumn.id, newOrderPosition}
}
