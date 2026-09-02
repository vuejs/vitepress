const origin = () => `http://localhost:${process.env['PORT']}`

const status = (path: string) =>
  page.evaluate(
    async (path) =>
      (await fetch(path, { headers: { accept: 'text/html' } })).status,
    path
  )

describe('not found page', () => {
  test('a missing url renders the site 404.md with a 404 status', async () => {
    const res = await page.goto(`${origin()}/missing`)
    expect(res?.status()).toBe(404)
    await page.waitForSelector('#app .Layout')

    expect(await page.textContent('h1')).toContain('Custom not found')
    expect(await page.title()).toBe('Not found | Example')
    // the address bar keeps what the visitor typed
    expect(new URL(page.url()).pathname).toBe('/missing')
    // a doc page without the doc chrome
    expect(
      await page.locator('.VPContent').getAttribute('class')
    ).not.toContain('has-sidebar')
    expect(await page.locator('.VPDocFooter .pager-link').count()).toBe(0)
    expect(await page.locator('.VPDocFooter .edit-link').count()).toBe(0)
  })

  test('a locale without its own 404.md inherits the root one', async () => {
    const res = await page.goto(`${origin()}/fr/guide/missing`)
    expect(res?.status()).toBe(404)
    await page.waitForSelector('#app .Layout')

    expect(await page.textContent('h1')).toContain('Custom not found')
    expect(await page.title()).toBe('Not found | Example')
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('fr')
    // the locale menu marks the locale of the miss
    expect(
      await page.locator('.VPNavBarTranslations .items a').first().textContent()
    ).toContain('English')
  })

  test('the not-found page also renders at its own url', async () => {
    await goto('/404')
    expect(await page.textContent('h1')).toContain('Custom not found')
  })

  test('client-side navigation to a missing url keeps the url', async () => {
    await goto('/')
    await page.evaluate(() => {
      ;(window as any).__spa_marker = 1
      const a = document.createElement('a')
      a.href = '/nested/nowhere'
      a.id = 'to-nowhere'
      a.textContent = 'nowhere'
      // above the fixed nav and sidebar, so the click reaches it
      a.style.cssText = 'position:fixed;right:0;bottom:0;z-index:1000'
      document.body.appendChild(a)
    })
    await page.click('#to-nowhere')
    await page.waitForFunction(() =>
      document.querySelector('h1')?.textContent?.includes('Custom not found')
    )
    expect(new URL(page.url()).pathname).toBe('/nested/nowhere.html')
    expect(await page.evaluate(() => (window as any).__spa_marker)).toBe(1)

    // and back to a real page
    await page.click('.vp-doc a[href="/"]')
    await page.waitForSelector('.VPHome')
    expect(new URL(page.url()).pathname).toBe('/')
    expect(await page.evaluate(() => (window as any).__spa_marker)).toBe(1)
  })

  test('the server answers with the right status codes', async () => {
    await goto('/')
    expect(await status('/missing')).toBe(404)
    expect(await status('/missing.html')).toBe(404)
    expect(await status('/nested/nowhere/')).toBe(404)
    expect(await status('/')).toBe(200)
    expect(await status('/home.html')).toBe(200)
    expect(await status('/404.html')).toBe(200)
  })

  test.runIf(process.env['VITE_TEST_BUILD'])(
    'the emitted page is pre-rendered, marked and not indexed',
    async () => {
      await goto('/')
      const html = await page.evaluate(async () =>
        (await fetch('/missing', { headers: { accept: 'text/html' } })).text()
      )
      expect(html).toContain('<div id="app" data-vp-not-found>')
      expect(html).toContain('Custom not found')
      expect(html).toContain('<meta name="robots" content="noindex">')

      const frHtml = await page.evaluate(async () =>
        (await fetch('/fr/404.html')).text()
      )
      expect(frHtml).toContain('<html lang="fr"')
      expect(frHtml).toContain('Custom not found')
      expect(frHtml).toContain('<title>Not found | Example</title>')
    }
  )

  test.runIf(process.env['VITE_TEST_BUILD'])(
    'a pre-rendered miss loads the page chunk once',
    async () => {
      await page.goto(`${origin()}/missing`)
      await page.waitForSelector('#app .Layout')
      const chunks = await page.evaluate(() =>
        performance
          .getEntriesByType('resource')
          .map((e) => e.name)
          .filter((name) => /\/404\.md\./.test(name))
      )
      expect(chunks).toHaveLength(1)
      expect(chunks[0]).not.toContain('.lean.js')
    }
  )
})
