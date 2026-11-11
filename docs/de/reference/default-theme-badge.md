---
description: Verwende die Badge-Komponente, um Statusbezeichnungen zu Überschriften in der VitePress-Dokumentation hinzuzufügen.
---

# Badge

Mit dem Badge kannst du deinen Überschriften einen Status hinzufügen. Zum Beispiel kann damit der Typ eines Abschnitts oder die unterstützte Version angegeben werden.

## Verwendung

Du kannst die global verfügbare `Badge`-Komponente verwenden.

```html
### Titel <Badge type="info" text="default" />
### Titel <Badge type="tip" text="^1.9.0" />
### Titel <Badge type="warning" text="beta" />
### Titel <Badge type="danger" text="deprecated" />
```

Der obige Code wird folgendermaßen dargestellt:

### Titel <Badge type="info" text="Standard" />
### Titel <Badge type="tip" text="^1.9.0" />
### Titel <Badge type="warning" text="beta" />
### Titel <Badge type="danger" text="deprecated" />

## Eigenes Children

`<Badge>` akzeptiert `children`, die im Badge angezeigt werden.

```html
### Titel <Badge type="info">benutzerdefiniertes Element</Badge>
```

### Titel <Badge type="info">benutzerdefiniertes Element</Badge>

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
  // Wenn `<slot>` übergeben wird, wird dieser Wert ignoriert.
  text?: string

  // Defaults to `tip`. Matches markdown containers/alerts colors.
  type?: 'info' | 'note' | 'tip' | 'important' | 'caution' | 'warning' | 'danger'
}
```
