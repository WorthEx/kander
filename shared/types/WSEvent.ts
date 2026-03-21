export type WSEvent = {
  type: 'welcome' | 'subscribe' | 'subscribed' | 'kanban' | 'chat'
  workspaceId: string
  timestamp?: number // to know when the event was created
  entityId?: string
  entity: 'column' | 'order' | 'message'
  action: 'create' | 'update' | 'delete' | 'move'
  data?: any
  userId?: string // the one who initiated the event,
  message?: string
}
