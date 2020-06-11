import each from 'jest-each'
import MarkdownIt from 'markdown-it'
import { containerPlugin } from '../containers'
import { getFragment } from '@/test-utils'

let md: MarkdownIt

describe('plugins/component', () => {
  beforeEach(() => {
    md = new MarkdownIt()
    containerPlugin(md)
  })

  each([
    ['tip'],
    ['warning'],
    ['danger'],
    ['info'],
    ['custom-tip'],
    ['custom-warning'],
    ['custom-danger'],
    ['custom-info'],
    ['v-pre']
  ]).test('renders a "%s" block', (fileName: string) => {
    expect(getFragment(__dirname, `containers/${fileName}.html`)).toEqual(
      md.render(getFragment(__dirname, `containers/${fileName}.md`))
    )
  })
})
