import { useRoute, useSiteData } from 'vitepress'
import { FunctionalComponent, h, VNode } from 'vue'
import { Header } from '../../../../types/shared'
import { joinUrl, isActive } from '../utils'
import { ResolvedSidebarItem } from './SideBar'

interface HeaderWithChildren extends Header {
  children?: Header[]
}

export const SideBarItem: FunctionalComponent<{
  item: ResolvedSidebarItem
}> = (props) => {
  const {
    item: { link: relLink, text, children }
  } = props

  const route = useRoute()
  const siteData = useSiteData()

  const link = resolveLink(siteData.value.base, relLink || '')
  const active = isActive(route, link)
  const headers = route.data.headers
  const childItems = createChildren(active, children, headers)

  return h('li', { class: 'sidebar-item' }, [
    h(
      link ? 'a' : 'p',
      {
        class: { 'sidebar-link': true, active },
        href: link
      },
      text
    ),
    childItems
  ])
}

function resolveLink(base: string, path: string): string | undefined {
  return path
    ? // keep relative hash to the same page
      path.startsWith('#')
      ? path
      : joinUrl(base, path)
    : undefined
}

function createChildren(
  active: boolean,
  children?: ResolvedSidebarItem[],
  headers?: Header[]
): VNode | null {
  if (children && children.length > 0) {
    return h(
      'ul',
      { class: 'sidebar-items' },
      children.map((c) => {
        return h(SideBarItem, { item: c })
      })
    )
  }

  return active && headers
    ? createChildren(false, resolveHeaders(headers))
    : null
}

function resolveHeaders(headers: Header[]): ResolvedSidebarItem[] {
  return mapHeaders(groupHeaders(headers))
}

function groupHeaders(headers: Header[]): HeaderWithChildren[] {
  headers = headers.map((h) => Object.assign({}, h))
  let lastH2: HeaderWithChildren
  headers.forEach((h) => {
    if (h.level === 2) {
      lastH2 = h
    } else if (lastH2) {
      ;(lastH2.children || (lastH2.children = [])).push(h)
    }
  })
  return headers.filter((h) => h.level === 2)
}

function mapHeaders(headers: HeaderWithChildren[]): ResolvedSidebarItem[] {
  return headers.map((header) => ({
    text: header.title,
    link: `#${header.slug}`,
    children: header.children ? mapHeaders(header.children) : undefined
  }))
}
