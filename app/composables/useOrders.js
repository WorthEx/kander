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


  return {cachedOrderColumns, loadingOrders, fetchOrders}
}
