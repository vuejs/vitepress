# Значки {#badge}

С помощью значков удобно добавлять статус к заголовкам. Например, может быть полезно указать тип раздела или поддерживаемую версию.

## Использование {#usage}

Вы можете использовать компонент `Badge`, который доступен глобально.

```html
### Заголовок <Badge type="info" text="по умолчанию" /> ### Заголовок
<Badge type="tip" text="^1.9.0" /> ### Заголовок
<Badge type="warning" text="beta" /> ### Заголовок
<Badge type="danger" text="осторожно" />
```

Приведённый выше код даёт такой результат:

### Заголовок <Badge type="info" text="по умолчанию" /> {#title}

### Заголовок <Badge type="tip" text="^1.9.0" /> {#title-1}

### Заголовок <Badge type="warning" text="beta" /> {#title-2}

### Заголовок <Badge type="danger" text="осторожно" /> {#title-3}

## Дочерние элементы {#custom-children}

`<Badge>` принимает параметр `children`, который будет отображаться внутри значка.

```html
### Заголовок <Badge type="info">вложенный элемент</Badge>
```

### Заголовок <Badge type="info">вложенный элемент</Badge>

## Настройка стиля значков {#customize-type-color}

Вы можете настроить стиль значков, переопределив переменные CSS. Ниже приведены значения по умолчанию:

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

## `<Badge>` {#badge-1}

Компонент `<Badge>` принимает следующие параметры:

```ts
interface Props {
  // Когда передается `<slot>`, это значение игнорируется.
  text?: string

  // По умолчанию: `tip`.
  type?: 'info' | 'tip' | 'warning' | 'danger'
}
```
