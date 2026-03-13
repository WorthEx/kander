import type {KanbanAction} from "#shared/types/KanbanAction";
import type {ChatAction} from "#shared/types/ChatAction";

export type WSEvent = {
  type: 'welcome' | 'subscribe' | 'subscribed' | 'kanban' | 'chat'
  workspaceId: string
  timestamp?: number // to know when the event was created
  data?: KanbanAction | ChatAction
  userId?: string // the one who initiated the event,
  message?: string
}
