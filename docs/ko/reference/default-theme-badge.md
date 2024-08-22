# 배지 {#badge}

배지는 헤더에 상태를 추가할 수 있게 해줍니다. 예를 들어, 섹션의 타입을 지정하거나 지원되는 버전을 표시하는 데 유용할 수 있습니다.

## 사용법 {#usage}

`Badge` 컴포넌트는 전역으로 사용 가능합니다.

```html
### 제목 <Badge type="info" text="default" />
### 제목 <Badge type="tip" text="^1.9.0" />
### 제목 <Badge type="warning" text="배타" />
### 제목 <Badge type="danger" text="주의" />
```

위 코드는 다음과 같이 렌더링됩니다:

### 제목 <Badge type="info" text="default" />
### 제목 <Badge type="tip" text="^1.9.0" />
### 제목 <Badge type="warning" text="배타" />
### 제목 <Badge type="danger" text="주의" />

## 커스텀 하위 노드 {#custom-children}

`<Badge>`는 `children`을 받아서 배지 내부에 표시합니다.

```html
### 제목 <Badge type="info">커스텀 노드</Badge>
```

### 제목 <Badge type="info">커스텀 노드</Badge>

## 타입 색상 커스터마이징 {#customize-type-color}

배지의 스타일은 CSS 변수를 재정의하여 커스터마이징 할 수 있습니다. 다음은 기본값입니다:

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

`<Badge>` 컴포넌트는 다음과 같은 프로퍼티를 사용합니다:

```ts
interface Props {
  // `<slot>`이 전달되면, 이 값은 무시됨.
  text?: string

  // 기본값: `tip`.
  type?: 'info' | 'tip' | 'warning' | 'danger'
}
```
