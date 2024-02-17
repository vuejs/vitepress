# Interface de Linha de Comando {#command-line-interface}

## `vitepress dev`

Inicia o servidor de desenvolvimento VitePress com o diretório designado como raiz. Por padrão usa o diretório atual. O comando `dev` pode também ser omitido ao rodar no diretório atual.

### Uso

```sh
# inicia no diretório atual, omitindo `dev`
vitepress

# inicia em um subdiretório
vitepress dev [root]
```

### Opções {#options}

| Opção          | Descrição                                                       |
| --------------- | ----------------------------------------------------------------- |
| `--open [path]` | Abre o navegador na inicialização (`boolean \| string`)                     |
| `--port <port>` | Especifica porta (`number`)                                           |
| `--base <path>` | Caminho base público (padrão: `/`) (`string`)                        |
| `--cors`        | Habilita CORS                                                       |
| `--strictPort`  | Interrompe se a porta especificada já está em uso (`boolean`)              |
| `--force`       | Força o otimizador a ignorar o cache e reempacotar (`boolean`) |

## `vitepress build`

Compila o site VitePress para produção.

### Uso

```sh
vitepress build [root]
```

### Opções

| Opção                         | Descrição                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `--mpa` (experimental)         | Compila no [Modo MPA](../guide/mpa-mode) sem hidratação no lado do cliente  (`boolean`)                                    |
| `--base <path>`                | Caminho base público (padrão: `/`) (`string`)                                                                          |
| `--target <target>`            | Transpila o alvo (padrão: `"modules"`) (`string`)                                                                  |
| `--outDir <dir>`               | Diretório de saída relativo ao **cwd** (padrão: `<root>/.vitepress/dist`) (`string`)                                 |
| `--minify [minifier]`          | Habilita/desabilita minificação, ou especifica um minificador para usar (padrão: `"esbuild"`) (`boolean \| "terser" \| "esbuild"`) |
| `--assetsInlineLimit <number>` | Limite em bytes para alinhar ativos em  base64 (padrão: `4096`) (`number`)                                          |

## `vitepress preview`

Prevê localmente a compilação de produção.

### Uso

```sh
vitepress preview [root]
```

### Opções

| Opção          | Descrição                                |
| --------------- | ------------------------------------------ |
| `--base <path>` | Caminho base público (padrão: `/`) (`string`) |
| `--port <port>` | Especifica porta (`number`)                    |

## `vitepress init`

Inicia o [Assistente de Instalação](../guide/getting-started#setup-wizard) no diretório atual.

### Uso

```sh
vitepress init
```
