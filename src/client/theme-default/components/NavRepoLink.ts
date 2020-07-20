import { computed, defineComponent, PropType } from 'vue'
import OutboundLink from './icons/OutboundLink.vue'
import { DefaultTheme } from '/@theme/config'

export default defineComponent({
  components: {
    OutboundLink
  },

  props: {
    editLinkConfig: {
      type: Object as PropType<DefaultTheme.EditLinkConfig>,
      required: true
    }
  },

  setup(props) {
    const editLinkConfig = props.editLinkConfig
    const repoLink = computed(() => {
      if (editLinkConfig && editLinkConfig.repo) {
        return /^https?:/.test(editLinkConfig.repo)
          ? editLinkConfig.repo
          : `https://github.com/${editLinkConfig.repo}`
      }
      return null
    })
    const repoLabel = computed(() => {
      if (!repoLink.value) return
      const repoHosts = repoLink.value.match(/^https?:\/\/[^/]+/)
      if (!repoHosts) return
      const repoHost = repoHosts[0]
      const platforms = ['GitHub', 'GitLab', 'Bitbucket']
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        if (new RegExp(platform, 'i').test(repoHost)) {
          return platform
        }
      }

      return 'Source'
    })
    return {
      repoLink,
      repoLabel
    }
  }
})
