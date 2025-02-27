# Iniciando {#getting-started}

## Experimente Online {#try-it-online}

Puede experimentar VitePress directamente en su navegador en [StackBlitz](https://vitepress.new).

## Instalación {#installation}

### Prerrequisitos {#prerequisites}

- [Node.js](https://nodejs.org/) versión 18 o superior.
- Terminal para acessar VitePress a través de su interfaz de linea de comando (CLI).
- Editor de texto con soporte a sintaxis [Markdown](https://en.wikipedia.org/wiki/Markdown).
  - [VSCode](https://code.visualstudio.com/) es recomendado, junto con la [extensión oficial Vue](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

VitePress puede ser usado solo, o ser instalado en un proyecto ya existente. En ambos casos, puede instalarlo con:

::: code-group

```sh [npm]
$ npm add -D vitepress
```

```sh [pnpm]
$ pnpm add -D vitepress
```

```sh [yarn]
$ yarn add -D vitepress
```

```sh [bun]
$ bun add -D vitepress
```

:::

::: details Recibiendo avisos sobre dependencias ausentes?
Si usa PNPM, percibirá un aviso de ausencia de `@docsearch/js`. Esto no evita que VitePress funcione. Si desea eliminar este aviso, adicione lo siguiente en su `package.json`:

```json
"pnpm": {
  "peerDependencyRules": {
    "ignoreMissing": [
      "@algolia/client-search",
      "search-insights"
    ]
  }
}
```

:::

::: tip NOTA

VitePress es un paquete apenas para ESM. No use `require()` para importarlo, y asegurese de que el `package.json` más cercano contiene `"type": "module"`, o cambie la extensión de archivo de sus archivos relevantes como `.vitepress/config.js` a `.mjs`/`.mts`. Consulte la [Guía de resolución de problemas Vite](http://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only) para más detalles. Además de eso, dentro de contextos de JavaScript asíncronos, puede usar `await import('vitepress')`.

:::

### Asistente de Instalación {#setup-wizard}

VitePress tiene embutido un asistente de instalación por linea de comando que ayudará a construir un proyecto básico. Después de la instalación, inicie el asistente ejecutando:

::: code-group

```sh [npm]
$ npx vitepress init
```

```sh [pnpm]
$ pnpm vitepress init
```

```sh [yarn]
$ yarn vitepress init
```

```sh [bun]
$ bun vitepress init
```

:::

Será saludado con algunas preguntas simples:

<<< @/snippets/init.ansi

::: tip Vue como Dependencia Correspondiente
Si tiene la intención de realizar una personalización que usa componentes Vue o APIs, debe instalar explicitamente `vue` como una dependencia correspondiente.
:::

## Estrutura de Archivos {#file-structure}

Se está construyendo un sitio VitePress individual, puede desarrollar su sitio en el directorio actual (`./`). Sin embargo, si está instalando VitePress en un proyecto existente junto con otro código fuente, es recomendado construir el sitio en un directorio anidado (e.g. `./docs`) para que esté separado del resto de su proyecto.

Asumiendo la opción de desarrollar el proyecto VitePress en `./docs`, la estructura de archivos generada debe parecerse a la siguiente:

```
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

El directorio `docs` es considerado la **raiz del proyecto** de su sitio VitePress. El directorio `.vitepress` es un lugar reservado para archivos de configuración VitePress, caché del servidor de desarrollo, resultado del build, y código de personalización de tema opcional.

::: tip
Por defecto, VitePress almacena el caché del servidor de desarrollo en `.vitepress/cache`, y el resultado del build de producción en `.vitepress/dist`. Se usa Git, debe adicionarlos a su archivo `.gitignore`. Estas ubicaciones también pueden ser [configuradas](../reference/site-config#outdir).
:::

### El archivo de configuración {#the-config-file}

El archivo de configuración (`.vitepress/config.js`) permite que personalice vários aspectos de su sitio VitePress, con las opciones más básicas siendo el titulo y la descripción del sitio:

```js [.vitepress/config.js]
export default {
  // opciones a nivel del sitio
  title: 'VitePress',
  description: 'Solo una broma.',

  themeConfig: {
    // opciones a nivel del tema
  }
}
```

Puede también configurar el comportamiento del tema a través de la opción `themeConfig`. Consulte la [Referencia de Configuración](../reference/site-config) para detaller completos sobre todas las opciones de configuración.

### Archivos fuente {#source-files}

Archivos Markdown fuera del directorio `.vitepress` son considerados **archivos fuente**.

VitePress usa **enrutamiento basado en archivos**: cada archivo `.md` es compilado en un archivo `.html` correspondiente con el mismo path. Por ejemplo, `index.md` será compilado en `index.html`, y puede ser visitado en el path raiz `/` del sitio VitePress resultante.

VitePress también proporciona la habilidad de generar URLs limpias, retambém fornece a habilidade de gerar URLs limpas, reescribir paths, y generare páginas dinámicamente. Estos serán tratados en la [Guía de Enrutamiento](./routing).

## Instalado y Funcionando {#up-and-running}

La herramienta debe tener también inyectado los siguientes scripts npm en su `package.json` si permitió esto durante el proceso de instalación:

```json [package.json]
{
  ...
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  ...
}
```

El script `docs:dev` iniciará un servidor de desarrollo local con actualizaciones instantáneas. Ejecutelo con el siguiente comando:

::: code-group

```sh [npm]
$ npm run docs:dev
```

```sh [pnpm]
$ pnpm run docs:dev
```

```sh [yarn]
$ yarn docs:dev
```

```sh [bun]
$ bun run docs:dev
```

:::

En vez de scripts npm, también puede invocar VitePress directamente con:

::: code-group

```sh [npm]
$ npx vitepress dev docs
```

```sh [pnpm]
$ pnpm vitepress dev docs
```

```sh [yarn]
$ yarn vitepress dev docs
```

```sh [bun]
$ bun vitepress dev docs
```

:::

Más usos de la linea de comandos están documaentados en la [Referencia CLI](../reference/cli).

El servidor de desarrollo debe estar corriendo en `http://localhost:5173`. Visite la URL en su navegador para ver su nuevo sitio en acción!

## Qué viene después? {#what-s-next}

- Para entender mejor cómo archivos Markdown son mapeados en HTML, consulte la [Guía de Enrutamiento](./routing).

- Para descubrir más sobre lo que puede hacer en una página, cómo escribir contenido markdown o usar un componente Vue, consulte la sección "Escribiendo" de la guía. Un optimo lugar para comenzar sería aprendiendo más sobre [Extensiones Markdown](./markdown).

- Para explorar las funcionalidades proporcionadas por el tema por defecto de la documentación, consulte la [Referencia de Configuración del Tema por Defecto](../reference/default-theme-config).

- Se quiere profundizar la personalización de la apariencia de su sitio, explore tanto [Extienda el Tema por Defecto](./extending-default-theme) como [Construya un Tema Personalizado](./custom-theme).

- Una vez que su documentación tome forma, asegurese de leer la [Guia de Despliegue](./deploy).
