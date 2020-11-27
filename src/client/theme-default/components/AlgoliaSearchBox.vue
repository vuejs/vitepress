<template>
  <div class="algolia-search-box" id="docsearch" />
</template>

<script setup lang="ts">
import type { AlgoliaSearchOptions } from 'algoliasearch'
import { useRoute, useRouter } from 'vitepress'
import { defineProps, getCurrentInstance, onMounted, watch } from 'vue'

const { options } = defineProps<{
  options: AlgoliaSearchOptions
}>()

const vm = getCurrentInstance()
const route = useRoute()
const router = useRouter()

watch(() => options, (value) => { update(value) })

onMounted(() => {
  initialize(options)
})

function isSpecialClick(event: MouseEvent) {
  return (
    event.button === 1 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  )
}

function getRelativePath(absoluteUrl: string) {
  const { pathname, hash } = new URL(absoluteUrl)

  return pathname + hash
}

function update(options: any) {
  if (vm && vm.vnode.el) {
    vm.vnode.el.innerHTML = '<div class="algolia-search-box" id="docsearch"></div>'
    initialize(options)
  }
}

function initialize(userOptions: any) {
  Promise.all([
    import('@docsearch/js'),
    import('@docsearch/css')
  ]).then(([docsearch]) => {
    docsearch.default(
      Object.assign({}, userOptions, {
        container: '#docsearch',

        searchParameters: Object.assign({}, userOptions.searchParameters),

        navigator: {
          navigate: ({ suggestionUrl }: { suggestionUrl: string }) => {
            const { pathname: hitPathname } = new URL(
              window.location.origin + suggestionUrl
            )

            // Router doesn't handle same-page navigation so we use the native
            // browser location API for anchor navigation
            if (route.path === hitPathname) {
              window.location.assign(window.location.origin + suggestionUrl)
            } else {
              router.go(suggestionUrl)
            }
          }
        },

        transformItems: (items) => {
          return items.map((item) => {
            return Object.assign({}, item, {
              url: getRelativePath(item.url)
            })
          })
        },

        hitComponent: ({ hit, children }) => {
          const relativeHit = hit.url.startsWith('http')
            ? getRelativePath(hit.url as string)
            : hit.url

          return {
            type: 'a',
            ref: undefined,
            constructor: undefined,
            key: undefined,
            props: {
              href: hit.url,
              onClick: (event: MouseEvent) => {
                if (isSpecialClick(event)) {
                  return
                }

                // we rely on the native link scrolling when user is already on
                // the right anchor because Router doesn't support duplicated
                // history entries
                if (route.path === relativeHit) {
                  return
                }

                // if the hits goes to another page, we prevent the native link
                // behavior to leverage the Router loading feature
                if (route.path !== relativeHit) {
                  event.preventDefault()
                }

                router.go(relativeHit)
              },
              children
            }
          }
        }
      })
    )
  })
}
</script>

<style>
.algolia-search-box {
  padding-top: 1px;
}

@media (min-width: 720px) {
  .algolia-search-box {
    padding-left: 8px;
  }
}

@media (min-width: 751px) {
  .algolia-search-box {
    padding-left: 8px;
  }

  .algolia-search-box .DocSearch-Button-Placeholder {
    padding-left: 8px;
    font-size: .9rem;
    font-weight: 500;
  }
}

.DocSearch {
  --docsearch-primary-color: #42b983;
  --docsearch-highlight-color: var(--docsearch-primary-color);
  --docsearch-searchbox-shadow: inset 0 0 0 2px var(--docsearch-primary-color);
  --docsearch-text-color: var(--c-text-light);
  --docsearch-muted-color: var(--c-text-lighter);
  --docsearch-searchbox-background: #f2f2f2;
}
</style>
