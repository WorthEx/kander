import type {KanbanAction} from "#shared/types/KanbanAction";
import type {ChatAction} from "#shared/types/ChatAction";

export type WSEvent = {
  type: 'subscribe' | 'subscribed' | 'kanban' | 'chat'
  workspaceId: string
  timestamp: number
  data?: KanbanAction | ChatAction
  userId?: string // the one who initiated the event
}
