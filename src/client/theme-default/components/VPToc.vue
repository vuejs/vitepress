<script setup lang="ts">
// in .vue components or .md pages:
// named import "data" is the resolved static data
// can also import types for type consistency
import { data as tocData, APIGroup } from '../data/toc.data.js'
import { ref, computed } from 'vue'
import { useRoute } from "vitepress"

const route = useRoute()

const query = ref('')
const normalize = (s: string) => s.toLowerCase().replace(/-/g, ' ')

const filtered = computed(() => {
  const q = normalize(query.value)
  const matches = (text: string) => normalize(text).includes(q)

  return (tocData[route.path] || []).map((section) => {
      // section title match
      if (matches(section.text)) {
        return section
      }

      // filter groups
      const matchedGroups = section.items
        .map((item) => {
          // group title match
          if (matches(item.text)) {
            return item
          }
          // ssr special case
          if (q.includes('ssr') && item.text.startsWith('Server')) {
            return item
          }
          // filter headers
          const matchedHeaders = item.headers.filter(
            ({ text, anchor }) => matches(text) || matches(anchor)
          )
          return matchedHeaders.length
            ? { text: item.text, link: item.link, headers: matchedHeaders }
            : null
        })
        .filter((i) => i)

      return matchedGroups.length
        ? { text: section.text, items: matchedGroups }
        : null
    })
    .filter((i) => i) as APIGroup[]
})

// same as vitepress' slugify logic
function slugify(text: string): string {
  return (
    text
      // Replace special characters
      .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'<>,.?/]+/g, '-')
      // Remove continuous separators
      .replace(/\-{2,}/g, '-')
      // Remove prefixing and trailing separators
      .replace(/^\-+|\-+$/g, '')
      // ensure it doesn't start with a number (#121)
      .replace(/^(\d)/, '_$1')
      // lowercase
      .toLowerCase()
  )
}
</script>

<template>
  <div id="api-index">
    <div class="header">
      <h1>Table of contents</h1>
      <div class="api-filter">
        <label for="api-filter">Filter</label>
        <input
          type="search"
          placeholder="Enter keyword"
          id="api-filter"
          v-model="query"
        />
      </div>
    </div>

    <div
      v-for="section of filtered"
      :key="section.text"
      class="api-section"
    >
      <h2 :id="slugify(section.text)">{{ section.text }}</h2>
      <div class="api-groups">
        <div
          v-for="item of section.items"
          :key="item.text"
          class="api-group"
        >
          <h3>{{ item.text }}</h3>
          <ul>
            <li v-for="h of item.headers" :key="h.anchor">
              <a :href="item.link + '.html#' + slugify(h.anchor)">{{ h.anchor }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="!filtered.length" class="no-match">
      No API matching "{{ query }}" found.
    </div>
  </div>
</template>

<style scoped>
#api-index {
  max-width: 1024px;
  margin: 0px auto;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  display: list-item;
  text-align: -webkit-match-parent;
  margin: 0;
  padding: 0;
}

li + li {
  margin-top: 0;
}

h1,
h2,
h3 {
  padding: 0;
  margin: 0;
  font-weight: 600;
  line-height: 1;
}

h1,
h2 {
  letter-spacing: -0.02em;
}

h1 {
  font-size: 38px;
}

h2 {
  font-size: 24px;
  color: var(--vp-c-text-1);
  margin: 36px 0;
  transition: color 0.5s;
  padding-top: 36px;
  border-top: 1px solid var(--vp-c-divider-light);
}

h3 {
  letter-spacing: -0.01em;
  color: var(--vp-c-green);
  font-size: 18px;
  margin-bottom: 1em;
  transition: color 0.5s;
}

.api-section {
  margin-bottom: 64px;
}

.api-groups a {
  font-size: 15px;
  font-weight: 500;
  line-height: 2;
  color: var(--vp-c-text-code);
  transition: color 0.5s;
}

.dark api-groups a {
  font-weight: 400;
}

.api-groups a:hover {
  color: var(--vp-c-green);
  transition: none;
}

.api-group {
  break-inside: avoid;
  overflow: auto;
  margin-bottom: 20px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 28px 32px;
  transition: background-color 0.5s;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.api-filter {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
}

.api-filter input {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 6px 12px;
}

.api-filter:focus {
  border-color: var(--vp-c-green-light);
}

.no-match {
  font-size: 1.2em;
  color: var(--vp-c-text-3);
  text-align: center;
  margin-top: 36px;
  padding-top: 36px;
  border-top: 1px solid var(--vp-c-divider-light);
}

@media (max-width: 768px) {
  #api-index {
    padding: 42px 24px;
  }
  h1 {
    font-size: 32px;
    margin-bottom: 24px;
  }
  h2 {
    font-size: 22px;
    margin: 42px 0 32px;
    padding-top: 32px;
  }
  .api-groups a {
    font-size: 14px;
  }
  .header {
    display: block;
  }
}

@media (min-width: 768px) {
  .api-groups {
    columns: 2;
  }
}

@media (min-width: 1024px) {
  .api-groups {
    columns: 3;
  }
}
</style>