# 배지 {#badge}

배지는 헤더에 상태를 추가할 수 있게 해줍니다. 예를 들어, 섹션의 유형이나 지원되는 버전을 명시하는 것이 유용할 수 있습니다.

## 사용법 {#usage}

글로벌하게 사용 가능한 `Badge` 컴포넌트를 사용할 수 있습니다.

```html
### 제목 <Badge type="info" text="default" />
### 제목 <Badge type="tip" text="^1.9.0" />
### 제목 <Badge type="warning" text="beta" />
### 제목 <Badge type="danger" text="주의" />
```

위 코드는 다음과 같이 렌더링됩니다:

### 제목 <Badge type="info" text="default" />
### 제목 <Badge type="tip" text="^1.9.0" />
### 제목 <Badge type="warning" text="beta" />
### 제목 <Badge type="danger" text="주의" />

## 사용자 정의 자식 요소 {#custom-children}

`<Badge>`는 `children`을 받아들이며, 이는 배지 안에 표시됩니다.

```html
### 제목 <Badge type="info">사용자 정의 요소</Badge>
```

### 제목 <Badge type="info">사용자 정의 요소</Badge>

## 타입 색상 사용자 정의 {#customize-type-color}

css 변수를 오버라이딩함으로써 배지의 스타일을 사용자 정의할 수 있습니다. 다음은 기본값입니다:

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

`<Badge>` 컴포넌트는 다음의 prop들을 받습니다:

```ts
interface Props {
  // `<slot>`이 전달되면, 이 값은 무시됩니다.
  text?: string

  // 기본값은 `tip`입니다.
  type?: 'info' | 'tip' | 'warning' | 'danger'
}
```
