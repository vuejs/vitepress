# Frontmatter

## Uso {#usage}

VitePress soporta frontmatter YAML en todos los archivos Markdown, procesandolos con [gray-matter](https://github.com/jonschlinkert/gray-matter). El frontmatter debe estar en la parte superior del archivo Markdown (antes de cualquier elemento, incluyendo tags `<script>`), y debe tener la forma de un YAML válido entre lineas con trazos de triple guion. Ejemplo:

```md
---
title: Documentación con VitePress
editLink: true
---
```

Muchas opciones de configuración del sitio o del tema por defecto tienen opciones correspondientes en el frontmatter. Puede usar el frontmatter para sobreponer un comportamiento específico solamente para la página actual. Para más detalles, vea [Referencia de Configuración del Frontmatter](../reference/frontmatter-config).

Puede también definir datos propios del frontmatter personalizados, para ser usados en expresiones Vue dinámicas en la página.

## Acceso a los Datos del Frontmatter {#accessing-frontmatter-data}

Los datos del frontmatter pueden ser accedidos por medio de la variable global especial `$frontmatter`:

Aqui está un ejemplo de como podría usarlo en su archivo Markdown:

```md
---
title: Documentación con VitePress
editLink: true
---

# {{ $frontmatter.title }}

Contenido de guia
```

Puede acceder los datos del frontmatter de la página actual en `<script setup>` con el auxiliar [`useData()`](../reference/runtime-api#usedata).

## Formatos Alternativos del Frontmatter {#alternative-frontmatter-formats}

VitePress también soporta la sintaxis frontmatter JSON, comenzando y terminando con llaves:

```json
---
{
  "title": "Creando blog como un hacker",
  "editLink": true
}
---
```
