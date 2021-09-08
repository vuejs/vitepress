import fg from 'fast-glob'
import * as fsAsync from 'fs/promises'
import path from 'path'
import { resolveSiteData } from 'vitepress/dist/node/config'
import { HmrContext } from 'vite'

let root = ''

export default function vitepressPages(docDir?: string) {
  const virtualFileId = '/@siteData'
  return {
    name: 'vitepress-pages', // required, will show up in warnings and errors
    resolveId(id) {
      if (id === virtualFileId) {
        return virtualFileId
      }
    },
    async load(id) {
      if (id === virtualFileId) {
        root = docDir ?? 'docs'
        const conf = await resolveSiteData(root)

        conf.themeConfig.sidebar = await resolvePages()

        const stringConfig = JSON.stringify(conf).replace(/"/g, '\\"')

        return "export default \"" + stringConfig + "\""
      }
    },
    async handleHotUpdate(context: HmrContext) {
      // not sure if this can plugin can support hot reloading
    }
  }

  async function resolvePages() {
    const mdFiles = findMdFiles()
    const dirToFiles = createMultiMap(mdFiles)

    const sidebarItems = []
    for (let [dir, files] of dirToFiles) {
      const fileHeadlineArray = await Promise.all(files.map(f => findFirstH1InFile(f)))

      const sidebarItem = {
        text: beautifySidebarItemText(dir),
        children: fileHeadlineArray.map(fh => createChild(fh.headline, fh.file))
      }

      sidebarItems.push(sidebarItem)
    }

    return sidebarItems
  }

  function findMdFiles() {
    return fg.sync(`${root}/**/*.md`, {
      onlyFiles: true,
    })
  }

  async function findFirstH1InFile(filepath: string) {
    return {
      file: filepath,
      headline: await findFirstH1(filepath)
    }
  }

  async function findFirstH1(filepath: string) {
    const file = await fsAsync.readFile(filepath, 'utf8')
    const data = file.toString()
      .split('\n')
      .filter(l => l.startsWith('# '))

    return data[0]
  }

  function createChild(text: string, link: string): { text: string; link: string } {
    return {
      text: text.replace('# ', ''),
      link: link
        .replace(root, '')
        .replace('index', '')
        .replace('.md', '')
    }
  }

  function beautifySidebarItemText(path: string) {
    const lastDir = path.split('/').pop()

    const capitalizedWords = lastDir
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return capitalizedWords
  }

  function createMultiMap(files: string[]): Map<string, string[]> {
    let map = new Map();
    files.forEach((file) => {
      const dir = path.dirname(file)

      if (map.has(dir)) {
        (map.get(dir) ?? []).push(file);
      } else {
        map.set(dir, [file]);
      }
    });
    return map;
  }
}
