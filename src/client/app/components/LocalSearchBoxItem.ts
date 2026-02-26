import { defineComponent, h } from 'vue'

export const LocalSearchBoxItem = defineComponent({
  props: {
    content: {
      type: String,
      required: true
    }
  },
  render() {
    return h('span', { innerHTML: this.content })
  }
})
