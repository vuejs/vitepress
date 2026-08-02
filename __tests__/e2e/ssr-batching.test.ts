import { access, readFile } from 'node:fs/promises'
import path from 'node:path'

test('batched SSR writes complete shared and per-page artifacts', async () => {
  if (!process.env.VITE_TEST_SSR_BATCH) return

  const outDir = path.resolve('.vitepress/dist')
  const [
    indexHtml,
    dynamicHtml,
    staticHtml,
    scopedHtml,
    lastBatchHtml,
    notFoundHtml,
    iconsCss,
    hashmap
  ] = await Promise.all([
    readFile(path.join(outDir, 'index.html'), 'utf8'),
    readFile(path.join(outDir, 'dynamic-routes/foo.html'), 'utf8'),
    readFile(path.join(outDir, 'ssr-static.html'), 'utf8'),
    readFile(path.join(outDir, 'ssr-scoped.html'), 'utf8'),
    readFile(path.join(outDir, 'text-literals/index.html'), 'utf8'),
    readFile(path.join(outDir, '404.html'), 'utf8'),
    readFile(path.join(outDir, 'vp-icons.css'), 'utf8'),
    readFile(path.join(outDir, 'hashmap.json'), 'utf8')
  ])

  expect(indexHtml).toContain('<div id="app">')
  expect(dynamicHtml).toContain('<title>Foo - transformed | Example</title>')
  expect(dynamicHtml).toContain('name="ssr-batch-hook-state"')
  expect(dynamicHtml).toContain(
    'data-ssr-batch-transform="dynamic-routes/foo.md"'
  )
  expect(staticHtml).toContain('<title>Static batching page | Example</title>')
  expect(staticHtml).toContain('<h1 id="static-batching-page"')
  expect(staticHtml).toContain(
    '<p data-static-batch-marker="preserved">Static HTML marker</p>'
  )
  expect(staticHtml).toContain(
    '<span class="VPBadge warning">static badge</span>'
  )
  expect(staticHtml).toContain('<!-- static comment preserved -->')
  expect(staticHtml).toContain(
    '<img data-static-public-asset src="/batch-public.txt" alt="Static public asset">'
  )
  expect(scopedHtml).toContain('Scoped module identity')
  expect(scopedHtml).toMatch(/class="scoped-batch-marker" data-v-[\da-f]+/)
  expect(staticHtml).toMatch(
    /<meta name="ssr-batch-hook-state" content="\d+:ssr-static\.md">/
  )
  expect(staticHtml).toContain(
    '<meta name="ssr-batch-after-config-resolve" content="coordinator mutation retained">'
  )
  expect(staticHtml).toContain('data-ssr-batch-transform="ssr-static.md"')
  expect(lastBatchHtml).toContain('<h1 id="text-literals"')
  expect(dynamicHtml).toContain('<pre class="params">')
  expect(dynamicHtml).toContain('&quot;id&quot;: &quot;foo&quot;')
  expect(dynamicHtml).not.toContain('{{ $params }}')
  expect(notFoundHtml).toContain('<title>404 | Example</title>')
  expect(iconsCss).toContain('.vpi-social-github')
  expect(hashmap).not.toContain('undefined')
  await expect(
    access(path.join(outDir, 'batch-public.txt'))
  ).resolves.toBeUndefined()
  if (!process.env.DEBUG) {
    await expect(access(path.resolve('.vitepress/.temp'))).rejects.toThrow()
  }
})

test('resolved config-file hooks preserve legacy physical Markdown SSR semantics', async () => {
  if (!process.env.VITE_TEST_BUILD) return

  const html = await readFile(
    path.resolve('.vitepress/dist/ssr-plugin-safety.html'),
    'utf8'
  )
  expect(html).toContain(
    '<p data-resolved-load-environment="ssr">physical Markdown load hook</p>'
  )
  expect(html).toContain(
    '<p data-resolved-transform-mode="server">environment-sensitive Markdown transform</p>'
  )
  expect(html).toContain(
    '<p data-resolved-plugin-context="build:false">production plugin context</p>'
  )
  expect(html).not.toContain('data-resolved-transform-mode="client"')
})

test('the static SSR fast path hydrates with normal client-page semantics', async () => {
  if (!process.env.VITE_TEST_SSR_BATCH) return

  await goto('/ssr-static.html')

  expect(
    await page
      .getByRole('heading', { level: 1, name: 'Static batching page' })
      .isVisible()
  ).toBe(true)
  expect(
    await page.locator('[data-static-batch-marker="preserved"]').textContent()
  ).toBe('Static HTML marker')
  expect(await page.locator('.VPBadge.warning').textContent()).toBe(
    'static badge'
  )
  expect(
    await page.locator('[data-static-public-asset]').getAttribute('src')
  ).toBe('/batch-public.txt')
})

test('scoped pages preserve client and SSR module identity', async () => {
  if (!process.env.VITE_TEST_SSR_BATCH) return

  await goto('/ssr-scoped.html')

  const marker = page.locator('.scoped-batch-marker')
  expect(await marker.textContent()).toBe('Scoped module identity')
  expect(
    await marker.evaluate((element) => getComputedStyle(element).color)
  ).toBe('rgb(1, 2, 3)')
})
