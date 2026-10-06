<script setup>
import { useRouter } from 'vitepress'

const router = useRouter()

function loadSlowPage() {
  router.go('/router-race/slow').finally(() => {
    document.documentElement.dataset.slowNavigationFinished = 'true'
  })
}
</script>

# Navigation Race

<button id="slow" @click="loadSlowPage">Load slow page</button>
<button id="fast" @click="router.go('/router-race/fast')">Load fast page</button>
