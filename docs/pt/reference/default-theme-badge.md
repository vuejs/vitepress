# Emblema {#badge}

O emblema permite adicionar status aos seus cabeçalhos. Por exemplo, pode ser útil especificar o tipo da seção ou a versão suportada.

## Uso {#usage}

Você pode usar o componente `Badge` que está disponível globalmente.

```html
### Title <Badge type="info" text="default" />
### Title <Badge type="tip" text="^1.9.0" />
### Title <Badge type="warning" text="beta" />
### Title <Badge type="danger" text="caution" />
```

O código acima é apresentado como:

### Title <Badge type="info" text="default" />
### Title <Badge type="tip" text="^1.9.0" />
### Title <Badge type="warning" text="beta" />
### Title <Badge type="danger" text="caution" />

## Filiação Personalizada {#custom-children}

`<Badge>` aceita `children` (filhos), que serão exibidos no emblema.

```html
### Title <Badge type="info">custom element</Badge>
```

### Title <Badge type="info">custom element</Badge>

## Personalize o Tipo de Cor {#customize-type-color}

Você pode personalizar o estilo dos emblemas sobrepondo variáveis CSS. Os seguintes são os valores padrão:

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

O componente `<Badge>` aceita as seguintes propriedades:

```ts
interface Props {
  // Quando `<slot>` é passado, esse valor é ignorado.
  text?: string

  // O padrão é `tip`.
  type?: 'info' | 'tip' | 'warning' | 'danger'
}
```
