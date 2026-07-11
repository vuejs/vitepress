---
outline: deep
description: Despliega tu sitio VitePress en plataformas populares como Netlify, Vercel, GitHub Pages y más.
---

# Despliegue su Sitio VitePress {#deploy-your-vitepress-site}

Las siguientes orientaciones están basadas en algunos supuestos:

- El sitio VitePress está dentro del directorio `docs` de su proyecto.
- Está usando la directorio por defecto para el la compilación (`.vitepress/dist`).
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

  Ahora, el método `docs:preview` iniciará el servidor en `http://localhost:8080`.

## Configurando un Directorio Base Publico {#setting-a-public-base-path}

Por defecto, asumimos que el sitio será implantado en el path raiz de un dominio (`/`). Si su sitio fuera servido en un subpath, por ejemplo, `https://mipagina.com/blog/`, necesitará entonces configurar la opción [`base`](../reference/site-config#base) para `'/blog/'` en la configuración VitePress.

**Ejemplo:** Si utilizas Github (o GitLab) Pages y realizas el despliegue en `user.github.io/repo/`, entonces establece tu `base` en `/repo/`.

## Headers de Cache HTTP {#http-cache-headers}

Si tiene control sobre los headers HTTP de su servidor en producción, se puede configurar headers `cache-control` para obtener mejor desempeño al visitar repetidas.

La compilación de producción usa nombres de archivos con hash para assets estáticos (JavaScript, CSS e otros assets que no están en `public`). Se inspecciona la previa de producción usando las herramientas de desarrollador de su navegador en la pestaña red, verá archivos como `app.4f283b18.js`.

Este hash `4f283b18` se genera a partir del contenido de este archivo. Se garantiza que la misma URL con hash servirá el mismo contenido del archivo; si el contenido cambia, las URL también cambian. Esto significa que puede usar con seguridad los encabezados de caché más seguros para estos archivos. Todos estos archivos se colocarán en `assets/` en el directorio de salida, por lo que puede configurar el siguiente encabezado para ellos:

```
Cache-Control: max-age=31536000,immutable
```

::: details Ejemplo de archivo `_headers` Netlify

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

Nota: el archivo `_headers` debe colocarse en el [directorio público](./asset-handling#the-public-directory) - en nuestro caso, `docs/public/_headers` - para que se copie tal cual al directorio de salida.

[Documentación de headers personalizados de Netlify](https://docs.netlify.com/routing/headers/)

:::

::: details de Ejemplo de configuración Vercel en `vercel.json`

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

Nota: el archivo `vercel.json` debe ser colocado en la raíz de su **repositorio**.

[Documentación Vercel sobre configuración de headers](https://vercel.com/docs/concepts/projects/project-configuration#headers)

:::

## Guias de Plataforma {#platform-guides}

### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render {#generic}

Configure un nuevo proyecto y altere estas configuraciones usando su panel:

- **Comando de Compilación:** `npm run docs:build`
- **directorio de Salida:** `docs/.vitepress/dist`
- **Versión de Node:** `20` (o superior)

::: warning
No active opciones como _Auto Minify_ para código HTML. Eso removerá comentarios de salida que tiene significado para Vue. Habrán errores de incompatibilidad de hidratación si fueran removidos.
:::

### GitHub Pages

1. Crea un archivo llamado `deploy.yml` dentro del directorio `.github/workflows` de tu proyecto con un contenido como este:

   ```yaml [.github/workflows/deploy.yml]
   # Ejemplo de flujo de trabajo para compilar e implantar un sitio VitePress en GitHub Pages
   #
   name: Despliegue el sitio VitePress en Pages

   on:
     # Se ejecuta en los pushes dirigidos a la rama `main`. Cámbialo a `master`
     # si estás usando la rama `master` como rama predeterminada.
     push:
       branches: [main]

     # Permite ejecutar este flujo de trabajo manualmente desde la pestaña Acciones
     workflow_dispatch:

   # Define permisos GITHUB_TOKEN para la implementación en GitHub Pages
   permissions:
     contents: read
     pages: write
     id-token: write

   # Permitir solo una implementación simultánea, omitiendo las ejecuciones en cola entre la ejecución en curso y la última en cola.

   # Sin embargo, NO cancelar las ejecuciones en curso, ya que queremos permitir que estas implementaciones de producción se completen.
   concurrency:
     group: pages
     cancel-in-progress: false

   jobs:
     # Trabajo de compilación
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v5
           with:
             fetch-depth: 0 # No necesario si lastUpdated no estuviera habilitado
         # - uses: pnpm/action-setup@v4 # Desconecte eso si estuviera usando pnpm
         #   with:
         #     version: 9 # No es necesario si has configurado "packageManager" en package.json
         # - uses: oven-sh/setup-bun@v1 # Desconecte eso se estuviera usando Bun
         - name: Setup Node
           uses: actions/setup-node@v6
           with:
             node-version: 24
             cache: npm # o pnpm / yarn
         - name: Cache VitePress
           uses: actions/cache@v4
           with:
             path: docs/.vitepress/cache
             key: ${{ runner.os }}-vitepress-${{ hashFiles('docs/**', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb') }}
             restore-keys: |
               ${{ runner.os }}-vitepress-
         - name: Setup Pages
           uses: actions/configure-pages@v4
         - name: Install dependencies
           run: npm ci # o pnpm install / yarn install / bun install
         - name: Build with VitePress
           run: npm run docs:build # o pnpm docs:build / yarn docs:build / bun run docs:build
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: docs/.vitepress/dist

     # Trabajo de despliegue
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

   ::: warning
   Asegúrese de que la opción `base` en su VitePress esté configurada correctamente. Vea [Configurando un Directorio Base Publico](#setting-a-public-base-path) para más detalles.
   :::

2. En las configuraciones de su repositorio sobre el item del menú "Pages", seleccione "GitHub Actions" en "Build and deployment > Source".

3. Envie sus modificaciones para el branch `main` y espere la conclusión del flujo de trabajo de GitHub Actions. Verá su sitio implantado en `https://<usuario>.github.io/[repositorio]/` o `https://<dominio-personalizado>/` dependiendo de sus configuraciones. Su sitio será implantado automáticamente en cada push para la branch `main`.

### GitLab Pages

1. Establezca `outDir` en la configuración de VitePress a `../public`. Configure la opción `base` a `'/<repositorio>/'` si desea implementar en `https://<usuario>.gitlab.io/<repositorio>/`. No necesita `base` si está implementando en un dominio personalizado, páginas de usuario o grupo, o si tiene habilitada la opción "Usar dominio único" en GitLab.

2. Cree un archivo llamado `.gitlab-ci.yml` en la raiz del proyecto con el contenido abajo. Esto construirá e implantará su sitio siempre que haga cambios en el contenido.

   ```yaml [.gitlab-ci.yml]
   image: node:24
   pages:
     cache:
       paths:
         - node_modules/
     script:
       # - apk add git # Descomente esto si está utilizando imágenes de Docker pequeñas como alpine y tiene la última actualización habilitada.
       - npm install
       - npm run docs:build
     artifacts:
       paths:
         - public
     only:
       - main
   ```

<!-- Mantener los encabezados ordenados alfabéticamente, dejar nginx al final -->

### Azure

1. Follow the [official documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration).

2. Configure esos valores en su archivo de configuración (y remueva aquellos que no necesita, como `api_location`):

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### CloudRay

Puedes desplegar tu proyecto VitePress con [CloudRay](https://cloudray.io/) siguiendo estas [instrucciones](https://cloudray.io/articles/how-to-deploy-vitepress-site).

### Firebase

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

2. Después de ejecutar `npm run docs:build`, ejecute este comando para desplegar:

   ```sh
   firebase deploy
   ```

### Heroku

1. Siga la documentación y el guia proporcionados por [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static).

2. Cree un archivo llamado `static.json` en la raiz de su proyecto con el siguiente contenido:

   ```json [static.json]
   {
     "root": "docs/.vitepress/dist"
   }
   ```

### Hostinger

Puedes desplegar tu proyecto VitePress con [Hostinger](https://www.hostinger.com/web-apps-hosting) siguiendo estas [instrucciones](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/). Al configurar los ajustes de compilación, elige VitePress como framework y ajusta el directorio raíz a `./docs`.

### Kinsta

Puede implantar su sitio VitePress en [Kinsta](https://kinsta.com/static-site-hosting/) siguiendo estas [instrucciones](https://kinsta.com/docs/vitepress-static-site-example/).

### Stormkit

Puedes desplegar tu proyecto VitePress en [Stormkit](https://www.stormkit.io) siguiendo estas [instrucciones](https://stormkit.io/blog/how-to-deploy-vitepress).

### Surge

1. Después de ejecutar `npm run docs:build`, ejecute este comando para implantar:

   ```sh
   npx surge docs/.vitepress/dist
   ```

### Nginx

Aquí hay un ejemplo de configuración de bloque de servidor Nginx. Esta configuración incluye compresión gzip para recursos comunes basados en texto, reglas para servir los archivos estáticos de su sitio VitePress con encabezados de caché adecuados, así como el manejo de `cleanUrls: true`.

```nginx
server {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    listen 80;
    server_name _;
    index index.html;

    location / {
        # content location
        root /app;

        # exact matches -> reverse clean urls -> folders -> not found
        try_files $uri $uri.html $uri/ =404;

        # non existent pages
        error_page 404 /404.html;

        # a folder without index.html raises 403 in this setup
        error_page 403 /404.html;

        # adjust caching headers
        # files in the assets folder have hashes filenames
        location ~* ^/assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

Esta configuración asume que su sitio VitePress compilado está ubicado en el directorio `/app` de su servidor. Ajuste la directiva `root` según corresponda si los archivos de su sitio se encuentran en otro lugar.

::: warning No predeterminar index.html
La resolución de try_files no debe predeterminar index.html como en otras aplicaciones Vue. Esto resultará en un estado de página inválido.
:::

Se puede encontrar más información en la [documentación oficial de nginx](https://nginx.org/en/docs/), en estos issues [#2837](https://github.com/vuejs/vitepress/discussions/2837), [#3235](https://github.com/vuejs/vitepress/issues/3235) así como en este [post del blog](https://blog.mehdi.cc/articles/vitepress-cleanurls-on-nginx-environment#readings) de Mehdi Merah.
