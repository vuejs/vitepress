import { resolveLlmTags, stripLlmTags } from 'node/utils/llmTags'

describe('node/utils/llmTags', () => {
  const basic = [
    '# Title',
    '',
    '<llm-only>',
    '',
    'For LLMs.',
    '',
    '</llm-only>',
    '',
    '<llm-exclude>',
    '',
    'For humans.',
    '',
    '</llm-exclude>',
    '',
    'Shared.',
    ''
  ].join('\n')

  test('stripLlmTags drops llm-only content and unwraps llm-exclude', () => {
    const out = stripLlmTags(basic)
    expect(out).not.toContain('For LLMs.')
    expect(out).toContain('For humans.')
    expect(out).toContain('Shared.')
    expect(out).not.toContain('llm-only')
    expect(out).not.toContain('llm-exclude')
  })

  test('resolveLlmTags unwraps llm-only and drops llm-exclude content', () => {
    const out = resolveLlmTags(basic)
    expect(out).toContain('For LLMs.')
    expect(out).not.toContain('For humans.')
    expect(out).toContain('Shared.')
    expect(out).not.toContain('llm-only')
    expect(out).not.toContain('llm-exclude')
  })

  test('ignores tags inside fenced code blocks', () => {
    const src = [
      'Before.',
      '',
      '```md',
      '<llm-only>',
      '',
      'Example.',
      '',
      '</llm-only>',
      '```',
      '',
      'After.',
      ''
    ].join('\n')

    expect(stripLlmTags(src)).toBe(src)
    expect(resolveLlmTags(src)).toBe(src)
  })

  test('ignores tags that are not alone on their line', () => {
    const src =
      'Wrap content in `<llm-only>` and close it with `</llm-only>`.\n'
    expect(stripLlmTags(src)).toBe(src)
    expect(resolveLlmTags(src)).toBe(src)
  })

  test('inline mention before a fenced example does not swallow the page', () => {
    // regression: docs/en/guide/llms.md mentions the tags inline and shows
    // them inside a ```md fence — the old regex matched from the inline
    // mention to the closing tag inside the fence
    const src = [
      'Wrap markdown in `<llm-only>` or `<llm-exclude>`:',
      '',
      '```md',
      '<llm-only>',
      '',
      'LLM extra context.',
      '',
      '</llm-only>',
      '',
      '<llm-exclude>',
      '',
      'Browser-only demo.',
      '',
      '</llm-exclude>',
      '```',
      '',
      'Content in `<llm-only>` is removed from HTML.',
      ''
    ].join('\n')

    expect(stripLlmTags(src)).toBe(src)
    expect(resolveLlmTags(src)).toBe(src)
  })

  test('handles fenced code blocks inside llm blocks', () => {
    const src = [
      '<llm-only>',
      '',
      '```js',
      'const a = 1',
      '```',
      '',
      '</llm-only>',
      '',
      'Shared.',
      ''
    ].join('\n')

    const stripped = stripLlmTags(src)
    expect(stripped).not.toContain('const a = 1')
    expect(stripped).toContain('Shared.')

    const resolved = resolveLlmTags(src)
    expect(resolved).toContain('const a = 1')
    expect(resolved).not.toContain('llm-only')
  })

  test('supports ~~~ fences and longer fences', () => {
    const src = [
      '~~~md',
      '<llm-only>',
      'in tilde fence',
      '</llm-only>',
      '~~~',
      '',
      '````md',
      '<llm-exclude>',
      'in long fence',
      '</llm-exclude>',
      '````',
      ''
    ].join('\n')

    expect(stripLlmTags(src)).toBe(src)
    expect(resolveLlmTags(src)).toBe(src)
  })

  test('leaves unclosed tags untouched', () => {
    const src = '# Title\n\n<llm-only>\n\nDangling.\n'
    expect(stripLlmTags(src)).toBe(src)
    expect(resolveLlmTags(src)).toBe(src)
  })

  test('allows indented tags up to 3 spaces', () => {
    const src = '  <llm-only>\ncontent\n  </llm-only>\nShared.\n'
    expect(stripLlmTags(src)).not.toContain('content')
    expect(resolveLlmTags(src)).toContain('content')
    expect(resolveLlmTags(src)).not.toContain('llm-only')
  })
})
