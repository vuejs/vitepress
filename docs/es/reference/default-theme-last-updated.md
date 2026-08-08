---
description: Muestra la marca de tiempo de la última actualización en las páginas de VitePress basada en el historial de commits de Git.
---

# Última Actualización {#last-updated}

La hora de la última actualización del contenido se mostrará en la esquina inferior derecha de la página. Para habilitar, agregue la opción `lastUpdated` a su archivo de configuración.

::: info
VitePress muestra la hora de la última actualización utilizando la marca de tiempo del commit de Git más reciente para cada archivo. Para habilitar esta función, el archivo Markdown debe estar suscrito a Git.

Internamente, VitePress ejecuta `git log -1 --pretty="%ai"` en cada archivo para obtener su marca de tiempo. Si todas las páginas muestran la misma hora de actualización, probablemente se deba a una clonación superficial (común en entornos de CI), lo que limita el historial de Git.

Para solucionar esto en **GitHub Actions**, utilice lo siguiente en su flujo de trabajo:

```yaml{4}
- name: Checkout
  uses: actions/checkout@v5
  with:
    fetch-depth: 0
```

Otras plataformas de CI/CD tienen configuraciones similares.

Si dichas opciones no están disponibles, puede ejecutar un fetch manual antes, configurándolo en el comando `docs:build` de su `package.json` de la siguiente forma:

```json
"docs:build": "git fetch --unshallow && vitepress build docs"
```
:::

## Configuración a nivel de sitio {#site-level-config}

```js
export default {
  lastUpdated: true
}
```

## Configuración Frontmatter {#frontmatter-config}

Esto se puede desactivar por página usando la opción `lastUpdated` en frontmatter:

```yaml
---
lastUpdated: false
---
```

Consulte también [Tema predeterminado: Última actualización](./default-theme-config#lastupdated) para obtener más detalles. Cualquier valor verdadero a nivel de tema también habilitará la función, a menos que se deshabilite explícitamente a nivel de sitio o página.
