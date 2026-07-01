import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

const source = readFileSync(
  new URL(
    '../../../../../src/client/theme-default/components/VPTeamMembersItem.vue',
    import.meta.url
  ),
  'utf-8'
)

function rule(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`^${escaped}\\s*\\{([^}]+)\\}`, 'm'))
  expect(match).toBeTruthy()
  return match![1]
}

describe('VPTeamMembersItem', () => {
  test('keeps social links aligned at the bottom of team cards', () => {
    expect(rule('.profile')).toMatch(/display:\s*flex/)
    expect(rule('.profile')).toMatch(/flex-direction:\s*column/)
    expect(rule('.data')).toMatch(/display:\s*flex/)
    expect(rule('.data')).toMatch(/flex-direction:\s*column/)
    expect(rule('.data')).toMatch(/flex-grow:\s*1/)
    expect(rule('.links')).toMatch(/margin-top:\s*auto/)
  })
})
