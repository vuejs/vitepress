import type { PageData } from 'shared'

function setupBrowser(url: string) {
  const listeners: Record<string, Function[]> = {}
  const location = new URL(url)

  Object.assign(globalThis, {
    document: { fragmentDirective: undefined },
    location,
    history: {
      state: {},
      replaceState: vi.fn(),
      pushState: vi.fn()
    },
    window: {
      scrollY: 0,
      addEventListener: vi.fn((type: string, listener: Function) => {
        ;(listeners[type] ||= []).push(listener)
      }),
      dispatchEvent: vi.fn()
    },
    fetch: vi.fn(() => Promise.reject(new Error('no hashmap')))
  })
}

function cleanupBrowser() {
  for (const key of ['document', 'location', 'history', 'window', 'fetch']) {
    delete (globalThis as any)[key]
  }
}

function pageData(relativePath: string, title: string): PageData {
  return {
    relativePath,
    filePath: relativePath,
    title,
    description: '',
    headers: [],
    frontmatter: {},
    params: {},
    lastUpdated: 0
  }
}

describe('client/app/router', () => {
  afterEach(() => {
    cleanupBrowser()
    vi.resetModules()
    vi.restoreAllMocks()
  })

  test('loads custom 404 page module for missing browser routes', async () => {
    setupBrowser('https://example.com/missing.html')
    vi.resetModules()

    const { siteDataRef } = await import('client/app/data')
    siteDataRef.value = { ...siteDataRef.value, base: '/', cleanUrls: false }

    const { createRouter } = await import('client/app/router')
    const customNotFound = { name: 'CustomNotFound' }
    const fallback = { name: 'DefaultNotFound' }
    const loadPageModule = vi.fn(async (path: string) => {
      if (path === '/404.html') {
        return {
          default: customNotFound,
          __pageData: pageData('404.md', 'Custom 404')
        }
      }
      return null
    })

    const router = createRouter(loadPageModule, fallback)

    await router.go('/missing.html', { initialLoad: true })

    expect(loadPageModule).toHaveBeenCalledWith('/missing.html')
    expect(loadPageModule).toHaveBeenCalledWith('/404.html')
    expect(router.route.path).toBe('/missing.html')
    expect(router.route.component).toBe(customNotFound)
    expect(router.route.data.title).toBe('Custom 404')
  })
})
