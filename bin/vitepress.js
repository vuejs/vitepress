#!/usr/bin/env node
// @ts-check

import module from 'node:module'

// https://github.com/vitejs/vite/blob/6c8a5a27e645a182f5b03a4ed6aa726eab85993f/packages/vite/bin/vite.js#L48-L63
try {
  module.enableCompileCache?.()
  setTimeout(() => {
    try {
      module.flushCompileCache?.()
    } catch {}
  }, 10 * 1000).unref()
} catch {}

import('../dist/node/cli.js')
