<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

interface Tab {
    label: string;
    elm: Element;
}

const codeblocks = ref<HTMLElement | null>(null)
let tabs = ref<Array<Tab>>([])
const activeTabIndex = ref(0)

onMounted(() => {
    if (codeblocks !== undefined) {
        codeblocks.value?.querySelectorAll(".code-block").forEach((element, i) => {
            const title = element.querySelector("span.code-title")?.textContent!
            tabs.value.push({
                label: title,
                elm: element
            })
        })
        switchTab(0)
    }
})

function switchTab(i: number) {
    tabs.value.forEach((tab) => {
        tab["elm"].classList.remove('active')
    })
    tabs.value[i]["elm"].classList.add('active')
}

watch(activeTabIndex, (newValue, oldValue) => {
    switchTab(newValue)
})

</script>

<template>
    <div class="code-group">
        <div class="tabs-header">
            <button v-for="({ label }, i) in tabs" :key="label" :class="[activeTabIndex === i && 'active']"
                @click="activeTabIndex = i">{{ label }}</button>
        </div>
        <div ref="codeblocks">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.tabs-header {
    border-radius: 8px 8px 0 0;
    padding: 0 12px 0 12px;
    background-color: var(--vp-code-block-tab-header-bg);
    transition: background-color 0.5s;
}

.tabs-header button {
    padding: 6px 8px 6px 8px;
    margin: 8px 0 8px 0;
    border-radius: 8px;
    color: white;
    outline: none;
}

.tabs-header button:hover {
    color: rgba(255, 255, 255, 0.82);
}


.tabs-header button.active {
    background-color: rgb(63 63 70);
}


:slotted(.code-block) {
    display: none;
}

:slotted(.code-block.active) {
    display: block;
}

:slotted(div[class*='language-']) {
    border-radius: 0 0 8px 8px !important;
    margin-top: 0;
}
</style>