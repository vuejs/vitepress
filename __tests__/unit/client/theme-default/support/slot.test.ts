import { isVNodeEmpty } from 'client/theme-default/support/slot'
import { createVNode, createCommentVNode, createTextVNode } from 'vue'

describe('client/theme-default/slot', () => {
  test('it tests empty vnode', () => {
    expect(isVNodeEmpty([])).toBeTruthy()
    expect(isVNodeEmpty(null)).toBeTruthy()
    expect(isVNodeEmpty(undefined)).toBeTruthy()
  })

  test('it tests comment vnode', () => {
    expect(isVNodeEmpty(createCommentVNode('demo comment'))).toBeTruthy()
  })

  test('it tests textual vnode', () => {
    expect(isVNodeEmpty(createTextVNode(' '))).toBeTruthy()
    expect(isVNodeEmpty(createTextVNode('demo text'))).toBeFalsy()
  })

  test('it tests element vnode', () => {
    expect(isVNodeEmpty(createVNode('p'))).toBeFalsy()
  })

  test('it tests combined deep vnode', () => {
    expect(
      isVNodeEmpty([createCommentVNode('demo comment'), createTextVNode(' ')])
    ).toBeTruthy()

    expect(
      isVNodeEmpty([
        createCommentVNode('demo comment'),
        createTextVNode(' '),
        createVNode('p')
      ])
    ).toBeFalsy()
  })
})
