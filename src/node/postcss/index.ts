import postcssPrefixSelector from 'postcss-prefix-selector'

type Options = Parameters<typeof postcssPrefixSelector>[0] & {
  enable?: boolean
}

export function postcssIsolateStyles(_options: Options = {}) {
  const { enable, ...options } = _options
  if (enable === false) return false
  return postcssPrefixSelector({
    prefix: ':not(:where(.vp-raw, .vp-raw *))',
    includeFiles: [/base\.css/],
    transform(prefix, _selector) {
      const [selector, pseudo = ''] = _selector.split(/:\S*$/)
      return selector + prefix + pseudo
    },
    ...options
  })
}
