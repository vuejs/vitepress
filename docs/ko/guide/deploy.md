---
outline: deep
---

# VitePress 사이트 배포하기 {#deploy-your-vitepress-site}

다음 가이드는 몇 가지 공유된 가정을 바탕으로 합니다:

- VitePress 사이트는 프로젝트의 `docs` 디렉토리 안에 있습니다.
- 기본 빌드 출력 디렉토리(`.vitepress/dist`)를 사용하고 있습니다.
- VitePress를 프로젝트의 로컬 의존성으로 설치했으며, `package.json`에 다음 스크립트를 설정했습니다:

  ```json
  {
    "scripts": {
      "docs:build": "vitepress build docs",
      "docs:preview": "vitepress preview docs"
    }
  }
  ```

## 로컬에서 빌드하고 테스트하기 {#build-and-test-locally}

1. 이 명령어를 실행하여 문서를 빌드합니다:

   ```sh
   $ npm run docs:build
   ```

2. 빌드가 완료되면, 다음 명령어를 실행하여 로컬에서 미리보기를 합니다:

   ```sh
   $ npm run docs:preview
   ```

   `preview` 명령어는 `.vitepress/dist` 출력 디렉토리를 `http://localhost:4173`에서 제공하는 로컬 정적 웹 서버를 부팅합니다. 이를 사용하여 프로덕션에 푸시하기 전에 모든 것이 잘 보이는지 확인할 수 있습니다.

3. `--port` 인수를 전달하여 서버의 포트를 구성할 수 있습니다.

   ```json
   {
     "scripts": {
       "docs:preview": "vitepress preview docs --port 8080"
     }
   }
   ```

   이제 `docs:preview` 메소드가 `http://localhost:8080`에서 서버를 시작합니다.

## public 기본 경로 설정하기 {#setting-a-public-base-path}

기본적으로, 사이트가 도메인의 루트 경로(`/`)에서 배포될 것으로 가정합니다. 사이트가 하위 경로, 예를 들어 `https://mywebsite.com/blog/`에서 제공되는 경우, VitePress 구성에서 [`base`](../reference/site-config#base) 옵션을 `'/blog/'`로 설정해야 합니다.

**예:** GitHub(또는 GitLab) 페이지를 사용하여 `user.github.io/repo/`로 배포하는 경우, `base`를 `/repo/`로 설정하세요.

## HTTP 캐시 헤더 {#http-cache-headers}

프로덕션 서버에서 HTTP 헤더를 제어할 수 있다면, 반복 방문 시 성능을 향상시키기 위해 `cache-control` 헤더를 구성할 수 있습니다.

프로덕션 빌드는 정적 자산(JavaScript, CSS, `public`에 있지 않은 다른 가져온 자산)을 위해 해시된 파일 이름을 사용합니다. 브라우저 개발 도구의 네트워크 탭을 사용하여 프로덕션 미리보기를 검사하면, `app.4f283b18.js`와 같은 파일을 볼 수 있습니다.

이 `4f283b18` 해시는 이 파일의 내용에서 생성됩니다. 같은 해시된 URL은 항상 동일한 파일 내용을 제공하도록 보장됩니다 - 내용이 변경되면 URL도 변경됩니다. 이는 이러한 파일에 대해 가장 강력한 캐시 헤더를 안전하게 사용할 수 있음을 의미합니다. 이러한 모든 파일이 출력 디렉토리의 `assets/` 아래에 배치되므로, 그들을 위해 다음 헤더를 구성할 수 있습니다:

```
Cache-Control: max-age=31536000,immutable
```

::: details Netlify `_headers` 파일 예시

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

참고: `_headers` 파일은 [public 디렉토리](./asset-handling#the-public-directory)에 배치해야 합니다 - 우리의 경우, `docs/public/_headers` - 출력 디렉토리에 그대로 복사되도록 하기 위해서입니다.

[Netlify 사용자 정의 헤더 문서](https://docs.netlify.com/routing/headers/)

:::

::: details `vercel.json` 내의 Vercel 설정 예시

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

참고: `vercel.json` 파일은 **리포지토리**의 루트에 위치해야 합니다.

[Vercel 헤더 설정에 대한 문서](https://vercel.com/docs/concepts/projects/project-configuration#headers)

:::

## 플랫폼 가이드 {#platform-guides}

### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render

새 프로젝트를 설정하고 대시보드를 사용하여 이 설정을 변경하세요:

- **빌드 명령어:** `npm run docs:build`
- **출력 디렉토리:** `docs/.vitepress/dist`
- **노드 버전:** `18` (또는 그 이상)

::: warning
HTML 코드에 대해 _Auto Minify_와 같은 옵션을 활성화하지 마세요. Vue에 의미를 가진 주석이 제거될 수 있습니다. 제거되면 수화 불일치 오류가 발생할 수 있습니다.
:::

### GitHub Pages

1. 프로젝트의 `.github/workflows` 디렉토리 안에 `deploy.yml`이라는 파일을 생성하고 다음과 같은 내용을 넣으세요:

   ```yaml
   # GitHub Pages에 VitePress 사이트를 빌드하고 배포하기 위한 샘플 워크플로우
   #
   name: Deploy VitePress site to Pages

   on:
     # `main` 브랜치를 대상으로 하는 푸시에 대해 실행합니다. 기본 브랜치로 `master`를
     # 사용하는 경우, 이를 `master`로 변경하세요.
     push:
       branches: [main]

     # Actions 탭에서 이 워크플로우를 수동으로 실행할 수 있도록 허용합니다.
     workflow_dispatch:

   # GitHub Pages에 배포를 허용하기 위해 GITHUB_TOKEN의 권한을 설정합니다.
   permissions:
     contents: read
     pages: write
     id-token: write

   # 동시에 하나의 배포만 허용하며, 진행 중인 실행과 최신 대기열 사이에 대기열에 있는 실행을 건너뛰기.
   # 그러나, 이러한 프로덕션 배포를 완료하도록 진행 중인 실행을 취소하지는 마세요.
   concurrency:
     group: pages
     cancel-in-progress: false

   jobs:
     # 빌드 작업
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
           with:
             fetch-depth: 0 # lastUpdated가 활성화되어 있지 않다면 필요 없습니다
         # - uses: pnpm/action-setup@v3 # pnpm을 사용하는 경우 이것을 주석 해제하세요
         # - uses: oven-sh/setup-bun@v1 # Bun을 사용하는 경우 이것을 주석 해제하세요
         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: npm # 또는 pnpm / yarn
         - name: Setup Pages
           uses: actions/configure-pages@v4
         - name: Install dependencies
           run: npm ci # 또는 pnpm install / yarn install / bun install
         - name: Build with VitePress
           run: npm run docs:build # 또는 pnpm docs:build / yarn docs:build / bun run docs:build
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: docs/.vitepress/dist

     # 배포 작업
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
   VitePress의 `base` 옵션이 제대로 구성되어 있는지 확인하세요. 자세한 내용은 [public 기본 경로 설정하기](#setting-a-public-base-path)를 참조하세요.
   :::

2. 저장소 설정에서 "Pages" 메뉴 항목 아래 "빌드 및 배포 > 출처"에서 "GitHub Actions"를 선택하세요.

3. `main` 브랜치에 변경 사항을 푸시하고 GitHub Actions 워크플로우가 완료되기를 기다리세요. 설정에 따라 사이트가 `https://<username>.github.io/[repository]/` 또는 `https://<custom-domain>/`에 배포된 것을 볼 수 있습니다. `main` 브랜치에 푸시할 때마다 사이트가 자동으로 배포됩니다.

### GitLab Pages

1. VitePress 구성에서 `outDir`을 `../public`으로 설정합니다. `https://<username>.gitlab.io/<repository>/`에 배포하려면 `base` 옵션을 `'/<repository>/'`로 구성하세요.

2. 변경 사항을 적용할 때마다 사이트를 빌드하고 배포하도록 하기 위해 프로젝트의 루트에 다음 내용을 가진 `.gitlab-ci.yml` 파일을 생성하세요:

   ```yaml
   image: node:18
   pages:
     cache:
       paths:
         - node_modules/
     script:
       # - apk add git # lastUpdated가 활성화되어 있고 alpine과 같은 작은 도커 이미지를 사용하는 경우 이것을 주석 해제하세요
       - npm install
       - npm run docs:build
     artifacts:
       paths:
         - public
     only:
       - main
   ```

### Azure 정적 Web 앱 {#azure-static-web-apps}

1. [공식 문서](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration)를 따르세요.

2. 구성 파일에 이 값을 설정하세요(필요하지 않은 값들, 예를 들어 `api_location` 같은 것은 제거하세요):

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### Firebase {#firebase}

1. 프로젝트의 루트에 `firebase.json`과 `.firebaserc`를 생성하세요:

   `firebase.json`:

   ```json
   {
     "hosting": {
       "public": "docs/.vitepress/dist",
       "ignore": []
     }
   }
   ```

   `.firebaserc`:

   ```json
   {
     "projects": {
       "default": "<YOUR_FIREBASE_ID>"
     }
   }
   ```

2. `npm run docs:build`를 실행한 후, 배포하려면 이 명령어를 실행하세요:

   ```sh
   firebase deploy
   ```

### Surge

1. `npm run docs:build`를 실행한 후, 배포하기 위해 이 명령어를 실행하세요:

   ```sh
   npx surge docs/.vitepress/dist
   ```

### Heroku

1. [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static)에 주어진 문서 및 가이드를 따르세요.

2. 프로젝트의 루트에 아래 내용을 가진 `static.json` 파일을 생성하세요:

   ```json
   {
     "root": "docs/.vitepress/dist"
   }
   ```

### Edgio

[Edgio에 VitePress 앱 생성 및 배포하기](https://docs.edg.io/guides/vitepress)를 참조하세요.

### Kinsta 정적 사이트 호스팅 {#kinsta-static-site-hosting}

[Kinsta](https://kinsta.com/static-site-hosting/)에서 VitePress 웹사이트를 배포하는 방법은 [이 지침](https://kinsta.com/docs/vitepress-static-site-example/)을 따르세요.

### 스톰킷

VitePress 프로젝트를 [Stormkit](https://www.stormkit.io)에 배포하려면 이 [지침](https://stormkit.io/blog/how-to-deploy-vitepress)을 따르세요.

### Nginx

다음은 Nginx 서버 블록 구성의 예입니다. 이 설정에는 일반적인 텍스트 기반 자산에 대한 gzip 압축, 적절한 캐싱 헤더로 VitePress 사이트의 정적 파일을 제공하는 규칙, `cleanUrls: true`를 처리하는 규칙이 포함되어 있습니다.

```nginx
server {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    listen 80;
    server_name _;
    index index.html;

    location / {
        # 내용 위치
        root /app;

        # 정확한 일치 -> 깨끗한 URL로 처리 -> 폴더 -> 찾을 수 없음
        try_files $uri $uri.html $uri/ =404;

        # 존재하지 않는 페이지
        error_page 404 /404.html;

        # index.html이 없는 폴더는 이 설정에서 403을 발생시킴
        error_page 403 /404.html;

        # 캐싱 헤더 조정
        # assets 폴더의 파일은 해시 파일 이름을 가짐
        location ~* ^/assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

이 구성은 빌드된 VitePress 사이트가 서버상의 `/app` 디렉토리에 위치한다고 가정합니다. 사이트 파일이 다른 곳에 위치한 경우 `root` 지시문을 그에 맞게 조정하세요.

::: warning index.html을 기본값으로 설정하지 마세요.
try_files 해결은 다른 Vue 애플리케이션처럼 index.html로 기본 설정되어서는 안 됩니다. 이것은 유효하지 않은 페이지 상태로 이어질 것입니다.
:::

추가 정보는 [공식 nginx 문서](https://nginx.org/en/docs/), 이슈 [#2837](https://github.com/vuejs/vitepress/discussions/2837), [#3235](https://github.com/vuejs/vitepress/issues/3235) 그리고 Mehdi Merah의 [블로그 포스트](https://blog.mehdi.cc/articles/vitepress-cleanurls-on-nginx-environment#readings)에서 찾을 수 있습니다.
