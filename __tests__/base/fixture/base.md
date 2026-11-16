# Base

<script setup>
import { useRoute } from 'vitepress'

const route = useRoute()

</script>
This page is used to verify that `route.path` in generated pages and in live pages are the same 

<div>Current path: <span id="path">{{ route.path }}</span></div>
