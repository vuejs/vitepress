import { useData } from '../composables/data'

/**
 * @param themeObject Can be an object with `translations` and `locales` properties
 */
export function createTranslate(
  themeObject: any,
  defaultTranslations: Record<string, any>
): (key: string) => string {
  const { localeIndex } = useData()

  function translate(key: string): string {
    const keyPath = key.split('.')

    const isObject = themeObject && typeof themeObject === 'object'
    const locales =
      (isObject && themeObject.locales?.[localeIndex.value]?.translations) ||
      null
    const translations = (isObject && themeObject.translations) || null

    let localeResult: Record<string, any> | null = locales
    let translationResult: Record<string, any> | null = translations
    let defaultResult: Record<string, any> | null = defaultTranslations

    const lastKey = keyPath.pop()!
    for (const k of keyPath) {
      let fallbackResult: Record<string, any> | null = null
      const foundInFallback: any = defaultResult?.[k]
      if (foundInFallback) {
        fallbackResult = defaultResult = foundInFallback
      }
      const foundInTranslation: any = translationResult?.[k]
      if (foundInTranslation) {
        fallbackResult = translationResult = foundInTranslation
      }
      const foundInLocale: any = localeResult?.[k]
      if (foundInLocale) {
        fallbackResult = localeResult = foundInLocale
      }
      // Put fallback into unresolved results
      if (!foundInFallback) {
        defaultResult = fallbackResult
      }
      if (!foundInTranslation) {
        translationResult = fallbackResult
      }
      if (!foundInLocale) {
        localeResult = fallbackResult
      }
    }
    return (
      localeResult?.[lastKey] ??
      translationResult?.[lastKey] ??
      defaultResult?.[lastKey] ??
      ''
    )
  }

  return translate
}
