<script setup>
import { h, ref } from 'vue'
import { defineClientComponent } from 'vitepress'

const load = () => import('./Slots.vue')
const ClientComponent = defineClientComponent(load)
const WithProps = defineClientComponent(load, [{ message: 'from args' }])
const WithEmptyArgs = defineClientComponent(load, [])
const WithNullProps = defineClientComponent(load, [null])
const WithExplicitSlots = defineClientComponent(load, [null, {
  default: () => 'explicit default',
  header: () => 'explicit header'
}])
const legacyChildren = [
  ['string', ['string child']],
  ['array', [[h('span', 'array child')]]],
  ['vnode', [h('span', 'vnode child')]],
  ['function', [() => 'function child']],
  ['number', [42]],
  ['null', [null, null]],
  ['undefined', [null, undefined]],
  ['multiple', [null, 'first', 'second']]
].map(([id, args]) => ({ id, component: defineClientComponent(load, args) }))
const count = ref(0)
</script>

# Client Components

<button id="increment" @click="count++">Increment</button>

<ClientComponent id="forwarded">
  <template #header="{ message }">{{ message }} {{ count }}</template>
  <template v-if="count % 2" #footer>conditional slot</template>
  default content {{ count }}
</ClientComponent>

<WithProps id="with-props">
  <template #header="{ message }">{{ message }}</template>
  content with props
</WithProps>

<WithEmptyArgs id="empty-args">content with empty args</WithEmptyArgs>

<WithNullProps id="null-props">content with null props</WithNullProps>

<WithExplicitSlots id="explicit">
  <template #header>ignored header</template>
  ignored default
</WithExplicitSlots>

<component
  v-for="{ id, component } in legacyChildren"
  :is="component"
  :id="`legacy-${id}`"
>
  ignored content
</component>
