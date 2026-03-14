// composables/useKanbanStore.ts
export function useKanbanStore() {
  // function addColumn(column: KanbanColumn) {
  //   const exists = columns.value.find(c => c.id === column.id)
  //   if (!exists) {
  //     columns.value.push(column)
  //     sortColumns()
  //   }
  // }

  // function updateColumn(columnId: string, data: Partial<KanbanColumn>) {
  //   const index = columns.value.findIndex(c => c.id === columnId)
  //   if (index !== -1) {
  //     columns.value[index] = {...columns.value[index], ...data}
  //     sortColumns()
  //   }
  // }
  //
  // function removeColumn(columnId: string) {
  //   const index = columns.value.findIndex(c => c.id === columnId)
  //   if (index !== -1) {
  //     columns.value.splice(index, 1)
  //   }
  // }
  //
  // function addOrder(order: Order) {
  //   const column = columns.value.find(c => c.id === order.columnId)
  //   if (column) {
  //     if (!column.orders) column.orders = []
  //     const exists = column.orders.find(o => o.id === order.id)
  //     if (!exists) {
  //       column.orders.push(order)
  //       sortOrders(order.columnId)
  //     }
  //   }
  // }
  //
  // function updateOrder(orderId: string, data: Partial<Order>) {
  //   for (const column of columns.value) {
  //     if (!column.orders) continue
  //     const index = column.orders.findIndex(o => o.id === orderId)
  //     if (index !== -1) {
  //       column.orders[index] = {...column.orders[index], ...data}
  //       sortOrders(column.id)
  //       break
  //     }
  //   }
  // }

  // function moveOrder(orderId: string, targetColumnId: string, position: number) {
  //   let order: Order | null = null
  //   for (const column of columns.value) {
  //     if (!column.orders) continue
  //     const index = column.orders.findIndex(o => o.id === orderId)
  //     if (index !== -1) {
  //       order = column.orders.splice(index, 1)[0]
  //       break
  //     }
  //   }
  //
  //   if (order) {
  //     const targetColumn = columns.value.find(c => c.id === targetColumnId)
  //     if (targetColumn) {
  //       if (!targetColumn.orders) targetColumn.orders = []
  //       order.columnId = targetColumnId
  //       order.position = position
  //       targetColumn.orders.push(order)
  //       sortOrders(targetColumnId)
  //     }
  //   }
  // }
  //
  // function removeOrder(orderId: string) {
  //   for (const column of columns.value) {
  //     if (!column.orders) continue
  //     const index = column.orders.findIndex(o => o.id === orderId)
  //     if (index !== -1) {
  //       column.orders.splice(index, 1)
  //       break
  //     }
  //   }
  // }
  //
  // function sortOrders(columnId: string) {
  //   const column = columns.value.find(c => c.id === columnId)
  //   if (column?.orders) {
  //     column.orders.sort((a, b) => a.position - b.position)
  //   }
  // }

  return {
    // columns,
    // loading,
    // updateColumn,
    // removeColumn,
    // addOrder,
    // updateOrder,
    // moveOrder,
    // removeOrder
  }
}
