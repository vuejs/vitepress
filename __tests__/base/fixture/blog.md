# Blog

<script setup>
import { data } from './posts.data.ts'
</script>

<div v-for="p in data" :key="p.url" class="post-excerpt" v-html="p.html"></div>
