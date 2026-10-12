<script setup>
import { ref } from 'vue'
import { VPImage } from 'vitepress/theme'

const description = ref('Override description')
const image = {
  light: '/pwa_light.svg',
  dark: '/pwa_dark.svg',
  alt: 'Image description'
}
</script>

# Themeable image descriptions

<div class="image-override">
  <VPImage :image :alt="description" />
</div>

<div class="image-decorative">
  <VPImage :image alt="" />
</div>

<div class="image-fallback">
  <VPImage :image />
</div>

<button @click="description = 'Updated description'">Update description</button>
<button @click="description = ''">Clear description</button>
