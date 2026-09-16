import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

test('loads data outside the site root', async () => {
  await goto('/external-data/')
  expect(await page.textContent('pre#external-data')).toBe('[{"a":true}]')
})

test.runIf(!process.env.VITE_TEST_BUILD)(
  'updates external data when files change, are added, or are deleted',
  async () => {
    await goto('/external-data/')
    const a = fileURLToPath(
      new URL('../../fixtures/external-data/a.json', import.meta.url)
    )
    const nested = fileURLToPath(
      new URL('../../fixtures/external-data/nested/', import.meta.url)
    )
    const original = await readFile(a, 'utf-8')

    async function expectData(data: unknown) {
      await page.waitForFunction(
        (expected) =>
          document.querySelector('pre#external-data')?.textContent === expected,
        JSON.stringify(data)
      )
    }

    try {
      await writeFile(a, '{"a":false}\n')
      await expectData([{ a: false }])

      await mkdir(nested)
      await writeFile(path.join(nested, 'b.json'), '{"b":true}\n')
      await expectData([{ a: false }, { b: true }])

      await rm(nested, { recursive: true })
      await expectData([{ a: false }])
    } finally {
      await rm(nested, { recursive: true, force: true })
      await writeFile(a, original)
    }
  }
)
