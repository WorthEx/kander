export const useAuth = _ => {
  const user = useState('user')
  const initialized = useState('initialized', _ => false)

  const logout = _ => {
    useCookie('accessToken').value = null
    useCookie('refreshToken').value = null
    user.value = null
    navigateTo('/auth/login')
  }

  return {user, initialized, logout}
}
