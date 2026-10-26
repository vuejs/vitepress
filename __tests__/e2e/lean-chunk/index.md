# Lean chunk

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

Each list item below has a run of static elements that the compiler turns into a single static vnode, followed by a dynamic paragraph. Both items must survive hydration from the lean chunk, which drops the static html (#5553).

<ul id="lean-chunk-list">
<li>
<div>
<p id="static-1">Static one.</p>
<p id="static-2">Static two.</p>
<p id="static-3">Static three.</p>
<p id="static-4">Static four.</p>
<img id="static-5" src="../assets/vitepress.png" alt="Static five.">
</div>
<p class="dynamic">dynamic A {{ count }}</p>
</li>
<li>
<div>
<p id="static-6">Static six.</p>
<p id="static-7">Static seven.</p>
<p id="static-8">Static eight.</p>
<p id="static-9">Static nine.</p>
<img id="static-10" src="../assets/vitepress.png?no-inline" alt="Static ten.">
</div>
<p class="dynamic">dynamic B {{ count }}</p>
</li>
</ul>

<button id="increment" @click="count++">increment</button>
