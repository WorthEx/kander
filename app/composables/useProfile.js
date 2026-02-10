export const useProfile = _ => {
  const {user} = useAuth()

  const editProfile = async (fullName, avatar) => {
    await $fetch("/api/profile", {
      method: 'POST',
      credentials: 'include',
      body: {
        fullName, avatar
      }
    })
    user.value = await $fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    })
  }

  return {editProfile}
}
