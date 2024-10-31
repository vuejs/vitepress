// @ts-check

import { bundledLanguages } from 'shiki'
import { runAsWorker } from 'synckit'

runAsWorker(async (lang) => {
  const fn = bundledLanguages[lang]
  if (!fn) return null
  return (await fn()).default
})
