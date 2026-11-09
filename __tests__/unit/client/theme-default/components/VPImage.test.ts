// @ts-expect-error the unit typecheck uses tsc; Vite compiles this SFC at runtime
import VPImage from 'client/theme-default/components/VPImage.vue'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

const images = [
  { name: 'string', image: 'logo.svg', fallback: '', count: 1 },
  {
    name: 'single source',
    image: { src: 'logo.svg', alt: 'Image description' },
    fallback: 'Image description',
    count: 1
  },
  {
    name: 'themed sources',
    image: { light: 'light.svg', dark: 'dark.svg', alt: 'Image description' },
    fallback: 'Image description',
    count: 2
  },
  {
    name: 'themed sources without alt',
    image: { light: 'light.svg', dark: 'dark.svg' },
    fallback: '',
    count: 2
  }
]

describe.each(images)('VPImage with $name', ({ image, fallback, count }) => {
  test.each(['Override description', '', undefined])(
    'respects the alt prop %j',
    async (alt) => {
      const html = await renderToString(createSSRApp(VPImage, { image, alt }))
      const descriptions = [...html.matchAll(/ alt(?:="([^"]*)")?/g)].map(
        ([, value]) => value ?? ''
      )
      expect(descriptions).toEqual(Array(count).fill(alt ?? fallback))
    }
  )
})
