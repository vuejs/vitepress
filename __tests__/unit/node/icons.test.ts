import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { generateIconsCSS, resolveIconSVG } from 'node/icons'
import { parseIconName } from 'shared/shared'

// the e2e workspace has @iconify-json/lucide installed — use it as the
// resolution root for collection-loading tests
const e2eRoot = resolve(fileURLToPath(import.meta.url), '../../../e2e')

describe('node/icons', () => {
  describe('parseIconName', () => {
    test('bare names resolve in simple-icons', () => {
      expect(parseIconName('github')).toEqual({
        collection: 'simple-icons',
        icon: 'github'
      })
    })

    test('prefixed names resolve in their collection', () => {
      expect(parseIconName('lucide:heart')).toEqual({
        collection: 'lucide',
        icon: 'heart'
      })
    })

    test('rejects names outside iconify grammar', () => {
      for (const name of [
        'GitHub',
        'foo bar',
        'foo:',
        ':bar',
        'a<b',
        'foo:bar:baz',
        '-leading',
        ''
      ]) {
        expect(parseIconName(name), name).toBeNull()
      }
    })
  })

  describe('generateIconsCSS', () => {
    test('emits base rules and per-icon rules, no legacy common rule', async () => {
      const { css, warnings } = await generateIconsCSS(
        e2eRoot,
        new Set(['github']),
        'compressed'
      )
      expect(warnings).toEqual([])
      expect(css).toContain(
        '.vpi-simple-icons-github{--icon:url("data:image/svg+xml'
      )
      expect(css).toContain('simple-icons (CC0 1.0)')
      expect(css).toContain(":where([class^='vpi-']")
      expect(css).toContain('display:inline-block')
      expect(css).not.toContain('.vpi-social')
    })

    test('credits simple-icons only when it contributed rules', async () => {
      const { css } = await generateIconsCSS(
        e2eRoot,
        new Set(['notarealiconname', 'lucide:heart']),
        'compressed'
      )
      expect(css).toContain('.vpi-lucide-heart')
      expect(css).not.toContain('simple-icons (CC0 1.0)')
    })

    test('groups collections and stays deterministic across insertion order', async () => {
      const a = await generateIconsCSS(
        e2eRoot,
        new Set(['lucide:heart', 'github', 'lucide:egg']),
        'compressed'
      )
      const b = await generateIconsCSS(
        e2eRoot,
        new Set(['github', 'lucide:egg', 'lucide:heart']),
        'compressed'
      )
      expect(a.css).toBe(b.css)
      expect(a.css).toContain('.vpi-lucide-heart')
      expect(a.css).toContain('.vpi-lucide-egg')
      expect(a.css).toContain('.vpi-simple-icons-github')
    })

    test('warns on icons missing from an installed collection', async () => {
      const { css, warnings } = await generateIconsCSS(
        e2eRoot,
        new Set(['github', 'thisiconisnotreal']),
        'compressed'
      )
      expect(css).toContain('.vpi-simple-icons-github')
      expect(css).not.toContain('thisiconisnotreal')
      expect(warnings).toEqual([
        expect.stringContaining(
          '"thisiconisnotreal" was not found in the "simple-icons"'
        )
      ])
    })

    test('warns on uninstalled collections with an install hint', async () => {
      const { css, warnings } = await generateIconsCSS(
        e2eRoot,
        new Set(['notinstalled:foo']),
        'compressed'
      )
      expect(css).toBe('')
      expect(warnings).toEqual([
        expect.stringContaining('@iconify-json/notinstalled')
      ])
    })

    test('warns on invalid names', async () => {
      const { warnings } = await generateIconsCSS(
        e2eRoot,
        new Set(['Not A Name']),
        'compressed'
      )
      expect(warnings).toEqual([
        expect.stringContaining('"Not A Name" is not a valid icon name')
      ])
    })

    test('returns empty css for an empty set', async () => {
      const { css, warnings } = await generateIconsCSS(
        e2eRoot,
        new Set(),
        'compressed'
      )
      expect(css).toBe('')
      expect(warnings).toEqual([])
    })
  })

  describe('resolveIconSVG', () => {
    test('resolves an svg offline', async () => {
      const resolved = await resolveIconSVG(e2eRoot, 'lucide', 'heart')
      expect(resolved).toHaveProperty('svg')
      const svg = (resolved as { svg: string }).svg
      expect(svg).toContain('<svg')
      expect(svg).toContain('viewBox')
    })

    test('reports missing icons and collections distinctly', async () => {
      expect(await resolveIconSVG(e2eRoot, 'lucide', 'noicon')).toEqual({
        error: expect.stringContaining('was not found in the "lucide"')
      })
      expect(await resolveIconSVG(e2eRoot, 'nocollection', 'x')).toEqual({
        error: expect.stringContaining('@iconify-json/nocollection')
      })
      expect(await resolveIconSVG(e2eRoot, 'Bad Name', 'x')).toEqual({
        error: expect.stringContaining('not a valid icon name')
      })
    })
  })
})
