import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const componentsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../src/client/theme-default/components'
)

function readComponent(name: string): string {
  return readFileSync(resolve(componentsDir, name), 'utf-8')
}

function expectCursorPointer(source: string, selector: string): void {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  expect(source).toMatch(
    new RegExp(`${escapedSelector}\\s*\\{[^}]*cursor:\\s*pointer`)
  )
}

describe('default theme link cursors', () => {
  test('marks desktop nav links with pointer cursor', () => {
    expectCursorPointer(
      readComponent('VPNavBarMenuLink.vue'),
      '.VPNavBarMenuLink'
    )
  })

  test('marks flyout menu links with pointer cursor', () => {
    expectCursorPointer(readComponent('VPMenuLink.vue'), '.link')
  })

  test('marks mobile nav links with pointer cursor', () => {
    expectCursorPointer(
      readComponent('VPNavScreenMenuLink.vue'),
      '.VPNavScreenMenuLink'
    )
    expectCursorPointer(
      readComponent('VPNavScreenMenuGroupLink.vue'),
      '.VPNavScreenMenuGroupLink'
    )
  })

  test('marks sidebar links with pointer cursor', () => {
    expectCursorPointer(readComponent('VPSidebarItem.vue'), '.link')
  })
})
