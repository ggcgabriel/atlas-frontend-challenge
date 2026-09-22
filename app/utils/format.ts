/**
 * pt-BR formatters, auto-imported by Nuxt.
 *
 * The `Intl.*` instances are built once at module scope on purpose: constructing
 * a formatter is expensive and the listing renders 520 cards.
 */

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

/** `14000` -> `R$ 140`. Rounded: catalog prices never need centavos. */
export function formatBRL(cents: number): string {
  return brl.format(cents / 100)
}

/** `14050` -> `R$ 140,50`. For service prices, where the cents are real. */
export function formatBRLExact(cents: number): string {
  return brlCents.format(cents / 100)
}

/** `4.8` -> `4,8` */
export function formatRating(value: number): string {
  return rating.format(value)
}

/** `1128` -> `1.128` */
export function formatCount(value: number): string {
  return integer.format(value)
}

/**
 * An ISO timestamp -> `Agosto de 2026`.
 *
 * Month precision on purpose: a review's exact day is noise, and the profile
 * reads as a history rather than a log.
 */
export function formatMonthYear(iso: string): string {
  const formatted = monthYear.format(new Date(iso))
  return formatted.charAt(0).toLocaleUpperCase('pt-BR') + formatted.slice(1)
}

/** `90` -> `1h30`, `60` -> `1h`, `45` -> `45min` */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours}h` : `${hours}h${rest}`
}
