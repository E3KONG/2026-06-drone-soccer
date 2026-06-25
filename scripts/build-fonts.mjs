// Subset Swei Marker Sans (500 + 700) to the glyphs used in the UI.
// Runs before `vite build`. Skips work when the glyph set is unchanged.
// Source is cached in .fontcache/ so repeat builds don't re-download.
//
// The glyph set is auto-derived: every CJK character found in any src/**/*.svelte
// (Chinese only appears in display text, never in code) plus a fixed latin/digit set.
import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import subsetFont from 'subset-font'

const CDN = 'https://cdn.jsdelivr.net/gh/max32002/swei-marker-sans@2.0/WebFont/CJK%20TC'
const WEIGHTS = [['Medium', 500], ['Bold', 700]]
const SRC_DIR = fileURLToPath(new URL('../src', import.meta.url))
const OUT_DIR = new URL('../src/assets/fonts/', import.meta.url)
const CACHE_DIR = new URL('../.fontcache/', import.meta.url)

// Latin/digits/punctuation can't be reliably scanned out of code, so pin a small safe set.
const LATIN = ' 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,!?:%-'
// CJK punctuation (U+3000-303F), ideographs + ext A (U+3400-9FFF),
// compatibility ideographs (U+F900-FAFF), fullwidth & halfwidth forms (U+FF00-FFEF).
const CJK = /[　-〿㐀-鿿豈-﫿＀-￯]/gu

const exists = (url) => access(url).then(() => true, () => false)

async function svelteFiles(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await svelteFiles(full)))
    else if (entry.name.endsWith('.svelte')) out.push(full)
  }
  return out
}

async function deriveText() {
  const chars = new Set()
  for (const file of await svelteFiles(SRC_DIR)) {
    const src = await readFile(file, 'utf8')
    for (const m of src.matchAll(CJK)) chars.add(m[0])
  }
  // sort for a deterministic hash regardless of file-walk order
  return [...chars].sort().join('') + LATIN
}

async function getSource(name) {
  const cached = new URL(`${name}.woff2`, CACHE_DIR)
  if (await exists(cached)) return readFile(cached)
  const res = await fetch(`${CDN}/SweiMarkerSansCJKtc-${name}.woff2`)
  if (!res.ok) throw new Error(`download ${name} failed: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(cached, buf)
  return buf
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const text = await deriveText()
  const key = createHash('sha256').update(text).digest('hex')
  const hashFile = new URL('.subset-hash', OUT_DIR)
  const outputs = WEIGHTS.map(([, w]) => new URL(`SweiMarkerSans-${w}-subset.woff2`, OUT_DIR))

  const allExist = (await Promise.all(outputs.map(exists))).every(Boolean)
  const prevKey = await readFile(hashFile, 'utf8').catch(() => '')
  if (allExist && prevKey === key) {
    console.log('[fonts] subset up to date, skipping')
    return
  }

  for (const [name, weight] of WEIGHTS) {
    const src = await getSource(name)
    const sub = await subsetFont(src, text, { targetFormat: 'woff2' })
    await writeFile(new URL(`SweiMarkerSans-${weight}-subset.woff2`, OUT_DIR), sub)
    console.log(`[fonts] wrote ${weight}: ${(sub.length / 1024).toFixed(1)} KB`)
  }
  await writeFile(hashFile, key)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
