---
description: Erfahre, wie man in VitePress auf statische Assets wie Bilder, Medien und Schriftarten verweisen und diese handhaben kann.
---

# Asset-Handhabung

## Referenzieren statischer Assets

Alle Markdown-Dateien werden in Vue-Komponenten kompiliert und von [Vite](https://vite.dev/guide/assets.html) verarbeitet. Sie können – **und sollten** – Assets über relative URLs referenzieren:

```md
![Ein Bild](./image.png)
```

Sie können in Ihren Markdown-Dateien, `*.vue`-Komponenten des Themes, Styles und reinen `.css`-Dateien auf statische Assets verweisen – entweder über absolute Public-Pfade (ausgehend vom Projektstammverzeichnis) oder über relative Pfade (bezogen auf das Dateisystem). Letzteres entspricht dem Verhalten, das Sie bereits von Vite, der Vue CLI oder dem `file-loader` von webpack kennen.

Gängige Datei-Formate für Bilder, Medien und Schriftarten werden automatisch erkannt und als Assets eingebunden.

::: tip Verlinkte Dateien werden nicht als Assets behandelt
PDFs oder andere Dokumente, auf die in Markdown-Dateien verlinkt wird, werden nicht automatisch als Assets behandelt. Um verlinkte Dateien verfügbar zu machen, müssen Sie diese manuell im [`public`](#the-public-directory)-Verzeichnis Ihres Projekts ablegen.
:::

Alle referenzierten Assets – einschließlich derer, die absolute Pfade verwenden – werden im Produktions-Build mit einem Hash-Dateinamen in das Ausgabeverzeichnis kopiert. Assets, auf die nicht verwiesen wird, werden nicht kopiert. Bild-Assets, die kleiner als 4 KB sind, werden als Base64 eingebettet; dieses Verhalten lässt sich über die Konfigurationsoption [`vite`](../reference/site-config#vite) anpassen.

Alle **statischen** Pfadreferenzen, einschließlich absoluter Pfade, sollten auf der Struktur Ihres Arbeitsverzeichnisses basieren.

## Das öffentliche Verzeichnis

Manchmal müssen statische Assets bereitgestellt werden, auf die in Ihren Markdown- oder Theme-Komponenten nicht direkt verwiesen wird, oder Sie möchten bestimmte Dateien unter ihrem ursprünglichen Dateinamen ausliefern. Beispiele für solche Dateien sind `robots.txt`, Favicons und PWA-Icons.

Sie können diese Dateien im `public`-Verzeichnis innerhalb des [Quellverzeichnisses](./routing#source-directory) ablegen. Wenn sich das Stammverzeichnis Ihres Projekts beispielsweise unter `./docs` befindet und Sie den Standardpfad für das Quellverzeichnis verwenden, lautet der Pfad zu Ihrem `public`-Verzeichnis `./docs/public`.

Im Ordner `public` abgelegte Assets werden unverändert in das Stammverzeichnis des Ausgabeordners kopiert.

Beachten Sie, dass Dateien aus dem Ordner `public` über einen absoluten Pfad ausgehend vom Stammverzeichnis referenziert werden sollten – so sollte beispielsweise `public/icon.png` im Quellcode stets als `/icon.png` angesprochen werden.

## Basis-URL

Wenn Ihre Website unter einer URL bereitgestellt wird, die nicht das Stammverzeichnis (Root) ist, legen Sie die Option [`base`](../reference/site-config#base) fest. Wenn Sie Ihre Website beispielsweise unter `https://foo.github.io/bar/` bereitstellen möchten, sollte `base` auf `'/bar/'` gesetzt werden.

Verweise auf statische Assets werden automatisch an die Basis (Base) angepasst; daher funktioniert ein absoluter Verweis auf eine Datei im Ordner `public` mit jeder beliebigen Basis und muss nie aktualisiert werden:

```md
![Ein Bild](/bild-in-public.png)
```

Nur dynamisch erstellte Pfade erfordern besondere Aufmerksamkeit – zum Beispiel ein Bild, dessen `src`-Attribut auf einem Konfigurationswert des Themes basiert. Umschließe diese mit dem [`withBase`-Hilfsprogramm](../reference/runtime-api#withbase), damit der Basis-Pfad zur Laufzeit vorangestellt wird:

```vue
<script setup>
import { withBase, useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img :src="withBase(theme.logoPath)" />
</template>
```

## Bereitstellung von Assets über ein CDN

Um die generierten Assets – Skripte, Styles, Schriftarten und Bilder, die aus Markdown oder Komponenten importiert wurden – von einem anderen Ursprung (Origin) als die Seiten bereitzustellen, konfigurieren Sie [`assetsBase`](../reference/site-config#assetsbase):

```ts
export default {
  base: '/',
  assetsBase: 'https://cdn.beispiel.de/'
}
```

Laden Sie das Verzeichnis `assets` aus der Build-Ausgabe auf das CDN hoch, sodass es unter `https://cdn.example.com/assets/` erreichbar ist, und stellen Sie den Rest der Ausgabe wie gewohnt auf Ihrer Website bereit. Dateien im Ordner `public` werden von `base` aus referenziert und verbleiben bei den Seiten.

Da der Wert oft umgebungsspezifisch ist, kann er auch über die Befehlszeile übergeben werden:

```sh
vitepress build docs --assetsBase "$CDN_URL"
```

::: warning CORS erforderlich
Modul-Skripte werden immer im CORS-Modus geladen; daher muss ein Cross-Origin-CDN mit einem entsprechenden `Access-Control-Allow-Origin`-Header antworten.
:::
