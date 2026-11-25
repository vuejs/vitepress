test('customizes previous and next page labels in frontmatter', async () => {
  await goto('/frontmatter/prev-next')

  const prev = page.locator('.pager-link.prev')
  expect(await prev.locator('.desc').textContent()).toBe('Pagina prior')
  expect(await prev.locator('.title').textContent()).toBe('Outline')

  const next = page.locator('.pager-link.next')
  expect(await next.locator('.desc').textContent()).toBe('Proxima pagina')
  expect(await next.locator('.title').textContent()).toBe('Home')
})
