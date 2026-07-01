export function shouldShowLocalNav(
  isHome: boolean,
  hasLocalNav: boolean,
  hasSidebar: boolean,
  scrollY: number,
  navHeight: number
): boolean {
  return !isHome && (hasLocalNav || hasSidebar || scrollY > navHeight)
}
