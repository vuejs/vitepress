# Layout {#layout}

Puedes elegir el layout de la página definiendo una opción de `layout` para el [frontmatter](./frontmatter-config) De la página. Hay tres opciones de layout: `doc`, `page` y `home`. Si no se especifica nada, la página será tratada como una página. `doc`.

```yaml
---
layout: doc
---
```

## Layout del documento {#doc-layout}

La opción `doc` es el layout predeterminado y aplica estilo a todo el contenido de Markdown el aspecto de "documentación". Funciona agrupando todo el contenido en la clase CSS `vp-doc`, y aplicando estilos a los elementos debajo de ella.

Casi todos los elementos genéricos como `p` o `h2`, recibirá un estilo especial. Por tanto, recuerda que si añades algún HTML contenido personalizado dentro del contenido Markdown, también se verá afectado por estos estilos.

También proporciona recursos de documentación específicos que se enumeran a continuación. Estas funciones solo están habilitadas en este layout.

- Editar link
- Links Anterior y próximo.
- _Outline_
- [Carbon Ads](./default-theme-carbon-ads)

## Layout de la Página {#page-layout}

La opción `page` se trata como una 'página en blanco'. Markdown aún se procesará y todo [Extensiones Markdown](../guide/markdown) funcionará de la misma manera que el layout `doc`, pero esto no recibirá ningún estilo predeterminado.

El layout de la página le permitirá diseñar todo sin que el tema de VitePress afecte el marcado. Esto es útil cuando desea crear su propia página personalizada.

Tenga en cuenta que incluso en este mismo layout, la barra lateral seguirá apareciendo si la página tiene una configuración de barra lateral correspondiente.

## Layout de Home {#home-layout}

La opción `home` gerará un modelo de _"Homepage"_. En este layout podrás definir opciones extras, como `hero` y `features`, para personalizar todavá más el contenido. Visite [Tema predeterminado: Página Inicial](./default-theme-home-page)  para obter más detalles.

## Sin Layout {#no-layout}

Si no quieres ningún diseño, puedes pasar `layout: false` a través del frontmatter. Esta opción es útil si deseas una página de destino completamente personalizable (sin barra lateral, barra de navegacón o pie de página por defecto).

## Layout Personalizado {#custom-layout}

También puedes usar un layout personalizado:

```md
---
layout: foo
---
```

Esto buscará un componente llamado `foo` registrado en contexto. Por ejemplo, puede registrar su componente globalmente en `.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme'
import Foo from './Foo.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('foo', Foo)
  }
}
```
