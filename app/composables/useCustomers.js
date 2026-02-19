export const useCustomers = () => {

  const addCustomer = async (body, wsId) => {
    await $fetch(`/api/workspaces/${wsId}/customers`, {
      method: 'POST',
      credentials: 'include',
      body
    })
  }


  return {addCustomer}
}
