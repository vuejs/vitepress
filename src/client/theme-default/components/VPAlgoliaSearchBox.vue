<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import docsearch from '@docsearch/js'
import { onMounted } from 'vue'
import { useRouter, useRoute, useData } from 'vitepress'

const router = useRouter()
const route = useRoute()
const { theme, site } = useData()

onMounted(() => {
  initialize(theme.value.algolia)
  setTimeout(poll, 16)
})

function poll() {
  // programmatically open the search box after initialize
  const e = new Event('keydown') as any

  e.key = 'k'
  e.metaKey = true

  window.dispatchEvent(e)

  setTimeout(() => {
    if (!document.querySelector('.DocSearch-Modal')) {
      poll()
    }
  }, 16)
}

const docsearch$ = docsearch.default ?? docsearch
type DocSearchProps = Parameters<typeof docsearch$>[0]

function initialize(userOptions: DefaultTheme.AlgoliaSearchOptions) {
  // note: multi-lang search support is removed since the theme
  // doesn't support multiple locales as of now.
  const options = Object.assign<{}, {}, DocSearchProps>({}, userOptions, {
    container: '#docsearch',

    navigator: {
      navigate({ itemUrl }) {
        const { pathname: hitPathname } = new URL(
          window.location.origin + itemUrl
        )

        // router doesn't handle same-page navigation so we use the native
        // browser location API for anchor navigation
        if (route.path === hitPathname) {
          window.location.assign(window.location.origin + itemUrl)
        } else {
          router.go(itemUrl)
        }
      }
    },

    transformItems(items) {
      return items.map((item) => {
        return Object.assign({}, item, {
          url: getRelativePath(item.url)
        })
      })
    },

    // @ts-expect-error vue-tsc thinks this should return Vue JSX but it returns the required React one
    hitComponent({ hit, children }) {
      return {
        __v: null,
        type: 'a',
        ref: undefined,
        constructor: undefined,
        key: undefined,
        props: { href: hit.url, children }
      }
    }
  })

  docsearch$(options)
}

function getRelativePath(absoluteUrl: string) {
  const { pathname, hash } = new URL(absoluteUrl)
  return (
    pathname.replace(
      /\.html$/,
      site.value.cleanUrls === 'disabled' ? '.html' : ''
    ) + hash
  )
}
</script>

<template>
  <div id="docsearch" />
</template>
