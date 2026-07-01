import { MarkdownItAsync } from 'markdown-it-async'
import { containerPlugin } from 'node/markdown/plugins/containers'

const createMarkdown = () => {
  const md = new MarkdownItAsync()
  const logger = { warn: vi.fn() }
  containerPlugin(md, undefined, logger)
  return { md, logger }
}

describe('node/markdown/plugins/containers', () => {
  test('warns for unknown custom containers', async () => {
    const { md, logger } = createMarkdown()

    await md.renderAsync('::: note\ncontent\n:::')

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Unknown markdown container: note')
    )
  })

  test('does not warn for supported custom containers', async () => {
    const { md, logger } = createMarkdown()

    const html = await md.renderAsync('::: tip\ncontent\n:::')

    expect(html).toContain('class="tip custom-block"')
    expect(logger.warn).not.toHaveBeenCalled()
  })
})
