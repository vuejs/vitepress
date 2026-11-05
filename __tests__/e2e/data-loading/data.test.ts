import { readFile, writeFile, unlink } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

describe('static data file support in vite 3', () => {
  beforeAll(async () => {
    await goto('/data-loading/data')
  })

  test('render correct content', async () => {
    expect(await page.textContent('pre#basic')).toMatchInlineSnapshot(`
      "[
        {
          "a": true
        },
        {
          "b": true
        }
      ]"
    `)
    expect(await page.textContent('pre#content')).toMatchInlineSnapshot(`
      "[
        {
          "src": "---\\ntitle: bar\\n---\\n\\nHello\\n\\n---\\n\\nworld\\n",
          "html": "<p>Hello</p>\\n<hr>\\n<p>world</p>\\n",
          "frontmatter": {
            "title": "bar"
          },
          "excerpt": "<p>Hello</p>\\n",
          "url": "/data-loading/content/bar.html",
          "transformed": true
        },
        {
          "src": "---\\ntitle: foo\\n---\\n\\nHello\\n\\n---\\n\\nworld\\n",
          "html": "<p>Hello</p>\\n<hr>\\n<p>world</p>\\n",
          "frontmatter": {
            "title": "foo"
          },
          "excerpt": "<p>Hello</p>\\n",
          "url": "/data-loading/content/foo.html",
          "transformed": true
        }
      ]"
    `)
  })

  test.runIf(!process.env.VITE_TEST_BUILD)('hmr works', async () => {
    const a = fileURLToPath(new URL('./data/a.json', import.meta.url))
    const b = fileURLToPath(new URL('./data/b.json', import.meta.url))

    try {
      await writeFile(a, JSON.stringify({ a: false }, null, 2) + '\n')
      await page.waitForFunction(
        () =>
          document.querySelector('pre#basic')?.textContent ===
          JSON.stringify([{ a: false }, { b: true }], null, 2)
      )
    } finally {
      await writeFile(a, JSON.stringify({ a: true }, null, 2) + '\n')
    }

    let err = true

    try {
      await unlink(b)
      await page.waitForFunction(
        () =>
          document.querySelector('pre#basic')?.textContent ===
          JSON.stringify([{ a: true }], null, 2)
      )
      err = false
    } finally {
      if (err) {
        await writeFile(b, JSON.stringify({ b: true }, null, 2) + '\n')
      }
    }

    try {
      await writeFile(b, JSON.stringify({ b: false }, null, 2) + '\n')
      await page.waitForFunction(
        () =>
          document.querySelector('pre#basic')?.textContent ===
          JSON.stringify([{ a: true }, { b: false }], null, 2)
      )
    } finally {
      await writeFile(b, JSON.stringify({ b: true }, null, 2) + '\n')
    }
  })

  test.runIf(!process.env.VITE_TEST_BUILD)(
    'hmr updates content rendered from included files',
    async () => {
      const foo = fileURLToPath(new URL('./content/foo.md', import.meta.url))
      const bar = fileURLToPath(new URL('./content/bar.md', import.meta.url))
      const originalFoo = await readFile(foo, 'utf8')
      const originalBar = await readFile(bar, 'utf8')

      try {
        await writeFile(
          foo,
          originalFoo.replace('Hello', '<!-- @include: ./bar.md -->')
        )
        await page.waitForFunction(() => {
          const data = JSON.parse(
            document.querySelector('pre#content')!.textContent!
          )
          return data.some(
            (item: { url: string; src: string }) =>
              item.url.endsWith('/foo.html') && item.src.includes('@include:')
          )
        })

        await writeFile(bar, originalBar.replace('Hello', 'Updated include'))
        await page.waitForFunction(() => {
          const data = JSON.parse(
            document.querySelector('pre#content')!.textContent!
          )
          return data.some(
            (item: { url: string; html: string; excerpt: string }) =>
              item.url.endsWith('/foo.html') &&
              item.html.includes('Updated include') &&
              item.excerpt.includes('Updated include')
          )
        })
      } finally {
        await writeFile(bar, originalBar)
        await writeFile(foo, originalFoo)
      }
    }
  )

  /*
    MODIFY a.json with { a: false }
    this should trigger a hmr update and the content should be updated to [{ a: false }, { b: true }]
    reset a.json

    DELETE b.json
    this should trigger a hmr update and the content should be updated to [{ a: true }]
    reset b.json if failed

    CREATE b.json with { b: false }
    this should trigger a hmr update and the content should be updated to [{ a: true }, { b: false }]
    reset b.json
  */
})
