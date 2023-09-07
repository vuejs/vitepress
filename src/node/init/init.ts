import {
  intro,
  outro,
  group,
  text,
  select,
  cancel,
  confirm
} from '@clack/prompts'
import fs from 'fs-extra'
import path from 'path'
import { cyan, bold, yellow } from 'picocolors'
import { fileURLToPath } from 'url'
import template from 'lodash.template'

export enum ScaffoldThemeType {
  Default = 'default theme',
  DefaultCustom = 'default theme + customization',
  Custom = 'custom theme'
}

export interface ScaffoldOptions {
  root: string
  title?: string
  description?: string
  theme: ScaffoldThemeType
  useTs: boolean
  injectNpmScripts: boolean
}

const getPackageManger = () => {
  const name = process.env?.npm_config_user_agent || 'npm'
  if (name === 'npm') {
    return 'npm'
  }
  return name.split('/')[0]
}

export async function init() {
  intro(bold(cyan('Welcome to VitePress!')))

  const options: ScaffoldOptions = await group(
    {
      root: () =>
        text({
          message: 'Where should VitePress initialize the config?',
          initialValue: './',
          validate(value) {
            // TODO make sure directory is inside
          }
        }),

      title: () =>
        text({
          message: 'Site title:',
          placeholder: 'My Awesome Project'
        }),

      description: () =>
        text({
          message: 'Site description:',
          placeholder: 'A VitePress Site'
        }),

      theme: () =>
        select({
          message: 'Theme:',
          options: [
            {
              // @ts-ignore
              value: ScaffoldThemeType.Default,
              label: 'Default Theme',
              hint: 'Out of the box, good-looking docs'
            },
            {
              // @ts-ignore
              value: ScaffoldThemeType.DefaultCustom,
              label: 'Default Theme + Customization',
              hint: 'Add custom CSS and layout slots'
            },
            {
              // @ts-ignore
              value: ScaffoldThemeType.Custom,
              label: 'Custom Theme',
              hint: 'Build your own or use external'
            }
          ]
        }),

      useTs: () =>
        confirm({ message: 'Use TypeScript for config and theme files?' }),

      injectNpmScripts: () =>
        confirm({
          message: 'Add VitePress npm scripts to package.json?'
        })
    },
    {
      onCancel: () => {
        cancel('Cancelled.')
        process.exit(0)
      }
    }
  )

  outro(scaffold(options))
}

export function scaffold({
  root = './',
  title = 'My Awesome Project',
  description = 'A VitePress Site',
  theme,
  useTs,
  injectNpmScripts
}: ScaffoldOptions): string {
  const resolvedRoot = path.resolve(root)
  const templateDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../template'
  )

  const data = {
    title: JSON.stringify(title),
    description: JSON.stringify(description),
    useTs,
    defaultTheme:
      theme === ScaffoldThemeType.Default ||
      theme === ScaffoldThemeType.DefaultCustom
  }

  const pkgPath = path.resolve('package.json')
  const userPkg = fs.existsSync(pkgPath)
    ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    : {}

  const useMjs = userPkg.type !== 'module'

  const renderFile = (file: string) => {
    const filePath = path.resolve(templateDir, file)
    let targetPath = path.resolve(resolvedRoot, file)
    if (useMjs && file === '.vitepress/config.js') {
      targetPath = targetPath.replace(/\.js$/, '.mjs')
    }
    if (useTs) {
      targetPath = targetPath.replace(/\.(m?)js$/, '.$1ts')
    }
    const src = fs.readFileSync(filePath, 'utf-8')
    const compiled = template(src)(data)
    fs.outputFileSync(targetPath, compiled)
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
    renderFile(file)
  }

  const dir =
    root === './' ? '' : ` ${root.replace(/^\.\//, '').replace(/[/\\]$/, '')}`
  const gitignorePrefix = dir ? `${dir}/.vitepress` : '.vitepress'

  const tips = []
  if (fs.existsSync('.git')) {
    tips.push(
      `Make sure to add ${cyan(`${gitignorePrefix}/dist`)} and ` +
        `${cyan(`${gitignorePrefix}/cache`)} to your ` +
        `${cyan(`.gitignore`)} file.`
    )
  }
  if (
    theme !== ScaffoldThemeType.Default &&
    !userPkg.dependencies?.['vue'] &&
    !userPkg.devDependencies?.['vue']
  ) {
    tips.push(
      `Since you've chosen to customize the theme, ` +
        `you should also explicitly install ${cyan(`vue`)} as a dev dependency.`
    )
  }

  const tip = tips.length ? yellow([`\n\nTips:`, ...tips].join('\n- ')) : ``

  if (injectNpmScripts) {
    const scripts = {
      'docs:dev': `vitepress dev${dir}`,
      'docs:build': `vitepress build${dir}`,
      'docs:preview': `vitepress preview${dir}`
    }
    Object.assign(userPkg.scripts || (userPkg.scripts = {}), scripts)
    fs.writeFileSync(pkgPath, JSON.stringify(userPkg, null, 2))
    return `Done! Now run ${cyan(
      `${getPackageManger()} run docs:dev`
    )} and start writing.${tip}`
  } else {
    const execCommand = getPackageManger() === 'bun' ? 'bunx' : 'npx'
    return `You're all set! Now run ${cyan(
      `${execCommand} vitepress dev${dir}`
    )} and start writing.${tip}`
  }
}
