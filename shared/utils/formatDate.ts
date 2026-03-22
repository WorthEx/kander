export const formatDate = (date: string) => {
  const dateObject = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const day = dateObject.getDate().toString().padStart(2, '0')
  const month = months[dateObject.getMonth()]
  const year = dateObject.getFullYear()


  return `${day} ${month} ${year}`
}
