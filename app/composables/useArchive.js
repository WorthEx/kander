export const useArchive = () => {

  const deleteOrder = async (wsId, orderId) => {
    await $fetch(`/api/workspaces/${wsId}/archive/${orderId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  const deleteAllOrders = async (wsId) => {
    await $fetch(`/api/workspaces/${wsId}/archive`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  const deleteOrdersInRange = async (wsId, from, to) => {
    await $fetch(`/api/workspaces/${wsId}/archive/range`, {
      method: 'DELETE',
      credentials: 'include',
      body: {
        from,
        to
      }
    })
  }

  const restoreOrder = async (wsId, orderId) => {
    await $fetch(`/api/workspaces/${wsId}/archive/${orderId}/restore`, {
      method: 'PATCH',
      credentials: 'include',
    })
  }

  return {deleteOrder, deleteAllOrders, deleteOrdersInRange, restoreOrder}
}
