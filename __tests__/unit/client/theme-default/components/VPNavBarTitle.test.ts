// @ts-expect-error the unit typecheck uses tsc; Vite compiles this SFC at runtime
import VPNavBarTitle from 'client/theme-default/components/VPNavBarTitle.vue'
import { createSSRApp, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'

const mockSite = ref<{ title: string }>({ title: 'My Site' })
const mockTheme = ref<{
  logo?: any
  siteTitle?: string | boolean
  logoLink?: any
}>({})

vi.mock('vitepress', () => ({
  useData: () => ({
    site: mockSite,
    theme: mockTheme,
    currentLang: ref({ link: '/' })
  }),
  withBase: (path: string) => path
}))

vi.mock('client/theme-default/composables/layout', () => ({
  useLayout: () => ({ hasSidebar: ref(false) })
}))

vi.mock('client/theme-default/composables/langs', () => ({
  useLangs: () => ({ currentLang: ref({ link: '/' }) })
}))

describe('VPNavBarTitle accessible name', () => {
  test('does not add aria-label when siteTitle is default (visibly rendered)', async () => {
    mockTheme.value = {}
    const html = await renderToString(createSSRApp(VPNavBarTitle))
    expect(html).toContain('My Site')
    expect(html).not.toContain('aria-label')
  })

  test('does not add aria-label when custom siteTitle is provided', async () => {
    mockTheme.value = { siteTitle: 'Custom Title' }
    const html = await renderToString(createSSRApp(VPNavBarTitle))
    expect(html).toContain('Custom Title')
    expect(html).not.toContain('aria-label')
  })

  test('adds aria-label with site.title when siteTitle is false and logo has no alt', async () => {
    mockTheme.value = { siteTitle: false, logo: '/logo.svg' }
    const html = await renderToString(createSSRApp(VPNavBarTitle))
    expect(html).toContain('aria-label="My Site"')
  })

  test('does not add aria-label when siteTitle is false but logo has alt', async () => {
    mockTheme.value = {
      siteTitle: false,
      logo: { src: '/logo.svg', alt: 'Logo Description' }
    }
    const html = await renderToString(createSSRApp(VPNavBarTitle))
    expect(html).not.toContain('aria-label')
  })
})
