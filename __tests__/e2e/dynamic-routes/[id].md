<script setup>
import { useData } from 'vitepress'
const { page } = useData()
</script>

<!-- @content -->

<pre class="params">{{ page.params }}</pre>
