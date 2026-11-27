describe('copy code', () => {
  beforeEach(async () => {
    await goto('/copy-code/')
    await page.evaluate(() => {
      const state = window as typeof window & {
        copyMode: string
        legacyCopies: number
        copyErrors: string[]
      }
      state.copyMode = 'resolved'
      state.legacyCopies = 0
      state.copyErrors = []
      window.addEventListener('unhandledrejection', (event) => {
        state.copyErrors.push(String(event.reason))
      })
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async () => {
            if (state.copyMode !== 'resolved') throw new Error('denied')
          }
        }
      })
      document.execCommand = () => {
        state.legacyCopies++
        if (state.copyMode === 'throw') throw new Error('unsupported')
        return state.copyMode === 'legacy'
      }
    })
  })

  test('reports success after a Clipboard API write', async () => {
    const button = page.locator('button.copy')
    await button.click()
    await expect.poll(() => button.getAttribute('class')).toContain('copied')
    expect(await page.evaluate(() => (window as any).legacyCopies)).toBe(0)
  })

  test('reports success after a checked legacy copy and restores selection and focus', async () => {
    await page.evaluate(() => {
      ;(window as any).copyMode = 'legacy'
      const button = document.querySelector<HTMLButtonElement>('button.copy')!
      button.focus()
      window.getSelection()?.selectAllChildren(document.querySelector('h1')!)
      button.click()
    })
    const button = page.locator('button.copy')
    await expect.poll(() => button.getAttribute('class')).toContain('copied')
    expect(
      await page.evaluate(() => ({
        focused: document.activeElement?.matches('button.copy'),
        selected: window.getSelection()?.toString(),
        textareas: document.querySelectorAll('textarea').length
      }))
    ).toEqual({ focused: true, selected: 'Copy code', textareas: 0 })
  })

  for (const mode of ['false', 'throw']) {
    test(`does not report success when legacy copy returns ${mode}`, async () => {
      const button = page.locator('button.copy')
      // An unsuccessful retry also clears previous success feedback.
      await button.click()
      await expect.poll(() => button.getAttribute('class')).toContain('copied')
      await page.evaluate((mode) => {
        ;(window as any).copyMode = mode
      }, mode)
      await button.click()
      await expect
        .poll(() => page.evaluate(() => window.getSelection()?.toString()))
        .toContain('copy this text')
      expect(await button.getAttribute('class')).not.toContain('copied')
      expect(await page.locator('textarea').count()).toBe(0)
      expect(await page.evaluate(() => (window as any).copyErrors)).toEqual([])
      expect(await button.evaluate((el) => document.activeElement === el)).toBe(
        true
      )
    })
  }
})
