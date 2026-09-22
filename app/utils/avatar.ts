/**
 * The initials fallback for professionals with no photo.
 *
 * Pure and auto-imported, so both the card and the profile derive the same
 * initials and the same tint for a given professional — and so this is unit
 * testable without mounting a component.
 */

/** The four tints sampled from the mockups, as CSS custom properties. */
const TINTS = [
  { background: 'var(--tint-sage)', text: '#0f3d3e' },
  { background: 'var(--tint-peach)', text: '#8a3d15' },
  { background: 'var(--tint-sand)', text: '#4a4436' },
  { background: 'var(--tint-mist)', text: '#2b3b52' },
] as const

export interface AvatarTint {
  background: string
  text: string
}

/**
 * `"Ofélia Batista"` -> `"OB"`, `"Ígor"` -> `"Í"`.
 *
 * First and last word, so a middle name never wins over the surname. Uppercased
 * with `pt-BR` rules and capped at two letters.
 */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'

  const first = words[0]![0] ?? ''
  const last = words.length > 1 ? (words.at(-1)![0] ?? '') : ''

  return `${first}${last}`.toLocaleUpperCase('pt-BR')
}

/**
 * A stable tint per professional.
 *
 * Keyed by id rather than picked at random: the same professional must get the
 * same colour on the server and on the client, or hydration mismatches — and
 * the same colour on the card and on their profile, or it looks like a bug.
 */
export function tintFor(id: number): AvatarTint {
  return TINTS[Math.abs(id) % TINTS.length]!
}
