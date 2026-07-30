import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const { version } = JSON.parse(readFileSync('package.json', 'utf-8'))

const webTypes = {
  $schema: 'http://json.schemastore.org/web-types',
  framework: 'vue',
  name: 'vitepress',
  version,
  'js-types-syntax': 'typescript',
  'description-markup': 'markdown',
  contributions: {
    html: {
      'vue-components': [
        {
          name: 'Content',
          source: { symbol: 'Content' },
          description:
            'Displays the rendered markdown contents. Useful when creating your own theme.',
          'doc-url': 'https://vitepress.dev/reference/runtime-api#content',
          props: [
            {
              name: 'as',
              description:
                'The content wrapper. Accepts an HTML tag name, a component name, or a component reference.',
              type: ['string', 'object'],
              default: 'div'
            }
          ]
        },
        {
          name: 'ClientOnly',
          source: { symbol: 'ClientOnly' },
          description:
            'Renders its slot only at client side. Useful for wrapping components that are not SSR-friendly.',
          'doc-url': 'https://vitepress.dev/reference/runtime-api#clientonly',
          slots: [
            {
              name: 'default',
              description: 'Content to render once the client app is mounted.'
            }
          ]
        },
        {
          name: 'Badge',
          source: { module: 'vitepress/theme', symbol: 'VPBadge' },
          description:
            "Adds a status label to headers, such as a section's type or supported version. Available when using the default theme.",
          'doc-url': 'https://vitepress.dev/reference/default-theme-badge',
          props: [
            {
              name: 'type',
              description: 'The badge color type.',
              type: "'info' | 'tip' | 'warning' | 'danger'",
              default: 'tip'
            },
            {
              name: 'text',
              description:
                'The text displayed inside the badge. Ignored when the default slot is passed.',
              type: 'string'
            }
          ],
          slots: [
            {
              name: 'default',
              description:
                'Content displayed inside the badge. Takes precedence over the `text` prop.'
            }
          ]
        }
      ]
    }
  }
}

mkdirSync('dist', { recursive: true })
writeFileSync('dist/web-types.json', JSON.stringify(webTypes, null, 2) + '\n')
