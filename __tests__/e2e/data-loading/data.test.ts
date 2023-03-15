describe('static data file support in vite 3', () => {
  beforeAll(async () => {
    await goto('/data-loading/data')
  })

  test('render correct content', async () => {
    expect(await page.textContent('pre#basic')).toMatchInlineSnapshot(`
      "[
        {
          \\"foo\\": true
        },
        {
          \\"bar\\": true
        }
      ]"
    `)
    expect(await page.textContent('pre#content')).toMatchInlineSnapshot(`
      "[
        {
          \\"src\\": \\"---\\\\ntitle: bar\\\\n---\\\\n\\\\nHello\\\\n\\\\n---\\\\n\\\\nworld\\\\n\\",
          \\"html\\": \\"<p>Hello</p>\\\\n<hr>\\\\n<p>world</p>\\\\n\\",
          \\"frontmatter\\": {
            \\"title\\": \\"bar\\"
          },
          \\"excerpt\\": \\"<p>Hello</p>\\\\n\\",
          \\"url\\": \\"/data-loading/content/bar.html\\",
          \\"transformed\\": true
        },
        {
          \\"src\\": \\"---\\\\ntitle: foo\\\\n---\\\\n\\\\nHello\\\\n\\\\n---\\\\n\\\\nworld\\\\n\\",
          \\"html\\": \\"<p>Hello</p>\\\\n<hr>\\\\n<p>world</p>\\\\n\\",
          \\"frontmatter\\": {
            \\"title\\": \\"foo\\"
          },
          \\"excerpt\\": \\"<p>Hello</p>\\\\n\\",
          \\"url\\": \\"/data-loading/content/foo.html\\",
          \\"transformed\\": true
        }
      ]"
    `)
  })
})
