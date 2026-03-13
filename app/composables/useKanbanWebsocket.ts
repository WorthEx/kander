import {useWebSocket} from "@vueuse/core";

export const useKanbanWebSocket = (workspaceId: string, onSubscribed: () => Promise<void>) => {
  // const {
  //   columns,
  //   addColumn,
  //   updateColumn,
  //   removeColumn,
  //   addOrder,
  //   updateOrder,
  //   moveOrder,
  //   removeOrder
  // } = useKanbanStore()
  const req = useRequestURL()

  const protocol = req.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${req.host}/ws`

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
    immediate: true,

    onConnected() {
      console.log('✅ WebSocket connected')
      // Подписываемся на организацию
      send(JSON.stringify({
        type: 'subscribe',
        workspaceId
      }))
    },

    onDisconnected(ws, event) {
      console.log('WebSocket disconnected:', event.code, event.reason)
    },

    onError(ws, event) {
      console.error('WebSocket error:', event)
    }
  })

  // ============================================
  // ПОЛУЧЕНИЕ ОБНОВЛЕНИЙ ОТ СЕРВЕРА
  // ============================================
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
          await onSubscribed() // start init board fetch only when subscribed
          break
        //
        //   case 'kanban:update':
        //     // handleServerUpdate(parsed)
        //     break
        //
        //   case 'pong':
        //     break
        //
        //   case 'error':
        //     console.error('❌ Server error:', parsed.message)
        //     break
        //
        default:
          console.warn('Unknown message type:', parsed.type)
      }
    } catch (error) {
      console.error('Failed to parse message:', error)
    }
  })

  // Обрабатываем обновления от сервера
  // function handleServerUpdate(event: any) {
  //   const { entity, action, id, data } = event
  //
  //   if (entity === 'column') {
  //     switch (action) {
  //       case 'create':
  //         addColumn(data)
  //         console.log('➕ Column created:', data.title)
  //         break
  //       case 'update':
  //         updateColumn(id, data)
  //         console.log('✏️ Column updated:', data.title)
  //         break
  //       case 'delete':
  //         removeColumn(id)
  //         console.log('🗑️ Column deleted:', id)
  //         break
  //     }
  //   }
  //
  //   if (entity === 'order') {
  //     switch (action) {
  //       case 'create':
  //         addOrder(data)
  //         console.log('➕ Order created:', data.id)
  //         break
  //       case 'update':
  //         updateOrder(id, data)
  //         console.log('✏️ Order updated:', data.id)
  //         break
  //       case 'move':
  //         moveOrder(id, data.columnId, data.position)
  //         console.log('🔄 Order moved:', id)
  //         break
  //       case 'delete':
  //         removeOrder(id)
  //         console.log('🗑️ Order deleted:', id)
  //         break
  //     }
  //   }
  // }

  // ============================================
  // ОТПРАВКА ДЕЙСТВИЙ НА СЕРВЕР
  // ============================================
  // function sendAction(entity: 'column' | 'order', action: string, id?: string, data?: any) {
  //   const message = {
  //     type: 'kanban:action',
  //     organizationId,
  //     entity,
  //     action,
  //     id,
  //     data
  //   }
  //
  //   send(JSON.stringify(message))
  // }
  //
  // // API для работы с колонками
  // const columnActions = {
  //   create: (title: string, position: number) => {
  //     sendAction('column', 'create', undefined, { title, position })
  //   },
  //   update: (id: string, data: any) => {
  //     sendAction('column', 'update', id, data)
  //   },
  //   delete: (id: string) => {
  //     sendAction('column', 'delete', id)
  //   }
  // }
  //
  // // API для работы с заказами
  // const orderActions = {
  //   create: (data: any) => {
  //     sendAction('order', 'create', undefined, data)
  //   },
  //   update: (id: string, data: any) => {
  //     sendAction('order', 'update', id, data)
  //   },
  //   move: (id: string, columnId: string, position: number) => {
  //     sendAction('order', 'move', id, { columnId, position })
  //   },
  //   delete: (id: string) => {
  //     sendAction('order', 'delete', id)
  //   }
  // }

  const disconnect = () => {
    close()
  }

  onUnmounted(() => {
    disconnect()
  })

  const isConnected = computed(() => status.value === 'OPEN')

  return {
    status,
    isConnected,
    // columns,
    // columnActions,
    // orderActions,
    disconnect,
    reconnect: open
  }
}
