# Migración desde VitePress 0.x

Si viene de la versión 0.x de VitePress, hay varios cambios importantes debido a nuevas características y mejoras. Siga esta guía para ver cómo migrar su aplicación a la última versión de VitePress.

## Configuración de la aplicación {#app-config}

- La característica de internacionalización aún no está implementada.

## Configuración del tema {#theme-config}

- La opción `sidebar` ha cambiado su estructura.
  - La clave `children` ahora se llama `items`.
  - El elemento de primer nivel no puede contener `link` por el momento. Estamos planeando traerlo de vuelta.
- Las opciones `repo`, `repoLabel`, `docsDir`, `docsBranch`, `editLinks` y `editLinkText` se han eliminado en favor de una API más flexible.
  - Para agregar un enlace de GitHub con icono a la barra de navegación, use la característica [Enlaces sociales](../reference/default-theme-nav#navigation-links).
  - Para agregar la característica "Editar esta página", use la característica [Enlace de edición](../reference/default-theme-edit-link).
- La opción `lastUpdated` ahora se divide en `config.lastUpdated` y `themeConfig.lastUpdated.text`.
- `carbonAds.carbon` se ha cambiado a `carbonAds.code`.

## Configuración de frontmatter {#frontmatter-config}

- La opción `home: true` ha cambiado a `layout: home`. Además, muchos ajustes relacionados con la página de inicio se han modificado para proporcionar características adicionales. Consulte la [guía de la página de inicio](../reference/default-theme-home-page) para obtener más detalles.
- La opción `footer` se ha movido a [`themeConfig.footer`](../reference/default-theme-config#footer).