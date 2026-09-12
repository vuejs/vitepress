describe('navbar layout', () => {
  test.each([959, 960, 1440])(
    'reserves space beside the title only for a visible sidebar at %ipx',
    async (width) => {
      await page.setViewportSize({ width, height: 720 })

      const searchOffset = async (path: string) => {
        await goto(path)
        await page.evaluate(() => document.fonts.ready)

        const title = await page.locator('.VPNavBarTitle').boundingBox()
        const search = await page.locator('.VPNavBarSearch').boundingBox()
        return search!.x - title!.x
      }

      const homeOffset = await searchOffset('/')

      for (const path of ['/navbar/no-sidebar', '/missing-page']) {
        expect(await searchOffset(path)).toBeCloseTo(homeOffset, 0)
      }

      const sidebarOffset = await searchOffset('/home')
      if (width >= 960) {
        expect(sidebarOffset).toBeGreaterThan(homeOffset)
      } else {
        expect(sidebarOffset).toBeCloseTo(homeOffset, 0)
      }
    }
  )
})
