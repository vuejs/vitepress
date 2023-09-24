import postcssPrefixSelector from 'postcss-prefix-selector'

export function postcssIsolateStyles(
  options: Parameters<typeof postcssPrefixSelector>[0] = {}
): ReturnType<typeof postcssPrefixSelector> {
  return postcssPrefixSelector({
    prefix: ':not(:where(.vp-raw, .vp-raw *))',
    includeFiles: [/base\.css/],
    transform(prefix, _selector) {
      const [selector, pseudo = ''] = _selector.split(/(:\S*)$/)
      return selector + prefix + pseudo
    },
    ...options
  })
}
