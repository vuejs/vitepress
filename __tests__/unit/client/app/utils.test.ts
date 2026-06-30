import {
  createRenderer,
  defineComponent,
  h,
  nextTick,
  type RendererNode
} from 'vue'
import { defineClientComponent } from 'client/app/utils'

interface TestNode extends RendererNode {
  type: string
  text?: string
  parent?: TestNode
  children: TestNode[]
}

function createTestRenderer() {
  return createRenderer<TestNode, TestNode>({
    patchProp() {},
    insert(child, parent) {
      child.parent = parent
      parent.children.push(child)
    },
    remove(child) {
      const parent = child.parent
      if (parent) {
        parent.children = parent.children.filter((node) => node !== child)
      }
      child.parent = undefined
    },
    createElement(type) {
      return { type, children: [] }
    },
    createText(text) {
      return { type: '#text', text, children: [] }
    },
    createComment(text) {
      return { type: '#comment', text, children: [] }
    },
    setText(node, text) {
      node.text = text
    },
    setElementText(node, text) {
      node.children = [{ type: '#text', text, children: [] }]
    },
    parentNode(node) {
      return node.parent ?? null
    },
    nextSibling(node) {
      const parent = node.parent
      if (!parent) return null
      const index = parent.children.indexOf(node)
      return parent.children[index + 1] ?? null
    }
  })
}

function textContent(node: TestNode): string {
  return [node.text, ...node.children.map(textContent)].filter(Boolean).join('')
}

describe('client/app/utils', () => {
  describe('defineClientComponent', () => {
    test('forwards slots to the loaded component', async () => {
      const ClientComponent = defineClientComponent(() =>
        Promise.resolve(
          defineComponent({
            setup(_, { slots }) {
              return () => h('p', slots.default?.())
            }
          })
        )
      )

      const App = defineComponent({
        setup() {
          return () =>
            h(ClientComponent, null, {
              default: () => 'slot content'
            })
        }
      })

      const root: TestNode = { type: 'root', children: [] }
      createTestRenderer().createApp(App).mount(root)

      await Promise.resolve()
      await nextTick()

      expect(textContent(root)).toBe('slot content')
    })
    test('forwards slots while preserving args props', async () => {
      const ClientComponent = defineClientComponent(
        () =>
          Promise.resolve(
            defineComponent({
              props: {
                label: String
              },
              setup(props, { slots }) {
                return () => h('p', [props.label, ':', slots.default?.()])
              }
            })
          ),
        [{ label: 'prop content' }]
      )

      const App = defineComponent({
        setup() {
          return () =>
            h(ClientComponent, null, {
              default: () => 'slot content'
            })
        }
      })

      const root: TestNode = { type: 'root', children: [] }
      createTestRenderer().createApp(App).mount(root)

      await Promise.resolve()
      await nextTick()

      expect(textContent(root)).toBe('prop content:slot content')
    })
  })
})
