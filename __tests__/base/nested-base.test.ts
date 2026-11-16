import {
  newPage,
  realErrors,
  type TestPage,
  waitForHydration
} from './helpers.ts'
import { NESTED_BASE_PREFIX } from './constants.ts'

const origin = () => `http://localhost:${process.env['NESTED_BASE_PORT']}`

let t: TestPage

beforeAll(async () => {
  t = await newPage()
})

afterAll(async () => {
  await t.page.close()
  await t.browser.close()
})

describe('relative base served from a deep subpath', () => {
  test('same path in static html and hydrated app', async () => {
    const response = await t.page.goto(
      `${origin()}${NESTED_BASE_PREFIX}base.html`
    )
    if (!response) throw new Error('No navigation response')

    const serverPath = await t.page.evaluate(
      (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html')
        return doc.querySelector('#path')?.textContent ?? null
      },
      await response.text()
    )

    await waitForHydration(t.page)
    expect(await t.page.textContent('#path')).toEqual(serverPath)
  })

  test('no console or page errors across the whole flow', () => {
    expect(realErrors(t.errors)).toEqual([])
  })
})
