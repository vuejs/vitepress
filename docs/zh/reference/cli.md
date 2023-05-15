# 命令行接口 {#command-line-interface}

## `vitepress dev`

使用指定目录作为根目录来启动 VitePress 开发服务器。默认为当前目录。在当前目录下运行时也可以省略 `dev` 命令。

### 用法

```sh
# 从当前目录开始，省略 `dev`
vitepress

# 从子目录开始
vitepress dev [root]
```

### 选项

| 选项            | 说明                                       |
| --------------- | ------------------------------------------ |
| `--open [path]` | 启动时打开浏览器 (`boolean \| string`)     |
| `--port <port>` | 指定端口 (`number`)                        |
| `--base <path>` | 公共基础路径 (default: `/`) (`string`)     |
| `--cors`        | 启用 CORS                                  |
| `--strictPort`  | 如果指定的端口已被占用则退出 (`boolean`)   |
| `--force`       | 强制优化程序忽略缓存并重新绑定 (`boolean`) |

## `vitepress build`

构建用于生产的 VitePress 站点。

### 用法 {#usage}

```sh
vitepress build [root]
```

### 选项 {#options}

| 选项                           | 说明                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| `--mpa` (experimental)         | 在没有客户端 hydration 的 [MPA 模式](../guide/mpa-mode) 下构建 (`boolean`)                        |
| `--base <path>`                | 公共基础路径 (default: `/`) (`string`)                                                            |
| `--target <target>`            | 转译目标 (default: `"modules"`) (`string`)                                                        |
| `--outDir <dir>`               | 输出目录 (default: `.vitepress/dist`) (`string`)                                                  |
| `--minify [minifier]`          | 启用/禁用压缩，或指定要使用的压缩程序 (default: `"esbuild"`) (`boolean \| "terser" \| "esbuild"`) |
| `--assetsInlineLimit <number>` | 静态资源 base64 内联阈值（以字节为单位） (default: `4096`) (`number`)                             |

## `vitepress preview`

在本地预览生产版本。

### 用法 {#usage-1}

```sh
vitepress preview [root]
```

### 选项 {#options-1}

| 选项            | 说明                                   |
| --------------- | -------------------------------------- |
| `--base <path>` | 公共基础路径 (default: `/`) (`string`) |
| `--port <port>` | 指定端口 (`number`)                    |

## `vitepress init`

在当前目录中启动[安装向导](../guide/getting-started#setup-wizard)。

### 用法

```sh
vitepress init
```
