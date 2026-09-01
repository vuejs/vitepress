import { createRequire } from 'node:module'

import { getIconData, iconToHTML, iconToSVG } from '@iconify/utils'
import { formatCSS } from '@iconify/utils/lib/css/format'
import { getIconsCSSData } from '@iconify/utils/lib/css/icons'
import { loadCollectionFromFS } from '@iconify/utils/lib/loader/fs'

import { dependencies } from '../../package.json' with { type: 'json' }
import { parseIconName } from './shared'

type IconifyJSON = Parameters<typeof getIconsCSSData>[0]

const require = createRequire(import.meta.url)

// collections vitepress itself depends on, resolvable even when the project
// doesn't install them
const ownCollections = new Set(
  Object.keys(dependencies)
    .filter((dep) => dep.startsWith('@iconify-json/'))
    .map((dep) => dep.slice('@iconify-json/'.length))
)

/**
 * Placeholder for the stylesheet's content hash, replaced once all pages
 * have rendered and the icon set is complete.
 */
export const VP_ICONS_HASH_PLACEHOLDER = '__VP_ICONS_HASH__'

export function vpIconsFileName(hash: string): string {
  return `vp-icons.${hash}.css`
}

// mirrors theme-default/styles/icons.css at zero specificity, so any theme's
// rules win and duplication is inert; the `--icon` default keeps unresolved
// icons invisible instead of solid currentColor boxes
const BASE_RULES =
  ":where([class^='vpi-'],[class*=' vpi-'])" +
  `{--icon:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E");` +
  'display:inline-block;width:1em;height:1em}' +
  ":where([class^='vpi-']:not(.bg),[class*=' vpi-']:not(.bg))" +
  '{-webkit-mask:var(--icon) no-repeat;mask:var(--icon) no-repeat;' +
  '-webkit-mask-size:100% 100%;mask-size:100% 100%;' +
  'background-color:currentColor;color:inherit}'

export interface IconsCSSResult {
  /** empty string when no icon resolved */
  css: string
  warnings: string[]
}

const collectionCache = new Map<string, Promise<IconifyJSON | undefined>>()

async function loadCollection(
  name: string,
  root: string
): Promise<IconifyJSON | undefined> {
  const key = `${root}\0${name}`
  let cached = collectionCache.get(key)
  if (!cached) {
    // falls back to vitepress's own dependencies for the collections it ships
    cached = loadCollectionFromFS(name, false, '@iconify-json', root)
      .catch(() => undefined)
      .then(
        (data) =>
          data ??
          (ownCollections.has(name)
            ? require(`@iconify-json/${name}/icons.json`)
            : undefined)
      )
    collectionCache.set(key, cached)
    // don't cache misses — the collection may be installed during dev
    cached.then((data) => {
      if (!data) collectionCache.delete(key)
    })
  }
  return cached
}

const collectionMissingMessage = (collection: string) =>
  `icon collection "${collection}" is not installed — ` +
  `run \`npm add -D @iconify-json/${collection}\` in your project`

const iconMissingMessage = (collection: string, icon: string) =>
  `icon "${icon}" was not found in the "${collection}" collection — ` +
  `check https://icones.js.org/collection/${collection} for valid names.`

export async function generateIconsCSS(
  root: string,
  icons: Set<string>,
  format: 'expanded' | 'compressed'
): Promise<IconsCSSResult> {
  const warnings: string[] = []
  const byCollection = new Map<string, Set<string>>()

  for (const raw of icons) {
    const parsed = parseIconName(raw)
    if (!parsed) {
      warnings.push(
        !raw.includes(':') && parseIconName(`x:${raw}`)
          ? `"${raw}" has no collection prefix — write it as ` +
              `"<collection>:${raw}" (e.g. "simple-icons:${raw}"). Only ` +
              `\`socialLinks\` qualifies bare names automatically.`
          : `"${raw}" is not a valid icon name and was skipped.`
      )
      continue
    }
    let names = byCollection.get(parsed.collection)
    if (!names) byCollection.set(parsed.collection, (names = new Set()))
    names.add(parsed.icon)
  }

  const chunks: string[] = []

  for (const collection of Array.from(byCollection.keys()).sort()) {
    const data = await loadCollection(collection, root)
    const names = Array.from(byCollection.get(collection)!).sort()
    if (!data) {
      warnings.push(
        `${collectionMissingMessage(collection)} (needed by: ${names.join(', ')})`
      )
      continue
    }
    const found = names.filter((name) => {
      if (getIconData(data, name)) return true
      warnings.push(iconMissingMessage(collection, name))
      return false
    })
    if (!found.length) continue
    const cssData = getIconsCSSData(data, found, {
      iconSelector: '.vpi-{prefix}-{name}',
      varName: 'icon',
      format,
      mode: 'mask'
    })
    chunks.push(formatCSS(cssData.css, format))
  }

  return {
    css: chunks.length ? BASE_RULES + '\n' + chunks.join('') : '',
    warnings
  }
}

/** single-icon SVG for the dev-server endpoint */
export async function resolveIconSVG(
  root: string,
  collection: string,
  icon: string
): Promise<{ svg: string } | { error: string }> {
  if (!parseIconName(`${collection}:${icon}`)) {
    return { error: `"${collection}:${icon}" is not a valid icon name.` }
  }
  const data = await loadCollection(collection, root)
  if (!data) return { error: collectionMissingMessage(collection) }
  const iconData = getIconData(data, icon)
  if (!iconData) return { error: iconMissingMessage(collection, icon) }
  const built = iconToSVG(iconData)
  return { svg: iconToHTML(built.body, built.attributes) }
}
