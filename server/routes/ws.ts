import type {Peer} from 'crossws'
import jwt from "jsonwebtoken";

export default defineWebSocketHandler({
  open(peer) {
    const {jwtSecret} = useRuntimeConfig()

    const accessToken = getCookieFromPeer(peer, 'accessToken')
    const refreshToken = getCookieFromPeer(peer, 'refreshToken')

    if (!refreshToken) {
      peer.close(4001, 'Not authorized.')
      return
    }

    try {
      const tokenPayload = accessToken ? jwt.verify(accessToken, jwtSecret) as any : jwt.verify(refreshToken, jwtSecret) as any
      peer.context.user = {
        userId: tokenPayload.userId,
        email: tokenPayload.email,
      }
    } catch {
      console.log('WATAFAAAAAAAA')
      peer.close(4001, 'Not authorized.')
      return
    }

    registerPeer(peer)
    peer.send(JSON.stringify({type: 'welcome', message: 'Connection established!'}));
  },

  message(peer, message) {
    try {
      const data: WSEvent = JSON.parse(message.text())
      const {workspaceId} = data

      if (data.type === 'subscribe') {
        peer.subscribe(workspaceId)
        peer.send(JSON.stringify({
          type: 'subscribed',
          workspaceId,
          createdAt: Date.now()
        }))
        return
      }
    } catch (error) {
      console.error('WebSocket error:', error)
    }
  },
  close(peer, details) {
    unregisterPeer(peer)
    console.log('WebSocket closed:', peer.id)
  },

  error(peer, error) {
    console.error('WebSocket error:', peer.id, error)
  }
})

async function handleKanbanAction(peer: Peer, message: any) {
  const {workspaceId, entity, action, id, data} = message

  let result: any

  try {
    // ============================================
    // ОПЕРАЦИИ С КОЛОНКАМИ
    // ============================================
    // if (entity === 'column') {
    //   if (action === 'create') {
    //     result = await prisma.kanbanColumn.create({
    //       data: {
    //         title: data.title,
    //         workspaceId,
    //         position: data.position,
    //         createdById: data.userId
    //       }
    //     })
    //   }
    //
    //   if (action === 'update') {
    //     result = await prisma.kanbanColumn.update({
    //       where: { id },
    //       data: {
    //         title: data.title,
    //         position: data.position
    //       }
    //     })
    //   }
    //
    //   if (action === 'delete') {
    //     await prisma.kanbanColumn.delete({
    //       where: { id }
    //     })
    //     result = { id }
    //   }
    // }

    // ============================================
    // ОПЕРАЦИИ С ЗАКАЗАМИ
    // ============================================
    if (entity === 'order') {
      if (action === 'create') {
        result = await prisma.order.create({
          data: {
            ...data,
            workspaceId
          }
        })
      }

      if (action === 'update') {
        result = await prisma.order.update({
          where: {id},
          data
        })
      }

      if (action === 'move') {
        result = await prisma.order.update({
          where: {id},
          data: {
            columnId: data.columnId,
            position: data.position
          }
        })
      }

      if (action === 'delete') {
        await prisma.order.delete({
          where: {id}
        })
        result = {id}
      }
    }

    // ============================================
    // BROADCAST ВСЕМ ПОДПИСЧИКАМ
    // ============================================
    const broadcastData = {
      type: 'kanban:update',
      workspaceId,
      entity,
      action,
      id: result?.id || id,
      data: result
    }

    // Отправляем всем подписчикам организации
    const topic = `org:${workspaceId}`
    const messageText = JSON.stringify(broadcastData)

    let sent = 0
    peer.publish(topic, messageText)

    console.log(`📡 Broadcast ${entity}:${action} to ${sent} clients`)

  } catch (error: any) {
    // Отправляем ошибку только инициатору
    peer.send(JSON.stringify({
      type: 'error',
      message: error.message || 'Operation failed'
    }))
  }
}
