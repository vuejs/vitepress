import {
  createMarkdownRenderer,
  disposeMdItInstance
} from 'node/markdown/markdown'
import type { MarkdownEnv, MarkdownSourceLoc } from 'node/shared'

async function collect(src: string, env: Partial<MarkdownEnv> = {}) {
  disposeMdItInstance()
  const md = await createMarkdownRenderer('.', {
    highlight: (code) => code
  })
  const fullEnv = {
    path: '/docs/page.md',
    relativePath: 'page.md',
    cleanUrls: false,
    ...env
  } as MarkdownEnv
  const tokens = md.parse(src, fullEnv)
  const found: { type: string; raw?: string; loc?: MarkdownSourceLoc }[] = []
  for (const token of tokens) {
    for (const child of token.children ?? []) {
      if (
        (child.type === 'link_open' || child.type === 'image') &&
        child.attrGet('class') !== 'header-anchor'
      ) {
        found.push({
          type: child.type,
          raw: child.meta?.vpRaw,
          loc: child.meta?.vpLoc
        })
      }
    }
  }
  return found
}

describe('markdown/plugins/sourcePositions', () => {
  test('exact lines and columns across a multi-line paragraph', async () => {
    const links = await collect('para one [a](./a)\nand two [b](./b) end\n')
    expect(links.map((l) => l.loc)).toEqual([
      { file: '/docs/page.md', line: 1, column: 10 },
      { file: '/docs/page.md', line: 2, column: 9 }
    ])
  })

  test('lines stay file-accurate after frontmatter', async () => {
    const links = await collect(
      '---\ntitle: x\n---\n\n# H\n\nsee [a](./a)\nand [b](./b)\n'
    )
    expect(links.map((l) => l.loc)).toEqual([
      { file: '/docs/page.md', line: 7, column: 5 },
      { file: '/docs/page.md', line: 8, column: 5 }
    ])
  })

  test('table-cell links inherit their exact row line', async () => {
    const links = await collect(
      '| a | b |\n|---|---|\n| [x](./x) | y |\n| r2 | [z](./z) |\n'
    )
    expect(links.map((l) => l.loc?.line)).toEqual([3, 4])
  })

  test('blockquote columns account for the stripped prefix', async () => {
    const links = await collect('> quoted [q](./q)\n> > deep [d](./d)\n')
    expect(links.map((l) => l.loc)).toEqual([
      { file: '/docs/page.md', line: 1, column: 10 },
      { file: '/docs/page.md', line: 2, column: 10 }
    ])
  })

  test('multi-line code span before a link does not shift it', async () => {
    // code-span newlines become spaces in token content; offset capture is
    // unaffected, the softbreak-walking approach would be off by one here
    const links = await collect('a `code\nspan` then [x](./x)\nnext [y](./y)\n')
    expect(links.map((l) => l.loc?.line)).toEqual([2, 3])
  })

  test('list continuation lines and nested items', async () => {
    const links = await collect('- item\n  cont [i](./i)\n- [j](./j)\n')
    expect(links.map((l) => l.loc)).toEqual([
      { file: '/docs/page.md', line: 2, column: 8 },
      { file: '/docs/page.md', line: 3, column: 3 }
    ])
  })

  test('reference links report the usage site', async () => {
    const links = await collect('start\n\nuse [ref][r] here\n\n[r]: ./target\n')
    expect(links.map((l) => l.loc?.line)).toEqual([3])
  })

  test('images and autolinks carry positions and raw destinations', async () => {
    const found = await collect(
      'pic ![alt](./img.png) and <http://localhost:5173/x>\n'
    )
    expect(found).toEqual([
      {
        type: 'image',
        raw: './img.png',
        loc: { file: '/docs/page.md', line: 1, column: 5 }
      },
      {
        type: 'link_open',
        raw: 'http://localhost:5173/x',
        loc: { file: '/docs/page.md', line: 1, column: 27 }
      }
    ])
  })

  test('linkified bare URLs after breaks get at least the line', async () => {
    const links = await collect('one\ntwo http://localhost:5173/a end\n')
    expect(links[0].loc?.line).toBe(2)
  })

  test('raw destination is decoded and keeps hash/query', async () => {
    const links = await collect('[c](./中文.md#über?q=1)\n')
    expect(links[0].raw).toBe('./中文.md#über?q=1')
    expect(links[0].loc).toEqual({ file: '/docs/page.md', line: 1, column: 1 })
  })

  test('emphasis, attrs suffixes and emoji before links do not break offsets', async () => {
    const links = await collect(
      '**bold** :smile: [a](./a){.cls}\nplain [b](./b)\n'
    )
    expect(links.map((l) => l.loc)).toEqual([
      { file: '/docs/page.md', line: 1, column: 18 },
      { file: '/docs/page.md', line: 2, column: 7 }
    ])
  })

  test('repeated cell text keeps the line and omits the column', async () => {
    const links = await collect(
      '| a | b |\n|---|---|\n| [x](./x) | [x](./x) |\n'
    )
    expect(links.map((l) => l.loc)).toEqual([
      { file: '/docs/page.md', line: 3 },
      { file: '/docs/page.md', line: 3 }
    ])
  })

  test('github alert bodies report exact positions', async () => {
    const links = await collect(
      '> [!TIP]\n> a [one](./one)\n> b [two](./two)\n'
    )
    expect(links.map((l) => l.loc)).toEqual([
      { file: '/docs/page.md', line: 2, column: 5 },
      { file: '/docs/page.md', line: 3, column: 5 }
    ])
  })

  test('github alert with a custom title keeps positions exact', async () => {
    const links = await collect('> [!WARNING] Custom\n> body [x](./x)\n')
    expect(links[0].loc).toEqual({
      file: '/docs/page.md',
      line: 2,
      column: 8
    })
  })

  test('header anchors get no synthetic position', async () => {
    disposeMdItInstance()
    const md = await createMarkdownRenderer('.', {
      highlight: (code) => code
    })
    const tokens = md.parse('# Heading\n', {
      path: '/docs/page.md',
      relativePath: 'page.md',
      cleanUrls: false
    } as MarkdownEnv)
    const permalink = tokens
      .flatMap((t) => t.children ?? [])
      .find((t) => t.attrGet('class') === 'header-anchor')
    expect(permalink).toBeDefined()
    expect(permalink!.meta?.vpLoc).toBeUndefined()
  })
})
