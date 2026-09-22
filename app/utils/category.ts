import {
  mdiDotsHorizontalCircleOutline,
  mdiFlashOutline,
  mdiFormatPaint,
  mdiHammerScrewdriver,
  mdiPipeValve,
  mdiShieldHomeOutline,
} from '@mdi/js'

const CATEGORY_ICONS: Record<string, string> = {
  'Elétrica e Climatização': mdiFlashOutline,
  'Hidráulica': mdiPipeValve,
  'Alvenaria e Acabamento': mdiFormatPaint,
  'Marcenaria e Esquadrias': mdiHammerScrewdriver,
  'Segurança e Áreas Externas': mdiShieldHomeOutline,
}

/** Falls back to a neutral glyph so a new category never renders an empty box. */
export function categoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? mdiDotsHorizontalCircleOutline
}

const CATEGORY_COLORS: Record<string, string> = {
  'Elétrica e Climatização': '#c08a21',
  'Hidráulica': '#2f7d9e',
  'Alvenaria e Acabamento': '#c05621',
  'Marcenaria e Esquadrias': '#7a5c3a',
  'Segurança e Áreas Externas': '#2f7d5f',
}

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#6b7280'
}
