# バッジ {#badge}

バッジを使うと、見出しにステータスを追加できます。たとえば、そのセクションの種類や対応バージョンを示すのに便利です。

## 使い方 {#usage}

グローバルに利用可能な `Badge` コンポーネントを使用します。

 ```html
 ### Title <Badge type="info" text="default" />
 ### Title <Badge type="tip" text="^1.9.0" />
 ### Title <Badge type="warning" text="beta" />
 ### Title <Badge type="danger" text="caution" />
 ```

上記のコードは次のように表示されます：

### Title <Badge type="info" text="default" />
### Title <Badge type="tip" text="^1.9.0" />
### Title <Badge type="warning" text="beta" />
### Title <Badge type="danger" text="caution" />

## 子要素のカスタマイズ {#custom-children}

`<Badge>` は子要素（`children`）を受け取り、バッジ内に表示できます。

 ```html
 ### Title <Badge type="info">custom element</Badge>
 ```

### Title <Badge type="info">custom element</Badge>

## 種類ごとの色をカスタマイズ {#customize-type-color}

CSS 変数を上書きすることで、バッジのスタイルをカスタマイズできます。以下はデフォルト値です：

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

`<Badge>` コンポーネントは次の props を受け取ります。

 ```ts
 interface Props {
   // `<slot>` が渡された場合、この値は無視されます。
   text?: string

   // 既定値は `tip`。
   type?: 'info' | 'tip' | 'warning' | 'danger'
 }
 ```
