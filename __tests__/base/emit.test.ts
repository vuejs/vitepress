import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = resolve(fileURLToPath(import.meta.url), '..')
const dist = (mode: string, ...p: string[]) =>
  join(dir, `fixture/.vitepress/dist-${mode}`, ...p)
const read = (mode: string, file: string) =>
  readFileSync(dist(mode, file), 'utf-8')

const walk = (root: string): string[] =>
  readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath, e.name))

describe('relative base emit', () => {
  test('root page references everything at ./', () => {
    const html = read('relative', 'index.html')
    expect(html).toContain(
      'window.__VP_SITE_ROOT__=new URL("./",location).href'
    )
    expect(html).toMatch(/href="\.\/assets\/style\.[\w-]+\.css"/)
    expect(html).toMatch(/src="\.\/assets\/app\.[\w-]+\.js"/)
    expect(html).toMatch(/src="\.\/assets\/chunks\/metadata\.[\w-]+\.js"/)
    expect(html).toContain('href="./vp-icons.css"')
  })

  test('markdown links compile page-relative with explicit index.html', () => {
    const html = read('relative', 'index.html')
    expect(html).toContain('href="./sub/page.html"')
    expect(html).toContain('href="./sub/index.html"')
    expect(html).toContain('href="./moved/target.html"')
  })

  test('non-page links get the prefix but no .html', () => {
    const html = read('relative', 'index.html')
    expect(html).toContain('href="./file.zip"')
    expect(html).not.toContain('file.zip.html')
  })

  test('public and hashed assets in content are page-relative', () => {
    const html = read('relative', 'index.html')
    expect(html).toContain('src="./logo.png"')
    expect(html).toMatch(/src="\.\/assets\/photo\.[\w-]+\.png"/)
  })

  test('depth 1 pages use ../', () => {
    const html = read('relative', 'sub/page.html')
    expect(html).toContain(
      'window.__VP_SITE_ROOT__=new URL("../",location).href'
    )
    expect(html).toMatch(/href="\.\.\/assets\/style\.[\w-]+\.css"/)
    expect(html).toContain('href="../vp-icons.css"')
    expect(html).toContain('src="../logo.png"')
    expect(html).toContain('href="../index.html"')
    expect(html).toContain('href="../sub/deep/page2.html"')
  })

  test('hash and external links stay untouched', () => {
    const html = read('relative', 'sub/page.html')
    expect(html).toContain('href="#local-anchor"')
    expect(html).toContain('href="https://example.com/x"')
  })

  test('depth 2 pages use ../../', () => {
    const html = read('relative', 'sub/deep/page2.html')
    expect(html).toContain(
      'window.__VP_SITE_ROOT__=new URL("../../",location).href'
    )
    expect(html).toMatch(/href="\.\.\/\.\.\/assets\/style\.[\w-]+\.css"/)
  })

  test('rewritten page lands at its rewrite depth', () => {
    const html = read('relative', 'moved/target.html')
    expect(html).toContain(
      'window.__VP_SITE_ROOT__=new URL("../",location).href'
    )
    expect(html).toMatch(/href="\.\.\/assets\/style\.[\w-]+\.css"/)
  })

  test('404 renders at root depth', () => {
    const html = read('relative', '404.html')
    expect(html).toContain(
      'window.__VP_SITE_ROOT__=new URL("./",location).href'
    )
    expect(html).toMatch(/href="\.\/assets\/style\.[\w-]+\.css"/)
  })

  test('no sentinel leaks into emitted html or css', () => {
    for (const file of walk(dist('relative'))) {
      if (!/\.(html|css)$/.test(file)) continue
      expect(readFileSync(file, 'utf-8'), file).not.toContain('__VP_BASE__')
    }
  })

  test('content-loader html keeps site-absolute links', () => {
    const html = read('relative', 'blog.html')
    // the loader source lives at posts/deep/, the consumer at the root —
    // per-source relativizing would point above the site root
    expect(html).toContain('href="/sub/page.html"')
    expect(html).not.toContain('../../sub/page.html')
    // the consuming page's own chrome is still relative
    expect(html).toMatch(/href="\.\/assets\/style\.[\w-]+\.css"/)
  })
})

describe('assetsBase emit', () => {
  const cdn = () => `http://localhost:${process.env['VP_CDN_PORT']}/`

  test('scripts, styles and preloads move to the cdn with crossorigin', () => {
    const html = read('cdn', 'index.html')
    expect(html).toMatch(
      new RegExp(
        `<script type="module" src="${cdn()}assets/app\\.[\\w-]+\\.js" crossorigin>`
      )
    )
    expect(html).toMatch(
      new RegExp(`src="${cdn()}assets/chunks/metadata\\.[\\w-]+\\.js"`)
    )
    expect(html).toMatch(
      new RegExp(`href="${cdn()}assets/style\\.[\\w-]+\\.css"`)
    )
    expect(html).toMatch(
      new RegExp(
        `<link rel="modulepreload" href="${cdn()}assets/chunks/[^"]+" crossorigin="">`
      )
    )
    expect(html).toMatch(
      new RegExp(
        `rel="preload" href="${cdn()}assets/inter-roman-latin\\.[^"]+"`
      )
    )
  })

  test('pages, links and root-level files stay on the site origin', () => {
    const html = read('cdn', 'index.html')
    expect(html).toContain('href="/vp-icons.css"')
    expect(html).toContain('href="/sub/page.html"')
    expect(html).toContain('src="/logo.png"')
    expect(read('cdn', 'hashmap.json')).toBeTruthy()
  })

  test('hashed content assets move to the cdn', () => {
    const html = read('cdn', 'index.html')
    expect(html).toMatch(
      new RegExp(`src="${cdn()}assets/photo\\.[\\w-]+\\.png"`)
    )
  })

  test('fonts referenced from css move to the cdn', () => {
    const cssFile = walk(dist('cdn', 'assets')).find((f) => f.endsWith('.css'))!
    expect(readFileSync(cssFile, 'utf-8')).toContain(
      `url(${cdn()}assets/inter-`
    )
  })
})

describe('mpa + relative base emit', () => {
  test('no sentinel leaks anywhere', () => {
    for (const file of walk(dist('mpa'))) {
      if (!/\.(html|css|js)$/.test(file)) continue
      expect(readFileSync(file, 'utf-8'), file).not.toContain('__VP_BASE__')
    }
  })

  test('css urls are relative to the css file', () => {
    const cssFile = walk(dist('mpa', 'assets')).find((f) => f.endsWith('.css'))!
    expect(readFileSync(cssFile, 'utf-8')).toContain('url(../assets/inter-')
  })

  test('pages reference assets by depth', () => {
    expect(read('mpa', 'sub/page.html')).toMatch(
      /href="\.\.\/assets\/style\.[\w-]+\.css"/
    )
  })
})

describe('plain base emit is unchanged', () => {
  test('root-absolute urls and no runtime-root script', () => {
    const html = read('plain', 'index.html')
    expect(html).toMatch(/href="\/assets\/style\.[\w-]+\.css"/)
    expect(html).toMatch(/src="\/assets\/app\.[\w-]+\.js"><\/script>/)
    expect(html).toContain('href="/sub/page.html"')
    expect(html).toContain('href="/sub/"')
    expect(html).toContain('src="/logo.png"')
    expect(html).not.toContain('__VP_SITE_ROOT__')
    expect(html).not.toContain('crossorigin>')
  })
})
