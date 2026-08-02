describe('dynamic routes', () => {
  test('render correct content', async () => {
    await goto('/dynamic-routes/foo')
    expect(await page.textContent('h1')).toMatch('Foo')
    expect(await page.textContent('pre.params')).toMatch('"id": "foo"')
    expect(await page.title()).toBe('Foo - transformed | Example')

    await goto('/dynamic-routes/bar')
    expect(await page.textContent('h1')).toMatch('Bar')
    expect(await page.textContent('pre.params')).toMatch('"id": "bar"')
  })
})
