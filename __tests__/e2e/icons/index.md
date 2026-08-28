# Icons

<script setup>
import { VPIcon } from 'vitepress/theme'
</script>

<VPIcon icon="lucide:rocket" data-test-icon="lucide" />
<VPIcon icon="simple-icons:vuedotjs" data-test-icon="simple" />
<VPIcon :icon="{ svg: '<svg viewBox=\'0 0 8 8\'><circle cx=\'4\' cy=\'4\' r=\'4\'/></svg>' }" data-test-icon="raw" />

Prose about the build internals must survive the rewrite pass:
`vp-icons.__VP_ICONS_HASH__.css`
