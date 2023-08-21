import type { Locator } from 'playwright-chromium'

const getClassList = async (locator: Locator) => {
  const className = await locator.getAttribute('class')
  return className?.split(' ').filter(Boolean) ?? []
}

const trim = (str?: string | null) => str?.replace(/\u200B/g, '').trim()

beforeEach(async () => {
  await goto('/markdown-extensions/')
})

describe('Links', () => {
  test('render internal link', async () => {
    const targetMap = Object.entries({
      home: '/',
      'markdown-extensions': '/markdown-extensions/',
      heading: './#internal-links',
      'omit extension': './foo.html',
      '.md extension': './foo.html',
      '.html extension': './foo.html'
    })

    const items = page.locator('#internal-links +ul a')
    const count = await items.count()
    expect(count).toBe(6)

    for (let i = 0; i < count; i++) {
      const [text, href] = targetMap[i]
      expect(await items.nth(i).textContent()).toBe(text)
      expect(await items.nth(i).getAttribute('href')).toBe(href)
    }
  })

  test('external link get target="_blank" and rel="noreferrer"', async () => {
    const link = page.locator('#external-links + p a')
    expect(await link.getAttribute('target')).toBe('_blank')
    expect(await link.getAttribute('rel')).toBe('noreferrer')
  })
})

describe('GitHub-Style Tables', () => {
  test('render table', async () => {
    const table = page.locator('#github-style-tables + table')
    expect(table).toBeTruthy()
  })
})

describe('Emoji', () => {
  test('render emoji', async () => {
    const emojis = ['🎉', '💯']

    const items = page.locator('#emoji + ul li')
    const count = await items.count()
    expect(count).toBe(2)

    for (let i = 0; i < count; i++) {
      expect(await items.nth(i).textContent()).toBe(emojis[i])
    }
  })
})

describe('Table of Contents', () => {
  test('render toc', async () => {
    const items = page.locator('#table-of-contents + nav ul li')
    const count = await items.count()
    expect(count).toBe(35)
  })
})

describe('Custom Containers', () => {
  enum CustomBlocks {
    Info = 'INFO',
    Tip = 'TIP',
    Warning = 'WARNING',
    Danger = 'DANGER',
    Details = 'Details'
  }

  const classnameMap = {
    [CustomBlocks.Info]: 'info',
    [CustomBlocks.Tip]: 'tip',
    [CustomBlocks.Warning]: 'warning',
    [CustomBlocks.Danger]: 'danger',
    [CustomBlocks.Details]: 'details'
  }

  const getTitleText = (locator: Locator, type: CustomBlocks) => {
    if (type === CustomBlocks.Details) {
      return locator.locator('summary').textContent()
    } else {
      return locator.locator('.custom-block-title').textContent()
    }
  }

  test('default title', async () => {
    const blocks = page.locator('#default-title ~ .custom-block')
    for (const [index, type] of Object.values(CustomBlocks).entries()) {
      const block = blocks.nth(index)
      const classList = await getClassList(block)
      expect(classList).contain(classnameMap[type as CustomBlocks])
      expect(await getTitleText(block, type)).toBe(type)
    }
  })

  test('custom Title', async () => {
    const blocks = page.locator('#custom-title ~ .custom-block')
    expect(await getTitleText(blocks.nth(0), CustomBlocks.Danger)).toBe('STOP')
    expect(await getTitleText(blocks.nth(1), CustomBlocks.Details)).toBe(
      'Click me to view the code'
    )
  })
})

describe('Line Highlighting in Code Blocks', () => {
  test('single line', async () => {
    const classList = await getClassList(
      page.locator('#single-line + div code > span').nth(3)
    )
    expect(classList).toContain('highlighted')
  })

  test('multiple single lines, ranges', async () => {
    const lines = page.locator(
      '#multiple-single-lines-ranges + div code > span'
    )

    for (const num of [1, 4, 6, 7, 8]) {
      expect(await getClassList(lines.nth(num - 1))).toContain('highlighted')
    }
  })

  test('comment highlight', async () => {
    const lines = page.locator('#comment-highlight + div code > span')
    expect(await getClassList(lines.nth(0))).toContain('has-focus')

    expect(await getClassList(lines.nth(1))).toContain('highlighted')

    expect(await getClassList(lines.nth(3))).toContain('diff')
    expect(await getClassList(lines.nth(3))).toContain('remove')

    expect(await getClassList(lines.nth(4))).toContain('diff')
    expect(await getClassList(lines.nth(4))).toContain('add')

    expect(await getClassList(lines.nth(5))).toContain('highlighted')
    expect(await getClassList(lines.nth(5))).toContain('error')

    expect(await getClassList(lines.nth(6))).toContain('highlighted')
    expect(await getClassList(lines.nth(6))).toContain('warning')
  })
})

describe('Line Numbers', () => {
  test('render line numbers', async () => {
    const div = page.locator('#line-numbers + div')
    expect(await getClassList(div)).toContain('line-numbers-mode')
    const lines = div.locator('.line-numbers-wrapper > span')
    expect(await lines.count()).toBe(2)
  })
})

describe('Import Code Snippets', () => {
  test('basic', async () => {
    const lines = page.locator('#basic-code-snippet + div code > span')
    expect(await lines.count()).toBe(22)
  })

  test('specify region', async () => {
    const lines = page.locator('#specify-region + div code > span')
    expect(await lines.count()).toBe(6)
  })

  test('with other features', async () => {
    const div = page.locator('#with-other-features + div')
    expect(await getClassList(div)).toContain('line-numbers-mode')
    const lines = div.locator('code > span')
    expect(await lines.count()).toBe(6)
    expect(await getClassList(lines.nth(0))).toContain('highlighted')
  })
})

describe('Code Groups', () => {
  test('basic', async () => {
    const div = page.locator('#basic-code-group + div')

    // tabs
    const labels = div.locator('.tabs > label')
    const labelNames = ['config.js', 'config.ts']
    const count = await labels.count()
    expect(count).toBe(2)
    for (let i = 0; i < count; i++) {
      const text = await labels.nth(i).textContent()
      expect(text).toBe(labelNames[i])
    }

    // blocks
    const blocks = div.locator('.blocks > div')
    expect(await getClassList(blocks.nth(0))).toContain('active')
    await labels.nth(1).click()
    expect(await getClassList(blocks.nth(1))).toContain('active')
  })

  test('with other features', async () => {
    const div = page.locator('#with-other-features-1 + div')

    // tabs
    const labels = div.locator('.tabs > label')
    const labelNames = ['foo.md', 'snippet with region']
    const count = await labels.count()
    expect(count).toBe(2)
    for (let i = 0; i < count; i++) {
      const text = await labels.nth(i).textContent()
      expect(text).toBe(labelNames[i])
    }

    // blocks
    const blocks = div.locator('.blocks > div')
    expect(await blocks.nth(0).locator('code > span').count()).toBe(22)
    expect(await getClassList(blocks.nth(1))).toContain('line-numbers-mode')
    expect(await getClassList(blocks.nth(1))).toContain('language-ts')
    expect(await blocks.nth(1).locator('code > span').count()).toBe(6)
    expect(
      await getClassList(blocks.nth(1).locator('code > span').nth(0))
    ).toContain('highlighted')
  })
})

describe('Markdown File Inclusion', () => {
  test('render markdown', async () => {
    const h1 = page.locator('#markdown-file-inclusion + h1')
    expect(await h1.getAttribute('id')).toBe('foo')
  })

  test('render markdown using @', async () => {
    const h1 = page.locator('#markdown-at-file-inclusion + h1')
    expect(await h1.getAttribute('id')).toBe('bar')
  })

  test('render markdown using nested inclusion', async () => {
    const h1 = page.locator('#markdown-nested-file-inclusion + h1')
    expect(await h1.getAttribute('id')).toBe('foo-1')
  })

  test('render markdown using nested inclusion inside sub folder', async () => {
    const h1 = page.locator('#after-foo + h1')
    expect(await h1.getAttribute('id')).toBe('inside-sub-folder')
    const h2 = page.locator('#after-foo + h1 + h2')
    expect(await h2.getAttribute('id')).toBe('sub-sub')
    const h3 = page.locator('#after-foo + h1 + h2 + h3')
    expect(await h3.getAttribute('id')).toBe('sub-sub-sub')
  })

  test('support selecting range', async () => {
    const h2 = page.locator('#markdown-file-inclusion-with-range + h2')
    expect(trim(await h2.textContent())).toBe('Region')

    const p = page.locator('#markdown-file-inclusion-with-range + h2 + p')
    expect(trim(await p.textContent())).toBe('This is a region')
  })

  test('support selecting range without specifying start', async () => {
    const p = page.locator(
      '#markdown-file-inclusion-with-range-without-start ~ p'
    )
    expect(trim(await p.nth(0).textContent())).toBe('This is before region')
    expect(trim(await p.nth(1).textContent())).toBe('This is a region')
  })

  test('support selecting range without specifying end', async () => {
    const p = page.locator(
      '#markdown-file-inclusion-with-range-without-end ~ p'
    )
    expect(trim(await p.nth(0).textContent())).toBe('This is a region')
    expect(trim(await p.nth(1).textContent())).toBe('This is after region')
  })
})
