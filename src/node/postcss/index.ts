import postcssPrefixSelector from 'postcss-prefix-selector'

type Options = Parameters<typeof postcssPrefixSelector>[0]

export function postcssIsolateStyles(options: Options = {}) {
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
