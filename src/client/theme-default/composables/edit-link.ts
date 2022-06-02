import { computed } from 'vue'
import { useData } from 'vitepress'

export function useEditLink() {
  const { theme, page } = useData()

  const {
    style = '',
    domain = 'github.com',
    repo = '???',
    branch = 'main',
    dir = '',
    text = 'Edit this page'
  } = theme.value.editLink || {}
  const { relativePath } = page.value
  const base = /^https?:\/\//.test(domain) ? domain : `https://${domain}`
  const path = dir ? `/${dir}/${relativePath}` : `/${relativePath}`

  const linkStyle = {
    github: ':repo/edit/:branch/:path',
    gitlab: ':repo/-/edit/:branch/:path',
    bitbucket:
      ':repo/src/:branch/:path?mode=edit&spa=0&at=:branch&fileviewer=file-view-default'
  }

  function knownService(domain: string) {
    if (/bitbucket\.org/.test(domain)) return 'bitbucket'
    if (/gitlab\.com/.test(domain)) return 'gitlab'
    if (/gitee\.com/.test(domain)) return 'github'
    return 'github'
  }

  return computed(() => {
    const url = `${base}/${style || linkStyle[knownService(domain)]}`
      .replace(/:repo/g, repo)
      .replace(/:branch/g, branch)
      .replace(/:path/g, `${path}`)
      .replace(/([^:])\/\//g, '$1/')

    return { url, text }
  })
}
