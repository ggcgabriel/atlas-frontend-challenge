/**
 * Turns the raw image cache into committed, optimized assets + a manifest.
 *
 *   .image-cache/portraits/*.jpg   (from scripts/fetch-portraits.sh)
 *        │  filtered through scripts/portrait-review.json
 *        ▼
 *   public/images/professionals/*.webp
 *   server/database/image-manifest.json
 *
 * Run manually (`pnpm images:build`); the OUTPUT is committed, so `pnpm db:seed`
 * and `pnpm build` never touch the network.
 *
 * The manifest carries intrinsic width/height and an LQIP data URI per image.
 * Those are what let the UI reserve the exact box before a file loads — the CLS
 * fix belongs in the data, not in a magic number in a stylesheet.
 */
import { existsSync } from 'node:fs'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const CACHE_PORTRAITS = '.image-cache/portraits'
const OUT_PORTRAITS = 'public/images/professionals'
const REVIEW = 'scripts/portrait-review.json'
const MANIFEST = 'server/database/image-manifest.json'

// 400x400 covers a 200px avatar at 2x DPR — more than any card needs, and
// @nuxt/image derives the smaller responsive variants from it.
const PORTRAIT_SIZE = 400
const PORTRAIT_COUNT = 520

export interface ManifestImage {
  url: string
  width: number
  height: number
  lqip: string
}

export interface ImageManifest {
  portraits: ManifestImage[]
  /**
   * Empty for now. The portfolio gallery is modelled in the schema but not
   * seeded: the keyword stock source we tried returned photos that did not
   * match the trade (a dragonfly for "jardineiro") and at least one carried a
   * visible photographer watermark, which has no business in a delivery repo.
   * Revisited in Stage 6 with a curated source.
   */
  portfolio: Record<string, ManifestImage[]>
}

interface PortraitReview {
  rejectedFiles: string[]
  auditedFiles: string[]
}

/** A 16px-wide WebP inlined as a data URI — roughly 200-400 bytes. */
async function makeLqip(input: Buffer): Promise<string> {
  const buf = await sharp(input)
    .resize(16, 16, { fit: 'inside' })
    .webp({ quality: 40 })
    .toBuffer()
  return `data:image/webp;base64,${buf.toString('base64')}`
}

async function buildPortraits(): Promise<ManifestImage[]> {
  await mkdir(OUT_PORTRAITS, { recursive: true })

  // The pool is an explicit allowlist, not "every .jpg in the cache". The
  // generator emits minors at a steady ~15%, so a file may only be used once a
  // human has looked at it — see scripts/portrait-review.json. Selecting from
  // the directory listing instead would silently admit unreviewed downloads.
  const review: PortraitReview = JSON.parse(await readFile(REVIEW, 'utf8'))
  const rejected = new Set(review.rejectedFiles)
  const files = review.auditedFiles
    .filter((f) => !rejected.has(f))
    .sort()
    .slice(0, PORTRAIT_COUNT)

  if (files.length < PORTRAIT_COUNT) {
    throw new Error(
      `Only ${files.length} reviewed portraits available, need ${PORTRAIT_COUNT}. ` +
        `Run: pnpm images:fetch, then review the new files.`,
    )
  }

  const out: ManifestImage[] = []
  for (const [i, file] of files.entries()) {
    const id = String(i + 1).padStart(4, '0')
    const dest = join(OUT_PORTRAITS, `${id}.webp`)
    const raw = await readFile(join(CACHE_PORTRAITS, file))

    if (!existsSync(dest)) {
      await sharp(raw)
        .resize(PORTRAIT_SIZE, PORTRAIT_SIZE, { fit: 'cover', position: 'attention' })
        .webp({ quality: 74, effort: 5 })
        .toFile(dest)
    }

    out.push({
      url: `/images/professionals/${id}.webp`,
      width: PORTRAIT_SIZE,
      height: PORTRAIT_SIZE,
      lqip: await makeLqip(raw),
    })
    if ((i + 1) % 50 === 0) console.log(`  portraits ${i + 1}/${files.length}`)
  }
  return out
}

async function main() {
  if (!existsSync(CACHE_PORTRAITS)) {
    throw new Error(
      `${CACHE_PORTRAITS} is empty. Run: ./scripts/fetch-portraits.sh 520`,
    )
  }

  console.log('Optimizing portraits…')
  const portraits = await buildPortraits()

  const manifest: ImageManifest = { portraits, portfolio: {} }
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)

  console.log(`Done. ${portraits.length} portraits. Manifest → ${MANIFEST}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
