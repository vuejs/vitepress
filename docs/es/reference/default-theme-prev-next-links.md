---
description: Personaliza los enlaces de página anterior y siguiente que se muestran en la parte inferior de las páginas de documentación en VitePress.
---

# Enlaces Anterior y Siguiente {#prev-next-links}

Puede personalizar el texto y el enlace para las páginas anterior y siguiente (mostrados en el pie de página de la documentación). Esto es útil si desea tener allí un texto diferente al que tiene en su barra lateral. Además, puede resultarle útil desactivar el pie de página o el enlace a una página que no esté incluida en su barra lateral.

## prev

- Tipo: `string | false | { text?: string; link?: string }`

- Detalles:

  Especifica el texto/enlace a mostrar en el enlace a la página anterior. Si no configura esto en el `frontmatter`, el texto/enlace se inferirá de la configuración de la barra lateral.

- Ejemplos:

  - Para personalizar solo el texto:

    ```yaml
    ---
    prev: 'Comenzar | Markdown'
    ---
    ```

  - Para personalizar ambos texto y enlace:

    ```yaml
    ---
    prev:
      text: 'Markdown'
      link: '/guia/markdown'
    ---
    ```

  - Para ocultar la página anterior:

    ```yaml
    ---
    prev: false
    ---
    ```

## next

Igual que `prev`, pero para la página siguiente.