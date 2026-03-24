import type {Peer} from 'crossws'
import jwt from "jsonwebtoken";

type PeerContext = {
  user?: {
    userId: string
    email: string
  }
}

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

      if (data.type === 'kanban') {
        handleKanbanAction(peer, data)
        return
      }

      if (data.type === 'ping') {
        peer.send(JSON.stringify({type: 'pong'}))
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

const handleKanbanAction = (peer: Peer, message: any) => {
  const {workspaceId} = message
  const userId = (peer.context as PeerContext).user?.userId

  try {
    const broadcastData = {
      ...message,
      timestamp: Date.now(),
      userId,
    }

    const messageText = JSON.stringify(broadcastData)
    peer.publish(workspaceId, messageText)

  } catch {
    peer.send(JSON.stringify({
      type: 'error',
      message: 'Operation failed'
    }))
  }
}
