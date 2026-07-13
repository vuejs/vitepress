import { resolveLocaleLink } from 'client/theme-default/composables/langs'
import type { Route, VitePressData } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { ref } from 'vue'

function createData(
  themeConfig: DefaultTheme.Config,
  relativePath = 'guide/getting-started.md',
  cleanUrls = false,
  hash = '#install'
) {
  return {
    site: ref({
      cleanUrls,
      locales: {
        root: { label: 'English', lang: 'en-US' },
        fr: { label: 'Français', lang: 'fr-FR', link: '/fr/' }
      },
      themeConfig
    }),
    page: ref({ relativePath }),
    theme: ref(themeConfig),
    hash: ref(hash)
  } as unknown as VitePressData<DefaultTheme.Config>
}

function createRoute(query = '', hash = '#install') {
  return {
    query,
    hash
  } as unknown as Route
}

describe('client/theme-default/composables/langs', () => {
  test('resolves corresponding links with the default router', () => {
    expect(
      resolveLocaleLink(createData({}), createRoute(), 'fr', '/fr/', '/', true)
    ).toBe('/fr/guide/getting-started.html#install')
  })

  test('resolves clean index links with the default router', () => {
    expect(
      resolveLocaleLink(
        createData({}, 'en/guide/index.md', true, '#intro'),
        createRoute('?query', '#intro'),
        'fr',
        '/fr/',
        '/en/',
        true
      )
    ).toBe('/fr/guide/?query#intro')
  })

  test('keeps locale root links when i18n routing is disabled', () => {
    expect(
      resolveLocaleLink(
        createData({ i18nRouting: false }),
        createRoute(),
        'fr',
        '/fr/',
        '/',
        true
      )
    ).toBe('/fr/#install')
  })

  test('uses custom i18n routing functions for corresponding links', () => {
    const data = createData({
      i18nRouting(data, hash, targetLocale) {
        return `${data.site.value.locales[targetLocale].link}mapped/${data.page.value.relativePath}${hash}`
      }
    })

    expect(
      resolveLocaleLink(data, createRoute(), 'fr', '/fr/', '/', true)
    ).toBe('/fr/mapped/guide/getting-started.md#install')
  })
})
