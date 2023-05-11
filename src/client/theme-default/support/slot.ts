import {
  Fragment,
  Text,
  Comment,
  type VNode,
  type Slot,
  type Slots,
  type VNodeArrayChildren
} from 'vue'

export function slotHasContent(
  slot: Slot | undefined | null,
  props = {}
): boolean {
  if (!slot) return false

  return isVNodeEmpty(slot(props))
}

export function isVNodeEmpty(
  vnode: VNode | VNode[] | null | undefined
): boolean {
  if (!vnode) {
    return true
  }

  return !asArray(vnode)
    .filter((vnode: VNode) => vnode?.type && vnode?.type !== Comment)
    .some((vnode: VNode) => hasVNodeAnyContent(vnode))
}

export function hasVNodeAnyContent(vnode: VNode | null | undefined) {
  return (
    isElementVNode(vnode) ||
    hasVNodeTextContent(vnode) ||
    hasFragmentVNodeContent(vnode) ||
    hasVNodeChildrenContent(vnode)
  )
}

export function hasVNodeTextContent(vnode: VNode | null | undefined): boolean {
  if (vnode?.type !== Text) {
    return false
  }

  if (!vnode.children) {
    return false
  }

  return (vnode.children as string).trim().length > 0
}

export function isElementVNode(vnode: VNode | null | undefined) {
  return typeof vnode?.type === 'string'
}

export function hasFragmentVNodeContent(vnode: VNode | null | undefined) {
  if (vnode?.type !== Fragment) {
    return false
  }

  if (!vnode.children?.length) {
    return false
  }

  return (vnode.children as VNodeArrayChildren).length > 0
}

export function hasVNodeChildrenContent(
  vnode: VNode | null | undefined
): boolean {
  if (!vnode?.children?.length) {
    return false
  }

  if (vnode.type === Text || vnode.type === Fragment) {
    return false
  }

  return (vnode.children as VNode[]).some((vnode: VNode) =>
    hasVNodeAnyContent(vnode)
  )
}

export function asArray(arg: VNode | VNode[]): VNode[] {
  return Array.isArray(arg) ? arg : arg !== null ? [arg] : []
}

export function hasAnySlot($slots: Slots, slots: string[]): boolean {
  return slots.some((slot) => slotHasContent($slots[slot]))
}
