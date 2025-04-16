import { defineComponent, onMounted, ref } from 'vue'

export const ClientOnly = defineComponent({
  props: {
    isClientOnly: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { slots }) {
    // Programmatically determine if this component should be
    // client-only based on the presence of the isClientOnly attribute.
    if (!props.isClientOnly) return () => slots.default?.(props) || null

    const show = ref(false)

    onMounted(() => {
      show.value = true
    })

    return () => (show.value && slots.default ? slots.default() : null)
  }
})
