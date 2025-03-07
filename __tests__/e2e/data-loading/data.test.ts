import fs from 'node:fs/promises'
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
      await fs.writeFile(a, JSON.stringify({ a: false }, null, 2) + '\n')
      await page.waitForFunction(
        () =>
          document.querySelector('pre#basic')?.textContent ===
          JSON.stringify([{ a: false }, { b: true }], null, 2),
        undefined,
        { timeout: 3000 }
      )
    } finally {
      await fs.writeFile(a, JSON.stringify({ a: true }, null, 2) + '\n')
    }

    let err = true

    try {
      await fs.unlink(b)
      await page.waitForFunction(
        () =>
          document.querySelector('pre#basic')?.textContent ===
          JSON.stringify([{ a: true }], null, 2),
        undefined,
        { timeout: 3000 }
      )
      err = false
    } finally {
      if (err) {
        await fs.writeFile(b, JSON.stringify({ b: true }, null, 2) + '\n')
      }
    }

    try {
      await fs.writeFile(b, JSON.stringify({ b: false }, null, 2) + '\n')
      await page.waitForFunction(
        () =>
          document.querySelector('pre#basic')?.textContent ===
          JSON.stringify([{ a: true }, { b: false }], null, 2),
        undefined,
        { timeout: 3000 }
      )
    } finally {
      await fs.writeFile(b, JSON.stringify({ b: true }, null, 2) + '\n')
    }
  })

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
