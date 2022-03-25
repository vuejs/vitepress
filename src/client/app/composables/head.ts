import { watchEffect, Ref } from 'vue'
import { HeadConfig, processHead, SiteData } from '../../shared'
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

    const newEls: HTMLElement[] = []
    const commonLength = Math.min(managedHeadTags.length, newTags.length)
    for (let i = 0; i < commonLength; i++) {
      let el = managedHeadTags[i]
      const [tag, attrs, innerHTML = ''] = newTags[i]
      if (el.tagName.toLocaleLowerCase() === tag) {
        for (const key in attrs) {
          if (el.getAttribute(key) !== attrs[key]) {
            el.setAttribute(key, attrs[key])
          }
        }
        for (let i = 0; i < el.attributes.length; i++) {
          const name = el.attributes[i].name
          if (!(name in attrs)) {
            el.removeAttribute(name)
          }
        }
        if (el.innerHTML !== innerHTML) {
          el.innerHTML = innerHTML
        }
      } else {
        document.head.removeChild(el)
        el = createHeadElement(newTags[i])
        document.head.append(el)
      }
      newEls.push(el)
    }

    managedHeadTags
      .slice(commonLength)
      .forEach((el) => document.head.removeChild(el))
    newTags.slice(commonLength).forEach((headConfig) => {
      const el = createHeadElement(headConfig)
      document.head.appendChild(el)
      newEls.push(el)
    })
    managedHeadTags = newEls
  }

  watchEffect(() => {
    const pageData = route.data
    const siteData = siteDataByRouteRef.value
    const pageTitle = pageData && pageData.title
    const pageDescription = pageData && pageData.description

    // update title and description
    document.title = (pageTitle ? pageTitle + ` | ` : ``) + siteData.title
    document
      .querySelector(`meta[name=description]`)!
      .setAttribute('content', pageDescription || siteData.description)

    updateHeadTags(processHead(siteData.head, pageData));
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
