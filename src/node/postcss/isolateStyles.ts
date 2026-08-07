import type { Plugin } from 'postcss'
import selectorParser from 'postcss-selector-parser'

type Options = {
  includeFiles?: RegExp[]
  ignoreFiles?: RegExp[]
  prefix?: string
}

export function postcssIsolateStyles({
  includeFiles = [/vp-doc\.css/, /base\.css/],
  ignoreFiles,
  prefix = ':not(:where(.vp-raw, .vp-raw *))'
}: Options = {}): Plugin {
  const prefixNodes = selectorParser().astSync(prefix).first.nodes

  return /* prettier-ignore */ {
    postcssPlugin: 'postcss-isolate-styles',
    Once(root) {
      const file = root.source?.input.file
      if (file && includeFiles?.length && !includeFiles.some((re) => re.test(file))) return
      if (file && ignoreFiles?.length && ignoreFiles.some((re) => re.test(file))) return

      root.walkRules((rule) => {
        if (!rule.selector || rule.selector.includes(prefix)) return
        if (rule.parent?.type === 'atrule' && /\bkeyframes$/i.test(rule.parent.name)) return

        rule.selector = selectorParser((selectors) => {
          selectors.each((sel) => {
            if (!sel.nodes.length) return
            const insertionIndex = sel.nodes.findLastIndex((n) => n.type !== 'pseudo') + 1
            sel.nodes.splice(insertionIndex, 0, ...prefixNodes.map((n) => n.clone() as any))
          })
        }).processSync(rule.selector)
      })
    }
  }
}
