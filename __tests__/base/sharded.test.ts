import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { newPage, realErrors, waitForHydration, type TestPage } from './helpers'

const dir = resolve(fileURLToPath(import.meta.url), '..')
const dist = (...p: string[]) =>
  join(dir, 'fixture/.vitepress/dist-sharded', ...p)
const origin = () => `http://localhost:${process.env['SHARDED_PORT']}`

// output-relative paths of everything under assets/
const files = () =>
  readdirSync(dist('assets'), { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath, e.name).slice(dist('assets').length + 1))

const isShardedPath = (f: string) => /^[0-2]\/[^/]+$/.test(f)

describe('assetsShards emit', () => {
  test('page chunks land in numbered subdirectories', () => {
    const pages = files().filter((f) => /\.md\.[\w-]+(\.lean)?\.js$/.test(f))
    expect(pages.length).toBeGreaterThan(0)
    expect(pages.every(isShardedPath)).toBe(true)
  })

  test('imported assets are sharded too, shared chunks and the app are not', () => {
    const all = files()
    const assets = all.filter(
      (f) => /\.(png|woff2|css)$/.test(f) && !/^vp-icons\./.test(f)
    )
    expect(assets.length).toBeGreaterThan(0)
    expect(assets.every(isShardedPath)).toBe(true)
    expect(all.some((f) => /^chunks\/framework\.[\w-]+\.js$/.test(f))).toBe(
      true
    )
    expect(all.some((f) => /^app\.[\w-]+\.js$/.test(f))).toBe(true)
  })

  test('hash map entries carry the shard and resolve to real files', () => {
    const map: Record<string, string> = JSON.parse(
      readFileSync(dist('hashmap.json'), 'utf-8')
    )
    // hash map keys are lowercased page names, file names keep their case
    const lower = new Set(files().map((f) => f.toLowerCase()))
    expect(Object.keys(map).length).toBeGreaterThan(0)
    for (const [page, entry] of Object.entries(map)) {
      expect(entry).toMatch(/^[0-2]\/[\w-]+$/)
      const [shard, hash] = entry.split('/')
      const chunk = `${shard}/${page}.${hash}`.toLowerCase()
      expect(lower.has(`${chunk}.js`)).toBe(true)
      expect(lower.has(`${chunk}.lean.js`)).toBe(true)
    }
  })

  test('preload links point at files that exist', () => {
    const existing = new Set(files().map((f) => `assets/${f}`))
    for (const page of [
      'index',
      'sub/page',
      'sub/deep/page2',
      'moved/target'
    ]) {
      const links = [
        ...readFileSync(dist(`${page}.html`), 'utf-8').matchAll(
          /<link rel="modulepreload" href="\/([^"]+)">/g
        )
      ].map((m) => m[1]!)
      expect(links.some((l) => l.includes('.md.'))).toBe(true)
      for (const link of links) expect(existing.has(link)).toBe(true)
    }
  })
})

describe('assetsShards in the browser', () => {
  let t: TestPage

  beforeAll(async () => {
    t = await newPage()
  })

  afterAll(async () => {
    await t.page.close()
    await t.browser.close()
  })

  test('pages hydrate with sharded chunks', async () => {
    await t.page.goto(`${origin()}/`)
    await waitForHydration(t.page)
    expect(await t.page.textContent('h1')).toContain('Home')
  })

  test('client-side navigation loads page chunks from their shard', async () => {
    await t.page.evaluate(() => ((window as any).__spa_marker = 1))
    await t.page.click('.vp-doc a[href="/sub/page.html"]')
    await t.page.waitForFunction(() =>
      document.querySelector('h1')?.textContent?.includes('Sub page')
    )
    expect(
      await t.page.evaluate(() => (window as any).__spa_marker === 1)
    ).toBe(true)
    const chunk = await t.page.evaluate(() =>
      performance
        .getEntriesByType('resource')
        .map((r) => r.name)
        .find((n) => /\/assets\/\d+\/sub_page\.md\.[\w-]+\.js$/.test(n))
    )
    expect(chunk).toBeDefined()
  })

  test('no console or page errors across the whole flow', () => {
    expect(realErrors(t.errors)).toEqual([])
  })
})
