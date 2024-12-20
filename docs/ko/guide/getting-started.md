
# 시작하기 {#getting-started}

## 온라인에서 사용해보기 {#try-it-online}

[StackBlitz](https://vitepress.new)에서 브라우저로 즉시 VitePress를 사용해 볼 수 있습니다.

## 설치 {#installation}

### 사전 준비 사항 {#prerequisites}

- [Node.js](https://nodejs.org/) 버전 18 이상.
- VitePress를 명령줄 인터페이스(CLI)를 통해 접근하기 위한 터미널.
- [마크다운](https://en.wikipedia.org/wiki/Markdown) 문법 지원이 있는 텍스트 에디터.
  - [VSCode](https://code.visualstudio.com/)와 [공식 Vue 확장 프로그램](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 사용을 권장합니다.

VitePress는 단독으로 사용하거나 기존 프로젝트에 설치할 수 있습니다. 두 경우 모두 다음과 같이 설치할 수 있습니다:

::: code-group

```sh [npm]
$ npm add -D vitepress
```

```sh [pnpm]
$ pnpm add -D vitepress
```

```sh [yarn]
$ yarn add -D vitepress
```

```sh [yarn (pnp)]
$ yarn add -D vitepress vue
```

```sh [bun]
$ bun add -D vitepress
```

:::

::: details "missing peer deps" 경고가 표시되나요?
PNPM을 사용하는 경우 `@docsearch/js`에 대한 "missing peer deps" 경고가 표시됩니다. 이는 VitePress가 작동하는 것을 방해하지 않습니다. 이 경고를 억제하려면 `package.json`에 다음을 추가합니다:

```json
"pnpm": {
  "peerDependencyRules": {
    "ignoreMissing": [
      "@algolia/client-search",
      "search-insights"
    ]
  }
}
```

:::

::: tip 참고

VitePress는 ESM 전용 패키지입니다. `require()`를 사용하여 가져오지 마시고, `package.json`에 `"type": "module"`이 포함되어 있는지 확인하거나, 관련 파일(예: `.vitepress/config.js`)의 확장자를 `.mjs`/`.mts`로 변경하세요. 자세한 내용은 [Vite 문제 해결 가이드](http://vitejs.dev/ko/guide/troubleshooting.html#this-package-is-esm-only)를 참고하세요. 또한, 비동기 CJS 컨텍스트에서는 `await import('vitepress')`를 사용할 수 있습니다.

:::

### 설정 마법사 {#setup-wizard}

VitePress는 기본 프로젝트를 구축하는 데 도움이 되는 명령줄 설정 마법사를 제공합니다. 설치 후, 마법사를 시작하려면 다음을 실행하세요:

::: code-group

```sh [npm]
$ npx vitepress init
```

```sh [pnpm]
$ pnpm vitepress init
```

```sh [yarn]
$ yarn vitepress init
```

```sh [bun]
$ bun vitepress init
```

:::

몇 가지 간단한 질문들이 나타날 것입니다:

<<< @/snippets/init.ansi

::: tip 피어 의존성으로서의 Vue
커스텀을 위해 Vue 컴포넌트나 API를 사용하려는 경우, `vue`를 명시적으로 의존성으로 설치해야 합니다.
:::

## 파일 구조 {#file-structure}

독립형 VitePress 사이트를 구축하려는 경우, 현재 디렉터리(`./`)에 사이트를 구축할 수 있습니다. 그러나 기존 프로젝트에서 다른 소스 코드와 함께 VitePress를 설치하는 경우, 프로젝트의 나머지 부분과 분리되도록 중첩된 디렉터리(e.g. `./docs`)에 사이트를 구축하는 것이 좋습니다.

VitePress 프로젝트를 `./docs`에 구축하기로 한 경우, 생성된 파일 구조는 다음과 같아야 합니다:

```
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

`docs` 디렉터리는 VitePress 사이트의 **프로젝트 루트**로 간주됩니다. `.vitepress` 디렉터리는 VitePress의 구성 파일, 개발 서버 캐시, 빌드 출력, 선택적 커스텀 테마 코드가 있는 위치입니다.

::: tip
기본적으로 VitePress는 개발 서버 캐시를 `.vitepress/cache`에 저장하고, 프로덕션 빌드 출력을 `.vitepress/dist`에 저장합니다. Git을 사용하는 경우, 이러한 디렉토리를 `.gitignore` 파일에 추가해야 합니다. 또는 이러한 위치를 수동으로 [구성](../reference/site-config#outdir)할 수도 있습니다.
:::

### 구성 파일 {#the-config-file}

구성 파일(`.vitepress/config.js`)을 사용하면 사이트의 제목과 설명과 같은 VitePress 사이트의 다양한 측면을 커스터마이즈할 수 있습니다:

```js [.vitepress/config.js]
export default {
  // 사이트 옵션
  title: 'VitePress',
  description: '그냥 해보는 중.',

  themeConfig: {
    // 테마 옵션
  }
}
```

테마의 동작은 `themeConfig` 옵션을 통해 구성할 수도 있습니다. 모든 구성 옵션에 대한 자세한 내용은 [구성 레퍼런스](../reference/site-config)를 참고하세요.

### 소스 파일 {#source-files}

`.vitepress` 디렉토리 외부의 마크다운 파일은 **소스 파일**로 간주됩니다.

VitePress는 **파일 기반 라우팅**을 사용합니다: 각 `.md` 파일은 동일한 경로에 해당하는 `.html` 파일로 컴파일됩니다. 예를 들어, `index.md`는 `index.html`로 컴파일되며, 결과적으로 VitePress 사이트의 루트 경로 `/`에서 방문할 수 있습니다.

또한 VitePress는 간결한 URL 생성, 경로 재작성, 동적 페이지 생성 기능을 제공합니다. 이러한 내용은 [라우팅 가이드](./routing)에서 다룹니다.

## 실행 및 작동 {#up-and-running}

설치 과정에서 허용한 경우, 도구는 다음 npm 스크립트를 `package.json`에 추가했을 것입니다:

```json [package.json]
{
  ...
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  ...
}
```

`docs:dev` 스크립트는 즉각적인 핫 업데이트가 가능한 로컬 개발 서버를 시작합니다. 다음 명령어로 실행할 수 있습니다:

::: code-group

```sh [npm]
$ npm run docs:dev
```

```sh [pnpm]
$ pnpm run docs:dev
```

```sh [yarn]
$ yarn docs:dev
```

```sh [bun]
$ bun run docs:dev
```

:::

npm 스크립트 대신 VitePress를 직접 호출할 수도 있습니다:

::: code-group

```sh [npm]
$ npx vitepress dev docs
```

```sh [pnpm]
$ pnpm vitepress dev docs
```

```sh [yarn]
$ yarn vitepress dev docs
```

```sh [bun]
$ bun vitepress dev docs
```

:::

더 많은 명령줄 사용법은 [CLI 레퍼런스](../reference/cli)에 문서화되어 있습니다.

개발 서버는 `http://localhost:5173`에서 실행되어야 합니다. 브라우저에서 URL을 방문하여 새 사이트를 확인하세요!

## 다음 단계는? {#what-s-next}

- 마크다운과 이 파일로 생성된 HTML이 어떻게 매핑되는지 더 잘 이해하려면 [라우팅 가이드](./routing)를 참고하세요.

- 페이지에서 할 수 있는 작업, 예를 들어 마크다운 콘텐츠 작성이나 Vue 컴포넌트 사용에 대해 더 알아보려면 가이드의 "글쓰기" 섹션을 참조하세요. 시작하기 좋은 곳은 [마크다운 확장](./markdown)에 대해 배우는 것입니다.

- 기본 문서 테마에서 제공하는 기능을 탐색하려면 [기본 테마 구성 레퍼런스](../reference/default-theme-config)를 확인하세요.

- 사이트의 외관을 더 맞춤화하려면 [기본 테마 확장](./extending-default-theme) 또는 [커스텀 테마 빌드](./custom-theme)를 탐색하세요.

- 문서 사이트가 형태를 갖추면 [배포 가이드](./deploy)를 꼭 읽어보세요.
