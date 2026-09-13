import type { Route } from 'playwright-chromium'

const slowModule = /(?:\/router-race\/slow\.md\?|\/router-race_slow\.md\.)/

describe.runIf(process.env.VITE_TEST_BUILD)('page load retries', () => {
  let slowRequest: Route | undefined

  beforeEach(async () => {
    slowRequest = undefined
    await page.route(slowModule, (route) => {
      if (slowRequest) return route.continue()
      slowRequest = route
    })
    await goto('/router-race/')
  })

  afterEach(async () => {
    await page.unrouteAll({ behavior: 'ignoreErrors' })
  })

  async function startSlowNavigation() {
    await page.locator('#slow').click()
    await expect.poll(() => !!slowRequest).toBe(true)
  }

  async function navigateToFastPage() {
    await page.locator('#fast').click()
    await expect
      .poll(() => page.locator('h1').textContent())
      .toContain('Fast Page')
  }

  async function expectFastPageAfterSlowNavigation() {
    await page.waitForFunction(
      () => document.documentElement.dataset.slowNavigationFinished === 'true'
    )
    expect(await page.locator('h1').textContent()).toContain('Fast Page')
    expect(new URL(page.url()).pathname).toBe('/router-race/fast.html')
  }

  test('ignores a failed page request after another navigation completes', async () => {
    await startSlowNavigation()
    await navigateToFastPage()
    await slowRequest!.abort()

    await expectFastPageAfterSlowNavigation()
  })

  test('ignores a retry after another navigation completes during a hash map fetch', async () => {
    let hashMapRequest: Route | undefined
    await page.route('**/hashmap.json', (route) => {
      hashMapRequest = route
    })

    await startSlowNavigation()
    await slowRequest!.abort()
    await expect.poll(() => !!hashMapRequest).toBe(true)
    await navigateToFastPage()
    await hashMapRequest!.continue()

    await expectFastPageAfterSlowNavigation()
  })

  test('retries the current page with its updated hash after a deployment', async () => {
    await page.route('**/hashmap.json', async (route) => {
      const response = await route.fetch()
      const map = await response.json()
      map['router-race_slow.md'] = 'retry'
      await route.fulfill({ json: map })
    })

    await startSlowNavigation()
    const response = await slowRequest!.fetch()
    await page.route('**/router-race_slow.md.retry.js', (route) =>
      route.fulfill({ response })
    )
    await slowRequest!.abort()

    await page.waitForFunction(
      () => document.documentElement.dataset.slowNavigationFinished === 'true'
    )
    expect(await page.locator('h1').textContent()).toContain('Slow Page')
    expect(new URL(page.url()).pathname).toBe('/router-race/slow.html')
  })

  test('still shows the not-found page when the current retry fails', async () => {
    await startSlowNavigation()
    await slowRequest!.abort()

    await page.waitForFunction(
      () => document.documentElement.dataset.slowNavigationFinished === 'true'
    )
    expect(await page.locator('h1').textContent()).toBe('PAGE NOT FOUND')
  })
})
