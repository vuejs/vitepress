---
outline: deep
description: Netlify, Vercel, GitHub Pages 등 인기 있는 플랫폼에 VitePress 사이트를 배포하세요.
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

## 재배치 가능한 빌드 (상대 경로 기준) {#relocatable-builds-relative-base}

빌드 시점에 사이트의 최종 URL을 알 수 없는 경우(IPFS 게이트웨이(`https://gateway/ipfs/<cid>/…`), Wayback Machine, 공유 폴더, 앱에 번들로 포함된 문서 등)에는 `base`를 `'./'`로 설정하세요:

```ts
export default {
  base: './'
}
```

이렇게 하면 모든 페이지가 에셋과 다른 페이지를 자신의 위치 기준 상대 경로로 참조하고, 클라이언트 런타임이 페이지 로드 시 실제 마운트 지점을 복원합니다. 동일한 빌드를 재빌드 없이 **어떤** 서브 경로에서든(여러 경로에서 동시에도) 사용할 수 있으며, 라우팅, 검색, 프리페칭이 모두 정상적으로 동작합니다.

생성된 HTML 파일을 파일 시스템(`file://`)에서 바로 열어도 스타일이 적용되고 완전히 탐색 가능한 정적 사이트로 동작합니다. 브라우저는 `file://`에서 JavaScript 모듈을 차단하므로 이 경우 하이드레이션은 없습니다. 검색 같은 인터랙티브 기능은 비활성화되지만, 사전 렌더링된 콘텐츠와 링크는 모두 계속 동작합니다.

알아두어야 할 몇 가지 사항:

- [`cleanUrls`](../reference/site-config#cleanurls)는 끈 상태(기본값)를 유지하세요. 이식 가능한 출력물에는 `.html`로 끝나는 링크가 필요합니다. 예쁜 URL로 재작성해 줄 서버가 없기 때문입니다.
- `404.html`은 루트 깊이에 대해 생성됩니다. 임의로 깊은 URL의 폴백으로 이를 제공하는 호스트에서는 스타일 없이 렌더링됩니다(알 수 없는 깊이에는 올바른 상대 경로 접두사가 없기 때문입니다).
- [`head`](../reference/site-config#head) 항목은 항상 그대로 출력되므로, `/favicon.ico` 같은 루트 절대 경로는 피하고 절대 URL이나 `transformHead`를 사용하세요.
- Markdown 안의 원시 HTML `<a>` 태그는 `href`를 작성한 그대로 유지하므로, 사이트 절대 링크에는 Markdown 링크 문법을 사용하세요(내장 `<img>` 소스는 에셋 파이프라인을 거치므로 처리됩니다).
- [`createContentLoader`](./data-loading#createcontentloader) 콘텐츠가 생성한 링크는 사이트 절대 경로로 유지됩니다(HTML이 다른 페이지에 내장되므로 단일한 올바른 상대 경로 접두사가 없습니다). 루트 마운트에서만 해석됩니다.
- 페이지는 정규 URL로 제공하세요. 루트는 `/dir/`(`/dir`이 아님)로, 페이지 URL에는 후행 슬래시를 추가하지 마세요. 상대 경로 접두사는 브라우저에 실제로 표시되는 URL을 기준으로 해석되며, 사실상 모든 정적 호스트가 이미 이런 방식으로 정규화합니다.
- 개발 서버는 항상 `/`에서 제공됩니다. 상대 경로 동작은 프로덕션 빌드에 적용됩니다.

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

### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render {#generic}

새 프로젝트를 설정하고 대시보드를 사용하여 다음 설정을 변경하세요:

- **빌드 명령어:** `npm run docs:build`
- **출력 디렉토리:** `docs/.vitepress/dist`
- **노드 버전:** `20` (또는 그 이상)

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
           uses: actions/checkout@v5
           with:
             fetch-depth: 0 # lastUpdated가 활성화되지 않은 경우 필요하지 않음
         # - uses: pnpm/action-setup@v4 # pnpm을 사용하는 경우 주석 해제
         #   with:
         #     version: 9
         # - uses: oven-sh/setup-bun@v1 # Bun을 사용하는 경우 주석 해제
         - name: Setup Node
           uses: actions/setup-node@v6
           with:
             node-version: 24
             cache: npm # 또는 pnpm / yarn
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
   image: node:24
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

### Azure

1. [공식 문서](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration)를 따르세요.

2. 구성 파일에 다음 값을 설정하세요(필요하지 않은 값들, 예를 들어 `api_location` 같은 것은 제거하세요):

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### CloudRay

[CloudRay](https://cloudray.io/)로 VitePress 프로젝트를 배포하려면 이 [지침](https://cloudray.io/articles/how-to-deploy-vitepress-site)을 따르세요.

### Firebase

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

### Heroku

1. [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static)에 제공된 문서와 가이드를 따르세요.

2. 프로젝트 루트에 아래 내용을 포함한 `static.json` 파일을 생성하세요:

   ```json [static.json]
   {
     "root": "docs/.vitepress/dist"
   }
   ```

### Hostinger

[Hostinger](https://www.hostinger.com/web-apps-hosting)로 VitePress 프로젝트를 배포하려면 이 [지침](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)을 따르세요. 빌드 설정을 구성할 때 프레임워크로 VitePress를 선택하고 루트 디렉터리를 `./docs`로 조정하세요.

### Lizard

[Lizard (lizard.build)](https://lizard.build)는 소스에서 VitePress 사이트를 빌드하고 생성된 HTML을 제공합니다. 이 가이드의 레이아웃에서는 `docs:build`를 감지하여 `docs/.vitepress/dist`를 `80` 포트에서 제공합니다.

[Lizard CLI](https://lizard.build/docs/cli)를 설치하고 `lizard login`으로 로그인하세요. 로컬 소스 디렉토리를 배포하려면 `package.json`이 있는 프로젝트 루트에서 다음 명령어를 실행하세요:

```sh
lizard init --name vitepress-docs
lizard add --service web
lizard up --service web --port 80
```

자동 감지를 사용하려면 빌드 및 시작 명령어 재정의를 비워 두세요. GitHub 배포나 다른 레이아웃은 [Lizard VitePress 가이드](https://lizard.build/docs/framework-guides/vitepress)를 참고하세요.

### Pethost

[Pethost](https://pethost.dev)는 소스에서 VitePress 사이트를 빌드하고 HTTPS로 제공합니다.

[Pethost CLI](https://pethost.dev/docs/cli/)를 설치하고, `package.json`이 있는 프로젝트 루트에서 다음 명령어를 실행하세요:

```sh
pethost deploy
```

`vitepress build`를 실행하는 스크립트를 찾아 이를 실행하고 `docs/.vitepress/dist`를 제공하는 `Dockerfile`을 작성한 뒤 사이트 주소를 출력합니다. GitHub 배포와 커스텀 도메인은 [Pethost VitePress 가이드](https://pethost.dev/blog/deploy-vitepress-site/)를 참고하세요.

### Stormkit

[VitePress](https://stormkit.io) 프로젝트를 [Stormkit](https://www.stormkit.io)에 배포하려면 이 [지침](https://stormkit.io/blog/how-to-deploy-vitepress)을 따르세요.

### Surge

`npm run docs:build`를 실행한 후, [Surge](https://surge.sh)에 배포하기 위해 이 명령어를 실행하세요:

```sh
npx surge docs/.vitepress/dist
```

### deed.page

`npm run docs:build`를 실행한 후, 출력 폴더를 압축하여 하나의 HTTP `PUT`으로 [deed.page](https://deed.page)에 업로드하세요. 계정이 필요하지 않습니다:

```sh
tar -C docs/.vitepress/dist -czf site.tar.gz .
curl -T site.tar.gz "https://deed.page/v1/sites?slug=my-docs"
```

응답에는 라이브 `https://my-docs.deed.page/` URL과 토큰이 포함됩니다. 같은 슬러그에 업데이트를 게시하려면 토큰을 `Authorization: Bearer <token>`으로 보내세요. 한 번의 업로드는 4MB로 제한되므로, 더 큰 빌드는 [deed.page 문서](https://deed.page/docs)에 설명된 매니페스트 업로드를 사용합니다.

### harvis

`npm run docs:build`를 실행한 후, [harvis](https://harvis.dev)에 배포하기 위해 이 명령어를 실행하세요:

```sh
npx harvis docs/.vitepress/dist
```

### nginx

다음은 nginx 서버 블록 구성의 예입니다. 이 설정은 일반적인 텍스트 기반 에셋에 대한 gzip 압축, VitePress 사이트의 정적 파일을 적절한 캐싱 헤더와 함께 제공하는 규칙 및 `cleanUrls: true`를 처리하는 규칙을 포함합니다.

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
