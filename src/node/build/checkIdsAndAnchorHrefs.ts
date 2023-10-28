import type { SiteConfig } from '../config'
import fg from 'fast-glob'
import { task } from '../utils/task'
import fs from 'fs-extra'
import { parse, walkSync, ELEMENT_NODE } from 'ultrahtml'
import { dirname, join, resolve } from 'path'

export async function checkIdsAndAnchorHrefs(siteConfig: SiteConfig) {
  await task('checking for duplicate ids and bad anchor hrefs', async () => {
    for await (const error of collectErrors(siteConfig)) {
      // TODO: use picocolors here
      console.error(error)
    }
  })
}

// TODO: export this function for testing purposes?
async function* collectErrors(siteConfig: SiteConfig) {
  const outDir = siteConfig.outDir
  const files = new Set(
    siteConfig.pages.map((page) =>
      `${siteConfig.rewrites.map[page] || page}`
        .replace(/\\/g, '/')
        .replace(/\.md$/, '.html')
    )
  )
  // add public html files to the list: i.e. VP docs has public/pure.html
  for await (const file of fg.stream('*.html', {
    cwd: outDir,
    deep: 1
  })) {
    files.add(file.toString().replace(/\\/g, '/'))
  }
  const checkHtmlExt = siteConfig.site.cleanUrls === false
  const stream = fg.stream('**/*.html', {
    cwd: siteConfig.outDir
  })
  for await (const file of stream) {
    const links = new Set<string>()
    const ids = new Set<string>()
    const errors: string[] = []
    const content = parse(
      await fs.promises.readFile(resolve(outDir, file.toString()), 'utf8')
    )
    // collect ids and href anchors
    walkSync(content, (node) => {
      if (node.type === ELEMENT_NODE) {
        const id = node.attributes.id
        if (id) {
          if (ids.has(id)) errors.push(`duplicate id "${id}"`)
          else ids.add(id)
        }
        if (node.name.toLowerCase() === 'a') {
          const href = node.attributes.href
          if (
            !href ||
            href.startsWith('http://') ||
            href.startsWith('https://')
          )
            return

          links.add(href)
        }
      }
    })
    // check for local hrefs and external links
    for (const href of links) {
      // 1) check for local ids
      if (href[0] === '#') {
        const id = href.slice(1)
        if (!ids.has(id)) errors.push(`missing local id for "${href}"`)

        continue
      }
      // 2) check for external links
      // Remove parameters and hash
      let localLink = href.split(/[#?]/).shift()
      if (!localLink) continue

      // Append .html
      if (checkHtmlExt) {
        if (localLink[localLink.length - 1] !== '/') {
          localLink += 'index.html'
        }
        if (!localLink.endsWith('.html')) {
          errors.push(`bad href link "${href}"`)
          continue
        }
      } else {
        if (localLink === '/') localLink = '/index.html'
        if (!localLink.endsWith('.html')) localLink += '.html'
      }
      // Get absolute link
      if (localLink[0] === '.') {
        localLink =
          '/' + join(dirname(file.toString()), localLink).replace(/\\/g, '/')
      }
      if (localLink[0] !== '/') {
        errors.push(`bad href link "${href}"`)
        continue
      }
      localLink = localLink.slice(1)
      if (!localLink) localLink = 'index.html'

      // Check if target html page exists
      if (!files.has(localLink)) {
        errors.push(`bad href link "${href}" (missing file)`)
      }
    }
    if (errors.length)
      yield `\n${file}\n${errors.map((e) => `  - ${e}`).join('\n')}`
  }
}
