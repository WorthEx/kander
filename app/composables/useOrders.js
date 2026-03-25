export const useOrders = () => {
  const cachedOrderColumns = useState('cachedOrderColumns', _ => [])
  const loadingOrders = useState('loadingOrders', _ => true)

  const fetchOrders = async wsId => {
    cachedOrderColumns.value = []
    loadingOrders.value = true
    try {
      cachedOrderColumns.value = await $fetch(`/api/workspaces/${wsId}/orders`, {
        credentials: 'include',
      })
    } catch (e) {
      throw e
    } finally {
      loadingOrders.value = false
    }
  }

  const createOrder = async (order, wsId) => {
    await $fetch(`/api/workspaces/${wsId}/orders`, {
      method: 'POST',
      credentials: 'include',
      body: {...order}
    })
  }

  const moveOrder = async (orderId, newPosition, newColumnId, wsId, publish = false) => {
    await $fetch(`/api/workspaces/${wsId}/orders/move`, {
      method: 'PATCH',
      credentials: 'include',
      body: {orderId, newPosition, newColumnId, publish}
    })
  }

  const archiveOrder = async (orderId, wsId) => {
    await $fetch(`/api/workspaces/${wsId}/orders/archive`, {
      method: 'PATCH',
      credentials: 'include',
      body: {orderId}
    })
  }

  const addResponsible = async (responsibleId, orderId, wsId) => {
    await $fetch(`/api/workspaces/${wsId}/orders/responsibles`, {
      method: 'POST',
      credentials: 'include',
      body: {orderId, responsibleId}
    })
  }

  const removeResponsible = async (responsibleId, orderId, wsId) => {
    await $fetch(`/api/workspaces/${wsId}/orders/responsibles`, {
      method: 'DELETE',
      credentials: 'include',
      body: {orderId, responsibleId}
    })
  }

  const addItem = async (item, orderId, wsId) => {
    return await $fetch(`/api/workspaces/${wsId}/orders/items`, {
      method: 'POST',
      credentials: 'include',
      body: {
        item, orderId
      }
    })
  }

  const removeItem = async (itemId, orderId, wsId) => {
    return await $fetch(`/api/workspaces/${wsId}/orders/items`, {
      method: 'DELETE',
      credentials: 'include',
      body: {
        itemId, orderId
      }
    })
  }

  const switchItem = async (itemId, orderId, done, wsId) => {
    return await $fetch(`/api/workspaces/${wsId}/orders/items`, {
      method: 'PATCH',
      credentials: 'include',
      body: {
        itemId, orderId, done
      }
    })
  }

  const attachLink = async (title, url, orderId, wsId) => {
    return await $fetch(`/api/workspaces/${wsId}/orders/links`, {
      method: 'POST',
      credentials: 'include',
      body: {
        title, url, orderId
      }
    })
  }

  const removeLink = async (linkId, orderId, wsId) => {
    return await $fetch(`/api/workspaces/${wsId}/orders/links`, {
      method: 'DELETE',
      credentials: 'include',
      body: {
        linkId, orderId
      }
    })
  }

  return {
    cachedOrderColumns, loadingOrders,
    fetchOrders, createOrder, moveOrder, archiveOrder,
    addResponsible, removeResponsible,
    addItem, removeItem, switchItem,
    attachLink, removeLink
  }
}
