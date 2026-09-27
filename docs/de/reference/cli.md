---
description: Referenz der VitePress-CLI-Befehle einschließlich dev, build, preview und init.
---

# Kommandozeilenschnittstelle

## `vitepress dev`

Starte den VitePress-Entwicklungsserver mit dem angegebenen Verzeichnis als Stammverzeichnis. Standardmäßig wird das aktuelle Verzeichnis verwendet. Der Befehl `dev` kann beim Ausführen im aktuellen Verzeichnis weggelassen werden.

### Verwendung

```sh
# start in current directory, omitting `dev`
vitepress

# start in sub directory
vitepress dev [root]
```

### Optionen

| Option          | Beschreibung                                                       |
| --------------- | ----------------------------------------------------------------- |
| `--open [path]` | Browser beim Start öffnen (`boolean \| string`)                     |
| `--port <port>` | Port festlegen (`number`)                                           |
| `--base <path>` | Öffentlicher Basispfad (Standard: `/`) (`string`)                        |
| `--cors`        | CORS aktivieren                                                       |
| `--strictPort`  | Beenden, wenn der angegebene Port bereits verwendet wird (`boolean`)              |
| `--force`       | Optimierer zwingen, den Cache zu ignorieren und erneut zu bündeln (`boolean`) |

## `vitepress build`

VitePress-Website für die Produktion erstellen.

### Verwendung

```sh
vitepress build [root]
```

### Optionen

| Option                         | Beschreibung                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `--mpa` (experimental)         | Im [MPA-Modus erstellen](../guide/mpa-mode) ohne clientseitige Hydration (`boolean`)                                    |
| `--base <path>`                | Öffentlicher Basispfad (Standard: `/`) (`string`)                                                                          |
| `--assetsBase <url>`           | URL-Präfix, von dem die erzeugten Assets ausgeliefert werden, z. B. ein CDN (`string`)                                              |
| `--target <target>`            | Transpilierungsziel (Standard: `"modules"`) (`string`)                                                                  |
| `--outDir <dir>`               | Ausgabeverzeichnis relativ zu **cwd** (Standard: `<root>/.vitepress/dist`) (`string`)                                 |
| `--assetsInlineLimit <number>` | Grenzwert für das Base64-Einbetten statischer Assets in Byte (Standard: `4096`) (`number`)                                          |

## `vitepress preview`

Produktions-Build lokal in der Vorschau anzeigen.

### Verwendung

```sh
vitepress preview [root]
```

### Optionen

| Option          | Beschreibung                                |
| --------------- | ------------------------------------------ |
| `--base <path>` | Öffentlicher Basispfad (Standard: `/`) (`string`) |
| `--assetsBase <url>` | URL-Präfix, von dem die erzeugten Assets ausgeliefert werden, z. B. ein CDN (`string`) |
| `--port <port>` | Port festlegen (`number`)                    |

## `vitepress init`

Starte den [Einrichtungsassistenten](../guide/getting-started#setup-wizard) in current directory.

### Verwendung

```sh
vitepress init
```
