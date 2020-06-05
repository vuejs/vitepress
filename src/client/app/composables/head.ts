import { watchEffect } from 'vue'
import { siteDataRef } from './siteData'
import { PageDataRef } from './pageData'
import { HeadConfig } from '../../../../types/shared'

export function useUpdateHead(pageDataRef: PageDataRef) {
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
    const pageData = pageDataRef.value
    const siteData = siteDataRef.value
    const pageTitle = pageData && pageData.title
    document.title = (pageTitle ? pageTitle + ` | ` : ``) + siteData.title
    updateHeadTags([
      [
        'meta',
        {
          name: 'description',
          content: siteData.description
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
