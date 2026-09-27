---
outline: deep
description: Stelle deine VitePress-Website auf beliebten Plattformen wie Netlify, Vercel, GitHub Pages und weiteren Plattformen bereit.
---

# Deine VitePress-Website bereitstellen

Die folgenden Anleitungen basieren auf einigen gemeinsamen Voraussetzungen:

- Die VitePress-Website befindet sich im Verzeichnis `docs` deines Projekts.
- Du verwendest das standardmäßige Build-Ausgabeverzeichnis (`.vitepress/dist`).
- VitePress ist als lokale Abhängigkeit in deinem Projekt installiert, und du hast die folgenden Skripte in deiner `package.json`:

  ```json [package.json]
  {
    "scripts": {
      "docs:build": "vitepress build docs",
      "docs:preview": "vitepress preview docs"
    }
  }
  ```

## Lokal erstellen und testen

1. Führe diesen Befehl aus, um die Dokumentation zu erstellen:

   ```sh
   $ npm run docs:build
   ```

2. Nach dem Erstellen kannst du die Website lokal mit folgendem Befehl anzeigen:

   ```sh
   $ npm run docs:preview
   ```

   Der Befehl `preview` startet einen lokalen statischen Webserver, der das Ausgabeverzeichnis `.vitepress/dist` unter `http://localhost:4173` bereitstellt. Du kannst damit überprüfen, ob alles korrekt aussieht, bevor du die Website in die Produktion überträgst.

3. Du kannst den Port des Servers ändern, indem du `--port` als Argument übergibst.

   ```json
   {
     "scripts": {
       "docs:preview": "vitepress preview docs --port 8080"
     }
   }
   ```

   Das Skript `docs:preview` startet den Server nun unter `http://localhost:8080`.

## Einen öffentlichen Basispfad festlegen

Standardmäßig wird angenommen, dass die Website am Stammpfad einer Domain (`/`). Wenn deine Website unter einem Unterpfad bereitgestellt wird, e.g. `https://mywebsite.com/blog/`, musst du die Option [`base`](../reference/site-config#base) option to `'/blog/'` in the VitePress config.

**Beispiel:** Wenn du GitHub- (oder GitLab-) Pages verwendest und unter `user.github.io/repo/`, then set your `base` to `/repo/`.

## Verschiebbare Builds (relativer Basispfad) {#relocatable-builds-relative-base}

Wenn die endgültige URL der Website zur Build-Zeit noch nicht bekannt ist — an IPFS gateway (`https://gateway/ipfs/<cid>/…`), the Wayback Machine, a shared folder, docs bundled in an app — set `base` to `'./'`:

```ts
export default {
  base: './'
}
```

Jede Seite referenziert Assets und andere Seiten dann relativ zu ihrem eigenen Speicherort. Die Client-Laufzeit ermittelt beim Laden der Seite den tatsächlichen Einhängepunkt. Derselbe Build funktioniert von **jedem** Unterpfad aus ohne erneuten Build – auch von mehreren Pfaden gleichzeitig – während Routing, Suche und Prefetching vollständig funktionieren.

Das direkte Öffnen der erzeugten HTML-Dateien über das Dateisystem (`file://`) also works as a styled, fully navigable static site. Browser blockieren JavaScript-Module über `file://`, so there is no hydration there — interactive features like search stay inactive, while all pre-rendered content and links keep working.

Einige Dinge solltest du beachten:

- Lasse [`cleanUrls`](../reference/site-config#cleanurls) deaktiviert (Standardeinstellung): Für portable Ausgaben müssen Links mit `.html` enden, da kein Server vorhanden ist, der saubere URLs umschreibt.
- `404.html` wird für die Stammebene erzeugt. Hosts, die sie als Fallback für beliebig tiefe URLs ausliefern, rendern sie ohne Styles (there is no correct relative prefix for an unknown depth).
- [`head`](../reference/site-config#head) Einträge werden wie immer unverändert ausgegeben – vermeide dort absolute Pfade wie `/favicon.ico` there and prefer absolute URLs or `transformHead`.
- Rohe HTML-`<a>`-Tags in Markdown behalten ihr `href` unverändert — use Markdown link syntax for site-absolute links (embedded `<img>` sources go durch the asset pipeline and are handled).
- Von [`createContentLoader`](./data-loading#createcontentloader) erzeugte Links bleiben absolut zur Website (their HTML is embedded in other pages, so no single relative prefix is correct) — they resolve only for a root mount.
- Stelle Seiten unter ihren kanonischen URLs bereit: the root as `/dir/` (not `/dir`), and no added trailing slashes on page URLs. The relative prefix is resolved against the URL the browser actually shows, and virtually all static hosts canonicalize this way already.
- Der Entwicklungsserver stellt immer unter `/` bereit; das relative Verhalten gilt für den Produktions-Build.

## HTTP-Cache-Header

Wenn du Kontrolle über die HTTP-Header deines Produktionsservers hast, kannst du `cache-control`-Header konfigurieren, um bei wiederholten Besuchen eine bessere Leistung zu erzielen.

Der Produktions-Build verwendet gehashte Dateinamen für statische Assets (JavaScript, CSS and other imported assets not in `public`). Wenn du die Produktionsvorschau mit dem Netzwerk-Tab der Browser-Entwicklertools untersuchst, you will see files like `app.4f283b18.js`.

Dieser Hash `4f283b18` wird aus dem Inhalt dieser Datei erzeugt. Dieselbe gehashte URL liefert garantiert denselben Dateiinhalt – wenn sich der Inhalt ändert, ändern sich auch die URLs. Das bedeutet, dass du für diese Dateien bedenkenlos die stärksten Cache-Header verwenden kannst. Alle solchen Dateien werden im Ausgabeverzeichnis unter `assets/` abgelegt. Dafür kannst du den folgenden Header konfigurieren:

```
Cache-Control: max-age=31536000,immutable
```

::: details Beispiel für die Netlify-Datei `_headers`

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

Hinweis: Die Datei `_headers` sollte im [public directory](./asset-handling#the-public-directory) - in our case, `docs/public/_headers` - liegen, damit sie unverändert in das Ausgabeverzeichnis kopiert wird.

[Netlify-Dokumentation zu benutzerdefinierten Headern](https://docs.netlify.com/routing/headers/)

:::

::: details Beispiel für die Vercel-Konfiguration in `vercel.json`

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

Hinweis: Die Datei `vercel.json` sollte im Stammverzeichnis deines **Repositorys** liegen.

[Vercel-Dokumentation zur Header-Konfiguration](https://vercel.com/docs/concepts/projects/project-Konfiguration#headers)

:::

## Anleitungen für Plattformen

### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render {#generic}

Richte ein neues Projekt ein und ändere diese Einstellungen über dein Dashboard:

- **Build-Befehl:** `npm run docs:build`
- **Ausgabeverzeichnis:** `docs/.vitepress/dist`
- **Node-Version:** `20` (or above)

::: warning
Aktiviere keine Optionen wie _Auto Minify_ für HTML-Code. Dadurch werden Kommentare aus der Ausgabe entfernt, die für Vue Bedeutung haben. Wenn sie entfernt werden, können Hydration-Mismatch-Fehler auftreten.
:::

### GitHub Pages

1. Erstelle eine Datei namens `deploy.yml` im Verzeichnis `.github/workflows` deines Projekts, beispielsweise mit folgendem Inhalt:

   ```yaml [.github/workflows/deploy.yml]
   # Beispiel-Workflow zum Erstellen und Bereitstellen einer VitePress-Website auf GitHub Pages
   #
   name: VitePress-Website auf Pages bereitstellen

   on:
     # Wird bei Pushes auf den `main`-Branch ausgeführt. Ändere dies zu `master`, wenn du
     # den `master`-Branch als Standard-Branch verwendest.
     push:
       branches: [main]

     # Ermöglicht das manuelle Ausführen dieses Workflows über den Actions-Tab
     workflow_dispatch:

   # Legt die Berechtigungen des GITHUB_TOKEN für die Bereitstellung auf GitHub Pages fest
   permissions:
     contents: read
     pages: write
     id-token: write

   # Erlaubt nur eine gleichzeitige Bereitstellung und überspringt zwischenzeitlich eingereihtes Ausführungen.
   # Laufende Ausführungen dürfen jedoch NICHT abgebrochen werden, damit diese Produktionsbereitstellungen abgeschlossen werden können.
   concurrency:
     group: pages
     cancel-in-progress: false

   jobs:
     # Build-Aufgabe
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v5
           with:
             fetch-depth: 0 # Not needed if lastUpdated is not enabled
         # - uses: pnpm/action-setup@v4 # Uncomment this block if you're using pnpm
         #   with:
         #     version: 9 # Not needed if you've set "packageManager" in package.json
         # - uses: oven-sh/setup-bun@v1 # Uncomment this if you're using Bun
         - name: Setup Node
           uses: actions/setup-node@v6
           with:
             node-version: 24
             cache: npm # or pnpm / yarn
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
           run: npm ci # or pnpm install / yarn install / bun install
         - name: Build with VitePress
           run: npm run docs:build # or pnpm docs:build / yarn docs:build / bun run docs:build
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: docs/.vitepress/dist

     # Bereitstellungsaufgabe
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       needs: build
       runs-on: ubuntu-latest
       name: Bereitstellen
       steps:
         - name: Bereitstellen to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

   ::: warning
   Stelle sicher, dass die Option `base` in deiner VitePress-Konfiguration korrekt konfiguriert ist. Weitere Informationen findest du unter [Einen öffentlichen Basispfad festlegen](#setting-a-public-base-path).
   :::

2. Wähle in den Repository-Einstellungen unter „Pages“ bei „Build and deployment > Source“ die Option „GitHub Actions“ aus.

3. Übertrage deine Änderungen auf den `main`-Branch und warte, bis der GitHub-Actions-Workflow abgeschlossen ist. Deine Website sollte anschließend unter `https://<username>.github.io/[repository]/` oder `https://<custom-domain>/` bereitstehen, abhängig von deinen Einstellungen. Deine Website wird bei jedem Push auf den `main`-Branch automatisch bereitgestellt.

### GitLab Pages

1. Setze `outDir` in der VitePress-Konfiguration auf `../public`. Konfiguriere die Option `base` auf `'/<repository>/'` wenn du unter `https://<username>.gitlab.io/<repository>/`. Du benötigst `base` nicht, wenn du eine benutzerdefinierte Domain, Benutzer- oder Gruppenseiten verwendest oder die Einstellung „Eindeutige Domain verwenden“ in GitLab aktiviert hast.

2. Erstelle eine Datei namens `.gitlab-ci.yml` im Stammverzeichnis deines Projekts mit folgendem Inhalt. Dadurch wird deine Website bei jeder Änderung am Inhalt erstellt und bereitgestellt:

   ```yaml [.gitlab-ci.yml]
   image: node:24
   pages:
     cache:
       paths:
         - node_modules/
     script:
       # - apk add git # Uncomment this if you're using small docker images like alpine and have lastUpdated enabled
       - npm install
       - npm run docs:build
     artifacts:
       paths:
         - public
     only:
       - main
   ```

<!-- Überschriften alphabetisch sortiert halten, nginx am Ende lassen -->

### Azure

1. Folge der [offiziellen Dokumentation](https://docs.microsoft.com/en-us/azure/static-web-apps/build-Konfiguration).

2. Setze diese Werte in deiner Konfigurationsdatei (und entferne nicht benötigte Werte wie `api_location`):

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### CloudRay

Du kannst deploy your VitePress project mit [CloudRay](https://cloudray.io/) by following these [instructions](https://cloudray.io/articles/how-to-deploy-vitepress-site).

### Firebase

1. Erstelle `firebase.json` und `.firebaserc` im Stammverzeichnis deines Projekts:

   `firebase.json`:

   ```json [firebase.json]
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

2. Nach `npm run docs:build` führe diesen Befehl aus, um die Website bereitzustellen:

   ```sh
   firebase deploy
   ```

### Heroku

1. Folge der Dokumentation und Anleitung für [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static).

2. Erstelle eine Datei namens `static.json` im Stammverzeichnis deines Projekts mit folgendem Inhalt:

   ```json [static.json]
   {
     "root": "docs/.vitepress/dist"
   }
   ```

### Hostinger

Du kannst deploy your VitePress project mit [Hostinger](https://www.hostinger.com/web-apps-hosting) by following these [instructions](https://www.hostinger.com/Unterstützung/how-to-deploy-a-nodejs-website-in-hostinger/). Wähle bei der Build-Konfiguration VitePress als Framework und setze das Stammverzeichnis auf `./docs`.

### Lizard

[Lizard (lizard.build)](https://lizard.build) builds VitePress sites von source and serves the generated HTML. For the layout verwendet in this guide, it detects `docs:build` and serves `docs/.vitepress/dist` on port `80`.

Install the [Lizard CLI](https://lizard.build/docs/cli) and sign in mit `lizard login`. To deploy a local source directory, run these commands von the project root containing `package.json`:

```sh
lizard init --name vitepress-docs
lizard add --service web
lizard up --service web --port 80
```

Lasse Überschreibungen für Build- und Startbefehle leer, damit die automatische Erkennung verwendet wird. Für GitHub-Bereitstellungen oder andere Strukturen siehe die [Lizard VitePress guide](https://lizard.build/docs/framework-guides/vitepress).

### Stormkit

Du kannst deploy your VitePress project to [Stormkit](https://www.stormkit.io) by following these [instructions](https://stormkit.io/blog/how-to-deploy-vitepress).

### Surge

Nach `npm run docs:build` führe diesen Befehl aus, um die Website auf [Surge](https://surge.sh):

```sh
npx surge docs/.vitepress/dist
```

### harvis

Nach `npm run docs:build` führe diesen Befehl aus, um die Website auf [harvis](https://harvis.dev):

```sh
npx harvis docs/.vitepress/dist
```

### nginx

Hier ist ein Beispiel für die Konfiguration eines nginx-Serverblocks. Diese Konfiguration enthält Gzip-Komprimierung für gängige textbasierte Assets, Regeln zum Ausliefern der statischen Dateien deiner VitePress-Website mit geeigneten Cache-Headern sowie die Behandlung von `cleanUrls: true`.

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
