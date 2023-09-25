import { watchEffect, type Ref } from 'vue'
import {
  type HeadConfig,
  type SiteData,
  createTitle,
  mergeHead
} from '../../shared'
import type { Route } from '../router'

export function useUpdateHead(route: Route, siteDataByRouteRef: Ref<SiteData>) {
  let managedHeadElements: (HTMLElement | undefined)[] = []
  let isFirstUpdate = true

  const updateHeadTags = (newTags: HeadConfig[]) => {
    if (import.meta.env.PROD && isFirstUpdate) {
      // in production, the initial meta tags are already pre-rendered so we
      // skip the first update.
      isFirstUpdate = false
      return
    }

    const newElements: (HTMLElement | undefined)[] =
      newTags.map(createHeadElement)

    managedHeadElements.forEach((oldEl, oldIndex) => {
      const matchedIndex = newElements.findIndex(
        (newEl) => newEl?.isEqualNode(oldEl ?? null)
      )
      if (matchedIndex !== -1) {
        delete newElements[matchedIndex]
      } else {
        oldEl?.remove()
        delete managedHeadElements[oldIndex]
      }
    })

    newElements.forEach((el) => el && document.head.appendChild(el))
    managedHeadElements = [...managedHeadElements, ...newElements].filter(
      Boolean
    )
  }

  watchEffect(() => {
    const pageData = route.data
    const siteData = siteDataByRouteRef.value
    const pageDescription = pageData && pageData.description
    const frontmatterHead = (pageData && pageData.frontmatter.head) || []

    // update title and description
    const title = createTitle(siteData, pageData)
    if (title !== document.title) {
      document.title = title
    }

    const description = pageDescription || siteData.description
    let metaDescriptionElement = document.querySelector(
      `meta[name=description]`
    )
    if (metaDescriptionElement) {
      if (metaDescriptionElement.getAttribute('content') !== description) {
        metaDescriptionElement.setAttribute('content', description)
      }
    } else {
      createHeadElement(['meta', { name: 'description', content: description }])
    }

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
  if (tag === 'script' && !attrs.async) {
    // async is true by default for dynamically created scripts
    ;(el as HTMLScriptElement).async = false
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
