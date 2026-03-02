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


  return {deleteOrder, deleteAllOrders}
}
