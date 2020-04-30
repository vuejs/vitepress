import { watchEffect } from 'vue'
import { siteDataRef } from './siteData'

/**
 * @param {import('./pageData').PageDataRef} pageDataRef
 */
export function useUpdateHead(pageDataRef) {
  /**
   * @type {HTMLElement[]}
   */
  const metaTags = Array.from(document.querySelectorAll('meta'))

  let isFirstUpdate = true
  /**
   * @param {import('src').HeadConfig[]} newTags
   */
  const updateHeadTags = (newTags) => {
    if (!__DEV__ && isFirstUpdate) {
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
    const pageData = pageDataRef.value
    const siteData = siteDataRef.value
    const pageTitle = pageData && pageData.title
    document.title = (pageTitle ? pageTitle + ` | ` : ``) + siteData.title
    updateHeadTags([
      ['meta', {
        name: 'description',
        content: siteData.description
      }],
      ...siteData.head,
      ...(pageData && pageData.frontmatter.head || [])
    ])
  })
}

/**
 * @param {import('src').HeadConfig} item
 */
function createHeadElement([tag, attrs, innerHTML]) {
  const el = document.createElement(tag)
  for (const key in attrs) {
    el.setAttribute(key, attrs[key])
  }
  if (innerHTML) {
    el.innerHTML = innerHTML
  }
  return el
}
