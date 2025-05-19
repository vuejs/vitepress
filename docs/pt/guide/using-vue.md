# Usando Vue em Markdown {#using-vue-in-markdown}

Em VitePress, cada arquivo Markdown é compilado para HTML e então processado como um [Componente de Arquivo Único Vue](https://vuejs.org/guide/scaling-up/sfc.html). Isso significa que você pode usar qualquer funcionalidade Vue dentro do Markdown, incluindo a interpolação dinâmica, usar componentes Vue ou lógica arbitrária de componentes Vue dentro da página adicionando uma tag `<script>`.

Vale ressaltar que VitePress aproveita o compilador Vue para detectar e otimizar automaticamente as partes puramente estáticas do conteúdo Markdown. Os conteúdos estáticos são otimizados em nós de espaço reservado únicos e eliminados da carga JavaScript da página para visitas iniciais. Eles também são ignorados durante a hidratação no lado do cliente. Em resumo, você só paga pelas partes dinâmicas em qualquer página específica.

::: tip Compatibilidade SSR
Todo uso do Vue precisa ser compatível com SSR. Consulte [Compatibilidade SSR](./ssr-compat) para detalhes e soluções comuns.
:::

## Criação de _Templates_ {#templating}

### Interpolação {#interpolation}

Cada arquivo Markdown é primeiro compilado para HTML e depois passado como um componente Vue para a canalização de processos Vite. Isso significa que você pode usar interpolação no estilo Vue no texto:

**Entrada**

```md
{{ 1 + 1 }}
```

**Saída**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### Diretivas {#directives}

Diretivas também funcionam (observe que, por definiçào, HTML cru também é válido em Markdown):

**Entrada**

```html
<span v-for="i in 3">{{ i }}</span>
```

**Saída**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

## `<script>` e `<style>`

As tags `<script>` e `<style>` em nível raiz nos arquivos Markdown funcionam igualmente como nos Componentes de Arquivo Único Vue, incluindo `<script setup>`, `<style module>`, e etc. A principal diferença aqui é que não há uma tag `<template>`: todo outro conteúdo em nível raiz é Markdown. Além disso, observe que todas as tags devem ser colocadas **após** o frontmatter:

```html
---
hello: world
---

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

## Conteúdo Markdown

A contagem é: {{ count }}

<button :class="$style.button" @click="count++">Incrementar</button>

<style module>
.button {
  color: red;
  font-weight: bold;
}
</style>
```

::: warning Evite `<style scoped>` no Markdown
Quando usado no Markdown, `<style scoped>` exige a adição de atributos especiais a cada elemento na página atual, o que aumentará significativamente o tamanho da página. `<style module>` é preferido quando é necessária uma estilização localizada em uma página.
:::

Você também tem acesso às APIs de tempo de execução VitePress, como o [auxiliar `useData`](../reference/runtime-api#usedata), que fornece acesso aos metadados da página atual:

**Entrada**

```html
<script setup>
import { useData } from 'vitepress'

const { page } = useData()
</script>

<pre>{{ page }}</pre>
```

**Saída**

```json
{
  "path": "/usando-vue.html",
  "title": "Usando Vue em Markdown",
  "frontmatter": {},
  ...
}
```

## Usando Componentes {#using-components}

Você pode importar e usar componentes Vue diretamente nos arquivos Markdown.

### Importando no Markdown {#importing-in-markdown}

Se um componente é usado apenas por algumas páginas, é recomendável importá-los explicitamente onde são usados. Isso permite que eles sejam divididos adequadamente e carregados apenas quando as páginas relevantes são mostradas:

```md
<script setup>
import CustomComponent from '../components/CustomComponent.vue'
</script>

# Documentação

Este é um arquivo .md usando um componente personalizado

<CustomComponent />

## Mais documentação

...
```

### Registrando Componentes Globalmente {#registering-components-globally}

Se um componente for usado na maioria das páginas, eles podem ser registrados globalmente personalizando a instância do aplicativo Vue. Consulte a seção relevante em [Estendendo o Tema Padrão](./extending-default-theme#registering-global-components) para um exemplo.

::: warning IMPORTANT
Certifique-se de que o nome de um componente personalizado contenha um hífen ou esteja em PascalCase. Caso contrário, ele será tratado como um elemento alinhado e envolvido dentro de uma tag `<p>`, o que levará a uma incompatibilidade de hidratação pois `<p>` não permite que elementos de bloco sejam colocados dentro dele.
:::

### Usando Componentes Em Cabeçalhos <ComponenteNoCabeçalho /> {#using-components-in-headers}

Você pode usar componentes Vue nos cabeçalhos, mas observe a diferença entre as seguintes sintaxes:

| Markdown                                                | HTML de Saída                               | Cabeçalho Processado |
| ------------------------------------------------------- | ----------------------------------------- | ------------- |
| <pre v-pre><code> # texto &lt;Tag/&gt; </code></pre>     | `<h1>texto <Tag/></h1>`                    | `texto`        |
| <pre v-pre><code> # texto \`&lt;Tag/&gt;\` </code></pre> | `<h1>texto <code>&lt;Tag/&gt;</code></h1>` | `texto <Tag/>` |

O HTML envolvido por `<code>` será exibido como é; somente o HTML que **não** estiver envolvido será analisado pelo Vue.

::: tip
O HTML de saída é realizado por [Markdown-it](https://github.com/Markdown-it/Markdown-it), enquanto os cabeçalhos processados são manipulados pelo VitePress (e usados tanto na barra lateral quanto no título do documento).
:::

## Escapes {#escaping}

Você pode escapar de interpolações Vue envolvendo-as em um `<span>` ou outros elementos com a diretiva `v-pre`:

**Entrada**

```md
Isto <span v-pre>{{ será exibido como é }}</span>
```

**Saída**

<div class="escape-demo">
  <p>Isto <span v-pre>{{ será exibido como é }}</span></p>
</div>

Alternativamente, você pode envolver todo o parágrafo em um container personalizado `v-pre`:

```md
::: v-pre
{{ Isto será exibido como é }}
:::
```

**Output**

<div class="escape-demo">

::: v-pre
{{ Isto será exibido como é }}
:::

</div>

## "Des-escape" em Blocos de Código {#unescape-in-code-blocks}

Por padrão, todos os blocos de código cercados são automaticamente envolvidos com `v-pre`, então nenhuma sintaxe Vue será processada dentro deles. Para permitir a interpolação no estilo Vue dentro do cercado, você pode adicionar a linguagem com o sufixo `-vue` , por exemplo, `js-vue`:

**Entrada**

````md
```js-vue
Olá {{ 1 + 1 }}
```
````

**Saída**

```js-vue
Olá {{ 1 + 1 }}
```

Observe que isso pode impedir que certos tokens sejam realçados corretamente.

## Usando Pré-processadores CSS {#using-css-pre-processors}

O VitePress possui [suporte embutido](https://vitejs.dev/guide/features.html#css-pre-processors) para pré-processadores CSS: arquivos `.scss`, `.sass`, `.less`, `.styl` e `.stylus`. Não é necessário instalar plugins específicos do Vite para eles, mas o próprio pré-processador correspondente deve ser instalado:

```
# .scss e .sass
npm install -D sass

# .less
npm install -D less

# .styl e .stylus
npm install -D stylus
```

Então você pode usar o seguinte em Markdown e nos componentes do tema:

```vue
<style lang="sass">
.title
  font-size: 20px
</style>
```

## Usando _Teleports_ {#using-teleports}

VitePress atualmente oferece suporte a SSG para _teleports_ apenas para o corpo. Para outros alvos, você pode envolvê-los dentro do componente embutido `<ClientOnly>` ou injetar a marcação de _teleport_ na localização correta em sua página final HTML por meio do [gancho `postRender`](../reference/site-config#postrender).

<ModalDemo />

::: details
<<< @/components/ModalDemo.vue
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
import ModalDemo from '../../components/ModalDemo.vue'
import ComponentInHeader from '../../components/ComponentInHeader.vue'
</script>

<style>
.escape-demo {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 0 20px;
}
</style>
