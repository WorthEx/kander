export const useNotification = useToastInstance => {

  const error = (title = 'We have a problem', description, icon = 'i-ri-error-warning-fill') => {
    useToastInstance.add({
      title,
      description,
      icon: icon,
      color: 'error',

    })
  }

  const success = (title = 'Success', description, icon = 'i-ri-checkbox-circle-fill') => {
    useToastInstance.add({
      title,
      description,
      icon: icon,
      color: 'success',

    })
  }

  const info = (title, description, icon = 'i-ri-information-fill') => {
    useToastInstance.add({
      title,
      description,
      icon: icon,
      color: 'info',

    })
  }

  return {error, success, info}
}
