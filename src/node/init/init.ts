import assert from 'node:assert'
import fs from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  cancel,
  confirm,
  group,
  intro,
  outro,
  select,
  text
} from '@clack/prompts'
import { Eta } from 'eta'
import c from 'picocolors'

import { slash } from '../shared'
import { readFile } from '../utils/fs'

export const ScaffoldThemeType = {
  Default: 'default theme',
  DefaultCustom: 'default theme + customization',
  Custom: 'custom theme'
} as const

export type ScaffoldThemeType =
  (typeof ScaffoldThemeType)[keyof typeof ScaffoldThemeType]

export interface ScaffoldOptions {
  root?: string
  srcDir?: string
  title?: string
  description?: string
  theme?: ScaffoldThemeType
  useTs?: boolean
  injectNpmScripts?: boolean
  addNpmScriptsPrefix?: boolean
  npmScriptsPrefix?: string
}

const getPackageManger = () => {
  const name = process.env?.npm_config_user_agent || 'npm'
  return name.split('/')[0]
}

export async function init(root?: string) {
  intro(c.bold(c.cyan('Welcome to VitePress!')))

  const options = await group(
    {
      root: async () => {
        if (root) return root

        return text({
          message: 'Where should VitePress initialize the config?',
          initialValue: './',
          defaultValue: './',
          validate(value) {
            // if value is undefined it will be handled as cwd.
            if (value === undefined) return undefined

            if (!isPathInside(process.cwd(), value))
              return `\`root\` must be in ${process.cwd()}`

            return undefined
          }
        })
      },

      srcDir: async ({ results }: any) => {
        return text({
          message: 'Where should VitePress look for your markdown files?',
          initialValue: results.root,
          defaultValue: results.root,
          validate(value) {
            // if value is undefined it will be handled as root.
            if (value === undefined) return undefined

            const resolvedRoot = path.resolve(results.root)
            if (!isPathInside(resolvedRoot, value))
              return `\`srcDir\` must be in \`root\`(${path.resolve(results.root)})`

            return undefined
          }
        })
      },

      title: async () => {
        return text({
          message: 'Site title:',
          placeholder: 'My Awesome Project',
          defaultValue: 'My Awesome Project'
        })
      },

      description: async () => {
        return text({
          message: 'Site description:',
          placeholder: 'A VitePress Site',
          defaultValue: 'A VitePress Site'
        })
      },

      theme: async () => {
        return select({
          message: 'Theme:',
          options: [
            {
              value: ScaffoldThemeType.Default,
              label: 'Default Theme',
              hint: 'Out of the box, good-looking docs'
            },
            {
              value: ScaffoldThemeType.DefaultCustom,
              label: 'Default Theme + Customization',
              hint: 'Add custom CSS and layout slots'
            },
            {
              value: ScaffoldThemeType.Custom,
              label: 'Custom Theme',
              hint: 'Build your own or use external'
            }
          ]
        })
      },

      useTs: async () => {
        return confirm({
          message: 'Use TypeScript for config and theme files?'
        })
      },

      injectNpmScripts: async () => {
        return confirm({
          message: 'Add VitePress npm scripts to package.json?'
        })
      },

      addNpmScriptsPrefix: async ({ results }: any) => {
        if (!results.injectNpmScripts) return false

        return confirm({
          message: 'Add a prefix for VitePress npm scripts?'
        })
      },

      npmScriptsPrefix: async ({ results }: any) => {
        if (!results.addNpmScriptsPrefix) return 'docs'

        return text({
          message: 'Prefix for VitePress npm scripts:',
          placeholder: 'docs',
          defaultValue: 'docs'
        })
      }
    },
    {
      onCancel: () => {
        cancel('Cancelled.')
        process.exit(0)
      }
    }
  )

  outro(await scaffold(options))
}

export async function scaffold({
  root: root_ = './',
  srcDir: srcDir_ = root_,
  title = 'My Awesome Project',
  description = 'A VitePress Site',
  theme = ScaffoldThemeType.Default,
  useTs = true,
  injectNpmScripts = true,
  addNpmScriptsPrefix = true,
  npmScriptsPrefix = 'docs'
}: ScaffoldOptions) {
  const resolvedRoot = path.resolve(root_)
  const root = path.relative(process.cwd(), resolvedRoot)

  const resolvedSrcDir = path.resolve(srcDir_)
  const srcDir = path.relative(resolvedRoot, resolvedSrcDir)

  const templateDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../template'
  )

  const data = {
    srcDir: srcDir ? JSON.stringify(srcDir) : undefined, // omit if default
    title: JSON.stringify(title),
    description: JSON.stringify(description),
    useTs,
    defaultTheme:
      theme === ScaffoldThemeType.Default ||
      theme === ScaffoldThemeType.DefaultCustom
  }

  const pkgPath = path.resolve('package.json')
  const userPkg = fs.existsSync(pkgPath)
    ? JSON.parse(await readFile(pkgPath))
    : {}

  const useMjs = userPkg.type !== 'module'

  const eta = new Eta({
    useWith: true,
    autoEscape: false,
    autoTrim: false
  })

  const renderFile = async (file: string) => {
    const filePath = path.resolve(templateDir, file)
    let targetPath = path.resolve(resolvedRoot, file)

    if (useMjs && file === '.vitepress/config.js') {
      targetPath = targetPath.replace(/\.js$/, '.mjs')
    }
    if (useTs) {
      targetPath = targetPath.replace(/\.(m?)js$/, '.$1ts')
    }
    if (file.endsWith('.md')) {
      targetPath = path.resolve(resolvedSrcDir, file)
    }

    const content = await readFile(filePath)
    const compiled = eta.renderString(content, data)

    await mkdir(path.dirname(targetPath), { recursive: true })
    await writeFile(targetPath, compiled)
  }

  const filesToScaffold = [
    'index.md',
    'api-examples.md',
    'markdown-examples.md',
    '.vitepress/config.js'
  ]

  if (theme === ScaffoldThemeType.DefaultCustom) {
    filesToScaffold.push(
      '.vitepress/theme/index.js',
      '.vitepress/theme/style.css'
    )
  } else if (theme === ScaffoldThemeType.Custom) {
    filesToScaffold.push(
      '.vitepress/theme/index.js',
      '.vitepress/theme/style.css',
      '.vitepress/theme/Layout.vue'
    )
  }

  for (const file of filesToScaffold) {
    await renderFile(file)
  }

  const tips = []

  const gitignorePrefix = root ? `${slash(root)}/.vitepress` : '.vitepress'
  if (fs.existsSync('.git')) {
    tips.push(
      `Make sure to add ${c.cyan(`${gitignorePrefix}/dist`)} and ${c.cyan(`${gitignorePrefix}/cache`)} to your ${c.cyan(`.gitignore`)} file.`
    )
  }

  if (
    theme !== ScaffoldThemeType.Default &&
    !userPkg.dependencies?.['vue'] &&
    !userPkg.devDependencies?.['vue']
  ) {
    tips.push(
      `Since you've chosen to customize the theme, you should also explicitly install ${c.cyan(`vue`)} as a dev dependency.`
    )
  }

  const tip = tips.length ? c.yellow([`\n\nTips:`, ...tips].join('\n- ')) : ``
  const dir = root ? ' ' + root : ''
  const pm = getPackageManger()

  if (injectNpmScripts) {
    const scripts: Record<string, string> = {}
    const prefix = addNpmScriptsPrefix ? `${npmScriptsPrefix}:` : ''

    scripts[`${prefix}dev`] = `vitepress dev${dir}`
    scripts[`${prefix}build`] = `vitepress build${dir}`
    scripts[`${prefix}preview`] = `vitepress preview${dir}`

    Object.assign(userPkg.scripts || (userPkg.scripts = {}), scripts)
    await writeFile(pkgPath, JSON.stringify(userPkg, null, 2))

    return `Done! Now run ${c.cyan(`${pm} run ${prefix}dev`)} and start writing.${tip}`
  } else {
    return `You're all set! Now run ${c.cyan(`${pm === 'npm' ? 'npx' : pm} vitepress dev${dir}`)} and start writing.${tip}`
  }
}

/**
 *
 * @description Returns whether `target` is inside `root`.
 *
 * @param {string} root an absolute directory.
 * @param {string} target an absolute or relative directory.
 *
 * @example
 * isPathInside("/home/test", "foo")        // true (inside)
 * isPathInside("/home/test", "./foo")      // true (inside)
 * isPathInside("/home/test", "..foo")      // true (inside)
 * isPathInside("/home/test", ".")          // true (root itself)
 * isPathInside("/home/test", "..")         // false (outside)
 * isPathInside("/home/test", "../foo")     // false (outside)
 * isPathInside("/home/test", "/home/test/a")  // true (absolute and inside)
 * isPathInside("/home/test", "/dev/foo")   // false (absolute and outside)
 * isPathInside("/home/test", "..")         // false (outside)
 * isPathInside("/home/test", "../foo")     // false (outside)
 * isPathInside("C:\\test", "D:\\foo")      // false (cross-drive, on Windows)
 */
function isPathInside(root: string, target: string): boolean {
  assert(path.isAbsolute(root), '`root` must be an absolute path')

  const resolvedTarget = path.resolve(root, target)
  const relativePath = path.relative(root, resolvedTarget)

  /**
   * - relativePath === "" means it's root.
   * - relativePath === ".." means it's the parent of root.
   * - relativePath === "../" (or, "..\", we use `path.sep` to handle this) means it's outside.
   * - if relativePath is an absolute path, means cross drive on Windows.
   */

  return (
    relativePath === '' ||
    (relativePath !== '..' &&
      !relativePath.startsWith('..' + path.sep) &&
      !path.isAbsolute(relativePath))
  )
}
