---
description: MPA-Modus (Multi-Page Application) in VitePress für Seiten ohne JavaScript mit besserer anfänglicher Performance.
---

# MPA-Modus <Badge type="warning" text="experimental" />

Der MPA-Modus (Multi-Page Application) kann über die Kommandozeile mit `vitepress build --mpa` oder über die Konfiguration mit der Option `mpa: true` aktiviert werden.

Im MPA-Modus werden standardmäßig alle Seiten ohne eingebundenes JavaScript gerendert. Dadurch erreicht die Produktionswebsite bei der ersten Ansicht wahrscheinlich bessere Performance-Werte in Prüfwerkzeugen.

Da die SPA-Navigation fehlt, führen Links zwischen Seiten jedoch zu vollständigen Seitenneuladungen. Navigationen nach dem Laden fühlen sich im MPA-Modus daher nicht so unmittelbar an wie im SPA-Modus.

Beachte außerdem, dass „standardmäßig kein JavaScript“ bedeutet, dass Vue im Wesentlichen nur als serverseitige Template-Sprache verwendet wird. Im Browser werden keine Event-Handler registriert, sodass keine Interaktivität vorhanden ist. Um clientseitiges JavaScript zu laden, musst du das spezielle `<script client>`-Tag verwenden:

```html
<script client>
document.querySelector('h1').addEventListener('click', () => {
  console.log('client side JavaScript!')
})
</script>

# Hello
```

`<script client>` ist eine reine VitePress-Funktion und keine Vue-Funktion. Sie funktioniert sowohl in `.md`- als auch in `.vue`-Dateien, aber nur im MPA-Modus. Client-Skripte aller Theme-Komponenten werden gemeinsam gebündelt, während das Client-Skript einer bestimmten Seite nur für diese Seite aufgeteilt wird.

Beachte, dass `<script client>` **nicht als Vue-Komponentencode ausgewertet wird**: Es wird als gewöhnliches JavaScript-Modul verarbeitet. Deshalb solltest du den MPA-Modus nur verwenden, wenn deine Website unbedingt minimale clientseitige Interaktivität benötigt.
