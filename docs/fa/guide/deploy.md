---
outline: deep
---

# استقرار وب‌سایت ویت‌پرس شما {#deploy-your-vitepress-site}

راهنماهای زیر بر اساس برخی فرضیات مشترک است:

- وب‌سایت ویت‌پرس در دایرکتوری `docs` پروژه شما قرار دارد.
- شما از دایرکتوری خروجی پیش‌فرض ساخته‌شده (`.vitepress/dist`) استفاده می‌کنید.
- ویت‌پرس به‌عنوان یک وابستگی محلی در پروژه شما نصب شده است و شما اسکریپت‌های زیر را در `package.json` پیکربندی کرده‌اید:

  ```json [package.json]
  {
    "scripts": {
      "docs:build": "vitepress build docs",
      "docs:preview": "vitepress preview docs"
    }
  }
  ```

## ساخت و تست محلی  {#build-and-test-locally}

1. برای ساخت اسناد، این دستور را اجرا کنید:

   ```sh
   $ npm run docs:build
   ```

2. پس از ساخت، آن را به‌صورت محلی پیش‌نمایش دهید با اجرای این دستور:

   ```sh
   $ npm run docs:preview
   ```

   دستور `preview` یک سرور وب ایستا محلی راه‌اندازی می‌کند که دایرکتوری خروجی `.vitepress/dist` را در آدرس `http://localhost:4173` ارائه می‌دهد. شما می‌توانید از این امکان استفاده کنید تا اطمینان حاصل کنید که همه چیز قبل از رفع به محیط تولیدی به‌درستی نمایش داده می‌شود.

3. می‌توانید پورت سرور را با انتقال `--port` به‌عنوان یک آرگمان پیکربندی کنید.

   ```json
   {
     "scripts": {
       "docs:preview": "vitepress preview docs --port 8080"
     }
   }
   ```

   حالا اسکریپت `docs:preview` سرور را در `http://localhost:8080` راه‌اندازی خواهد کرد.

## تنظیم مسیر پایه عمومی {#setting-a-public-base-path}

به‌طور پیش‌فرض، ما فرض می‌کنیم که وب‌سایت در مسیر ریشه دامنه (`/`) انتشار می‌یابد. اگر وب‌سایت شما باید در یک زیرمسیر ارائه شود، مانند `https://mywebsite.com/blog/`، در این صورت باید گزینه [`base`](../reference/site-config#base) را به `'/blog/'` در پیکربندی ویت‌پرس تنظیم کنید.

**مثال:** اگر از صفحات GitHub (یا GitLab) استفاده می‌کنید و به `user.github.io/repo/` انتشار می‌دهید، آنگاه `base` را به `/repo/` تنظیم کنید.

## سربرگ‌های حافظه نهان HTTP {#http-cache-headers}

اگر شما کنترلی بر روی سربرگ‌های HTTP در سرور تولیدی خود دارید، می‌توانید سربرگ‌های `cache-control` را پیکربندی کنید تا بهبود عملکرد در بازدیدهای تکراری داشته باشید.

بسیاری از فایل‌های ایستا (مانند JavaScript، CSS و سایر فایل‌های وارد شده که در `public` نیستند) از نام‌های فایل با هش استفاده می‌کنند. اگر پیش‌نمایش تولیدی را با استفاده از تب شبکه ابزارهای توسعه مرورگر خود بررسی کنید، فایل‌هایی مانند `app.4f283b18.js` را خواهید دید.

این هش `4f283b18` از محتوای این فایل تولید شده است. اگر محتوا تغییر کند، URL‌ها نیز تغییر می‌کنند. این به این معنی است که می‌توانید برای این فایل‌ها سربرگ‌های حافظه نهان قدرتمند را استفاده کنید. همه این فایل‌ها در زیردایرکتوری `assets/` در دایرکتوری خروجی قرار می‌گیرند، بنابراین می‌توانید برای آن‌ها سربرگ زیر را پیکربندی کنید:

```
Cache-Control: max-age=31536000,immutable
```

::: details مثال فایل `_headers` برای Netlify

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

توجه: فایل `_headers` باید در [دایرکتوری عمومی](./asset-handling#the-public-directory) قرار گیرد - در این مورد، `docs/public/_headers` - تا کپی شود بطور صحیح به دایرکتوری خروجی.

[مستندات سربرگ‌های سفارشی Netlify](https://docs.netlify.com/routing/headers/)

:::

::: details پیکربندی مثال Vercel در `vercel.json`

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

توجه: فایل `vercel.json` باید در ریشه مخزن شما قرار گیرد.

[مستندات Vercel در مورد پیکربندی سربرگ‌ها](https://vercel.com/docs/concepts/projects/project-configuration#headers)

:::

## راهنمای‌های پلتفرم {#platform-guides}

### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render {#netlify-vercel-cloudflare-pages-aws-amplify-render}

یک پروژه جدید راه‌اندازی کرده و این تنظیمات را با استفاده از داشبورد خود تغییر دهید:

- **دستور ساخت:** `npm run docs:build`
- **دایرکتوری خروجی:** `docs/.vitepress/dist`
- **نسخه Node:** `18` (یا بالاتر)

::: warning هشدار
گزینه‌هایی مانند _Auto Minify_ را برای کد HTML فعال نکنید. این گزینه‌ها ممکن است توضیحاتی را که به Vue معنا دارد، از خروجی حذف کنند. ممکن است خطاهای ناسازگاری را در اجرا ببینید اگر حذف شوند.
:::

### صفحات GitHub {#github-pages}

1. یک فایل به نام `deploy.yml` در دایرکتوری `.github/workflows` پروژه خود ایجاد کنید با محتوایی مانند زیر:

   ```yaml [.github/workflows/deploy.yml]
   # Sample workflow for building and deploying a ویت‌پرس site to GitHub Pages
   #
   name: Deploy ویت‌پرس site to Pages

   on:
     # Runs on pushes targeting the `main` branch. Change this to `master` if you're
     # using the `master` branch as the default branch.
     push:
       branches: [main]

     # Allows you to run this workflow manually from the Actions tab
     workflow_dispatch:

   # Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
   permissions:
     contents: read
     pages: write
     id-token: write

   # Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
   # However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
   concurrency:
     group: pages
     cancel-in-progress: false

   jobs:
     # Build job
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
           with:
             fetch-depth: 0 # Not needed if lastUpdated is not enabled
         # - uses: pnpm/action-setup@v3 # Uncomment this if you're using pnpm
         # - uses: oven-sh/setup-bun@v1 # Uncomment this if you're using Bun
         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: npm # or pnpm / yarn
         - name: Setup Pages
           uses: actions/configure-pages@v4
         - name: Install dependencies
           run: npm ci # or pnpm install / yarn install / bun install
         - name: Build with ویت‌پرس
           run: npm run docs:build # or pnpm docs:build / yarn docs:build / bun run docs:build
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: docs/.vitepress/dist

     # Deployment job
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

::: warning هشدار
   مطمئن شوید که گزینه `base` در ویت‌پرس به‌درستی پیکربندی شده است. برای اطلاعات بیشتر به [تنظیم مسیر پایه عمومی](#setting-a-public-base-path) مراجعه کنید.
   :::

2. در تنظیمات مخزن خود در زیرمنوی "Build and deployment > Source" در "Github Actions"  را انتخاب کنید.

3. تغییرات خود را به شاخه `main` ارسال کنید و منتظر GitHub Actions workflow بمانید. شما باید وب‌سایت خود را در `https://<username>.github.io/[repository]/` یا `https://<custom-domain>/` بسته به تنظیمات خود دیده شده است. وب‌سایت شما به‌طور خودکار در هر بار فشرده‌سازی به شاخه `main` ارسال می‌شود.

### صفحات GitLab {#gitlab-pages}

1. `outDir` را در پیکربندی ویت‌پرس به `../public` تنظیم کنید. گزینه `base` را به `'/<repository>/'` تنظیم کنید اگر می‌خواهید در `https://<username>.gitlab.io/<repository>/` انتشار دهید.

2. یک فایل به نام `.gitlab-ci.yml` در ریشه پروژه خود با محتوای زیر ایجاد کنید. این کار به ساخت و انتشار وب‌سایت شما هر زمانی که تغییری در محتوا ایجاد می‌کنید، می‌پردازد:

   ```yaml [.gitlab-ci.yml]
   image: node:18
   pages:
     cache:
       paths:
         - node_modules/
     script:
       # - apk add git # Uncomment this if you're using small docker images like alpine and have lastUpdated enabled
       - npm install
       - npm run docs:build
     artifacts:
       paths:
         - public
     only:
       - main
   ```

### Azure Static Web Apps {#azure-static-web-apps}

1. دستورالعمل [رسمی](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration) را دنبال کنید.

2. این مقادیر را در فایل پیکربندی خود تنظیم کنید (و مواردی که نیازی به آن‌ها ندارید، مانند `api_location` را حذف کنید):

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### Firebase {#firebase}

1. فایل‌های `firebase.json` و `.firebaserc` را در ریشه پروژه خود ایجاد کنید:

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

2. بعد از اجرای `npm run docs:build`، دستور زیر را برای انتشار اجرا کنید:

   ```sh
   firebase deploy
   ```

### Surge {#surge}

1. بعد از اجرای `npm run docs:build`، دستور زیر را برای انتشار اجرا کنید:

   ```sh
   npx surge docs/.vitepress/dist
   ```

### Heroku {#heroku}

1. دستورالعمل و راهنماها را در [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static) دنبال کنید.

2. یک فایل به نام `static.json` در ریشه پروژه خود با محتوای زیر ایجاد کنید:

   ```json [static.json]
   {
     "root": "docs/.vitepress/dist"
   }
   ```

### Edgio {#edgio}

به [ایجاد و انتشار یک برنامه ویت‌پرس در Edgio](https://docs.edg.io/guides/vitepress) مراجعه کنید.

### Kinsta Static Site Hosting {#kinsta-static-site-hosting}

شما می‌توانید وب‌سایت ویت‌پرس خود را بر روی [Kinsta](https://kinsta.com/static-site-hosting/) با دنبال کردن این [دستورالعمل‌ها](https://kinsta.com/docs/vitepress-static-site-example/) انتشار دهید.

### Stormkit

شما می‌توانید پروژه ویت‌پرس خود را به [Stormkit](https://www.stormkit.io) با دنبال کردن این [دستورالعمل‌ها](https://stormkit.io/blog/how-to-deploy-vitepress) انتشار دهید.

### Nginx

اینجا یک مثال از پیکربندی بلوک سرور Nginx است. این تنظیم شامل فشرده‌سازی gzip برای فایل‌های متن معمولی، قوانین برای سرویس فایل‌های ایستا سایت ویت‌پرس شما با هدرهای مناسب برای حافظه‌نگهداری مناسب است و همچنین مدیریت `cleanUrls: true` می‌کند.

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

این پیکربندی فرض می‌کند که سایت ویت‌پرس ساخته شده شما در دایرکتوری `/app` در سرور شما قرار دارد. دستورالعمل `root` را از ابزارهای مربوطه استفاده کنید اگر فایل‌های سایت شما در جای دیگری قرار دارد.

::: warning هشدار
مسیر تنظیمات try_files نباید به طور پیش‌فرض به index.html مانند برنامه‌های دیگر Vue مشخص شود. این کار باعث وضعیت نامعتبر صفحه می‌شود.
:::

اطلاعات بیشتر را در [مستندات رسمی nginx](https://nginx.org/en/docs/)، در این مسائل [#2837](https://github.com/vuejs/vitepress/discussions/2837)، [#3235](https://github.com/vuejs/vitepress/issues/3235) و همچنین در این [پست وبلاگ](https://blog.mehdi.cc/articles/vitepress-cleanurls-on-nginx-environment#readings) از Mehdi Merah پیدا کنید.
