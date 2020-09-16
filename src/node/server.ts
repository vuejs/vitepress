import path from 'path'
import {
  createServer as createViteServer,
  cachedRead,
  ServerConfig,
  ServerPlugin
} from 'vite'
import { resolveConfig, SiteConfig, resolveSiteData } from './config'
import { createMarkdownToVueRenderFn } from './markdownToVue'
import { APP_PATH, SITE_DATA_REQUEST_PATH } from './resolver'
import { existsSync } from 'fs'

const debug = require('debug')('vitepress:serve')
const debugHmr = require('debug')('vitepress:hmr')

function createVitePressPlugin({
  configPath,
  site: initialSiteData
}: SiteConfig): ServerPlugin {
  return ({ app, root, watcher, resolver }) => {
    const markdownToVue = createMarkdownToVueRenderFn(root)

    // hot reload .md files as .vue files
    watcher.on('change', async (file) => {
      if (file.endsWith('.md')) {
        debugHmr(`reloading ${file}`)
        const content = await cachedRead(null, file)
        const timestamp = Date.now()
        const { pageData, vueSrc } = markdownToVue(
          content.toString(),
          file,
          timestamp,
          // do not inject pageData on HMR
          // it leads to vite to think <script> has changed and reloads the
          // component instead of re-rendering.
          // pageData needs separate HMR logic anyway (see below)
          false
        )

        // notify the client to update page data
        watcher.send({
          type: 'custom',
          id: 'vitepress:pageData',
          customData: {
            path: resolver.fileToRequest(file),
            pageData
          }
        })

        // reload the content component
        watcher.handleVueReload(file, timestamp, vueSrc)
      }
    })

    // hot reload handling for siteData
    // the data is stringified twice so it is sent to the client as a string
    // it is then parsed on the client via JSON.parse() which is faster than
    // parsing the object literal as JavaScript.
    let siteData = initialSiteData
    let stringifiedData = JSON.stringify(JSON.stringify(initialSiteData))
    watcher.add(configPath)
    watcher.on('change', async (file) => {
      if (file === configPath) {
        const newData = await resolveSiteData(root)
        stringifiedData = JSON.stringify(JSON.stringify(newData))
        if (newData.base !== siteData.base) {
          console.warn(
            `[vitepress]: config.base has changed. Please restart the dev server.`
          )
        }
        siteData = newData
        watcher.handleJSReload(SITE_DATA_REQUEST_PATH)
      }
    })

    // inject Koa middleware
    app.use(async (ctx, next) => {
      // serve siteData (which is a virtual file)
      if (ctx.path === SITE_DATA_REQUEST_PATH) {
        ctx.type = 'js'
        ctx.body = `export default ${stringifiedData}`
        debug(ctx.url)
        return
      }

      // handle .md -> vue transforms
      if (ctx.path.endsWith('.md')) {
        const file = resolver.requestToFile(ctx.path)
        if (!existsSync(file)) {
          return next()
        }

        await cachedRead(ctx, file)

        // let vite know this is supposed to be treated as vue file
        ctx.vue = true

        const { vueSrc, pageData } = markdownToVue(
          ctx.body,
          file,
          ctx.lastModified.getTime(),
          false
        )
        ctx.body = vueSrc
        debug(ctx.url, ctx.status)

        const pageDataWithLinks = {
          ...pageData,
          // TODO: this doesn't work with locales
          ...getNextAndPrev(siteData.themeConfig, ctx.path)
        }
        await next()

        // make sure this is the main <script> block
        if (!ctx.query.type) {
          // inject pageData to generated script
          ctx.body += `\nexport const __pageData = ${JSON.stringify(
            JSON.stringify(pageDataWithLinks)
          )}`
        }
        return
      }

      await next()

      // serve our index.html after vite history fallback
      if (ctx.url.endsWith('.html')) {
        await cachedRead(ctx, path.join(APP_PATH, 'index.html'))
        ctx.status = 200
      }
    })
  }
}

// TODO: share types from SideBarLink, SideBarGroup, etc. We are also assuming
// all themes follow this structure, in which case, we should expose the type
// instead of having any for themeConfig or not nest `sidebar` inside
// `themeConfig`, specially given it must be specified inside `locales` if there
// are any
interface SideBarLink {
  text: string
  link: string
}

function getNextAndPrev(themeConfig: any, pagePath: string) {
  if (!themeConfig.sidebar) {
    return
  }
  const sidebar = themeConfig.sidebar
  let candidates: SideBarLink[] = []
  Object.keys(sidebar).forEach((k) => {
    if (!pagePath.startsWith(k)) {
      return
    }
    sidebar[k].forEach((sidebarItem: { children?: SideBarLink[] }) => {
      if (!sidebarItem.children) {
        return
      }
      sidebarItem.children.forEach((candidate) => {
        candidates.push(candidate)
      })
    })
  })

  const path = pagePath.replace(/\.(md|html)$/, '')
  const currentLinkIndex = candidates.findIndex((v) => v.link === path)

  const nextAndPrev: { prev?: SideBarLink; next?: SideBarLink } = {}

  if (
    themeConfig.nextLinks !== false &&
    currentLinkIndex > -1 &&
    currentLinkIndex < candidates.length - 1
  ) {
    nextAndPrev.next = candidates[currentLinkIndex + 1]
  }

  if (themeConfig.prevLinks !== false && currentLinkIndex > 0) {
    nextAndPrev.next = candidates[currentLinkIndex - 1]
  }

  return nextAndPrev
}

export async function createServer(options: ServerConfig = {}) {
  const config = await resolveConfig(options.root)

  return createViteServer({
    ...options,
    configureServer: createVitePressPlugin(config),
    resolvers: [config.resolver]
  })
}
