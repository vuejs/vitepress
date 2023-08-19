// @ts-ignore
import postcssPrefixSelector from 'postcss-prefix-selector'

export function postcssIsolateStyles(options: Options = {}) {
  if (options.enable === false) return false
  return postcssPrefixSelector({
    prefix: ':not(:where(.vp-raw, .vp-raw *))',
    includeFiles: [/base\.css/],
    transform(prefix, _selector) {
      const [selector, pseudo = ''] = _selector.split(/:\S*$/)
      return selector + prefix + pseudo
    },
    ...options
  } satisfies Omit<Options, 'enable'>) as (root: any) => void
}

interface Options {
  enable?: boolean
  prefix?: string
  exclude?: (string | RegExp)[]
  ignoreFiles?: (string | RegExp)[]
  includeFiles?: (string | RegExp)[]
  transform?: (
    prefix: string,
    selector: string,
    prefixedSelector: string,
    file: string
  ) => string
}
