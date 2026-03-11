export const useOrders = () => {
  const cachedOrderColumns = useState('cachedOrderColumns', _ => [])
  const loadingOrders = ref(true)

  const fetchOrders = async wsId => {
    cachedOrderColumns.value = []
    cachedOrderColumns.value = await $fetch(`/api/workspaces/${wsId}/orders`, {
      credentials: 'include',
    })
  }

  return {cachedOrderColumns, loadingOrders, fetchOrders}
}
