const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const brlCents = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const rating = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const integer = new Intl.NumberFormat('pt-BR')

const monthYear = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
})

export function formatBRL(cents: number): string {
  return brl.format(cents / 100)
}

export function formatBRLExact(cents: number): string {
  return brlCents.format(cents / 100)
}

export function formatRating(value: number): string {
  return rating.format(value)
}

export function formatCount(value: number): string {
  return integer.format(value)
}

export function formatMonthYear(iso: string): string {
  const formatted = monthYear.format(new Date(iso))
  return formatted.charAt(0).toLocaleUpperCase('pt-BR') + formatted.slice(1)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours}h` : `${hours}h${rest}`
}
