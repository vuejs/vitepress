import { createRequire } from 'node:module'
import { writeFile } from 'node:fs/promises'

const require = createRequire(import.meta.url)

// release script will change the version before running the build script
const { version } = require('../package.json')

await writeFile(
  './dist/web-types.json',
  JSON.stringify(
    {
      // $schema: 'https://json.schemastore.org/web-types',
      $schema:
        'https://raw.githubusercontent.com/JetBrains/web-types/master/schema/web-types.json',
      framework: 'vue',
      name: 'vitepress',
      version: version,
      'js-types-syntax': 'typescript',
      'description-markup': 'markdown',
      'framework-config': {
        'enable-when': {
          'node-packages': ['vue'],
          'file-extensions': ['vue'],
          'ide-libraries': ['vue']
        }
      },
      contributions: {
        html: {
          'vue-components': [
            {
              name: 'ClientOnly',
              description:
                'ClientOnly component renders its default slot only at client side.',
              'doc-url':
                'https://vitepress.dev/reference/runtime-api#clientonly',
              slots: [
                {
                  name: 'default',
                  description: 'Content to render once client app is mounted'
                }
              ]
            },
            {
              name: 'Content',
              description:
                'The Content component displays the rendered markdown contents. Useful when creating your own theme.',
              'doc-url': 'https://vitepress.dev/reference/runtime-api#content',
              props: [
                {
                  name: 'as',
                  description:
                    'An HTML tag name, a Component name or Component class reference.',
                  type: ['string', 'object'],
                  default: '"div"'
                }
              ]
            }
          ]
        }
      }
    },
    null,
    2
  ),
  'utf8'
)
