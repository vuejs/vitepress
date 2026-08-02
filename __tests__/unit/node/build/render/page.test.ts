import {
  deserializeRenderedPage,
  serializeRenderedPage
} from 'node/build/render/page'

test('round-trips worker render results with sorted Set-backed state', () => {
  const renderedPage = {
    page: 'guide.md',
    pageData: {
      title: 'Guide',
      description: '',
      frontmatter: {},
      headers: [],
      relativePath: 'guide.md',
      filePath: 'guide.md'
    },
    hasCustom404: true,
    context: {
      content: '<main>Guide</main>',
      teleports: { body: '<div>teleported</div>' },
      vpSocialIcons: new Set(['z-icon', 'a-icon']),
      __watcherHandles: [() => undefined]
    }
  }

  const serialized = serializeRenderedPage(renderedPage)
  expect(serialized.context.vpSocialIcons).toEqual(['a-icon', 'z-icon'])
  expect(serialized.context).not.toHaveProperty('__watcherHandles')

  const restored = deserializeRenderedPage(serialized)
  expect(restored).toMatchObject({
    page: renderedPage.page,
    pageData: renderedPage.pageData,
    hasCustom404: true,
    context: {
      content: '<main>Guide</main>',
      teleports: { body: '<div>teleported</div>' }
    }
  })
  expect(restored.context.vpSocialIcons).toBeInstanceOf(Set)
  expect([...restored.context.vpSocialIcons]).toEqual(['a-icon', 'z-icon'])
})
