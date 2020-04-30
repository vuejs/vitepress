import { watchEffect } from 'vue'
import { useSiteData } from './siteData'

/**
 * @param {import('./pageData').PageDataRef} pageData
 */
export function useUpdateHead(pageData) {
  const siteData = useSiteData()

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
      newTags.forEach(([tag, attrs, innerHTML]) => {
        const el = document.createElement(tag)
        for (const key in attrs) {
          el.setAttribute(key, attrs[key])
        }
        if (innerHTML) {
          el.innerHTML = innerHTML
        }
        document.head.appendChild(el)
        tags.push(el)
      })
    }
  }

  watchEffect(() => {
    updateHeadTags(siteHeadTags, siteData.value.head)
  })

  watchEffect(() => {
    updateHeadTags(
      pageHeadTags,
      pageData.value && pageData.value.frontmatter.head
    )
  })
}
