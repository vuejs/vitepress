import { resolveLocaleLink } from 'client/theme-default/composables/langs'
import type { Route, VitePressData } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { ref } from 'vue'

// `currentPage` is the current page's relative path (like
// `route.data.relativePath`, but with a leading slash), plus any query and
// hash of the current URL.
function resolve(
  currentPage: string,
  {
    themeConfig = {},
    cleanUrls = false,
    targetLocale = 'fr',
    targetLocaleLink = '/fr/',
    currentLocaleLink = '/',
    linkToCorrespondingPage = true
  }: {
    themeConfig?: DefaultTheme.Config
    cleanUrls?: boolean
    targetLocale?: string
    targetLocaleLink?: string
    currentLocaleLink?: string
    linkToCorrespondingPage?: boolean
  } = {}
) {
  const { pathname, search, hash } = new URL(currentPage, 'http://a.com')
  const route = {
    data: { relativePath: pathname.slice(1) },
    query: search,
    hash
  } as Route
  const data = {
    site: ref({
      cleanUrls,
      locales: {
        root: { label: 'English', lang: 'en-US' },
        fr: { label: 'Français', lang: 'fr-FR', link: '/fr/' }
      },
      themeConfig
    }),
    theme: ref(themeConfig)
  } as unknown as VitePressData<DefaultTheme.Config>

  return resolveLocaleLink(data, route, {
    targetLocale,
    targetLocaleLink,
    currentLocaleLink,
    linkToCorrespondingPage
  })
}

describe('client/theme-default/composables/langs', () => {
  describe('resolveLocaleLink', () => {
    describe('locale home links (linkToCorrespondingPage: false)', () => {
      test('links to the target locale home', () => {
        expect(
          resolve('/guide/getting-started.md', {
            linkToCorrespondingPage: false
          })
        ).toBe('/fr/')
      })

      test('preserves query and hash', () => {
        expect(
          resolve('/guide/getting-started.md?a=1#install', {
            linkToCorrespondingPage: false
          })
        ).toBe('/fr/?a=1#install')
      })

      test('ignores custom i18n routing functions', () => {
        expect(
          resolve('/guide/getting-started.md', {
            linkToCorrespondingPage: false,
            themeConfig: { i18nRouting: () => '/custom/' }
          })
        ).toBe('/fr/')
      })
    })

    describe('corresponding page links (linkToCorrespondingPage: true)', () => {
      test('rewrites the current page path into the target locale', () => {
        expect(resolve('/guide/getting-started.md#install')).toBe(
          '/fr/guide/getting-started.html#install'
        )
      })

      test('drops the .html extension when clean URLs are enabled', () => {
        expect(
          resolve('/guide/getting-started.md#install', { cleanUrls: true })
        ).toBe('/fr/guide/getting-started#install')
      })

      test('resolves index pages to directory links', () => {
        expect(resolve('/guide/index.md')).toBe('/fr/guide/')
        expect(resolve('/guide/index.md', { cleanUrls: true })).toBe(
          '/fr/guide/'
        )
      })

      test('resolves the site root page to the target locale home', () => {
        expect(resolve('/index.md')).toBe('/fr/')
      })

      test('strips the current locale prefix before rewriting', () => {
        expect(
          resolve('/en/guide/index.md?query#intro', {
            currentLocaleLink: '/en/',
            cleanUrls: true
          })
        ).toBe('/fr/guide/?query#intro')
      })

      test('rewrites into the root locale', () => {
        expect(
          resolve('/fr/guide/getting-started.md#install', {
            targetLocale: 'root',
            targetLocaleLink: '/',
            currentLocaleLink: '/fr/'
          })
        ).toBe('/guide/getting-started.html#install')
      })

      test('links to the target locale home when i18n routing is disabled', () => {
        expect(
          resolve('/guide/getting-started.md#install', {
            themeConfig: { i18nRouting: false }
          })
        ).toBe('/fr/#install')
      })

      test('delegates to custom i18n routing functions', () => {
        expect(
          resolve('/guide/getting-started.md#install', {
            themeConfig: {
              i18nRouting(data, route, targetLocale) {
                return `${data.site.value.locales[targetLocale].link}mapped/${route.data.relativePath}${route.hash}`
              }
            }
          })
        ).toBe('/fr/mapped/guide/getting-started.md#install')
      })
    })
  })
})
