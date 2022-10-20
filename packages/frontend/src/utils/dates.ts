export const formatDate = (dateAsIsoString: string) => {
  const result = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateAsIsoString))

  return result.replace(/\//g, '.')
}