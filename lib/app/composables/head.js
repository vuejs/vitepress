import { watchEffect } from 'vue'
import { siteDataRef } from './siteData'

/**
 * @param {import('./pageData').PageDataRef} pageDataRef
 */
export function useUpdateHead(pageDataRef) {
  const descriptionTag = createHeadElement(['meta', {
    name: 'description',
    content: siteDataRef.value.description
  }])
  document.head.appendChild(descriptionTag)

  /**
   * @type {HTMLElement[]}
   */
  const siteHeadTags = []
  /**
   * @type {HTMLElement[]}
   */
  const pageHeadTags = []

  /**
   * @param {HTMLElement[]} tags
   * @param {import('src').HeadConfig[]} newTags
   */
  const updateHeadTags = (tags, newTags) => {
    tags.forEach((el) => document.head.removeChild(el))
    tags.length = 0
    if (newTags && newTags.length) {
      newTags.forEach((headConfig) => {
        const el = createHeadElement(headConfig)
        document.head.appendChild(el)
        tags.push(el)
      })
    }
  }

  watchEffect(() => {
    const pageData = pageDataRef.value
    const siteData = siteDataRef.value
    const pageTitle = pageData && pageData.title
    document.title = (pageTitle ? pageTitle + ` | ` : ``) + siteData.title
    descriptionTag.setAttribute('content', siteData.description)
    updateHeadTags(siteHeadTags, siteData.head)
    updateHeadTags(
      pageHeadTags,
      pageData && pageData.frontmatter.head
    )
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
