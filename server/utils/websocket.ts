import type {Peer} from 'crossws'

const peers = new Set<Peer>()

export const registerPeer = (peer: Peer) => peers.add(peer)

export const unregisterPeer = (peer: Peer) => peers.delete(peer)

export const publishToWorkspace = (workspaceId: string, wsEvent: WSEvent) => {
  if (peers.size < 1) return

  peers.forEach(p => {
    if (p.topics?.has(workspaceId)) {
      p.send(JSON.stringify(wsEvent))
    }
  })
}
