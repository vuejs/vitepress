---
description: Разверните свой сайт VitePress на популярных платформах, таких как Netlify, Vercel, GitHub Pages и других.
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

## Переносимые сборки (относительный base) {#relocatable-builds-relative-base}

Когда конечный URL сайта неизвестен на момент сборки — шлюз IPFS (`https://gateway/ipfs/<cid>/…`), Wayback Machine, общая папка, документация, встроенная в приложение — установите `base` равным `'./'`:

```ts
export default {
  base: './'
}
```

Каждая страница затем ссылается на ресурсы и другие страницы относительно своего собственного расположения, а клиентский рантайм восстанавливает реальную точку монтирования при загрузке страницы. Одна и та же сборка работает из **любого** подпути без пересборки — в том числе из нескольких одновременно — с полностью работающими маршрутизацией, поиском и предзагрузкой.

Открытие сгенерированных HTML-файлов напрямую из файловой системы (`file://`) также работает как стилизованный, полностью навигируемый статический сайт. Браузеры блокируют JavaScript-модули при использовании `file://`, поэтому гидратации там нет — интерактивные функции вроде поиска остаются неактивными, при этом весь предварительно отрендеренный контент и ссылки продолжают работать.

Несколько важных моментов:

- Держите [`cleanUrls`](../reference/site-config#cleanurls) выключенным (значение по умолчанию): переносимому выводу нужны ссылки, оканчивающиеся на `.html`, поскольку нет сервера для переписывания «красивых» URL.
- `404.html` генерируется для корневой глубины. Хосты, отдающие его как fallback для URL произвольной глубины, отрендерят его без стилей (для неизвестной глубины нет корректного относительного префикса).
- Записи [`head`](../reference/site-config#head) выводятся как есть, как и всегда — избегайте в них корне-абсолютных путей вроде `/favicon.ico` и предпочитайте абсолютные URL или `transformHead`.
- Сырые HTML-теги `<a>` в Markdown сохраняют `href` в том виде, как написаны — используйте синтаксис Markdown-ссылок для сайт-абсолютных ссылок (встроенные источники `<img>` проходят через пайплайн ресурсов и обрабатываются корректно).
- Ссылки, созданные [`createContentLoader`](./data-loading#createcontentloader), остаются сайт-абсолютными (их HTML встраивается в другие страницы, поэтому единого корректного относительного префикса не существует) — они разрешаются только для корневого монтирования.
- Отдавайте страницы по их каноническим URL: корень как `/dir/` (не `/dir`), и без добавленных завершающих слэшей у URL страниц. Относительный префикс разрешается относительно URL, который браузер реально показывает, а практически все статические хостинги уже канонизируют именно так.
- Dev-сервер всегда отдаёт по `/`; относительное поведение применяется к продакшен-сборке.

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

### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render {#generic}

Создайте новый проект и измените эти настройки с помощью панели управления:

- **Build Command:** `npm run docs:build`
- **Output Directory:** `docs/.vitepress/dist`
- **Node Version:** `20` (или выше)

::: warning ПРЕДУПРЕЖДЕНИЕ
Не включайте такие опции, как _Auto Minify_ для HTML-кода. Он удалит из вывода комментарии, которые имеют значение для Vue. При их удалении могут возникать ошибки несоответствия гидратации.
:::

### GitHub Pages

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
           uses: actions/checkout@v5
           with:
             fetch-depth: 0 # Не требуется, если функция lastUpdated не включена
         # - uses: pnpm/action-setup@v4 # Раскомментируйте, если вы используете pnpm
         #   with:
         #     version: 9
         # - uses: oven-sh/setup-bun@v1 # Раскомментируйте, если вы используете Bun
         - name: Setup Node
           uses: actions/setup-node@v6
           with:
             node-version: 24
             cache: npm # или pnpm / yarn
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

### GitLab Pages

1. Установите значение `../public` для параметра `outDir` в конфигурации VitePress. Настройте опцию `base` на `'/<репозиторий>/'`, если вы хотите развернуть ваш проект по адресу `https://<имя пользователя>.gitlab.io/<репозиторий>/`. Вам не нужна опция `base`, если вы выполняете развёртывание на личном домене, страницах пользователя или группы, или если в GitLab включен параметр «Использовать уникальный домен».

2. Создайте файл с именем `.gitlab-ci.yml` в корне вашего проекта с приведённым ниже содержимым. Это позволит создавать и развёртывать ваш сайт каждый раз, когда вы вносите изменения в его содержимое:

   ```yaml [.gitlab-ci.yml]
   image: node:24
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

<!-- keep headings sorted alphabetically, leave nginx at the end -->

### Azure

1. Следуйте [официальной документации](https://docs.microsoft.com/ru-ru/azure/static-web-apps/build-configuration).

2. Установите эти значения в вашем конфигурационном файле (и удалите те, которые вам не нужны, например, `api_location`):

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### CloudRay

Вы можете развернуть свой проект VitePress с [CloudRay](https://cloudray.io/), следуя этим [инструкциям](https://cloudray.io/articles/how-to-deploy-vitepress-site).

### Firebase

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

### Heroku

1. Следуйте документации и руководству, приведённому в [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static).

2. Создайте файл `static.json` в корне вашего проекта со следующим содержимым:

   ```json [static.json]
   {
     "root": "docs/.vitepress/dist"
   }
   ```

### Hostinger

Вы можете развернуть свой проект VitePress на [Hostinger](https://www.hostinger.com/web-apps-hosting), следуя этим [инструкциям](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/). При настройке параметров сборки выберите VitePress в качестве фреймворка и укажите корневой каталог `./docs`.

### Stormkit

Вы можете развернуть свой проект VitePress на [Stormkit](https://www.stormkit.io), следуя следующим [инструкциям](https://stormkit.io/blog/how-to-deploy-vitepress).

### Surge

После запуска `npm run docs:build` выполните эту команду для развёртывания на [Surge](https://surge.sh):

```sh
npx surge docs/.vitepress/dist
```

### harvis

После выполнения `npm run docs:build` выполните эту команду для развёртывания на [harvis](https://harvis.dev):

```sh
npx harvis docs/.vitepress/dist
```

### Nginx

Вот пример конфигурации блока сервера Nginx. Эта настройка включает сжатие gzip для общих текстовых ресурсов, правила обслуживания статических файлов вашего сайта VitePress с правильными заголовками кэширования и обработку параметра `cleanUrls: true`.

```nginx
map $uri $cache_control {
    ~^/assets/  "public, max-age=31536000, immutable";
    default     "no-cache";
}

server {
    listen 8080;
    listen [::]:8080;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;
    charset utf-8;
    server_tokens off;

    absolute_redirect off;

    gzip on;
    gzip_vary on;
    gzip_comp_level 5;
    gzip_min_length 1024;
    gzip_types
        application/javascript
        application/json
        application/manifest+json
        image/svg+xml
        text/css
        text/javascript
        text/plain;

    add_header Cache-Control $cache_control always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        try_files $uri $uri.html $uri/index.html =404;
    }

    location ~ ^(?<page>.+)/$ {
        if (-f $document_root$page.html) {
            return 301 $page$is_args$args;
        }
        try_files $page/index.html =404;
    }

    error_page 404 /404.html;
}
```
