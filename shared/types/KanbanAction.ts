export interface KanbanAction {
  entityId: string
  entity: 'column' | 'order'
  action: 'create' | 'update' | 'delete'
  data: any
}
