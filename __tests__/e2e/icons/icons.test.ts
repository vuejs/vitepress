import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const isBuild = !!process.env.VITE_TEST_BUILD

const maskImage = (selector: string) =>
  page.$eval(selector, (el) => {
    const styles = getComputedStyle(el)
    return styles.maskImage || styles.webkitMaskImage
  })

describe('icons', () => {
  const externalRequests: string[] = []
  const devIconRequests: string[] = []

  beforeAll(() => {
    page.on('request', (request) => {
      const url = request.url()
      if (!url.startsWith(`http://localhost:${process.env['PORT']}`)) {
        externalRequests.push(url)
      }
      if (url.includes('/@vpicons/')) devIconRequests.push(url)
    })
  })

  test('social links render from both collections', async () => {
    await goto('/')

    for (const [label, cls] of [
      ['Home social link', '.vpi-simple-icons-github'],
      ['Heart social link', '.vpi-lucide-heart']
    ]) {
      const selector = `a[aria-label="${label}"] span`
      expect(await page.getAttribute(selector, 'class')).toBe(cls.slice(1))
      // an unresolved icon computes to mask-image: none and renders nothing
      await page.waitForFunction(
        (sel) => {
          const el = document.querySelector(sel)
          if (!el) return false
          const styles = getComputedStyle(el)
          return (styles.maskImage || styles.webkitMaskImage) !== 'none'
        },
        selector,
        { timeout: 3000 }
      )
    }
  })

  test('VPIcon renders collection, default-collection and raw svg icons', async () => {
    await goto('/icons/')

    expect(await page.getAttribute('[data-test-icon="lucide"]', 'class')).toBe(
      'vpi-lucide-rocket'
    )
    expect(await page.getAttribute('[data-test-icon="simple"]', 'class')).toBe(
      'vpi-simple-icons-vuedotjs'
    )
    expect(
      await page.$eval('[data-test-icon="raw"]', (el) => el.innerHTML)
    ).toContain('<svg')
    // the raw-svg wrapper must not pick up the mask machinery, which would
    // paint a solid currentColor box over the svg
    expect(
      await page.$eval('[data-test-icon="raw"]', (el) => {
        const styles = getComputedStyle(el)
        return {
          background: styles.backgroundColor,
          svgWidth: getComputedStyle(el.querySelector('svg')!).width
        }
      })
    ).toEqual({ background: 'rgba(0, 0, 0, 0)', svgWidth: '16px' })

    await page.waitForFunction(() => {
      const el = document.querySelector('[data-test-icon="lucide"]')
      if (!el) return false
      const styles = getComputedStyle(el)
      return (styles.maskImage || styles.webkitMaskImage) !== 'none'
    })
  })

  test('no icon is ever fetched from an external origin', () => {
    expect(externalRequests).toEqual([])
  })

  test.runIf(!isBuild)(
    'dev resolves icons from the local endpoint',
    async () => {
      await goto('/')
      await page.waitForFunction(() => {
        const el = document.querySelector(
          'a[aria-label="Heart social link"] span'
        )
        if (!el) return false
        const styles = getComputedStyle(el)
        return (styles.maskImage || styles.webkitMaskImage).includes(
          '/@vpicons/'
        )
      })
      expect(
        devIconRequests.some((url) =>
          url.includes('/@vpicons/lucide/heart.svg')
        )
      ).toBe(true)
    }
  )

  test.runIf(isBuild)(
    'build inlines icons into the hashed stylesheet',
    async () => {
      await goto('/')
      expect(
        await maskImage('a[aria-label="Heart social link"] span')
      ).toContain('data:image/svg+xml')
      expect(devIconRequests).toEqual([])

      const html = readFileSync(
        resolve(
          fileURLToPath(import.meta.url),
          '../../.vitepress/dist/index.html'
        ),
        'utf-8'
      )
      expect(html).toMatch(/href="\/assets\/vp-icons\.[\w-]+\.css"/)
      expect(html).not.toContain('__VP_ICONS_HASH__')

      // prose mentioning the placeholder is left alone — only the link tag
      // gets the hash substituted
      const iconsPage = readFileSync(
        resolve(
          fileURLToPath(import.meta.url),
          '../../.vitepress/dist/icons/index.html'
        ),
        'utf-8'
      )
      expect(iconsPage).toContain('vp-icons.__VP_ICONS_HASH__.css</code>')
      expect(iconsPage).toMatch(
        /<link rel="preload stylesheet" href="\/assets\/vp-icons\.[\w-]+\.css" as="style">/
      )
    }
  )

  test.runIf(isBuild)(
    'icons.include forces unrendered icons into the sheet',
    () => {
      const assetsDir = resolve(
        fileURLToPath(import.meta.url),
        '../../.vitepress/dist/assets'
      )
      const cssFile = readdirSync(assetsDir).find((f) =>
        /^vp-icons\.[\w-]+\.css$/.test(f)
      )!
      expect(cssFile).toBeTruthy()
      const css = readFileSync(join(assetsDir, cssFile), 'utf-8')
      expect(css).toContain('.vpi-lucide-egg')
      expect(css).toContain('.vpi-lucide-heart')
      expect(css).toContain('.vpi-simple-icons-github')
      // zero-specificity base rules ship with the sheet for any theme
      expect(css).toContain(':where(')
    }
  )
})
