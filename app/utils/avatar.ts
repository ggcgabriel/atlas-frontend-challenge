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

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'

  const first = words[0]![0] ?? ''
  const last = words.length > 1 ? (words.at(-1)![0] ?? '') : ''

  return `${first}${last}`.toLocaleUpperCase('pt-BR')
}

export function tintFor(id: number): AvatarTint {
  return TINTS[Math.abs(id) % TINTS.length]!
}
