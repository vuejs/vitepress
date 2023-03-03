# Command Line Interface

## `vitepress dev`

Start VitePress dev server using designated directory as root. Defaults to current directory. The `dev` command can also be omitted when running in current directory.

### Usage

```sh
# start in current directory, omitting `dev`
vitepress

# start in sub directory
vitepress dev [root]
```

### Options

| Option | Description |
| -      | -           |
| `--open [path]`          | Open browser on startup (`boolean \| string`) |
| `--port <port>`          | Specify port (`number`) |
| `--base <path>`          | Public base path (default: `/`) (`string`) |
| `--cors`                 | Enable CORS |
| `--strictPort`           | Exit if specified port is already in use (`boolean`) |
| `--force`                | Force the optimizer to ignore the cache and re-bundle (`boolean`) |

## `vitepress build`

Build the VitePress site for production.

### Usage

```sh
vitepress build [root]
```

### Options

| Option | Description |
| -      | -           |
| `--mpa` (experimental) | Build in MPA mode without client-side hydration (`boolean`) |
| `--base <path>`          | Public base path (default: `/`) (`string`) |
| `--target <target>`            | Transpile target (default: `"modules"`) (`string`) |
| `--outDir <dir>`          | Output directory (default: `.vitepress/dist`) (`string`) |
| `--minify [minifier]`          | Enable/disable minification, or specify minifier to use (default: `"esbuild"`) (`boolean \| "terser" \| "esbuild"`) |
| `--assetsInlineLimit <number>` | Static asset base64 inline threshold in bytes (default: `4096`) (`number`) |

## `vitepress preview`

Locally preview the production build.

### Usage

```sh
vitepress preview [root]
```

### Options

| Option | Description |
| -      | -           |
| `--base <path>`          | Public base path (default: `/`) (`string`) |
| `--port <port>`          | Specify port (`number`) |

## `vitepress init`

Start the [Setup Wizard](/guide/getting-started#setup-wizard) in current directory.

### Usage

```sh
vitepress init
```
