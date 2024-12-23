---
outline: deep
---

# VitePress 사이트 배포하기 {#deploy-your-vitepress-site}

다음 가이드는 몇 가지 공통된 가정을 기반으로 합니다:

- VitePress 사이트는 프로젝트의 `docs` 디렉토리 안에 있다.
- 기본 빌드 출력 디렉토리(`.vitepress/dist`)를 사용하고 있다.
- VitePress는 프로젝트의 로컬 종속성으로 설치되어 있으며, `package.json`에 다음 스크립트가 설정되어 있다:

  ```json [package.json]
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

   `preview` 명령은 출력 디렉토리 `.vitepress/dist`를 `http://localhost:4173`에서 제공할 것입니다. 이를 사용하여 프로덕션에 푸시하기 전에 모든 것이 잘 보이는지 확인할 수 있습니다.

3. `--port` 인자를 전달하여 서버의 포트를 구성할 수 있습니다.

   ```json
   {
     "scripts": {
       "docs:preview": "vitepress preview docs --port 8080"
     }
   }
   ```

   이제 `docs:preview` 메서드가 `http://localhost:8080`에서 서버를 시작합니다.

## public 기본 경로 설정하기 {#setting-a-public-base-path}

기본적으로 사이트가 도메인의 루트 경로(`/`)에 배포된다고 가정합니다. 예를 들어 사이트가 `https://mywebsite.com/blog/` 와 같은 서브 경로에서 제공될 경우, VitePress 구성에서 [`base`](../reference/site-config#base) 옵션을 `'/blog/'`로 설정해야 합니다.

**예**: Github(또는 GitLab) Pages를 사용하여 `user.github.io/repo/`에 배포하는 경우, `base`를 `/repo/`로 설정하세요.

## HTTP 캐시 헤더 {#http-cache-headers}

프로덕션 서버에서 HTTP 헤더를 제어할 수 있다면, 반복 방문 시 더 나은 성능을 위해 `cache-control` 헤더를 구성할 수 있습니다.

프로덕션 빌드는 정적 자산(JavaScript, CSS, `public`가 아닌 곳에서 가져온 에셋)에 대해 해시된 파일 이름을 사용합니다. 브라우저 개발 도구의 네트워크 탭을 사용하여 프로덕션 미리보기를 검사하면 `app.4f283b18.js`와 같은 파일을 볼 수 있습니다.

이 `4f283b18` 해시는 파일의 내용에서 생성됩니다. 동일한 해시된 URL은 동일한 파일 내용을 제공할 것이 보장되며, 내용이 변경되면 URL도 변경됩니다. 이는 이러한 파일에 대해 가장 강력한 캐시 헤더를 안전하게 사용할 수 있음을 의미합니다. 모든 이러한 파일은 출력 디렉토리의 `assets/` 아래에 배치되므로, 다음 헤더를 구성할 수 있습니다:

```
Cache-Control: max-age=31536000,immutable
```

::: details Netlify `_headers` 파일 예시

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

참고: `_headers` 파일은 [public 디렉토리](./asset-handling#the-public-directory)에 배치해야 합니다. 이 경우 `docs/public/_headers`에 위치하여 출력 디렉토리에 그대로 복사됩니다.

[Netlify 커스텀 헤더 문서](https://docs.netlify.com/routing/headers/)

:::

::: details Vercel 내의 `vercel.json` 구성 예시

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

참고: `vercel.json` 파일은 **리포지토리**의 루트에 배치해야 합니다.

[Vercel 헤더 구성에 대한 문서](https://vercel.com/docs/concepts/projects/project-configuration#headers)

:::

## 플랫폼 가이드 {#platform-guides}

### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render

새 프로젝트를 설정하고 대시보드를 사용하여 다음 설정을 변경하세요:

- **빌드 명령어:** `npm run docs:build`
- **출력 디렉토리:** `docs/.vitepress/dist`
- **노드 버전:** `18` (또는 그 이상)

::: warning
HTML 코드에 대해 _Auto Minify_ 옵션을 활성화하지 마세요. 이는 Vue에 의미가 있는 주석을 출력에서 제거할 것입니다. 제거되면 하이드레이션 불일치 오류가 발생할 수 있습니다.
:::

### GitHub Pages

1. 프로젝트의 `.github/workflows` 디렉토리 안에 `deploy.yml`이라는 파일을 만들고 다음과 같은 내용을 추가하세요:

   ```yaml [.github/workflows/deploy.yml]
   # VitePress 사이트를 GitHub Pages에 빌드하고 배포하는 샘플 워크플로우
   #
   name: VitePress 사이트를 Pages에 배포

   on:
     # `main` 브랜치를 대상으로 하는 푸시에서 실행됩니다. 기본 브랜치로 `master`를 사용하는 경우 여기를 `master`로 변경하세요.
     push:
       branches: [main]

     # Actions 탭에서 이 워크플로우를 수동으로 실행할 수 있게 합니다.
     workflow_dispatch:

   # GitHub Pages에 배포할 수 있도록 GITHUB_TOKEN의 권한을 설정합니다.
   permissions:
     contents: read
     pages: write
     id-token: write

   # 진행 중인 실행과 마지막으로 대기 중인 실행 사이에 대기 중인 실행을 건너뛰어 하나의 동시 배포만 허용합니다.
   # 그러나 이러한 프로덕션 배포가 완료되도록 진행 중인 실행은 취소하지 않습니다.
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
             fetch-depth: 0 # lastUpdated가 활성화되지 않은 경우 필요하지 않음
         # - uses: pnpm/action-setup@v3 # pnpm을 사용하는 경우 주석 해제
         #   with:
         #     version: 9
         # - uses: oven-sh/setup-bun@v1 # Bun을 사용하는 경우 주석 해제
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
   VitePress의 `base` 옵션이 제대로 구성되어 있는지 확인하세요. 자세한 내용은 [public 기본 경로 설정하기](#setting-a-public-base-path)를 참고하세요.
   :::

2. 리포지토리 설정의 "Pages" 메뉴 항목에서 "Build and deployment > Source"에서 "GitHub Actions"를 선택하세요.

3. 변경 사항을 `main` 브랜치에 푸시하고 GitHub Actions 워크플로우가 완료될 때까지 기다립니다. 설정에 따라 사이트가 `https://<username>.github.io/[repository]/` 또는 `https://<custom-domain>/`에 배포된 것을 볼 수 있습니다. 사이트는 `main` 브랜치에 푸시할 때마다 자동으로 배포됩니다.

### GitLab Pages

1. VitePress 구성에서 `outDir`을 `../public`으로 설정하세요. `https://<username>.gitlab.io/<repository>/`에 배포하려면 `base` 옵션을 `'/<repository>/'`로 구성하세요. 커스텀 도메인, 유저 또는 그룹 페이지에 배포하거나 GitLab에서 "Use unique domain" 설정이 활성화된 경우에는 `base`가 필요하지 않습니다.

2. 변경 사항을 적용할 때마다 사이트를 빌드하고 배포하도록 하기 위해 프로젝트의 루트에 다음 내용을 가진 `.gitlab-ci.yml` 파일을 생성하세요:

   ```yaml [.gitlab-ci.yml]
   image: node:18
   pages:
     cache:
       paths:
         - node_modules/
     script:
       # - apk add git # alpine 과 같은 작은 도커 이미지를 사용하고 있고 lastUpdated 가 활성화된 경우 주석 처리를 제거하세요.
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

2. 구성 파일에 다음 값을 설정하세요(필요하지 않은 값들, 예를 들어 `api_location` 같은 것은 제거하세요):

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### Firebase {#firebase}

1. 프로젝트 루트에 `firebase.json`과 `.firebaserc`를 생성하세요:

   `firebase.json`:

   ```json  [firebase.json]
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

1. [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static)에 제공된 문서와 가이드를 따르세요.

2. 프로젝트 루트에 아래 내용을 포함한 `static.json` 파일을 생성하세요:

   ```json [static.json]
   {
     "root": "docs/.vitepress/dist"
   }
   ```

### Edgio

[Edgio에 VitePress 앱 생성 및 배포하기](https://docs.edg.io/guides/vitepress)를 참고하세요.

### Kinsta 정적 사이트 호스팅 {#kinsta-static-site-hosting}

[VitePress](https://kinsta.com/static-site-hosting/) 웹사이트를 [Kinsta](https://kinsta.com/static-site-hosting/)에 배포하려면 이 [지침](https://kinsta.com/docs/vitepress-static-site-example/)을 따르세요.

### Stormkit

[VitePress](https://stormkit.io) 프로젝트를 [Stormkit](https://www.stormkit.io)에 배포하려면 이 [지침](https://stormkit.io/blog/how-to-deploy-vitepress)을 따르세요.

### Nginx

다음은 Nginx 서버 블록 구성의 예입니다. 이 설정은 일반적인 텍스트 기반 에셋에 대한 gzip 압축, VitePress 사이트의 정적 파일을 적절한 캐싱 헤더와 함께 제공하는 규칙 및 `cleanUrls: true`를 처리하는 규칙을 포함합니다.

```nginx
server {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    listen 80;
    server_name _;
    index index.html;

    location / {
        # 콘텐츠 위치
        root /app;

        # 정확히 일치하는 파일 -> 정제된 URL로 역방향 매핑 -> 폴더 -> 파일 없음
        try_files $uri $uri.html $uri/ =404;

        # 존재하지 않는 페이지
        error_page 404 /404.html;

        # index.html이 없는 폴더는 이 설정에서 403 오류를 발생시킴
        error_page 403 /404.html;

        # 캐싱 헤더 조정
        # assets 폴더의 파일들은 해시된 파일명 사용
        location ~* ^/assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

이 구성은 빌드된 VitePress 사이트가 서버의 `/app` 디렉토리에 위치한다고 가정합니다. 사이트 파일이 다른 곳에 위치한 경우 `root` 지시문을 적절하게 조정하세요.

::: warning index.html을 기본값으로 설정하지 마세요.
try_files는 다른 Vue 애플리케이션처럼 index.html을 기본값으로 할 수 없습니다. 이는 페이지 상태가 유효하지 않게 만듭니다.
:::

추가 정보는 [공식 nginx 문서](https://nginx.org/en/docs/), 이슈 [#2837](https://github.com/vuejs/vitepress/discussions/2837), [#3235](https://github.com/vuejs/vitepress/issues/3235) 및 Mehdi Merah의 [블로그 포스트](https://blog.mehdi.cc/articles/vitepress-cleanurls-on-nginx-environment#readings)에서 확인할 수 있습니다.
