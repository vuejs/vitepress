# Links Anterior y Próximo {#prev-next-links}

Puede personalizar el texto y el enlace de los botones Anterior y Siguiente que se muestran en la parte inferior de la página. Esto es útil cuando desea mostrar un texto diferente al que tiene en la barra lateral. Además, puede resultarle útil desactivar el pie de página o el enlace a la página para que no se incluya en la barra lateral.

## prev

- Tipo: `string | false | { text?: string; link?: string }`

- Detalles:

  Especifica el text/enlace que se mostrará en el enlace a la página anterior. Si no ve esto al principio, el text/enlace se deducirá de la configuración de la barra lateral.

- Ejemplos:

  - Para personalizar solo texto:

    ```yaml
    ---
    prev: 'Iniciar | Markdown'
    ---
    ```

  - Para personalizar ambos texto y link:

    ```yaml
    ---
    prev:
      text: 'Markdown'
      link: '/guide/markdown'
    ---
    ```

  - Para esconder la página anterior:

    ```yaml
    ---
    prev: false
    ---
    ```

## next

Igual que el `prev` pero para la página siguiente.
