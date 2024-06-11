# Última Actualización {#last-updated}

La hora en que se actualizó el contenido por última vez se mostrará en la esquina inferior derecha de la página. Para habilitar, agregue la opción `lastUpdated` en su confirguración.

::: tip
Necesitas hacer un _commit_ en el archivo markdown para ver el clima actualizado.
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

Consulte [Tema Personalizado: Última Actualización](./default-theme-config#lastupdated) para obtener más. Cualquier valor positivo a nivel de tema también habilitará la funcionalidad a menos que esté explícitamente deshabilitado a nivel de página o sitio.
