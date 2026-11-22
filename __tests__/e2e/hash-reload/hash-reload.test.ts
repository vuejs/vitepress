test('keeps the hash target in view when an image loads after reload', async () => {
  await page.setViewportSize({ width: 1280, height: 720 })

  let reloading = false
  let releaseImage!: () => void
  const image = new Promise<void>((resolve) => {
    releaseImage = resolve
  })

  await page.route('**/hash-reload-image.svg', async (route) => {
    if (reloading) await image
    await route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="700"/>'
    })
  })

  const target = page.locator('#target')
  const targetTop = () =>
    target.evaluate((el) => el.getBoundingClientRect().top)
  const atBottom = () =>
    scrollY > 0 &&
    document.scrollingElement!.scrollHeight - innerHeight - scrollY < 2

  await goto('/hash-reload/')
  await page.locator('.outline-link[href="#target"]').click()
  await page.waitForFunction(atBottom, undefined, { timeout: 10_000 })
  const originalTop = await targetTop()

  reloading = true
  try {
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForFunction(atBottom, undefined, { timeout: 10_000 })
  } finally {
    releaseImage()
  }
  await page.waitForFunction(
    () => document.querySelector<HTMLImageElement>('main img')!.naturalHeight
  )

  await expect.poll(targetTop).toBeCloseTo(originalTop, 0)
})
