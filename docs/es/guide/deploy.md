---
outline: deep
---

# Despliegue su Sitio VitePress {#deploy-your-vitepress-site}

Las siguientes orientaciones están basadas en algunos supuestos:

- El sitio VitePress está dentro del directorio `docs` de su proyecto.
- Está usando la directorio por defecto para el build (`.vitepress/dist`).
- VitePress está instalado como una dependencia local en su proyecto, y usted configuró los siguientes scripts en su `package.json`:

  ```json [package.json]
  {
    "scripts": {
      "docs:build": "vitepress build docs",
      "docs:preview": "vitepress preview docs"
    }
  }
  ```

## Compilar y Testear Localmente {#build-and-test-locally}

1. Ejecute este comando para compilar la documentación:

   ```sh
   $ npm run docs:build
   ```

2. Después de la compilación, vea la vista previa ejecutando:

   ```sh
   $ npm run docs:preview
   ```

   El comando `preview` inicializará un servidor web estático local que servirá la directorio de salida `.vitepress/dist` en `http://localhost:4173`. Puede usar eso para garantizar que todo esté correcto antes de enviar a producción.

3. Puede configurar el puerto del servidor pasando `--port` como argumento.

   ```json
   {
     "scripts": {
       "docs:preview": "vitepress preview docs --port 8080"
     }
   }
   ```

   Ahora el método `docs:preview` implantará el servidor en `http://localhost:8080`.

## Configurando un Path Base Publico {#setting-a-public-base-path}

Por defecto, asumimos que el sitio será implantado en el path raiz de un dominio (`/`). Si su sitio fuera servido en un subpath, por ejemplo, `https://meusite.com/blog/`, necesitará entonces configurar la opción [`base`](../reference/site-config#base) para `'/blog/'` en la configuración VitePress.

**Ejemplo:** Al usar GitHub Pages (ou GitLab Pages) e implantar en `user.github.io/repo/`, defina su `base` como `/repo/`.

## Headers de Cache HTTP {#http-cache-headers}

Si tiene control sobre los headers HTTP de su servidor en producción, se puede configurar headers `cache-control` para obtener mejor desempeño en vistar repetidas.

La compilación de producción usa nombres de archivos con hash para assets estáticos (JavaScript, CSS e otros assets que no están en `public`). Se inspecciona la previa de producción usando las herramientas de desarrollador de su navegador en la pestaña red, verá archivos como `app.4f283b18.js`.

Este hash `4f283b18` es generado a partir del contenido de este archivo. La misma URL con hash es garantizada para servir el mismo contenido del archivo - se el contenido cambia, las URLs también cambian. Esto significa que puede utilizar con seguridad los headers de cahe más fuertespara esos archivos. Todos esos archivos serán colocados en `assets/` en la directorio de salida, entonces puede configurar el siguiente header para ellos:

```
Cache-Control: max-age=31536000,immutable
```

::: details Ejemplo de archivo `_headers` do Netlify

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

Nota: el archivo `_headers` debe ser colocado en [diretório public](./asset-handling#the-public-directory) - en nuestro caso, `docs/public/_headers` - para que el sea copiado exactamente para la directorio de salida.

[Documentación de headers personalizados de Netlify](https://docs.netlify.com/routing/headers/)

:::

::: details de Ejemplo de configuración Vercel em `vercel.json`

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

Nota: el archivo `vercel.json` debe ser colocado en la raiz de su **repositório**.

[Documentación Vercel sobre configuración de headers ](https://vercel.com/docs/concepts/projects/project-configuration#headers)

:::

## Guias de Plataforma {#platform-guides}

### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render

Configure un nuevo proyecto y altere estas configuraciones usando su panel:

- **Comando de Compilación:** `npm run docs:build`
- **directorio de Salida:** `docs/.vitepress/dist`
- **Versión de Node:** `18` (o superior)

::: warning
No active opciones como _Auto Minify_ para código HTML. Eso removera comentarios de salida que tiene significado para Vue. Habrán errores de incompatibilidad de hidratación se fueran removidos.
:::

### GitHub Pages

1. Cree un archivo llamado `deploy.yml` dentro del directorio `.github/workflows` do seu projeto com algum conteúdo como este:

   ```yaml [.github/workflows/deploy.yml]
   # Ejemplo de flujo de trabajo para compilar e implantar un sitio VitePress en GitHub Pages
   #
   name: Implante el sitio VitePress en Pages

   on:
     # Ejecute en push direccionados a la branch `main`.
     # Cambie para `master` si estuviera usando la branch `master` por defecto.
     push:
       branches: [main]

     # Permite ejecutar manualmente este flujo de trabajo en la guia Actions
     workflow_dispatch:

   # Define permisos GITHUB_TOKEN para la implementación en GitHub Pages
   permissions:
     contents: read
     pages: write
     id-token: write

   # Permite apenas una implantación simultánea, omitiendo ejecuciones en fila entre la ejecución en progreso y la última de la fila.
   # Sin embargo, NO cancela ejecuciones en progreso, pues queremos permitir que esas implantaciones de producción sean concuidas.
   concurrency:
     group: pages
     cancel-in-progress: false

   jobs:
     # Trabajo de compilación
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
           with:
             fetch-depth: 0 # No necesario se lastUpdated no estuviera habilitado
         # - uses: pnpm/action-setup@v3 # Desconecte eso si estuviera usando pnpm
         #   with:
         #     version: 9
         # - uses: oven-sh/setup-bun@v1 # Desconecte eso se estuviera usando Bun
         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: npm # o pnpm / yarn
         - name: Setup Pages
           uses: actions/configure-pages@v4
         - name: Install dependencies
           run: npm ci # o pnpm install / yarn install / bun install
         - name: Build with VitePress
           run: |
             npm run docs:build # o pnpm docs:build / yarn docs:build / bun run docs:build
             touch docs/.vitepress/dist/.nojekyll
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: docs/.vitepress/dist

     # Trabajo de implantación
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       needs: build
       runs-on: ubuntu-latest
       name: Deploy
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

   Asegurese de que la opción `base` en su VitePress esté configurada correctamentse. Vea [Configuranco un Path base Público](#setting-a-public-base-path) para más detalles.
   :::

2. En las configuraciones de su repositorio sobre el item del menú "Pages", seleccione "GitHub Actions" en "Build and deployment > Source".

3. Envie sus modificaciones para el branch `main` y espere la conclusión del flujo de trabajo de GitHub Actions. Verá su sitio implantado en `https://<username>.github.io/[repository]/` o `https://<custom-domain>/` dependiendo de sus configuraciones. Su sitio será implantado automáticamente en cada push para la branch `main`.

### GitLab Pages

1. Defina `outDir` en la configuración VitePress como `../public`. Configure la opción `base` para `'/<repository>/'` se desea implantar en `https://<username>.gitlab.io/<repository>/`.

2. Cree un archivo llamado `.gitlab-ci.yml` en la raiz del proyecto con el contenido abajo. Esto construirá e implantará su sitio siempre que haga alteraciones en el contenido.

   ```yaml [.gitlab-ci.yml]
   image: node:18
   pages:
     cache:
       paths:
         - node_modules/
     script:
       # - apk add git # Desconecte eso se estuviera usando imagenes pequeñas de Docker como Alpine y tuviera lastUpdated habilitado
       - npm install
       - npm run docs:build
     artifacts:
       paths:
         - public
     only:
       - main
   ```

### Azure Static Web Apps {#azure-static-web-apps}

1. Siga la [documentación oficial](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration).

2. Configure esos valores en su archivo de configuración (y remueva aquellos que no necesita, como `api_location`):

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### Firebase {#firebase}

1. Cree `firebase.json` y `.firebaserc` en la raiz de su proyecto:

   `firebase.json`:

   ```json [firebase.json]
   {
     "hosting": {
       "public": "docs/.vitepress/dist",
       "ignore": []
     }
   }
   ```

   `.firebaserc`:

   ```json [.firebaserc]
   {
     "projects": {
       "default": "<SU_ID_FIREBASE>"
     }
   }
   ```

2. Después de ejecutar `npm run docs:build`, ejecute este comando para implantar:

   ```sh
   firebase deploy
   ```

### Surge

1. Después de ejecutar `npm run docs:build`, ejecute este comando para implantar:

   ```sh
   npx surge docs/.vitepress/dist
   ```

### Heroku

1. Siga la documentación y el guia proporcionados por [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static).

2. Cree un archivo llamado `static.json` en la raiz de su proyecto con el contenido abajo:

   ```json [static.json]
   {
     "root": "docs/.vitepress/dist"
   }
   ```

### Edgio

Consulte [Crear e Implantar una Aplicación VitePress en Edgio](https://docs.edg.io/guides/vitepress).

### Kinsta Static Site Hosting {#kinsta-static-site-hosting}

Puede implantar su sitio VitePress em [Kinsta](https://kinsta.com/static-site-hosting/) siguiendo estas [instrucciones](https://kinsta.com/docs/vitepress-static-site-example/).
