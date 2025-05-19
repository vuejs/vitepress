# 에셋 핸들링 {#asset-handling}

## 정적 에셋 참조하기 {#referencing-static-assets}

모든 마크다운 파일은 Vue 컴포넌트로 컴파일되어 [Vite](https://vitejs.dev/guide/assets.html)에 의해 처리됩니다. 모든 에셋은 상대 URL을 사용하여 참조할 수 있으며, **참조해야 합니다**:

```md
![이미지](./image.png)
```

마크다운 파일에서 정적 에셋을 참조할 수 있으며, 테마 내의 `*.vue` 컴포넌트, 스타일 및 일반 `.css` 파일을 절대 경로(프로젝트 루트를 기준으로) 또는 상대 경로(파일 시스템을 기준으로)를 사용하여 참조할 수 있습니다. 후자는 Vite, Vue CLI 또는 webpack의 `file-loader` 동작과 유사합니다.

일반적인 이미지, 미디어 및 글꼴 파일 형식은 자동으로 에셋으로 감지되어 포함됩니다.

::: tip 링크를 통해 참조된 파일은 에셋으로 처리되지 않습니다
마크다운 파일 내에서 링크로 참조된 PDF 또는 기타 문서는 자동으로 에셋으로 처리되지 않습니다. 링크된 파일을 접근 가능하게 하려면 프로젝트의 [`public`](#the-public-directory) 디렉토리에 수동으로 배치해야 합니다.
:::

절대 경로를 사용하는 에셋을 포함하여 모든 참조된 에셋은 프로덕션 빌드에서 해시된 파일 이름으로 출력 디렉토리에 복사됩니다. 참조되지 않은 에셋은 복사되지 않습니다. 4kb보다 작은 이미지 에셋은 base64로 인라인됩니다. 이는 [`vite`](../reference/site-config#vite) 구성 옵션을 통해 구성할 수 있습니다.

모든 **정적** 경로 참조는 절대 경로를 포함하여 작업 디렉토리 구조를 기반으로 해야 합니다.

## Public 디렉터리 {#the-public-directory}

때때로 마크다운이나 테마 컴포넌트에서 직접 참조되지 않는 정적 에셋을 제공해야 하거나 특정 파일을 원래 파일 이름으로 제공하고 싶을 때가 있습니다. 이러한 파일의 예로는 `robots.txt`, 파비콘, PWA 아이콘 등이 있습니다.

이 파일들은 [소스 디렉토리](./routing#source-directory) 아래의 `public` 디렉토리에 놓을 수 있습니다. 예를 들어 프로젝트 루트가 `./docs`이고 기본 소스 디렉토리 위치를 사용 중인 경우, `public` 디렉토리는 `./docs/public`이 됩니다.

`public`에 배치된 에셋은 출력 디렉토리의 루트로 그대로 복사됩니다.

`public`에 배치된 파일은 루트 절대 경로를 사용하여 참조해야 한다는 점에 유의하세요. 예를 들어, `public/icon.png`는 소스 코드에서 항상 `/icon.png`로 참조되어야 합니다.

## Base URL {#base-url}

사이트가 루트 URL이 아닌 곳에 배포된 경우, `.vitepress/config.js`에서 `base` 옵션을 설정해야 합니다. 예를 들어, 사이트를 `https://foo.github.io/bar/`에 배포하려는 경우 `base`는 `'/bar/'`로 설정해야 합니다(항상 슬래시로 시작하고 끝나야 합니다).

모든 정적 에셋 경로는 다른 `base` 구성 값에 맞게 자동으로 처리됩니다. 예를 들어, 마크다운에서 `public` 하위의 에셋에 대한 절대 참조가 있는 경우:

```md
![이미지](/image-inside-public.png)
```

이 경우 `base` 구성 값을 변경할 때 **업데이트할 필요가 없습니다**.

그러나 테마 구성 값을 기반으로 `src`가 설정된 이미지와 같이 동적으로 에셋에 링크하는 테마 컴포넌트를 작성하는 경우:

```vue
<img :src="theme.logoPath" />
```

이 경우 VitePress에서 제공하는 [`withBase` 헬퍼](../reference/runtime-api#withbase)로 경로를 감싸는 것이 좋습니다:

```vue
<script setup>
import { withBase, useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img :src="withBase(theme.logoPath)" />
</template>
```
