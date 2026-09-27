---
description: Verwende die Badge-Komponente, um Statusbezeichnungen zu Überschriften in der VitePress-Dokumentation hinzuzufügen.
---

# Badge

Mit dem Badge kannst du deinen Überschriften einen Status hinzufügen. Zum Beispiel kann damit der Typ eines Abschnitts oder die unterstützte Version angegeben werden.

## Verwendung

Du kannst die global verfügbare `Badge`-Komponente verwenden.

```html
### Title <Badge type="info" text="default" />
### Title <Badge type="tip" text="^1.9.0" />
### Title <Badge type="warning" text="beta" />
### Title <Badge type="danger" text="deprecated" />
```

Der obige Code wird folgendermaßen dargestellt:

### Title <Badge type="info" text="Standard" />
### Title <Badge type="tip" text="^1.9.0" />
### Title <Badge type="warning" text="beta" />
### Title <Badge type="danger" text="deprecated" />

## Eigenes Children

`<Badge>` akzeptiert `children`, die im Badge angezeigt werden.

```html
### Title <Badge type="info">custom element</Badge>
```

### Title <Badge type="info">custom element</Badge>

## Farbe und Typ anpassen

Du kannst das Erscheinungsbild der Badges durch Überschreiben der CSS-Variablen anpassen. Die folgenden Werte sind die Standardwerte:

```css
:root {
  --vp-badge-info-border: transparent;
  --vp-badge-info-text: var(--vp-c-text-2);
  --vp-badge-info-bg: var(--vp-c-default-soft);

  --vp-badge-note-border: transparent;
  --vp-badge-note-text: var(--vp-c-note-1);
  --vp-badge-note-bg: var(--vp-c-note-soft);

  --vp-badge-tip-border: transparent;
  --vp-badge-tip-text: var(--vp-c-tip-1);
  --vp-badge-tip-bg: var(--vp-c-tip-soft);

  --vp-badge-important-border: transparent;
  --vp-badge-important-text: var(--vp-c-important-1);
  --vp-badge-important-bg: var(--vp-c-important-soft);

  --vp-badge-caution-border: transparent;
  --vp-badge-caution-text: var(--vp-c-caution-1);
  --vp-badge-caution-bg: var(--vp-c-caution-soft);

  --vp-badge-warning-border: transparent;
  --vp-badge-warning-text: var(--vp-c-warning-1);
  --vp-badge-warning-bg: var(--vp-c-warning-soft);

  --vp-badge-danger-border: transparent;
  --vp-badge-danger-text: var(--vp-c-danger-1);
  --vp-badge-danger-bg: var(--vp-c-danger-soft);
}
```

## `<Badge>`

Die Komponente `<Badge>` akzeptiert die folgenden Props:

```ts
interface Props {
  // When `<slot>` is passed, this value gets ignored.
  text?: string

  // Defaults to `tip`. Matches markdown containers/alerts colors.
  type?: 'info' | 'note' | 'tip' | 'important' | 'caution' | 'warning' | 'danger'
}
```
