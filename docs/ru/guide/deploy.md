---
outline: deep
---

# Развёртывание вашего сайта VitePress {#deploy-your-vitepress-site}

Следующие инструкции основаны на некоторых общих предположениях:

- Сайт VitePress находится в директории `docs` вашего проекта.
- Вы используете выходной каталог сборки по умолчанию (`.vitepress/dist`).
- VitePress установлен как локальная зависимость в вашем проекте, и вы установили следующие скрипты в вашем `package.json`:

  ```json [package.json]
  {
    "scripts": {
      "docs:build": "vitepress build docs",
      "docs:preview": "vitepress preview docs"
    }
  }
  ```

## Сборка и локальное тестирование {#build-and-test-locally}

1. Выполните эту команду, чтобы собрать документацию:

   ```sh
   $ npm run docs:build
   ```

2. После сборки просмотрите её локально, запустив команду:

   ```sh
   $ npm run docs:preview
   ```

   Команда `preview` загрузит локальный статический веб-сервер, который будет обслуживать выходной каталог `.vitepress/dist` по адресу `http://localhost:4173`. Вы можете использовать его для теста, чтобы убедиться, что всё выглядит хорошо, прежде чем отправлять в производство.

3. Можно указать порт сервера, передав `--port` в качестве аргумента.

   ```json
   {
     "scripts": {
       "docs:preview": "vitepress preview docs --port 8080"
     }
   }
   ```

   Теперь метод `docs:preview` запустит сервер по адресу `http://localhost:8080`.

## Установка публичного базового пути {#setting-a-public-base-path}

По умолчанию предполагается, что сайт будет развёрнут по корневому пути домена (`/`). Если ваш сайт будет обслуживаться по подпути, например, `https://mywebsite.com/blog/`, то в конфигурации VitePress необходимо установить для опции [`base`](../reference/site-config#base) значение `'/blog/'`.

**Пример:** Если вы используете Github (или GitLab) Pages и развёртываете на `user.github.io/repo/`, то установите `base` на `/repo/`.

## Заголовки кэша HTTP {#http-cache-headers}

Если вы контролируете HTTP-заголовки на своем рабочем сервере, можно настроить заголовки `cache-control` для достижения лучшей производительности при повторных посещениях.

В производственной сборке используются хэшированные имена файлов для статических ресурсов (JavaScript, CSS и другие импортированные ресурсы, не находящиеся в `public`). Если вы просмотрите предварительную версию с помощью вкладки «Network» («Сеть») инструментов разработчика вашего браузера, вы увидите файлы типа `app.4f283b18.js`.

Этот хэш `4f283b18` генерируется из содержимого этого файла. Один и тот же хэшированный URL гарантированно обслуживает одно и то же содержимое файла — если содержимое меняется, то и URL тоже. Это означает, что можно смело использовать самые сильные настройки кэширования для этих файлов. Все такие файлы будут помещены в каталог `assets/` в выходном каталоге, поэтому вы можете настроить для них следующий заголовок:

```
Cache-Control: max-age=31536000,immutable
```

::: details Пример файла Netlify `_headers`

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

Примечание: файл `_headers` должен быть помещён в [директорию `public`](./asset-handling#the-public-directory) — в нашем случае `docs/public/_headers` — так, чтобы он был скопирован в выходной каталог.

[Netlify custom headers documentation](https://docs.netlify.com/routing/headers/)

:::

::: details Пример конфигурации Vercel в файле `vercel.json`

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

Примечание: Файл `vercel.json` должен быть помещен в корень вашего **репозитория**.

[Документация Vercel по конфигурации заголовков](https://vercel.com/docs/concepts/projects/project-configuration#headers)

:::

## Руководства по платформам {#platform-guides}

### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render {#netlify-vercel-cloudflare-pages-aws-amplify-render}

Создайте новый проект и измените эти настройки с помощью панели управления:

- **Build Command:** `npm run docs:build`
- **Output Directory:** `docs/.vitepress/dist`
- **Node Version:** `18` (или выше)

::: warning ПРЕДУПРЕЖДЕНИЕ
Не включайте такие опции, как _Auto Minify_ для HTML-кода. Он удалит из вывода комментарии, которые имеют значение для Vue. При их удалении могут возникать ошибки несоответствия гидратации.
:::

### GitHub Pages {#github-pages}

1. Создайте файл с именем `deploy.yml` в директории `.github/workflows` вашего проекта с примерно таким содержанием:

   ```yaml [.github/workflows/deploy.yml]
   # Пример рабочего процесса для создания и развёртывания сайта VitePress на GitHub Pages
   #
   name: Deploy VitePress site to Pages

   on:
     # Выполняется при пушах, направленных в ветку `main`. Измените это значение на `master`, если вы
     # используете ветку `master` в качестве ветки по умолчанию.
     push:
       branches: [main]

     # Позволяет запустить этот рабочий процесс вручную на вкладке «Actions».
     workflow_dispatch:

   # Устанавливает разрешения GITHUB_TOKEN, чтобы разрешить развёртывание на страницах GitHub.
   permissions:
     contents: read
     pages: write
     id-token: write

   # Разрешите только одно одновременное развёртывание, пропуская запуски, стоящие в очереди.
   # Однако НЕ отменяйте текущие запуски, поскольку мы хотим дать возможность завершить производственные развёртывания.
   concurrency:
     group: pages
     cancel-in-progress: false

   jobs:
     # Сборка
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
           with:
             fetch-depth: 0 # Не требуется, если функция lastUpdated не включена
         # - uses: pnpm/action-setup@v3 # Раскомментируйте, если вы используете pnpm
         #   with:
         #     version: 9
         # - uses: oven-sh/setup-bun@v1 # Раскомментируйте, если вы используете Bun
         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: npm # или pnpm / yarn
         - name: Setup Pages
           uses: actions/configure-pages@v4
         - name: Install dependencies
           run: npm ci # или pnpm install / yarn install / bun install
         - name: Build with VitePress
           run: npm run docs:build # или pnpm docs:build / yarn docs:build / bun run docs:build
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: docs/.vitepress/dist

     # Развёртывание
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

   ::: warning ПРЕДУПРЕЖДЕНИЕ
   Убедитесь, что опция `base` в вашем VitePress настроена правильно. Дополнительные сведения см. в секции [Установка публичного базового пути](#setting-a-public-base-path).
   :::

2. В настройках вашего репозитория в разделе «Pages» выберите пункт меню «GitHub Actions» в секции «Build and deployment > Source».

3. Внесите свои изменения в ветку `main` и дождитесь завершения процесса GitHub Actions. Вы должны увидеть, что ваш сайт развёрнут по адресу `https://<username>.github.io/[repository]/` или `https://<custom-domain>/` в зависимости от ваших настроек. Ваш сайт будет автоматически разворачиваться при каждом внесении изменений в ветке `main`.

### GitLab Pages {#gitlab-pages}

1. Установите значение `../public` для параметра `outDir` в конфигурации VitePress. Настройте опцию `base` на `'/<репозиторий>/'`, если вы хотите развернуть ваш проект по адресу `https://<имя пользователя>.gitlab.io/<репозиторий>/`. Вам не нужна опция `base`, если вы выполняете развёртывание на личном домене, страницах пользователя или группы, или если в GitLab включен параметр «Использовать уникальный домен».

2. Создайте файл с именем `.gitlab-ci.yml` в корне вашего проекта с приведённым ниже содержимым. Это позволит создавать и развёртывать ваш сайт каждый раз, когда вы вносите изменения в его содержимое:

   ```yaml [.gitlab-ci.yml]
   image: node:18
   pages:
     cache:
       paths:
         - node_modules/
     script:
       # - apk add git # Отметьте это, если вы используете небольшие докер-образы, такие как alpine, и у вас включен lastUpdated
       - npm install
       - npm run docs:build
     artifacts:
       paths:
         - public
     only:
       - main
   ```

### Статические веб-приложения Azure {#azure-static-web-apps}

1. Следуйте [официальной документации](https://docs.microsoft.com/ru-ru/azure/static-web-apps/build-configuration).

2. Установите эти значения в вашем конфигурационном файле (и удалите те, которые вам не нужны, например, `api_location`):

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### Firebase {#firebase}

1. Создайте `firebase.json` и `.firebaserc` в корне вашего проекта:

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
       "default": "<YOUR_FIREBASE_ID>"
     }
   }
   ```

2. После запуска `npm run docs:build` выполните эту команду для развёртывания:

   ```sh
   firebase deploy
   ```

### Surge {#surge}

1. После запуска `npm run docs:build` выполните эту команду для развёртывания:

   ```sh
   npx surge docs/.vitepress/dist
   ```

### Heroku {#heroku}

1. Следуйте документации и руководству, приведённому в [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static).

2. Создайте файл `static.json` в корне вашего проекта со следующим содержимым:

   ```json [static.json]
   {
     "root": "docs/.vitepress/dist"
   }
   ```

### Edgio {#edgio}

См. [Создание и развёртывание приложения VitePress в Edgio](https://docs.edg.io/applications/v6/sites_frameworks/getting_started/vitepress).

### Хостинг статических файлов Kinsta {#kinsta-static-site-hosting}

Вы можете развернуть свой сайт VitePress на [Kinsta](https://kinsta.com/static-site-hosting/), следуя этим [инструкциям](https://kinsta.com/docs/vitepress-static-site-example/).

### Stormkit

Вы можете развернуть свой проект VitePress на [Stormkit](https://www.stormkit.io), следуя следующим [инструкциям](https://stormkit.io/blog/how-to-deploy-vitepress).

### Nginx

Вот пример конфигурации блока сервера Nginx. Эта настройка включает сжатие gzip для общих текстовых ресурсов, правила обслуживания статических файлов вашего сайта VitePress с правильными заголовками кэширования и обработку параметра `cleanUrls: true`.

```nginx
server {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    listen 80;
    server_name _;
    index index.html;

    location / {
        # расположение контента
        root /app;

        # точные совпадения -> обратные чистые URL-адреса -> папки -> не найдены
        try_files $uri $uri.html $uri/ =404;

        # несуществующие страницы
        error_page 404 /404.html;

        # папка без index.html вызывает ошибку 403 в этой настройке
        error_page 403 /404.html;

        # настройка заголовков кэширования
        # файлы в папке с ресурсами имеют хэши имён файлов
        location ~* ^/assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

Эта конфигурация предполагает, что ваш собранный сайт VitePress находится в директории `/app`. При необходимости измените директиву `root`, если файлы вашего сайта расположены в другом месте.

::: warning Не используйте index.html по умолчанию
Разрешение try_files не должно использовать index.html, как это делается в других приложениях Vue. Это может привести к недопустимому состоянию страницы.
:::

Дополнительную информацию можно найти в официальной документации [Nginx](https://nginx.org/ru/docs/), а также в следующих обсуждениях: [#2837](https://github.com/vuejs/vitepress/discussions/2837), [#3235](https://github.com/vuejs/vitepress/issues/3235), а также в [блоге Mehdi Merah](https://blog.mehdi.cc/articles/vitepress-cleanurls-on-nginx-environment#readings).
