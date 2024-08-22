# Badge {#badge}

Los Badge te permite agregar estados a tus encabezados. Por ejemplo, podría resultar útil especificar el tipo de sección o la version compatible.

## Uso {#usage}

Puedes usar el componente `Badge` que está disponible globalmente.

```html
### Title <Badge type="info" text="default" />
### Title <Badge type="tip" text="^1.9.0" />
### Title <Badge type="warning" text="beta" />
### Title <Badge type="danger" text="caution" />
```

el código anterior se representa como:

### Title <Badge type="info" text="default" />
### Title <Badge type="tip" text="^1.9.0" />
### Title <Badge type="warning" text="beta" />
### Title <Badge type="danger" text="caution" />

## Personalizar hijos {#custom-children}

`<Badge>` acepta `children` (hijos), que se mostrará en el badge.

```html
### Title <Badge type="info">custom element</Badge>
```

### Title <Badge type="info">custom element</Badge>

## Personalizar Tipo de Color {#customize-type-color}

Puedes personalizar el estilo del badge anulando las variables CSS. los siguiente son los valores predeterminados:

```css
:root {
  --vp-badge-info-border: transparent;
  --vp-badge-info-text: var(--vp-c-text-2);
  --vp-badge-info-bg: var(--vp-c-default-soft);

  --vp-badge-tip-border: transparent;
  --vp-badge-tip-text: var(--vp-c-brand-1);
  --vp-badge-tip-bg: var(--vp-c-brand-soft);

  --vp-badge-warning-border: transparent;
  --vp-badge-warning-text: var(--vp-c-warning-1);
  --vp-badge-warning-bg: var(--vp-c-warning-soft);

  --vp-badge-danger-border: transparent;
  --vp-badge-danger-text: var(--vp-c-danger-1);
  --vp-badge-danger-bg: var(--vp-c-danger-soft);
}
```

## `<Badge>`

El componente `<Badge>` acepta las siguiente propiedades:

```ts
interface Props {
  // Cuando se pasa `<slot>` ese valor es ignorado.
  text?: string

  // El valor predeterminado es `tip`.
  type?: 'info' | 'tip' | 'warning' | 'danger'
}
```
