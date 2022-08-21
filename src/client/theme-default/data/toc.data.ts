/// <reference types="node" />
import fs from "fs"
import path from "path"
import type { DefaultTheme } from 'vitepress/theme'
import type { SiteData } from 'vitepress'
import { defineData } from "vitepress"

interface APIHeader {
  anchor: string
  text: string
}

interface APIItems {
  text: string
  link: string
  headers: APIHeader[]
}

export interface APIGroup {
  text: string
  items: APIItems[]
}

// declare resolved data type
export declare const data: Record<string, APIGroup[]>

type DefaultThemeSiteData = SiteData<DefaultTheme.Config>

export default defineData({
  config: (siteData: DefaultThemeSiteData) => {
    return resolveTOCRoute(siteData)
  },
  // declare files that should trigger HMR
  watch: (data) => data.watch,
  // read from fs and generate the data
  load: (data) => data.load
})

const headersCache = new Map<
  string,
  {
    headers: APIHeader[]
    timestamp: number
  }
>()

function resolveTOCRoute(siteData: DefaultThemeSiteData) {
  const sidebar = Array.isArray(siteData.themeConfig.sidebar) 
    ? siteData.themeConfig.sidebar
    : Object.values(siteData.themeConfig.sidebar || []).flat(1)
  const seen: Record<string, APIGroup[]> = {}

  type Context = APIGroup & { toc: string }

  function walk(items: DefaultTheme.SidebarItem[], current: Context | null) {
    for (const item of items) {
      if ('items' in item) {
        let newCtx: Context | null = current
        if (item.toc || current) {
          newCtx = current 
            ? <Context>{
              text: current.text + ' - ' + item.text,
              toc: current.toc,
              items: [],
            } 
            : <Context>{
              text: item.text,
              items: [],
              toc: item.toc
            }
          seen[newCtx.toc] = (seen[newCtx.toc] || []).concat([newCtx])
        }
        walk(item.items, newCtx)
      } else {
        current?.items.push({
          text: item.text,
          link: item.link,
          headers: parsePageHeaders(path.join(siteData.root, item.link + '.md'))
        })
      }
    }
  }

  walk(sidebar as any, null)
  return {
    watch: Array.from(headersCache.keys()),
    load: seen
  }
}

function parsePageHeaders(fullPath: string): APIHeader[] {
  const timestamp = fs.statSync(fullPath).mtimeMs

  const cached = headersCache.get(fullPath)
  if (cached && timestamp === cached.timestamp) {
    return cached.headers
  }

  const src = fs.readFileSync(fullPath, 'utf-8')
  const h2s = src.match(/^## [^\n]+/gm)
  let headers: APIHeader[] = []
  if (h2s) {
    headers = h2s.map((h) => {
        const text = h
          .slice(2)
          .replace(/<sup class=.*/, '')
          .replace(/\\</g, '<')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/\{#([a-zA-Z0-9-]+)\}/g, '') // hidden anchor tag
          .trim()
        const anchor = h.match(/\{#([a-zA-Z0-9-]+)\}/)?.[1] ?? text
        return { text, anchor }
      }
    )
  }
  headersCache.set(fullPath, {
    timestamp,
    headers
  })
  return headers
}