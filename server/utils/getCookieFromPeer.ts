import type {Peer} from "crossws";

export const getCookieFromPeer = (peer: Peer, name: string): string | null => {
  const cookieHeader = peer.request?.headers?.get('cookie') ?? ''
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`)) ?? null
  return match && match[1] ? decodeURIComponent(match[1]) : null
}
