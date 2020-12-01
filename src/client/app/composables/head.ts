import { watchEffect, Ref } from 'vue'
import { HeadConfig, SiteData } from '../../../../types/shared'
import { Route } from '../router'

export function useUpdateHead(route: Route, siteDataByRouteRef: Ref<SiteData>) {
  const metaTags: HTMLElement[] = Array.from(document.querySelectorAll('meta'))

  let isFirstUpdate = true
  const updateHeadTags = (newTags: HeadConfig[]) => {
    if (process.env.NODE_ENV === 'production' && isFirstUpdate) {
      // in production, the initial meta tags are already pre-rendered so we
      // skip the first update.
      isFirstUpdate = false
      return
    }
    metaTags.forEach((el) => document.head.removeChild(el))
    metaTags.length = 0
    if (newTags && newTags.length) {
      newTags.forEach((headConfig) => {
        const el = createHeadElement(headConfig)
        document.head.appendChild(el)
        metaTags.push(el)
      })
    }
  }

  watchEffect(() => {
    const pageData = route.data
    const siteData = siteDataByRouteRef.value
    const pageTitle = pageData && pageData.title
    const pageDescription = pageData && pageData.description
    document.title = (pageTitle ? pageTitle + ` | ` : ``) + siteData.title
    updateHeadTags([
      ['meta', { charset: 'utf-8' }],
      [
        'meta',
        {
          name: 'viewport',
          content: 'width=device-width,initial-scale=1'
        }
      ],
      [
        'meta',
        {
          name: 'description',
          content: pageDescription || siteData.description
        }
      ],
      ...siteData.head,
      ...((pageData && pageData.frontmatter.head) || [])
    ])
  })
}

function createHeadElement([tag, attrs, innerHTML]: HeadConfig) {
  const el = document.createElement(tag)
  for (const key in attrs) {
    el.setAttribute(key, attrs[key])
  }
  if (innerHTML) {
    el.innerHTML = innerHTML
  }
  return el
}
