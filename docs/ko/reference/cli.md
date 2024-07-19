# 명령 줄 인터페이스 {#command-line-interface}

## `vitepress dev`

지정된 디렉토리를 루트로 사용하여 VitePress 개발 서버 시작. 기본값은 현재 디렉토리입니다. 현재 디렉토리에서 실행할 때는 `dev` 명령을 생략할 수도 있습니다.

### 사용법

```sh
# 현재 디렉토리에서 시작, `dev` 생략
vitepress

# 서브 디렉토리에서 시작
vitepress dev [root]
```

### 옵션

| 옵션              | 설명                                      |
|-----------------|-----------------------------------------|
| `--open [path]` | 시작 시 브라우저 열기 (`boolean \| string`)      |
| `--port <port>` | 포트 지정 (`number`)                        |
| `--base <path>` | 공개 기본 경로 (기본값: `/`) (`string`)          |
| `--cors`        | CORS 활성화                                |
| `--strictPort`  | 지정된 포트가 이미 사용 중인 경우 종료 (`boolean`)      |
| `--force`       | 최적화기가 캐시를 무시하고 다시 번들링하도록 강제 (`boolean`) |

## `vitepress build`

VitePress 사이트를 프로덕션 용으로 빌드합니다.

### 사용법

```sh
vitepress build [root]
```

### 옵션

| 옵션                             | 설명                                                                                   |
|--------------------------------|--------------------------------------------------------------------------------------|
| `--mpa` (실험적)                  | 클라이언트 측 수화 없이 [MPA 모드](../guide/mpa-mode)에서 빌드 (`boolean`)                           |
| `--base <path>`                | 공개 기본 경로 (기본값: `/`) (`string`)                                                       |
| `--target <target>`            | 트랜스파일 대상 (기본값: `"modules"`) (`string`)                                               |
| `--outDir <dir>`               | **cwd**에 상대적인 출력 디렉토리 (기본값: `<root>/.vitepress/dist`) (`string`)                     |
| `--minify [minifier]`          | 미니화 활성화/비활성화하거나 사용할 미니화기를 지정 (기본값: `"esbuild"`) (`boolean \| "terser" \| "esbuild"`) |
| `--assetsInlineLimit <number>` | 바이트 단위로 정적 자산 base64 인라인 임계값 (기본값: `4096`) (`number`)                                |

## `vitepress preview`

프로덕션 빌드를 로컬에서 미리 볼 수 있습니다.

### 사용법

```sh
vitepress preview [root]
```

### 옵션

| 옵션              | 설명                             |
|-----------------|--------------------------------|
| `--base <path>` | 공개 기본 경로 (기본값: `/`) (`string`) |
| `--port <port>` | 포트 지정 (`number`)               |

## `vitepress init`

현재 디렉토리에서 [설정 마법사](../guide/getting-started#setup-wizard) 시작.

### 사용법

```sh
vitepress init
```
