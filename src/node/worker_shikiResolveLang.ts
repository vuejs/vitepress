import {
  bundledLanguages,
  type DynamicImportLanguageRegistration,
  type LanguageRegistration
} from 'shiki'
import { runAsWorker } from 'synckit'

async function resolveLang(lang: string) {
  return (
    (
      bundledLanguages as Record<
        string,
        DynamicImportLanguageRegistration | undefined
      >
    )
      [lang]?.()
      .then((m) => m.default) || ([] as LanguageRegistration[])
  )
}

runAsWorker(resolveLang)

export type ShikiResolveLang = typeof resolveLang
