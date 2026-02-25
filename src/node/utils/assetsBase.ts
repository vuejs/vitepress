import { isExternal, type SiteData } from '../shared'

export function getDefaultAssetsBase(base: string) {
  return `${base}assets/`
}

export function isDefaultAssetsBase(base: string, assetsBase: string) {
  return assetsBase === getDefaultAssetsBase(base)
}

export function normalizeAssetsBase(assetsBase: string) {
  // add leading slash if given `assetsBase` is not external
  if (!isExternal(assetsBase)) {
    assetsBase = assetsBase.replace(/^([^/])/, '/$1')
  }

  // add trailing slash
  return assetsBase.replace(/([^/])$/, '$1/')
}

export function normalizeAssetUrl(siteData: SiteData, filename: string) {
  // normalize assets only
  if (filename.startsWith('assets/')) {
    return `${siteData.assetsBase}${filename.slice(7)}`
  }

  return `${siteData.base}${filename}`
}
