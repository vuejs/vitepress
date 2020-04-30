import { watchEffect } from 'vue'
import { siteDataRef } from './siteData'

/**
 * @param {import('./pageData').PageDataRef} pageData
 */
export function useUpdateHead(pageData) {
  const descriptionTag = createHeadElement(['meta', {
    name: 'description',
    content: siteDataRef.value.description
  }])
  document.head.appendChild(descriptionTag)

  const updateTitleAndDescription = () => {
    document.title = siteDataRef.value.title
    descriptionTag.setAttribute('content', siteDataRef.value.description)
  }

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
    updateTitleAndDescription()
    updateHeadTags(siteHeadTags, siteDataRef.value.head)
  })

  watchEffect(() => {
    updateHeadTags(
      pageHeadTags,
      pageData.value && pageData.value.frontmatter.head
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
