import { watchEffect, Ref } from 'vue'
import { HeadConfig, SiteData, createTitle, mergeHead } from '../../shared'
import { Route } from '../router'

export function useUpdateHead(route: Route, siteDataByRouteRef: Ref<SiteData>) {
  let managedHeadTags: HTMLElement[] = []
  let isFirstUpdate = true

  const updateHeadTags = (newTags: HeadConfig[]) => {
    if (import.meta.env.PROD && isFirstUpdate) {
      // in production, the initial meta tags are already pre-rendered so we
      // skip the first update.
      isFirstUpdate = false
      return
    }

    managedHeadTags.forEach((el) => document.head.removeChild(el))
    managedHeadTags = []
    newTags.forEach((headConfig) => {
      const el = createHeadElement(headConfig)
      document.head.appendChild(el)
      managedHeadTags.push(el)
    })
  }

  watchEffect(() => {
    const pageData = route.data
    const siteData = siteDataByRouteRef.value
    const pageDescription = pageData && pageData.description
    const frontmatterHead = (pageData && pageData.frontmatter.head) || []

    // update title and description
    document.title = createTitle(siteData, pageData)

    document
      .querySelector(`meta[name=description]`)!
      .setAttribute('content', pageDescription || siteData.description)

    updateHeadTags(
      mergeHead(siteData.head, filterOutHeadDescription(frontmatterHead))
    )
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

function isMetaDescription(headConfig: HeadConfig) {
  return (
    headConfig[0] === 'meta' &&
    headConfig[1] &&
    headConfig[1].name === 'description'
  )
}

function filterOutHeadDescription(head: HeadConfig[]) {
  return head.filter((h) => !isMetaDescription(h))
}
