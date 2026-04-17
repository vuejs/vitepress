import type { BrowserContext, Page } from 'playwright-chromium'
import type { Router } from 'vitepress'

/**
 * The same suite runs twice — once with the Navigation API strategy (the
 * default in modern Chromium) and once with the legacy History-API
 * strategy, forced on by setting `window.__VP_USE_LEGACY_ROUTER__` before
 * the app boots. This gives us a single source of truth for user-facing
 * router behaviour across both implementations.
 *
 * The default (nav-api) mode reuses the shared `page` / `goto` created by
 * vitestSetup.ts; the legacy mode adds a second browser context on the
 * same Playwright browser with the flag pre-injected via an init script.
 */

// ---- Types shared between Node-side helpers and browser-side evaluate bodies.
// These types are erased at runtime; they only help TS check the callbacks
// passed to `page.evaluate`.

interface VueAppInternals {
  _context: { provides: Record<string | symbol, unknown> }
}
type AppEl = HTMLElement & { __vue_app__?: VueAppInternals }

declare global {
  interface Window {
    __VP_USE_LEGACY_ROUTER__?: boolean
    __spaMarker?: number
    __hookLog?: Array<['before' | 'after', string]>
    resolveRouterOrThrow: () => Router
  }
}

// Browser-side helper: finds the router via the Vue app on `#app` so every
// `page.evaluate(...)` below can just call `window.resolveRouterOrThrow()` instead
// of duplicating the provides-walking logic. Registered via init script on
// both browser contexts so it runs before any client code.
const RESOLVE_ROUTER_INIT_SCRIPT = (): void => {
  window.resolveRouterOrThrow = function () {
    const app = (document.querySelector('#app') as AppEl | null)?.__vue_app__
    if (!app) throw new Error('[router test] Vue app not mounted on #app')
    const provides = app._context.provides
    for (const sym of Object.getOwnPropertySymbols(provides)) {
      const v = provides[sym]
      if (v && typeof (v as Router).go === 'function' && (v as Router).route) {
        return v as Router
      }
    }
    throw new Error('[router test] router not found in provides')
  }
}

// ---- Legacy-mode page, reusing the browser from the shared setup ----

let legacyContext: BrowserContext
let legacyPage: Page
let legacyGoto: (path: string) => Promise<void>

beforeAll(async () => {
  const browser = page.context().browser()
  if (!browser) throw new Error('shared browser is not available')

  // Default context (nav-api mode) — inject the resolver.
  await page.context().addInitScript(RESOLVE_ROUTER_INIT_SCRIPT)

  // Legacy context — flag the router off, then inject the resolver.
  legacyContext = await browser.newContext()
  await legacyContext.addInitScript(() => {
    window.__VP_USE_LEGACY_ROUTER__ = true
  })
  await legacyContext.addInitScript(RESOLVE_ROUTER_INIT_SCRIPT)
  legacyPage = await legacyContext.newPage()
  legacyGoto = async (path) => {
    await legacyPage.goto(`http://localhost:${process.env['PORT']}${path}`)
    await legacyPage.waitForSelector('#app .Layout')
  }
})

afterAll(async () => {
  await legacyPage.close()
  await legacyContext.close()
})

// ---- Same scenarios, parameterised over both strategies ----

interface Mode {
  name: 'navigation-api' | 'legacy'
  getPage: () => Page
  getGoto: () => (path: string) => Promise<void>
}

const MODES: Mode[] = [
  { name: 'navigation-api', getPage: () => page, getGoto: () => goto },
  { name: 'legacy', getPage: () => legacyPage, getGoto: () => legacyGoto }
]

for (const mode of MODES) {
  describe(`router [${mode.name}]`, () => {
    let p: Page
    let visit: (path: string) => Promise<void>

    beforeAll(() => {
      p = mode.getPage()
      visit = mode.getGoto()
    })

    test('selects the expected router strategy', async () => {
      await visit('/home')
      const isLegacy = await p.evaluate(
        () => window.__VP_USE_LEGACY_ROUTER__ === true
      )
      expect(isLegacy).toBe(mode.name === 'legacy')

      // Navigation API is present in this Chromium in both modes; the flag
      // is the only thing distinguishing the two runs.
      const hasNavigation = await p.evaluate(() => 'navigation' in window)
      expect(hasNavigation).toBe(true)
    })

    test('link click performs a SPA navigation (no full reload)', async () => {
      await visit('/home')
      // Tag the window — a full document reload would clear this.
      await p.evaluate(() => {
        window.__spaMarker = 42
      })

      await p.click(
        '.VPSidebar a[href="/frontmatter/multiple-levels-outline.html"]'
      )
      await p.waitForURL(/\/frontmatter\/multiple-levels-outline/)
      await p.waitForSelector('h1#h1-1')

      const marker = await p.evaluate(() => window.__spaMarker)
      expect(marker).toBe(42)
      expect(await p.textContent('h1#h1-1')).toMatch('h1 - 1')
    })

    test('hash anchor click updates URL, scrolls and focuses the target', async () => {
      await visit('/frontmatter/multiple-levels-outline')
      await p.evaluate(() => window.scrollTo(0, 0))

      await p.click('.VPDocAsideOutline a[href="#h3-2"]')
      await p.waitForFunction(() => location.hash === '#h3-2')
      // Focus is applied via requestAnimationFrame; wait for it explicitly.
      await p.waitForFunction(() => document.activeElement?.id === 'h3-2')

      const state = await p.evaluate(() => ({
        hash: location.hash,
        scrollY: window.scrollY,
        focusId: document.activeElement?.id ?? '',
        targetTop:
          document.getElementById('h3-2')?.getBoundingClientRect().top ?? 0
      }))

      expect(state.hash).toBe('#h3-2')
      expect(state.focusId).toBe('h3-2')
      expect(state.scrollY).toBeGreaterThan(0)
      // Both paths respect scroll-margin, so the target lands near the top.
      expect(state.targetTop).toBeLessThan(200)
    })

    test('back and forward navigate between entries', async () => {
      await visit('/home')
      await p.click(
        '.VPSidebar a[href="/frontmatter/multiple-levels-outline.html"]'
      )
      await p.waitForURL(/\/frontmatter\/multiple-levels-outline/)
      await waitForH1(p, /h1 - 1/)

      await p.goBack()
      await p.waitForURL(/\/home(\.html)?$/)
      await waitForH1(p, /Lorem Ipsum/)

      await p.goForward()
      await p.waitForURL(/\/frontmatter\/multiple-levels-outline/)
      await waitForH1(p, /h1 - 1/)
    })

    test('scroll position is restored on back traversal', async () => {
      await visit('/frontmatter/multiple-levels-outline')
      await p.evaluate(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        window.scrollTo(0, Math.min(400, max))
      })
      await p.waitForFunction(() => window.scrollY > 100)
      const scrollBefore = await p.evaluate(() => window.scrollY)

      await callRouterGo(p, '/home')
      await p.waitForURL(/\/home(\.html)?$/)
      await waitForH1(p, /Lorem Ipsum/)

      await p.goBack()
      await p.waitForURL(/\/frontmatter\/multiple-levels-outline/)
      await waitForH1(p, /h1 - 1/)
      await p.waitForFunction(
        (expected) => Math.abs(window.scrollY - expected) < 50,
        scrollBefore,
        { timeout: 5_000 }
      )
      const scrollAfter = await p.evaluate(() => window.scrollY)
      expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(50)
    })

    test('onBeforeRouteChange / onAfterRouteChange fire for full navigations', async () => {
      await visit('/home')
      await installHookSpy(p)

      await p.click(
        '.VPSidebar a[href="/frontmatter/multiple-levels-outline.html"]'
      )
      await p.waitForURL(/\/frontmatter\/multiple-levels-outline/)
      await p.waitForFunction(() => (window.__hookLog?.length ?? 0) >= 2)

      const log = await p.evaluate(() => window.__hookLog ?? [])
      expect(log[0][0]).toBe('before')
      expect(log[log.length - 1][0]).toBe('after')
      expect(log[0][1]).toMatch(/multiple-levels-outline/)
    })

    test('onBeforeRouteChange / onAfterRouteChange fire for hash-only navs', async () => {
      await visit('/frontmatter/multiple-levels-outline')
      await installHookSpy(p)

      await p.click('.VPDocAsideOutline a[href="#h2-1"]')
      await p.waitForFunction(() => location.hash === '#h2-1')
      await p.waitForFunction(() => (window.__hookLog?.length ?? 0) >= 2)

      const log = await p.evaluate(() => window.__hookLog ?? [])
      expect(log[0][0]).toBe('before')
      expect(log[log.length - 1][0]).toBe('after')
      expect(log[0][1]).toMatch(/#h2-1$/)
    })

    test('onBeforeRouteChange returning false cancels the page load', async () => {
      await visit('/home')
      await p.evaluate(() => {
        window.resolveRouterOrThrow().onBeforeRouteChange = () => false
      })

      await p.click(
        '.VPSidebar a[href="/frontmatter/multiple-levels-outline.html"]'
      )
      // Give the click a chance to process; content should NOT change.
      await p.waitForTimeout(400)

      expect(await p.textContent('.VPContent h1')).toMatch('Lorem Ipsum')
    })

    test('programmatic router.go navigates and updates route state', async () => {
      await visit('/home')
      await callRouterGo(p, '/frontmatter/multiple-levels-outline')

      await p.waitForURL(/\/frontmatter\/multiple-levels-outline/)
      await waitForH1(p, /h1 - 1/)
    })

    test('router.go with { replace: true } replaces the history entry', async () => {
      await visit('/home')
      await visit('/multi-sidebar/')
      const lenBefore = await p.evaluate(() => history.length)

      await callRouterGo(p, '/frontmatter/multiple-levels-outline', {
        replace: true
      })
      await p.waitForURL(/\/frontmatter\/multiple-levels-outline/)
      await waitForH1(p, /h1 - 1/)
      expect(await p.evaluate(() => history.length)).toBe(lenBefore)

      // /multi-sidebar/ was replaced by /frontmatter/... so goBack lands
      // on /home (the entry before /multi-sidebar/), not on /multi-sidebar/.
      await p.goBack()
      await p.waitForURL(/\/home(\.html)?$/)
      await waitForH1(p, /Lorem Ipsum/)
    })

    test('same-URL click scrolls to hash without creating a new history entry', async () => {
      await visit('/frontmatter/multiple-levels-outline')
      // Click once to seed a hash in the URL.
      await p.click('.VPDocAsideOutline a[href="#h2-1"]')
      await p.waitForFunction(() => location.hash === '#h2-1')
      const lenAfterFirstClick = await p.evaluate(() => history.length)

      // Click again on the same hash — URL already matches, no new entry.
      await p.click('.VPDocAsideOutline a[href="#h2-1"]')
      await p.waitForTimeout(300)
      expect(await p.evaluate(() => history.length)).toBe(lenAfterFirstClick)
      expect(await p.evaluate(() => location.hash)).toBe('#h2-1')
    })

    test('onBeforePageLoad / onAfterPageLoad fire during loadPage', async () => {
      await visit('/home')
      await p.evaluate(() => {
        const router = window.resolveRouterOrThrow()
        window.__hookLog = []
        router.onBeforePageLoad = (to: string) => {
          window.__hookLog!.push(['before', to])
        }
        router.onAfterPageLoad = (to: string) => {
          window.__hookLog!.push(['after', to])
        }
      })

      await p.click(
        '.VPSidebar a[href="/frontmatter/multiple-levels-outline.html"]'
      )
      await p.waitForURL(/\/frontmatter\/multiple-levels-outline/)
      await p.waitForFunction(() => (window.__hookLog?.length ?? 0) >= 2)

      const log = await p.evaluate(() => window.__hookLog ?? [])
      expect(log[0][0]).toBe('before')
      expect(log[log.length - 1][0]).toBe('after')
      expect(log[0][1]).toMatch(/multiple-levels-outline/)
    })

    test('onBeforePageLoad returning false cancels page load (but still fires onAfterRouteChange)', async () => {
      await visit('/home')
      await p.evaluate(() => {
        const router = window.resolveRouterOrThrow()
        router.onBeforePageLoad = () => false
      })

      await p.click(
        '.VPSidebar a[href="/frontmatter/multiple-levels-outline.html"]'
      )
      await p.waitForTimeout(400)
      // Content should stay on /home since loadPage bailed out.
      expect(await p.textContent('.VPContent h1')).toMatch('Lorem Ipsum')
    })

    test('links inside .vp-raw are not intercepted (full page reload)', async () => {
      await visit('/home')
      // Inject a .vp-raw-wrapped link and trigger its click via the DOM
      // API — sidebar overlays would otherwise block a real click. A full
      // document reload will clear the window tag we set below.
      await p.evaluate(() => {
        window.__spaMarker = 99
        const wrapper = document.createElement('div')
        wrapper.className = 'vp-raw'
        wrapper.style.position = 'fixed'
        wrapper.style.top = '0'
        wrapper.style.left = '0'
        wrapper.style.zIndex = '9999'
        const link = document.createElement('a')
        link.id = 'vp-raw-link'
        link.href = '/frontmatter/multiple-levels-outline.html'
        link.textContent = 'raw link'
        wrapper.appendChild(link)
        document.body.appendChild(wrapper)
        ;(link as HTMLAnchorElement).click()
      })
      await p.waitForURL(/\/frontmatter\/multiple-levels-outline/)
      const marker = await p.evaluate(() => window.__spaMarker)
      expect(marker).toBeUndefined()
    })

    test('external links are not intercepted', async () => {
      await visit('/home')
      // Don't actually follow the link cross-origin; just verify the
      // router's capture-phase handler did NOT call preventDefault, which
      // would leave the anchor's default navigation intact.
      const intercepted = await p.evaluate(() => {
        const link = document.createElement('a')
        link.href = 'https://example.com/'
        link.textContent = 'ext'
        document.body.appendChild(link)
        let defaultPrevented = false
        link.addEventListener(
          'click',
          (e) => {
            defaultPrevented = e.defaultPrevented
            e.preventDefault() // stop the actual navigation away
          },
          // Runs after the router's capture-phase handler.
          { capture: false }
        )
        link.click()
        link.remove()
        return defaultPrevented
      })
      expect(intercepted).toBe(false)
    })

    test('links with download attribute are not intercepted', async () => {
      await visit('/home')
      const intercepted = await p.evaluate(() => {
        const link = document.createElement('a')
        link.href = '/frontmatter/multiple-levels-outline.html'
        link.setAttribute('download', 'x.html')
        link.textContent = 'dl'
        document.body.appendChild(link)
        let defaultPrevented = false
        link.addEventListener('click', (e) => {
          defaultPrevented = e.defaultPrevented
          e.preventDefault()
        })
        link.click()
        link.remove()
        return defaultPrevented
      })
      expect(intercepted).toBe(false)
    })

    test('links with target attribute are not intercepted', async () => {
      await visit('/home')
      const intercepted = await p.evaluate(() => {
        const link = document.createElement('a')
        link.href = '/frontmatter/multiple-levels-outline.html'
        link.target = '_self'
        link.textContent = 't'
        document.body.appendChild(link)
        let defaultPrevented = false
        link.addEventListener('click', (e) => {
          defaultPrevented = e.defaultPrevented
          e.preventDefault()
        })
        link.click()
        link.remove()
        return defaultPrevented
      })
      expect(intercepted).toBe(false)
    })

    test('links to non-HTML paths are not intercepted', async () => {
      await visit('/home')
      const intercepted = await p.evaluate(() => {
        const link = document.createElement('a')
        link.href = '/some-file.zip'
        link.textContent = 'zip'
        document.body.appendChild(link)
        let defaultPrevented = false
        link.addEventListener('click', (e) => {
          defaultPrevented = e.defaultPrevented
          e.preventDefault()
        })
        link.click()
        link.remove()
        return defaultPrevented
      })
      expect(intercepted).toBe(false)
    })

    test('clicks on buttons inside links are not intercepted', async () => {
      // docsearch-style layout: `<a><button>action</button></a>`. Clicking
      // the inner button should run the button's handler, not navigate.
      await visit('/home')
      const { defaultPrevented, buttonHandled } = await p.evaluate(() => {
        const link = document.createElement('a')
        link.href = '/frontmatter/multiple-levels-outline.html'
        const button = document.createElement('button')
        button.textContent = 'action'
        link.appendChild(button)
        document.body.appendChild(link)

        let buttonHandled = false
        button.addEventListener('click', () => {
          buttonHandled = true
        })
        // Read defaultPrevented after the router's capture-phase click
        // listener (legacy mode) would have run. The button's own bubble
        // listener above doesn't call preventDefault.
        let defaultPrevented = false
        link.addEventListener('click', (e) => {
          defaultPrevented = e.defaultPrevented
          e.preventDefault() // stop the actual navigation away
        })

        button.click()
        link.remove()
        return { defaultPrevented, buttonHandled }
      })
      expect(buttonHandled).toBe(true)
      expect(defaultPrevented).toBe(false)
    })

    test('route state (path, hash, query) stays in sync', async () => {
      await visit('/home')
      await callRouterGo(p, '/frontmatter/multiple-levels-outline?x=1#h3-2')
      await p.waitForURL(/\/frontmatter\/multiple-levels-outline/)
      await p.waitForFunction(() => location.hash === '#h3-2')

      const state = await p.evaluate(() => {
        const router = window.resolveRouterOrThrow()
        return {
          path: router.route.path,
          hash: router.route.hash,
          query: router.route.query
        }
      })
      expect(state.path).toMatch(/\/frontmatter\/multiple-levels-outline/)
      expect(state.hash).toBe('#h3-2')
      expect(state.query).toBe('?x=1')
    })

    test('unknown paths fall back to the 404 page', async () => {
      await visit('/definitely-not-a-real-page')
      // Default theme's NotFound renders this copy.
      await p.waitForFunction(() =>
        /PAGE NOT FOUND/i.test(document.body.textContent ?? '')
      )
      expect(await p.textContent('body')).toMatch(/PAGE NOT FOUND/i)
    })

    test('route.data.relativePath is set from the loaded page', async () => {
      await visit('/frontmatter/multiple-levels-outline')
      const relPath = await p.evaluate(
        () => window.resolveRouterOrThrow().route.data.relativePath
      )
      expect(relPath).toBe('frontmatter/multiple-levels-outline.md')
    })
  })
}

// ---- Node-side helpers ----

async function waitForH1(p: Page, pattern: RegExp): Promise<void> {
  await p.waitForFunction(
    (src: string) =>
      new RegExp(src).test(
        document.querySelector('.VPContent h1')?.textContent ?? ''
      ),
    pattern.source,
    { timeout: 5_000 }
  )
}

async function callRouterGo(
  p: Page,
  href: string,
  options?: { replace?: boolean }
): Promise<void> {
  await p.evaluate(
    ({ to, opts }) => window.resolveRouterOrThrow().go(to, opts),
    { to: href, opts: options }
  )
}

async function installHookSpy(p: Page): Promise<void> {
  await p.evaluate(() => {
    const router = window.resolveRouterOrThrow()
    window.__hookLog = []
    router.onBeforeRouteChange = (to: string) => {
      window.__hookLog!.push(['before', to])
    }
    router.onAfterRouteChange = (to: string) => {
      window.__hookLog!.push(['after', to])
    }
  })
}
