---
outline: deep
---

# Conectando a un CMS {#connecting-to-a-cms}

## Flujo de Trabajo general {#general-workflow}

Conectar VitePress a un CMS girará mayormente en torno a [Rutas dinámicas](./routing#dynamic-routes). Asegurese de entender cómo funcionan antes de proceder.

Como cada CMS funcionará de forma diferente, aqui podemos proveer apenas un flujo de trabajo genérico que requiere ser adaptado para cada escenario específico.

1. Si su CMS exige autenticación, cree un archivo `.env` para almacenar los tokens del API y cargarlos como:

    ```js
    // posts/[id].paths.js
    import { loadEnv } from 'vitepress'

    const env = loadEnv('', process.cwd())
    ```

2. Obtenga los datos necesarios del CMS y aplique formato en paths de datos apropiados:

    ```js
    export default {
      async paths() {
        // use la biblioteca del cliente CMS respectiva si es necesario
        const data = await (await fetch('https://my-cms-api', {
          headers: {
            // token caso necesario
          }
        })).json()

        return data.map(entry => {
          return {
            params: { id: entry.id, /* título, autores, data, etc. */ },
            content: entry.content
          }
        })
      }
    }
    ```

3. Presente el contenido en la página:

    ```md
    # {{ $params.title }}

    - por {{ $params.author }} en {{ $params.date }}

    <!-- @content -->
    ```

## Guias de Integración {#integration-guides}

Se usted escribió una guía sobre cómo integrar VitePress con un CMS específico, por favor use el link "Edite esta página" abajo para enviarlo hacia aqui!
