export const useServices = () => {

  const addService = async (body, wsId) => {
    await $fetch(`/api/workspaces/${wsId}/services`, {
      method: 'POST',
      credentials: 'include',
      body
    })
  }

  const updateService = async (id, basePrice, status, wsId) => {
    await $fetch(`/api/workspaces/${wsId}/services`, {
      method: 'PATCH',
      credentials: 'include',
      body: {
        basePrice, status, id
      }
    })
  }

  return {addService, updateService}
}
