// this file contains node-only types of default theme
// (functions starting with _ are node-only)
// in most of the cases these will leak to client too
// but these can import types from dev deps

import type { MarkdownItAsync } from 'markdown-it-async'
import type { DefaultTheme } from '../../types/default-theme'
import type { PageSplitSection } from '../../types/local-search'
import type { Awaitable, MarkdownEnv } from './shared'

declare module '../../types/default-theme.js' {
  namespace DefaultTheme {
    interface LocalSearchOptions {
      /**
       * Transforms the already-rendered page HTML before indexing (node only).
       * This avoids a second Markdown/Shiki pass and is preferred over
       * `_render` when the customization only filters or edits HTML.
       * Return an empty string to skip indexing.
       */
      _transformHtml?: (html: string, env: MarkdownEnv) => Awaitable<string>
      /**
       * Allows transformation of content before indexing (node only)
       * Return empty string to skip indexing
       */
      _render?: (
        src: string,
        env: MarkdownEnv,
        md: MarkdownItAsync
      ) => Awaitable<string>
    }

    interface MiniSearchOptions {
      /**
       * Overrides the default regex based page splitter.
       * Supports async generator, making it possible to run in true parallel
       * (when used along with `node:child_process` or `worker_threads`)
       * ---
       * This should be especially useful for scalability reasons.
       * ---
       * @param {string} path - absolute path to the markdown source file
       * @param {string} html - document page rendered as html
       */
      _splitIntoSections?: (
        path: string,
        html: string
      ) =>
        | AsyncGenerator<PageSplitSection>
        | Generator<PageSplitSection>
        | Awaitable<PageSplitSection[]>
    }
  }
}

export type { DefaultTheme }
