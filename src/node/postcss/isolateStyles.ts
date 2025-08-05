import postcssPrefixSelector from 'postcss-prefix-selector'

export function postcssIsolateStyles(
  options: Parameters<typeof postcssPrefixSelector>[0] = {}
): ReturnType<typeof postcssPrefixSelector> {
  return postcssPrefixSelector({
    prefix: ':not(:where(.vp-raw, .vp-raw *))',
    includeFiles: [/base\.css/],
    transform(prefix, _selector) {
      // split selector from its pseudo part if the trailing colon is not escaped
      const [selector, pseudo] = splitSelectorPseudo(_selector)
      return selector + prefix + pseudo
    },
    ...options
  })
}

export function splitSelectorPseudo(selector: string): [string, string] {
  const [base, pseudo = ''] = selector.split(/(?<!\\)(:\S*)$/)
  return [base, pseudo]
}
