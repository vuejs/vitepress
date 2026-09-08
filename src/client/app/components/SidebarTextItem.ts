import { defineComponent, h } from 'vue'

export const SidebarTextItem = defineComponent({
  props: {
    content: {
      type: String,
      required: true
    },
    is: {
      type: [Object, String],
      default: 'p'
    }
  },
  render() {
    return h(this.is, { innerHTML: this.content })
  }
})
