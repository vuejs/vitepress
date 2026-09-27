---
description: Erfahre, wie du statische Assets wie Bilder, Medien und Schriftarten in VitePress referenzierst und verwaltest.
---

# Asset-Verwaltung

## Statische Assets referenzieren

Alle Markdown-Dateien werden in Vue-Komponenten kompiliert und von [Vite](https://vite.dev/guide/assets.html) verarbeitet. Du kannst und solltest Assets über relative URLs referenzieren:

\`\`\`md
![Ein Bild](./image.png)
\`\`\`

Du kannst statische Assets in deinen Markdown-Dateien, deinen \`*.vue\`-Komponenten im Theme, Styles und normalen \`.css\`-Dateien entweder über absolute öffentliche Pfade (bezogen auf das Projektverzeichnis) oder über relative Pfade (bezogen auf dein Dateisystem) referenzieren. Letzteres funktioniert ähnlich wie bei Vite, Vue CLI oder Webpacks \`file-loader\`.

Gängige Bild-, Medien- und Schriftdateitypen werden automatisch erkannt und als Assets eingebunden.

::: tip Verknüpfte Dateien werden nicht als Assets behandelt
PDFs oder andere Dokumente, auf die in Markdown-Dateien verlinkt wird, werden nicht automatisch als Assets behandelt. Damit verknüpfte Dateien zugänglich sind, musst du sie manuell im Verzeichnis [\`public\`](#das-public-verzeichnis) deines Projekts ablegen.
:::

Alle referenzierten Assets, einschließlich solcher mit absoluten Pfaden, werden beim Produktions-Build mit einem gehashten Dateinamen in das Ausgabeverzeichnis kopiert. Nicht referenzierte Assets werden nicht kopiert. Bild-Assets unter 4 KB werden als Base64 eingebettet. Dies kann über die [\`vite\`](../reference/site-config#vite)-Konfigurationsoption angepasst werden.

Alle **statischen** Pfadangaben, einschließlich absoluter Pfade, sollten auf deiner Arbeitsverzeichnisstruktur basieren.

## Das Public-Verzeichnis

Manchmal musst du statische Assets bereitstellen, die in keiner deiner Markdown-Dateien oder Theme-Komponenten direkt referenziert werden, oder bestimmte Dateien unter ihrem ursprünglichen Dateinamen ausliefern. Beispiele hierfür sind \`robots.txt\`, Favicons und PWA-Icons.

Du kannst diese Dateien im Verzeichnis \`public\` unterhalb des [Quellverzeichnisses](./routing#quellverzeichnis) ablegen. Wenn dein Projektverzeichnis beispielsweise \`./docs\` ist und das Standard-Quellverzeichnis verwendet wird, lautet dein Public-Verzeichnis \`./docs/public\`.

Assets im Verzeichnis \`public\` werden unverändert in das Stammverzeichnis des Ausgabeverzeichnisses kopiert.

Beachte, dass du Dateien aus \`public\` mit einem absoluten Pfad vom Stammverzeichnis referenzieren solltest. \`public/icon.png\` sollte im Quellcode beispielsweise immer als \`/icon.png\` referenziert werden.

## Basis-URL

Wenn deine Website unter einer URL bereitgestellt wird, die nicht dem Stammverzeichnis entspricht, setze die Option [\`base\`](../reference/site-config#base). Wenn du deine Website beispielsweise unter \`https://foo.github.io/bar/\` bereitstellen möchtest, sollte \`base\` auf \`'/bar/'\` gesetzt werden.

Referenzen auf statische Assets werden automatisch an \`base\` angepasst. Eine absolute Referenz auf eine Datei in \`public\` funktioniert daher mit jedem \`base\` und muss nicht aktualisiert werden:

\`\`\`md
![Ein Bild](/image-innerhalb-public.png)
\`\`\`

Nur dynamisch erzeugte Pfade benötigen besondere Behandlung – beispielsweise ein Bild, dessen \`src\` auf einem Wert aus der Theme-Konfiguration basiert. Um den Basis-Pfad zur Laufzeit voranzustellen, umschließe solche Pfade mit dem [\`withBase\`-Helper](../reference/runtime-api#withbase):

\`\`\`vue
<script setup>
import { withBase, useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img :src="withBase(theme.logoPath)" />
</template>
\`\`\`

## Assets über ein CDN ausliefern

Um generierte Assets – Skripte, Styles, Schriftarten und aus Markdown oder Komponenten importierte Bilder – von einer anderen Origin als den Seiten auszuliefern, setze [\`assetsBase\`](../reference/site-config#assetsbase):

\`\`\`ts
export default {
  base: '/',
  assetsBase: 'https://cdn.example.com/'
}
\`\`\`

Lade das Verzeichnis \`assets\` aus dem Build-Ausgabeverzeichnis auf das CDN hoch, sodass es unter \`https://cdn.example.com/assets/\` erreichbar ist, und stelle den restlichen Output wie gewohnt auf deiner Website bereit. Dateien in \`public\` werden relativ zu \`base\` referenziert und bleiben bei den Seiten.

Da der Wert häufig von der Umgebung abhängt, kann er auch über die Kommandozeile übergeben werden:

\`\`\`sh
vitepress build docs --assetsBase "$CDN_URL"
\`\`\`

::: warning CORS erforderlich
Modul-Skripte werden immer im CORS-Modus geladen. Daher muss ein CDN über verschiedene Origins einen passenden \`Access-Control-Allow-Origin\`-Header zurückgeben.
:::
