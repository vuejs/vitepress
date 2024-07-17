
# 시작하기 {#getting-started}

## 온라인에서 시도해보기 {#try-it-online}

브라우저에서 바로 VitePress를 시도해 볼 수 있습니다 [StackBlitz](https://vitepress.new).

## 설치 {#installation}

### 사전 준비 사항 {#prerequisites}

- [Node.js](https://nodejs.org/) 버전 18 이상.
- VitePress를 명령줄 인터페이스(CLI)를 통해 접근하기 위한 터미널.
- [Markdown](https://en.wikipedia.org/wiki/Markdown) 문법 지원이 있는 텍스트 에디터.
  - [VSCode](https://code.visualstudio.com/)와 [공식 Vue 확장 프로그램](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 사용을 권장합니다.

VitePress는 독립 실행형으로 사용하거나 기존 프로젝트에 설치할 수 있습니다. 어떤 경우든 다음과 같이 설치할 수 있습니다:

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

::: details 필요한 피어 종속성 경고가 나타나나요?
PNPM을 사용할 경우 `@docsearch/js`에 대한 누락된 피어 경고를 볼 수 있습니다. 이것은 VitePress 작동을 방해하지 않습니다. 이 경고를 억제하려면, `package.json`에 다음을 추가하세요:

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

VitePress는 ESM-only 패키지입니다. `require()`를 사용하여 가져오지 마십시오, 그리고 가장 가까운 `package.json`에 `"type": "module"`이 포함되어 있는지 확인하거나, 관련 파일(예: `.vitepress/config.js`)의 확장자를 `.mjs`/`.mts`로 변경하십시오. 자세한 내용은 [Vite의 문제 해결 가이드](http://vitejs.dev/ko/guide/troubleshooting.html#this-package-is-esm-only)를 참조하십시오. 또한, 비동기 CJS 컨텍스트 내에서는 대신 `await import('vitepress')`를 사용할 수 있습니다.

:::

### 설정 마법사 {#setup-wizard}

VitePress는 기본 프로젝트를 스캐폴딩하는 데 도움이 되는 명령줄 설정 마법사를 제공합니다. 설치 후, 마법사를 시작하려면 다음을 실행하세요:

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

::: tip Vue를 피어 의존성으로
Vue 컴포넌트나 API를 사용하여 커스터마이즈를 수행하려면, `vue`도 명시적으로 의존성으로 설치해야 합니다.
:::

## 파일 구조 {#file-structure}

독립 실행형 VitePress 사이트를 빌딩하는 경우, 현재 디렉토리(`./`)에 사이트를 스캐폴딩할 수 있습니다. 그러나 다른 소스 코드와 함께 기존 프로젝트에 VitePress를 설치하는 경우, 프로젝트의 나머지 부분과 별도로 (`예: `./docs`) 중첩된 디렉토리에 사이트를 스캐폴딩하는 것이 좋습니다.

VitePress 프로젝트를 `./docs`에 스캐폴딩하기로 선택한 경우 생성된 파일 구조는 다음과 같아야 합니다:

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

`docs` 디렉토리는 VitePress 사이트의 **프로젝트 루트**로 간주됩니다. `.vitepress` 디렉토리는 VitePress의 설정 파일, 개발 서버 캐시, 빌드 출력 및 선택적 테마 사용자 정의 코드를 위한 예약된 위치입니다.

::: tip
기본적으로, VitePress는 개발 서버 캐시를 `.vitepress/cache`에, 프로덕션 빌드 출력을 `.vitepress/dist`에 저장합니다. Git을 사용하는 경우, 이들을 `.gitignore` 파일에 추가해야 합니다. 이 위치는 또한 [구성할 수 있습니다](../reference/site-config#outdir).
:::

### 설정 파일 {#the-config-file}

설정 파일(`.vitepress/config.js`)을 사용하면 사이트의 제목과 설명과 같은 VitePress 사이트의 다양한 측면을 커스터마이즈할 수 있습니다:

```js
// .vitepress/config.js
export default {
  // 사이트 수준 옵션
  title: 'VitePress',
  description: '그냥 해보는 중.',

  themeConfig: {
    // 테마 수준 옵션
  }
}
```

`themeConfig` 옵션을 통해 테마의 동작을 구성할 수도 있습니다. 모든 구성 옵션에 대한 전체 세부 정보는 [구성 참조](../reference/site-config)를 참조하십시오.

### 소스 파일 {#source-files}

`.vitepress` 디렉토리 밖의 마크다운 파일들은 **소스 파일**로 간주됩니다.

VitePress는 **파일 기반 라우팅**을 사용합니다: 각 `.md` 파일은 동일한 경로에 해당하는 `.html` 파일로 컴파일됩니다. 예를 들어, `index.md`는 `index.html`로 컴파일되며, 결과적인 VitePress 사이트의 루트 경로 `/`에서 방문할 수 있습니다.

VitePress는 또한 깨끗한 URL 생성, 경로 리라이팅 및 동적 페이지 생성 기능을 제공합니다. 이러한 내용은 [라우팅 가이드](./routing)에서 다뤄질 것입니다.

## 실행 및 작동 {#up-and-running}

설정 프로세스 중에 허용한 경우, 도구는 `package.json`에 다음 npm 스크립트를 주입해야 합니다:

```json
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

`docs:dev` 스크립트는 즉각적인 핫 업데이트를 제공하는 로컬 개발 서버를 시작합니다. 다음 명령으로 실행하세요:

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

npm 스크립트 대신, 다음과 같이 VitePress를 직접 호출할 수도 있습니다:

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

명령줄 사용법은 [CLI 참조](../reference/cli)에 문서화되어 있습니다.

개발 서버는 `http://localhost:5173`에서 실행되어야 합니다. 브라우저에서 URL을 방문하여 새 사이트를 확인하세요!

## 다음 단계는? {#what-s-next}

- 생성된 HTML로 마크다운 파일이 어떻게 매핑되는지 더 잘 이해하려면, [라우팅 가이드](./routing)로 진행하세요.

- 페이지에서 할 수 있는 일에 대해 더 알아보려면, 마크다운 콘텐츠 작성이나 Vue 컴포넌트 사용과 같은 "작성" 섹션의 가이드를 참조하십시오. 시작하기 좋은 곳은 [마크다운 확장](./markdown)에 대해 배우는 것입니다.

- 기본 문서 테마가 제공하는 기능을 탐색하려면, [기본 테마 구성 참조](../reference/default-theme-config)를 확인하세요.

- 사이트의 모양을 더욱 커스터마이즈하고 싶다면, [기본 테마 확장](./extending-default-theme)이나 [커스텀 테마 빌드](./custom-theme)하는 방법을 탐색해보세요.

- 문서 사이트가 구성되기 시작하면, [배포 가이드](./deploy)를 반드시 읽어보세요.
