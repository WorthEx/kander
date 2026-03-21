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

  const moveOrder = async (orderId, newPosition, newColumnId, wsId) => {
    await $fetch(`/api/workspaces/${wsId}/orders/move`, {
      method: 'PATCH',
      credentials: 'include',
      body: {orderId, newPosition, newColumnId}
    })
  }

  return {cachedOrderColumns, loadingOrders, fetchOrders, createOrder, moveOrder}
}
