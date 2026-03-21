import {useWebSocket} from "@vueuse/core";

export default defineNuxtPlugin((nuxtApp) => {
  const cachedOrderColumns = useState('cachedOrderColumns')
  const {fetchOrders} = useOrders()
  const req = useRequestURL()
  const protocol = req.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${req.host}/ws`

  const workspaceId = ref<string | null>(null)

  const {
    status,
    data,
    send,
    open,
    close
  } = useWebSocket(wsUrl, {
    autoReconnect: {
      retries: 5,
      delay: 3000,
    },
    immediate: false,

    onConnected() {
      console.log('✅ WebSocket connected')
      // Подписываемся на организацию
      send(JSON.stringify({
        type: 'subscribe',
        workspaceId: workspaceId.value,
      }))
    },

    onDisconnected(ws, event) {
      console.log('WebSocket disconnected:', event.code, event.reason)
    },

    onError(ws, event) {
      console.error('WebSocket error:', event)
    }
  })

  watch(data, async (message) => {
    if (!message) return

    try {
      const parsed: WSEvent = JSON.parse(message)

      switch (parsed.type) {

        case 'welcome':
          console.log(parsed.message)
          break

        case 'subscribed':
          console.log(`Subscribed to workspace with ID of ${parsed.workspaceId}`)
          await fetchOrders(workspaceId.value) // start init board fetch only when subscribed
          break

        case 'kanban':
          handleServerUpdate(parsed)
          break

        default:
          console.warn('Unknown message type:', parsed.type)
      }
    } catch (error) {
      console.error('Failed to parse message:', error)
    }
  })

  // handle updates from other peers
  const handleServerUpdate = (event: WSEvent) => {
    const {type, workspaceId, action, entity, data, entityId} = event

    if (entity === 'column') {
      switch (action) {
        case 'create':
          //@ts-ignore
          cachedOrderColumns.value.push(data)
          break
        case 'update':
          //@ts-ignore
          cachedOrderColumns.value = cachedOrderColumns.value.map(column => {
            if (column.id === entityId) {
              return {...column, title: data.title};
            }
            return column
          })
          break
        case 'delete':
          //@ts-ignore
          cachedOrderColumns.value = cachedOrderColumns.value.filter(column => column.id !== entityId)
          break
      }
    }

    if (entity === 'order') {
      switch (action) {
        case 'create':
          //@ts-ignore
          const column = cachedOrderColumns.value.find(column => column.id === data.columnId)
          column.orders.push(data)
          break
        //     case 'update':
        //       updateOrder(id, data)
        //       console.log('✏️ Order updated:', data.id)
        //       break
        case 'move':
          let movedOrder = null

          // 1. Find and delete the order from its current column
          // @ts-ignore
          for (const column of cachedOrderColumns.value) {
            const index = column.orders.findIndex((order: any) => order.id === entityId)
            if (index !== -1) {
              movedOrder = column.orders[index]
              column.orders.splice(index, 1)
              break
            }
          }

          if (!movedOrder) break

          // 2. Update order data
          movedOrder.columnId = data.newColumnId
          movedOrder.position = data.newPosition

          // 3. Find the new column
          // @ts-ignore
          const newColumn = cachedOrderColumns.value.find(column => column.id === data.newColumnId)
          if (!newColumn) break

          // 4. Push the order
          newColumn.orders.push(movedOrder)

          // 5. Сортируем колонку по LexoRank
          newColumn.orders.sort((a: any, b: any) =>
            a.position.localeCompare(b.position)
          )
          break
        //     case 'delete':
        //       removeOrder(id)
        //       console.log('🗑️ Order deleted:', id)
        //       break
      }
    }
  }


  // API for sending column events
  const columnActions = {
    create: (newColumn: any) => {
      send(JSON.stringify({
        type: 'kanban',
        workspaceId: workspaceId.value,
        action: 'create',
        entity: 'column',
        data: newColumn
      }))
    },
    update: (id: string, data: any) => {
      send(JSON.stringify({
        type: 'kanban',
        workspaceId: workspaceId.value,
        action: 'update',
        entity: 'column',
        entityId: id,
        data
      }))
    },
    delete: (id: string) => {
      send(JSON.stringify({
        type: 'kanban',
        workspaceId: workspaceId.value,
        action: 'delete',
        entity: 'column',
        entityId: id
      }))
    }
  }

  // API for sending order events
  const orderActions = {
    //   create: (data: any) => {
    //     sendAction('order', 'create', undefined, data)
    //   },
    //   update: (id: string, data: any) => {
    //     sendAction('order', 'update', id, data)
    //   },
    move: (id: string, newPosition: string, newColumnId: string) => {
      send(JSON.stringify({
        type: 'kanban',
        workspaceId: workspaceId.value,
        action: 'move',
        entity: 'order',
        entityId: id,
        data: {
          newPosition,
          newColumnId
        }
      }))
    },
    //   delete: (id: string) => {
    //     sendAction('order', 'delete', id)
    //   }
  }

  const connect = (id: string) => {
    workspaceId.value = id
    open()
  }

  const disconnect = () => {
    close()
  }

  const semanticStatus = computed(() => {
    switch (status.value) {
      case "OPEN":
        return "online"
      case "CONNECTING":
        return "connecting"
      case "CLOSED":
        return "offline"
      default:
        return "unknown"
    }
  })

  return {
    provide: {
      kanbanWs: {
        semanticStatus,
        columnActions,
        orderActions,
        connect,
        disconnect,
        reconnect: open
      }
    }
  }
})
