export const useEmployees = () => {

  const addEmployee = async (email, wsId) => {
    await $fetch(`/api/workspaces/${wsId}/employees`, {
      method: 'POST',
      credentials: 'include',
      query: {email}
    })
  }

  const updateEmployee = async (status, role, wsMemberId, wsId, userId) => {
    await $fetch(`/api/workspaces/${wsId}/employees`, {
      method: 'PATCH',
      credentials: 'include',
      body: {
        wsMemberId, status, role, userId
      }
    })
  }

  return {addEmployee, updateEmployee}
}
