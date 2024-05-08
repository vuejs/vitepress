<template>
  <div class="VPApiPage" style="user-select: none;">
    <div v-if="currentItem.some(item => item.type === 'namespace')">
      <h2>Namespaces</h2>
      <div v-for="item in currentItem">
        <div class="item" v-if="item.type === 'namespace'" @click="whenClick(item.items!)">
          <VPLink v-if="item.link" :href="item.link">
            <div class="namespace">N</div> {{ item.name }}
          </VPLink>
          <div v-else>
            <div class="namespace">N</div> {{ item.name }}
          </div>
        </div>
      </div>
      <br />
    </div>

    <div v-if="currentItem.some(item => item.type === 'function')">
      <h2>Functions</h2>
      <div v-for="item in currentItem">
        <div class="item" v-if="item.type === 'function'" @click="whenClick(item.items!)">
          <VPLink v-if="item.link" :href="item.link">
            <div class="function">F</div> {{ item.name }}
          </VPLink>
          <div v-else>
            <div class="function">F</div> {{ item.name }}
          </div>
        </div>
      </div>
      <br />
    </div>

    <div v-if="currentItem.some(item => item.type === 'enum')">
      <h2>Enumerations</h2>
      <div v-for="item in currentItem">
        <div class="item" v-if="item.type === 'enum'" @click="whenClick(item.items!)">
          <VPLink v-if="item.link" :href="item.link">
            <div class="enum">E</div> {{ item.name }}
          </VPLink>
          <div v-else>
            <div class="enum">E</div> {{ item.name }}
          </div>
        </div>
      </div>
      <br />
    </div>

    <div v-if="currentItem.some(item => item.type === 'class')">
      <h2>Classes</h2>
      <div v-for="item in currentItem">
        <div class="item" v-if="item.type === 'class'" @click="whenClick(item.items!)">
          <VPLink v-if="item.link" :href="item.link">
            <div class="class">C</div> {{ item.name }}
          </VPLink>
          <div v-else>
            <div class="class">C</div> {{ item.name }}
          </div>
        </div>
      </div>
      <br />
    </div>

    <div v-if="currentItem.some(item => item.type === 'interface')">
      <h2>Interfaces</h2>
      <div v-for="item in currentItem">
        <div class="item" v-if="item.type === 'interface'" @click="whenClick(item.items!)">
          <VPLink v-if="item.link" :href="item.link">
            <div class="interface">I</div> {{ item.name }}
          </VPLink>
          <div v-else>
            <div class="interface">I</div> {{ item.name }}
          </div>
        </div>
      </div>
      <br />
    </div>

    <div v-if="currentItem.some(item => item.type === 'variable')">
      <h2>Variables</h2>
      <div v-for="item in currentItem">
        <div class="item" v-if="item.type === 'variable'" @click="whenClick(item.items!)">
          <VPLink v-if="item.link" :href="item.link">
            <div class="variable">V</div> {{ item.name }}
          </VPLink>
          <div v-else>
            <div class="variable">V</div> {{ item.name }}
          </div>
        </div>
      </div>
      <br />
    </div>

    <div v-if="currentItem.some(item => item.type === 'type')">
      <h2>Types</h2>
      <div v-for="item in currentItem">
        <div class="item" v-if="item.type === 'type'" @click="whenClick(item.items!)">
          <VPLink v-if="item.link" :href="item.link">
            <div class="type">T</div> {{ item.name }}
          </VPLink>
          <div v-else>
            <div class="type">T</div> {{ item.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue'
import VPLink from './VPLink.vue';

interface Props {
  apis: ApiItem[]
}

interface ApiItem {
  type: 'namespace' | 'function' | 'enum' | 'class' | 'interface' | 'variable' | 'type',
  name: string,
  items?: ApiItem[],
  link?: string
}

const props = defineProps<Props>()

const currentItem = ref(props.apis)

function whenClick(item: ApiItem[]) {
  if (typeof item !== 'undefined') {
    currentItem.value = item
  }
}
</script>

<style scoped>
.VPApiPage .item:hover {
  text-decoration: underline
}

.VPApiPage .item {
  float: left;
  margin: 5px;
}

.VPApiPage .namespace {
  border: solid purple 2px;
  border-radius: 5px;
  width: 20px;
  height: 20px;
  text-align: center;
  color: purple;
  float: left;
  margin-right: 5px;
  user-select: none;
}

.VPApiPage .function {
  border: solid yellow 2px;
  border-radius: 5px;
  width: 20px;
  height: 20px;
  text-align: center;
  color: yellow;
  float: left;
  margin-right: 5px;
  user-select: none;
}

.VPApiPage .enum {
  border: solid brown 2px;
  border-radius: 5px;
  width: 20px;
  height: 20px;
  text-align: center;
  color: brown;
  float: left;
  margin-right: 5px;
  user-select: none;
}

.VPApiPage .class {
  border: solid green 2px;
  border-radius: 5px;
  width: 20px;
  height: 20px;
  text-align: center;
  color: green;
  float: left;
  margin-right: 5px;
  user-select: none;
}

.VPApiPage .interface {
  border: solid skyblue 2px;
  border-radius: 5px;
  width: 20px;
  height: 20px;
  text-align: center;
  color: skyblue;
  float: left;
  margin-right: 5px;
  user-select: none;
}

.VPApiPage .variable {
  border: solid red 2px;
  border-radius: 5px;
  width: 20px;
  height: 20px;
  text-align: center;
  color: red;
  float: left;
  margin-right: 5px;
  user-select: none;
}

.VPApiPage .type {
  border: solid blue 2px;
  border-radius: 5px;
  width: 20px;
  height: 20px;
  text-align: center;
  color: blue;
  float: left;
  margin-right: 5px;
  user-select: none;
}
</style>