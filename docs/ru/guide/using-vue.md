# Использование Vue в Markdown {#using-vue-in-markdown}

В VitePress каждый Markdown-файл компилируется в HTML, а затем обрабатывается как [однофайловый компонент Vue](https://ru.vuejs.org/guide/scaling-up/sfc.html). Это означает, что вы можете использовать любые возможности Vue внутри Markdown, включая динамический шаблонизатор, использование компонентов Vue или произвольную логику компонентов Vue на странице, добавив тег `<script>`.

Стоит отметить, что VitePress использует компилятор Vue для автоматического обнаружения и оптимизации чисто статических частей контента в формате Markdown. Статичное содержимое оптимизируется в отдельные узлы-заполнители и исключается из полезной нагрузки JavaScript страницы при первых посещениях. Они также пропускаются при гидратации на стороне клиента. Короче говоря, вы платите только за динамические части на каждой конкретной странице.

::: tip Совместимость с SSR
Всё, что используется в Vue, должно быть совместимо с SSR. Подробности и общие обходные пути см. в главе [Совместимость с SSR](./ssr-compat).
:::

## Шаблонизация {#templating}

### Интерполяция {#interpolation}

Каждый файл Markdown сначала компилируется в HTML, а затем передается в качестве компонента Vue в конвейер процесса Vite. Это означает, что вы можете использовать интерполяцию в стиле Vue в тексте:

**Разметка**

```md
{{ 1 + 1 }}
```

**Результат**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### Директивы {#directives}

Директивы также работают (обратите внимание, что по замыслу необработанный HTML также допустим в Markdown):

**Разметка**

```html
<span v-for="i in 3">{{ i }}</span>
```

**Результат**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

## `<script>` и `<style>` {#script-and-style}

Теги корневого уровня `<script>` и `<style>` в Markdown-файлах работают так же, как и в Vue SFC, включая `<script setup>`, `<style module>` и т. д. Главное отличие заключается в отсутствии тега `<template>`: всё остальное содержимое корневого уровня — Markdown. Также обратите внимание, что все теги должны располагаться **после** метаданных:

```html
---
hello: world
---

<script setup>
  import { ref } from 'vue'

  const count = ref(0)
</script>

## Содержание в формате Markdown. Счётчик: {{ count }}

<button :class="$style.button" @click="count++">Увеличить</button>

<style module>
  .button {
    color: red;
    font-weight: bold;
  }
</style>
```

::: warning Избегайте `<style scoped>` в Markdown
При использовании в Markdown `<style scoped>` требует добавления специальных атрибутов к каждому элементу на текущей странице, что значительно увеличивает размер страницы. `<style module>` предпочтительнее, когда на странице требуется локально копируемый стиль.
:::

У вас также есть доступ к runtime API VitePress, например, к [хелперу `useData`](../reference/runtime-api#usedata), который предоставляет доступ к метаданным текущей страницы:

**Разметка**

```html
<script setup>
  import { useData } from 'vitepress'

  const { page } = useData()
</script>

<pre>{{ page }}</pre>
```

**Результат**

```json
{
  "path": "/using-vue.html",
  "title": "Использование Vue в Markdown",
  "frontmatter": {},
  ...
}
```

## Использование компонентов {#using-components}

Вы можете импортировать и использовать компоненты Vue непосредственно в файлах Markdown.

### Импорт в Markdown {#importing-in-markdown}

Если компонент используется только на нескольких страницах, рекомендуется явно импортировать его туда, где он используется. Это позволяет правильно разделить их по коду и загружать только при показе соответствующих страниц:

```md
<script setup>
import CustomComponent from '../components/CustomComponent.vue'
</script>

# Документация

Это .md с использованием пользовательского компонента

<CustomComponent />

## Другая документация

...
```

### Глобальная регистрация компонентов {#registering-components-globally}

Если компонент будет использоваться на большинстве страниц, его можно зарегистрировать глобально, настроив экземпляр приложения Vue. Пример смотрите в соответствующей главе [Расширение темы по умолчанию](./extending-default-theme#registering-global-components).

::: warning ВАЖНО
Убедитесь, что имя пользовательского компонента содержит дефис или написано в PascalCase. В противном случае он будет рассматриваться как встроенный элемент и заключен в тег `<p>`, что приведёт к несоответствию гидратации, поскольку `<p>` не позволяет размещать внутри него блочные элементы.
:::

### Использование компонентов в заголовках <ComponentInHeader /> {#using-components-in-headers}

Вы можете использовать компоненты Vue в заголовках, но обратите внимание на разницу между следующими синтаксисами:

| Markdown                                                 | Итоговый HTML                              | Разобранный заголовок |
| -------------------------------------------------------- | ------------------------------------------ | --------------------- |
| <pre v-pre><code> # текст &lt;Tag/&gt; </code></pre>     | `<h1>текст <Tag/></h1>`                    | `текст`               |
| <pre v-pre><code> # текст \`&lt;Tag/&gt;\` </code></pre> | `<h1>текст <code>&lt;Tag/&gt;</code></h1>` | `текст <Tag/>`        |

HTML, обёрнутый `<code>`, будет отображаться как есть; только тот HTML, который **не** обёрнут, будет разобран Vue.

::: tip ПРИМЕЧАНИЕ
Вывод HTML осуществляется с помощью [Markdown-it](https://github.com/Markdown-it/Markdown-it), а парсинг заголовков обрабатывается VitePress (и используется как для боковой панели, так и для заголовка документа).
:::

## Экранирование {#escaping}

Вы можете избежать интерполяций Vue, обернув их в `<span>` или другие элементы с помощью директивы `v-pre`:

**Разметка**

```md
Это <span v-pre>{{ будет отображаться как есть }}</span>.
```

**Результат**

<div class="escape-demo">
  <p>Это <span v-pre>{{ будет отображаться как есть }}</span></p>
</div>

В качестве альтернативы вы можете обернуть весь абзац в пользовательский контейнер `v-pre`:

```md
::: v-pre
{{ Это будет отображаться как есть }}
:::
```

**Результат**

<div class="escape-demo">

::: v-pre
{{ Это будет отображаться как есть }}
:::

</div>

## Отключение экранирования в блоках кода {#unescape-in-code-blocks}

По умолчанию все изолированные блоки кода автоматически оборачиваются `v-pre`, поэтому внутри них не будет обрабатываться синтаксис Vue. Чтобы включить интерполяцию в стиле Vue внутри фигурных скобок, можно добавить к языку суффикс `-vue`, например `js-vue`:

**Разметка**

````md
```js-vue
Привет, {{ 1 + 1 }}
```
````

**Результат**

```js-vue
Привет, {{ 1 + 1 }}
```

Обратите внимание, что при этом некоторые лексемы могут не выделяться синтаксисом должным образом.

## Использование препроцессоров CSS {#using-css-pre-processors}

VitePress имеет [встроенную поддержку](https://vitejs.dev/guide/features.html#css-pre-processors) для препроцессоров CSS: файлы `.scss`, `.sass`, `.less`, `.styl` и `.stylus`. Для них не нужно устанавливать специфические для Vite плагины, но сам соответствующий препроцессор должен быть установлен:

::: code-group

```sh [npm]
# .scss и .sass
npm install -D sass

# .less
npm install -D less

# .styl и .stylus
npm install -D stylus
```

```sh [pnpm]
# .scss и .sass
pnpm add -D sass

# .less
pnpm add -D less

# .styl и .stylus
pnpm add -D stylus
```

```sh [yarn]
# .scss и .sass
yarn add -D sass

# .less
yarn add -D less

# .styl и .stylus
yarn add -D stylus
```

```sh [bun]
# .scss и .sass
bun add -D sass

# .less
bun add -D less

# .styl и .stylus
bun add -D stylus
```
:::

Затем вы можете использовать соответствующий атрибут `lang` в Markdown и компонентах темы:

```vue
<style lang="sass">
.title
  font-size: 20px
</style>
```

## Использование телепортов {#using-teleports}

В настоящее время VitePress поддерживает SSG только для телепортов к элементу `body`. Для других целей вы можете обернуть их внутри встроенного компонента `<ClientOnly>` или внедрить разметку телепортации в нужное место HTML конечной страницы через [хук `postRender`](../reference/site-config#postrender).

<ModalDemo />

::: details Исходный код
<<< @/ru/components/ModalDemo.vue
:::

```md
<ClientOnly>
  <Teleport to="#modal">
    <div>
      // ...
    </div>
  </Teleport>
</ClientOnly>
```

<script setup>
import ModalDemo from '../components/ModalDemo.vue'
import ComponentInHeader from '../../components/ComponentInHeader.vue'
</script>

<style>
.escape-demo {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 0 20px;
}
</style>


## Поддержка VS Code IntelliSense

<!-- Based on https://github.com/vuejs/language-tools/pull/4321 -->

Vue предоставляет поддержку IntelliSense из коробки через [официальный плагин Vue для VS Code](https://marketplace.visualstudio.com/items?itemName=Vue.volar). Однако, чтобы включить её для файлов `.md`, вам нужно внести некоторые изменения в файлы конфигурации.

1. Добавьте шаблон `.md` в параметры `include` и `vueCompilerOptions.vitePressExtensions` в файле tsconfig/jsconfig:

::: code-group
```json [tsconfig.json]
{
  "include": [
    "docs/**/*.ts",
    "docs/**/*.vue",
    "docs/**/*.md",
  ],
  "vueCompilerOptions": {
    "vitePressExtensions": [".md"],
  },
}
```
:::

2. Добавьте `markdown` в параметр `vue.server.includeLanguages` в настройках VS Code:

::: code-group
```json [.vscode/settings.json]
{
  "vue.server.includeLanguages": ["vue", "markdown"]
}
```
:::
