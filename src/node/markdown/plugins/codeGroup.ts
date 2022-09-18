import Token from 'markdown-it/lib/token'

export const extractCodeTitleAndLang = (token: Token): [string, string] => {
  const RE = /(\w*)(?:{[\d,-]+})?\s*\[(.+)\]/
  const hint = token.info
    .trim()
    .replace(codeGroupInternalActiveMark, '')
    .replace(/-vue$/, '')
  let codeTitle = ''
  let lang = hint
  if (RE.test(hint)) {
    const matchGroup = RE.exec(hint)
    if (matchGroup && matchGroup.length == 3) {
      lang = matchGroup[1].trim()
      codeTitle = matchGroup[2]
    }
  } else {
    // Use language name as code title if not specified
    codeTitle = lang === 'vue-html' ? 'template' : lang
  }
  return [codeTitle, lang]
}

export const codeGroupInternalActiveMark = '#vitepress-internal-active#'
