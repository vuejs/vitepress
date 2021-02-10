<script lang="ts">
import { defineComponent, h } from "vue"
import { CodeGroupTabState } from "/@theme/components/global/types"
import CodeBlock from "/@theme/components/global/CodeBlock.vue"

export default defineComponent({
  name: "CodeGroup",
  components: { CodeBlock },
  data() {
    return {
      tabs: [] as CodeGroupTabState[],
      activeTabIndex: -1
    }
  },
  mounted() {
    let activeTabIndex = -1
    const tabs: CodeGroupTabState[] = []

    const blocks = (this.$slots.default?.() || []).filter(s => s.type.name === 'CodeBlock')

    blocks.forEach(({ props: { title, active = false }, children }, index) => {
      if (activeTabIndex === -1 && typeof active === 'string' || active) {
        activeTabIndex = index
      }

      tabs.push({
        index: index,
        title: title,
        content: children?.length
      })
    })

    this.tabs = tabs
    this.activeTabIndex = activeTabIndex
  },
  render() {
    const hCodeBlocks = this.tabs.map(
        tab => h(
            CodeBlock,
            {
              active: this.activeTabIndex === tab.index,
              title: tab.title,
              _internal: true
            },
            {
              default: (props) => {
                const children = this.$slots.default ? this.$slots.default(props) : []

                return children[tab.index]
              }
          }
        )
    )
    const hTabNav = h('div', { class: 'code-group__nav' },
        this.tabs.map(tab =>
            h(
                'button',
                {
                  class: `code-group__nav-button ${this.activeTabIndex === tab.index ? 'code-group__nav-button-active' : ''}`,
                  onClick: () => (this.activeTabIndex = tab.index)
                },
                tab.title
            )
        )
    )
    return h('div', { class: 'code-group' }, [hTabNav, ...hCodeBlocks])
  }
})
</script>