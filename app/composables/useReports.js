export const useReports = _ => {
  const generateAnnualReport = async (wsId, year) => {
    const blob = await $fetch(`/api/workspaces/${wsId}/reports/annual`, {
      responseType: 'blob',
      method: 'POST',
      credentials: 'include',
      body: {year}
    })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `AR_${year}.xlsx`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return {generateAnnualReport}
}
