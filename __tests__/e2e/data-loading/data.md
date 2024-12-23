# Static Data

<script setup lang="ts">
import { data } from './basic.data.mjs'
import { data as contentData } from './contentLoader.data.js'
</script>

<pre id="basic">{{ data }}</pre>

<pre id="content">{{ contentData }}</pre>
