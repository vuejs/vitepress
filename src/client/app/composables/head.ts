import { watchEffect, Ref } from 'vue'
import { HeadConfig, SiteData, processHead } from '../../shared'
import { Route } from '../router'

export function useUpdateHead(route: Route, siteDataByRouteRef: Ref<SiteData>) {

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
