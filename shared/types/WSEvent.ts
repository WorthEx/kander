import type {KanbanAction} from "#shared/types/KanbanAction";
import type {ChatAction} from "#shared/types/ChatAction";

export type WSEvent = {
  type: 'subscribe' | 'unsubscribe' | 'kanban' | 'chat' | 'error',
  workspaceId: string,
  data?: KanbanAction | ChatAction
}
