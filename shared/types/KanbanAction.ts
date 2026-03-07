export type KanbanAction = {
  workspaceId: string
  entityId: string,
  entity: 'column' | 'order'
  action: 'create' | 'update' | 'delete' | 'move'
  data: any
}
