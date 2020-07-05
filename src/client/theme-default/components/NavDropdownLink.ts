import NavBarLink from './NavBarLink.vue'
import { defineComponent, ref, watch, PropType } from 'vue'
import { useRoute } from 'vitepress'
import { DefaultTheme } from '../config'

export default defineComponent({
  name: 'DropdownLink',
  components: {
    NavBarLink
  },
  props: {
    item: {
      type: Object as PropType<DefaultTheme.NavItemWithChildren>,
      required: true
    }
  },
  setup(props) {
    const open = ref(false)
    const route = useRoute()

    watch(
      () => route.path,
      () => {
        open.value = false
      }
    )

    const setOpen = (value: boolean) => {
      open.value = value
    }

    const isLastItemOfArray = <T>(item: T, array: T[]) => {
      return array.length && array.indexOf(item) === array.length - 1
    }

    return {
      open,
      setOpen,
      isLastItemOfArray
    }
  }
})
