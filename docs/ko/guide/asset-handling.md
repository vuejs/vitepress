# 자산 처리 {#asset-handling}

## 정적 자산 참조하기 {#referencing-static-assets}

모든 Markdown 파일은 Vue 컴포넌트로 컴파일되며 [Vite](https://vitejs.dev/ko/guide/assets.html)에 의해 처리됩니다. 상대 URL을 사용하여 어떠한 자산도 참조할 수 **있으며 해야 합니다**:

```md
![이미지](./image.png)
```

Markdown 파일, 테마의 `*.vue` 컴포넌트, 스타일 및 일반 `.css` 파일에서 정적 자산을 참조할 수 있으며, 절대 공개 경로(프로젝트 루트를 기준으로 함) 또는 상대 경로(파일 시스템을 기준으로 함)를 사용할 수 있습니다. 후자는 Vite, Vue CLI 또는 webpack의 `file-loader`를 사용해 본 적이 있다면 익숙한 동작 방식과 유사합니다.

일반적인 이미지, 미디어, 폰트 파일 유형은 자동으로 자산으로 감지되어 포함됩니다.

::: tip 링크된 파일은 자산으로 취급되지 않음
Markdown 파일 내의 링크로 참조된 PDF 또는 기타 문서는 자동으로 자산으로 취급되지 않습니다. 링크된 파일을 접근 가능하게 만들기 위해서는 수동으로 해당 파일을 프로젝트의 [`public`](#the-public-directory) 디렉토리에 배치해야 합니다.
:::

절대 경로를 포함한 모든 참조된 자산은 생산 빌드에서 해시된 파일 이름으로 출력 디렉토리에 복사됩니다. 참조되지 않은 자산은 복사되지 않습니다. 4kb보다 작은 이미지 자산은 base64 인라인으로 처리됩니다 - 이는 [`vite`](../reference/site-config#vite) 구성 옵션을 통해 설정할 수 있습니다.

모든 **정적** 경로 참조, 절대 경로를 포함하여, 작업 디렉토리 구조를 기반으로 해야 합니다.

## Public 디렉토리 {#the-public-directory}

Markdown이나 테마 컴포넌트에서 직접 참조되지 않은 정적 자산을 제공할 필요가 있거나, 특정 파일을 원본 파일명으로 제공하고 싶은 경우가 있을 수 있습니다. 이러한 파일의 예로는 `robots.txt`, 파비콘, PWA 아이콘이 있습니다.

이 파일들은 [소스 디렉토리](./routing#source-directory) 아래의 `public` 디렉토리에 배치할 수 있습니다. 예를 들어, 프로젝트 루트가 `./docs`이고 기본 소스 디렉토리 위치를 사용한다면, public 디렉토리는 `./docs/public`이 됩니다.

`public`에 배치된 자산은 그대로 출력 디렉토리의 루트로 복사됩니다.

`public`에 배치된 파일을 참조할 때는 루트 절대 경로를 사용해야 한다는 점에 유의하세요 - 예를 들어, `public/icon.png`는 소스 코드에서 항상 `/icon.png`로 참조되어야 합니다.

## 기본 URL {#base-url}

사이트가 루트 URL이 아닌 곳에 배포되는 경우, `.vitepress/config.js`에서 `base` 옵션을 설정해야 합니다. 예를 들어, 사이트를 `https://foo.github.io/bar/`에 배포할 계획이라면, `base`는 `'/bar/'`(항상 슬래시로 시작하고 끝나야 함)로 설정해야 합니다.

모든 정적 자산 경로는 다양한 `base` 구성 값에 맞게 자동으로 처리됩니다. 예를 들어, 마크다운에서 `public` 아래에 있는 자산에 대한 절대 참조가 있는 경우:

```md
![이미지](/image-inside-public.png)
```

이 경우 `base` 구성 값을 변경하더라도 업데이트할 필요가 **없습니다**.

그러나 자산을 동적으로 연결하는 테마 컴포넌트를 작성하는 경우, 예를 들어 테마 구성 값에 기반한 이미지의 `src`가 있는 경우:

```vue
<img :src="theme.logoPath" />
```

이 경우 VitePress에 제공되는 [`withBase` 헬퍼](../reference/runtime-api#withbase)로 경로를 래핑하는 것이 권장됩니다:

```vue
<script setup>
import { withBase, useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img :src="withBase(theme.logoPath)" />
</template>
```
