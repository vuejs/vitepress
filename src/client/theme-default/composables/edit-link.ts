import { computed } from 'vue'
import { useData } from 'vitepress'

const editLinkPatterns = {
  GitHub: ':repo/edit/:branch/:path',
  GitLab: ':repo/-/edit/:branch/:path',
  Gitee: ':repo/edit/:branch/:path',
  Bitbucket:
    ':repo/src/:branch/:path?mode=edit&spa=0&at=:branch&fileviewer=file-view-default'
}

function resolveRepoType(repo: string) {
  if (/bitbucket\.org/.test(repo)) return 'Bitbucket'
  if (/gitlab\.com/.test(repo)) return 'GitLab'
  if (/gitee\.com/.test(repo)) return 'Gitee'
  return 'GitHub'
}

export function useEditLink() {
  const { theme, page } = useData()

  return computed(() => {
    const {
      repo = '???',
      branch = 'main',
      dir = '',
      text = 'Edit this page'
    } = theme.value.editLink || {}
    const { relativePath } = page.value

    const base = /:\/\//.test(repo) ? repo : `https://github.com/${repo}`
    const pattern = editLinkPatterns[resolveRepoType(base)]
    const url = pattern
      .replace(/:repo/g, base)
      .replace(/:branch/g, branch)
      .replace(/:path/g, `${dir}/${relativePath}`)
      .replace(/([^:])\/\//g, '$1/')

    return { url, text }
  })
}
