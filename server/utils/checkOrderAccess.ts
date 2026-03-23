export const checkOrderAccess = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId
    },
    include: {
      responsibles: true
    }
  })
  if (!order) return createError({
    statusCode: 404,
    statusText: 'Order not found.'
  })
  if (!order.responsibles.some(user => user.id === userId)) return createError({
    statusCode: 403,
    statusText: 'User is not responsible for this order.'
  })
}
