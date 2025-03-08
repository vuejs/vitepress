# افزونه‌های Markdown {#markdown-extensions}

ویت‌پرس با افزونه‌های markdown داخلی ارائه شده است.

## لینک‌های هدر {#header-anchors}

هدرها به طور خودکار لینک‌های anchor دریافت می‌کنند. نمایش anchor ها با استفاده از گزینه `markdown.anchor` قابل پیکربندی است.

### anchor های سفارشی {#custom-anchors}

برای مشخص کردن تگ anchor سفارشی برای یک هدینگ به جای استفاده از تگ خودکار، یک پسوند به هدینگ اضافه کنید:

```
# Using custom anchors {#my-anchor}
```

این به شما امکان می‌دهد که به جای استفاده از به جای استفاده از `#using-custom-anchors`، به هدینگ به عنوان `#my-anchor` لینک دهید.

## لینک‌ها {#links}

هم لینک‌های داخلی و هم خارجی با دستورالعمل‌های خاصی ارائه می‌شوند.

### لینک‌های داخلی {#internal-links}

لینک‌های داخلی به لینک روتر برای ناوبری SPA تبدیل می‌شوند. همچنین، هر `index.md` موجود در هر زیرپوشه به طور خودکار به `index.html` تبدیل می‌شود، با URL متناظر `/`.

به عنوان مثال، با توجه به ساختار پوشه زیر:

```
.
├─ index.md
├─ foo
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ bar
   ├─ index.md
   ├─ three.md
   └─ four.md
```

و با فرض این که شما در `foo/one.md` هستید:

```md
[Home](/) <!-- sends the user to the root index.md -->
[foo](/foo/) <!-- sends the user to index.html of directory foo -->
[foo heading](./#heading) <!-- anchors user to a heading in the foo index file -->
[bar - three](../bar/three) <!-- you can omit extension -->
[bar - three](../bar/three.md) <!-- you can append .md -->
[bar - four](../bar/four.html) <!-- or you can append .html -->
```

### پسوند صفحه  {#page-suffix}

صفحات و لینک‌های داخلی به طور پیش‌فرض با پسوند `.html` تولید می‌شوند.

### لینک‌های خارجی {#external-links}

لینک‌های خروجی به طور خودکار دارای `target="_blank" rel="noreferrer"` هستند:

- [vuejs.org](https://vuejs.org)
- [ویت‌پرس در GitHub](https://github.com/vuejs/vitepress)

## Frontmatter {#frontmatter}

[YAML frontmatter](https://jekyllrb.com/docs/front-matter/) به طور پیش‌فرض پشتیبانی می‌شود:

```yaml
---
title: عنوان صفحه
lang: fa-IR
---
```

این داده‌ها برای بقیه صفحه در دسترس خواهد بود، همراه با تمامی اجزاهای سفارشی و تم.

برای اطلاعات بیشتر، به [Frontmatter](../reference/frontmatter-config) مراجعه کنید.

## جداول مانند Github   {#github-style-tables}

**ورودی**

```md
| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |
```

**خروجی**

| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |

## اموجی :tada: {#emoji}

**ورودی**

```
:tada: :100:
```

**خروجی**

:tada: :100:

یک [لیست از همه اموجی ها](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.mjs) در دسترس است.

## فهرست مطالب {#table-of-contents}

**ورودی**

```
[[toc]]
```

**خروجی**

[[toc]]

نحوه پردازش فهرست مطالب با استفاده از گزینه `markdown.toc` قابل پیکربندی است.

## کانتینرهای سفارشی {#custom-containers}

کانتینرهای سفارشی می‌توانند توسط انواع، عناوین و محتویات خود تعریف شوند.

### عنوان پیش‌فرض {#default-title}

**ورودی**

```md
::: info
این یک جعبه اطلاعات است.
:::

::: tip
این یک نکته است.
:::

::: warning
این یک هشدار است.
:::

::: danger
این یک هشدار خطرناک است.
:::

::: details
این یک بلوک جزئیات است.
:::
```

**خروجی**

::: info اطلاعات
این یک جعبه اطلاعات است.
:::

::: tip نکته
این یک نکته است.
:::

::: warning هشدار
این یک هشدار است.
:::

::: danger خطر
این یک هشدار خطرناک است.
:::

::: details جزئیات
این یک بلوک جزئیات است.
:::

### عنوان سفارشی {#custom-title}

می‌توانید عنوان سفارشی را با اضافه کردن متن به انتهای نوع کانتینر تنظیم کنید.

**ورودی**

````md
::: danger ایست!
منطقه خطرناک، ادامه ندهید
:::

::: details برای مشاهده کد کلیک کنید
```js
console.log('Hello, ویت‌پرس!')
```
:::
````

**خروجی**

::: danger ایست!
منطقه خطرناک، ادامه ندهید
:::

::: details برای مشاهده کد کلیک کنید
```js
console.log('Hello, ویت‌پرس!')
```
:::

این همچنین امکان دارد که شما عنوان‌های سفارشی را به صورت global تنظیم کنید با اضافه کردن محتوای زیر به تنظیمات سایت. این امکان خاصا اگر به زبان انگلیسی نوشته نمی‌شود، بسیار مفید است:

```ts
// config.ts
export default defineConfig({
  // ...
  markdown: {
    container: {
      tipLabel: 'نکته',
      warningLabel: 'اخطار',
      dangerLabel: 'خطر',
      infoLabel: 'اطلاعات',
      detailsLabel: 'جزئیات'
    }
  }
  // ...
})
```

### `raw` {#raw}

این یک کانتینر ویژه است که می‌تواند برای جلوگیری از تداخل استایل و روتر با ویت‌پرس استفاده شود. این به ویژه زمانی مفید است که شما کتابخانه‌های کامپوننت را مستند کنید. می‌توانید همچنین [whyframe](https://whyframe.dev/docs/integrations/vitepress) را برای ایزوله‌تر شدن بیشتر بررسی کنید.

**نحوه استفاده**

```md
::: raw
بسته‌بندی در یک `<div class="vp-raw">`
:::
```

کلاس `vp-raw` می‌تواند به صورت مستقیم بر روی عناصر استفاده شود. ایزوله‌سازی استایل در حال حاضر انتخابی است:

- `postcss` را با مدیر بسته‌های مورد علاقه‌تان نصب کنید:

  ```sh
  $ npm add -D postcss
  ```

- یک فایل با نام `docs/postcss.config.mjs` ایجاد کنید و کد زیر را به آن اضافه کنید:

  ```js
  import { postcssIsolateStyles } from 'vitepress'

  export default {
    plugins: [postcssIsolateStyles()]
  }
  ```

  این از [`postcss-prefix-selector`](https://github.com/postcss/postcss-load-config) استفاده می‌کند. می‌توانید گزینه‌های آن را به این صورت پاس بدهید:

  ```js
  postcssIsolateStyles({
    includeFiles: [/vp-doc\.css/] // به طور پیش‌فرض /base\.css/
  })
  ```

## هشدارهای GitHub {#github-flavored-alerts}

ویت‌پرس همچنین [هشدارهای GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts) را برای نمایش به عنوان تماس‌ها پشتیبانی می‌کند. آن‌ها به همان شکلی که [کانتینرهای سفارشی](#custom-containers) نمایش داده می‌شوند.

```md
> [!NOTE]
> اطلاعاتی که کاربران باید به آن توجه کنند، حتی اگر سریع بخوانند.

> [!TIP]
> اطلاعات اختیاری برای کمک به کاربر برای موفقیت بیشتر.

> [!IMPORTANT]
> اطلاعات حیاتی برای موفقیت کاربران.

> [!WARNING]
> محتوای بحرانی که نیاز به توجه فوری کاربر دارد به دلیل خطرات پتانسیلی.

> [!CAUTION]
> پیامدهای منفی احتمالی یک عمل.
```

> [!NOTE]
> اطلاعاتی که کاربران باید به آن توجه کنند، حتی اگر سریع بخوانند.

> [!TIP]
> اطلاعات اختیاری برای کمک به کاربر برای موفقیت بیشتر.

> [!IMPORTANT]
> اطلاعات حیاتی برای موفقیت کاربران.

> [!WARNING]
> محتوای بحرانی که نیاز به توجه فوری کاربر دارد به دلیل خطرات پتانسیلی.

> [!CAUTION]
> پیامدهای منفی احتمالی یک عمل.

## Syntax Highlighting در بلوک‌های کد {#syntax-highlighting-in-code-blocks}

ویت‌پرس از [Shiki](https://github.com/shikijs/shiki) برای syntax highlighting زبان در بلوک‌های کد Markdown با استفاده از متن رنگی استفاده می‌کند. Shiki از تنوع وسیعی از زبان‌های برنامه‌نویسی پشتیبانی می‌کند. تنها کافی است که یک نام مستعار زبان معتبر به بکتیک‌ها ابتدایی کد اضافه کنید:

**ورودی**

````
```js
export default {
  name: 'MyComponent',
  // ...
}
```
````

````
```html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```
````

**خروجی**

```js
export default {
  name: 'MyComponent'
  // ...
}
```

```html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```

یک [لیست از زبان‌های معتبر](https://shiki.style/languages) در مخزن Shiki موجود است.

همچنین می‌توانید تم syntax highlighting را در تنظیمات برنامه سفارشی کنید. لطفاً به [گزینه‌های Markdown](../reference/site-config#markdown) برای جزئیات بیشتر مراجعه کنید.

## برجسته‌سازی خطوط در بلوک‌های کد {#line-highlighting-in-code-blocks}

**ورودی**

````
```js{4}
export default {
  data () {
    return {
      msg: 'برجسته‌سازی شده!'
    }
  }
}
```
````

**خروجی**

```js{4}
export default {
  data () {
    return {
      msg: 'برجسته‌سازی شده!'
    }
  }
}
```

علاوه بر یک خط، می‌توانید چندین خط تکی، محدوده‌ها یا هر دو را نیز مشخص کنید:

- محدوده‌های خط: به عنوان مثال `{5-8}`, `{3-10}`, `{10-17}`
- چند خط تک: به عنوان مثال `{4,7,9}`
- محدوده‌های خط و خط‌های تک: به عنوان مثال `{4,7-13,16,23-27,40}`

**ورودی**

````
```js{1,4-6}
const message = 'Hello, World!';

console.log(message);
```
````

**خروجی**

```js{1,4-6}
const message = 'Hello, World!';

console.log(message);
```

## فکوس در بلاک‌های کد {#focus-in-code-blocks}

افزودن کامنت `// [!code focus]` به یک خط، روی آن فکوس می‌کند و بخش‌های دیگر کد را مات می‌کند.

به‌علاوه، می‌توانید با استفاده از `// [!code focus:<lines>]` تعدادی خط را برای فکوس تعیین کنید.

**ورودی**

````
```js
export default {
  data () {
    return {
      msg: 'Focused!' // [!!code focus]
    }
  }
}
```
````

**خروجی**

```js
export default {
  data() {
    return {
      msg: 'Focused!' // [!code focus]
    }
  }
}
```

## تفاوت‌های رنگی در بلاک‌های کد {#colored-diffs-in-code-blocks}

افزودن کامنت `// [!code --]` یا `// [!code ++]` به یک خط، یک تفاوت را در آن خط ایجاد می‌کند، با حفظ رنگ‌های بلاک کد.

**ورودی**

````
```js
export default {
  data () {
    return {
      msg: 'Removed' // [!!code --]
      msg: 'Added' // [!!code ++]
    }
  }
}
```
````

**خروجی**

```js
export default {
  data () {
    return {
      msg: 'Removed' // [!code --]
      msg: 'Added' // [!code ++]
    }
  }
}
```

## خطاها و هشدارها در بلاک‌های کد {#errors-and-warnings-in-code-blocks}

افزودن کامنت `// [!code warning]` یا `// [!code error]` به یک خط، آن را مطابق با نوع، رنگ می‌کند.

**ورودی**

````
```js
export default {
  data () {
    return {
      msg: 'Error', // [!!code error]
      msg: 'Warning' // [!!code warning]
    }
  }
}
```
````

**خروجی**

```js
export default {
  data() {
    return {
      msg: 'Error', // [!code error]
      msg: 'Warning' // [!code warning]
    }
  }
}
```

## شماره‌گذاری خطوط {#line-numbers}

می‌توانید با استفاده از تنظیمات، شماره‌گذاری خطوط را برای هر بلاک کد فعال کنید:

```js
export default {
  markdown: {
    lineNumbers: true
  }
}
```

لطفاً [گزینه‌های markdown](../reference/site-config#markdown) را برای جزئیات بیشتر ببینید.

می‌توانید با استفاده از `:line-numbers` / `:no-line-numbers` در بلاک‌های کد شماره‌گذاری خطوط را نادیده بگیرید یا تنظیمات اصلی را با `=` پس از `:line-numbers` سفارشی کنید. به عنوان مثال، `:line-numbers=2` به معنای شروع شماره‌گذاری از خط `2` است.

**ورودی**

````md
```ts {1}
// شماره‌گذاری خطوط به طور پیش‌فرض غیرفعال است
const line2 = 'این خط ۲ است'
const line3 = 'این خط ۳ است'
```

```ts:line-numbers {1}
// شماره‌گذاری خطوط فعال است
const line2 = 'این خط ۲ است'
const line3 = 'این خط ۳ است'
```

```ts:line-numbers=2 {1}
// شماره‌گذاری خطوط فعال است و از خط ۲ شروع می‌شود
const line3 = 'این خط ۳ است'
const line4 = 'این خط ۴ است'
```
````

**خروجی**

```ts {1}
// شماره‌گذاری خطوط به طور پیش‌فرض غیرفعال است
const line2 = 'این خط ۲ است'
const line3 = 'این خط ۳ است'
```

```ts:line-numbers {1}
// شماره‌گذاری خطوط فعال است
const line2 = 'این خط ۲ است'
const line3 = 'این خط ۳ است'
```

```ts:line-numbers=2 {1}
// شماره‌گذاری خطوط فعال است و از خط ۲ شروع می‌شود
const line3 = 'این خط ۳ است'
const line4 = 'این خط ۴ است'
```

## وارد کردن Snippet کد {#import-code-snippets}

می‌توانید snippet های کد را از فایل‌های موجود با استفاده از دستور زیر وارد کنید:

```md
<<< @/filepath
```

این دستور [highlight کردن خط](#line-highlighting-in-code-blocks) را نیز پشتیبانی می‌کند:

```md
<<< @/filepath{highlightLines}
```

**ورودی**

```md
<<< @/snippets/snippet.js{2}
```

**فایل کد**

<<< @/snippets/snippet.js

**خروجی**

<<< @/snippets/snippet.js{2}

::: tip نکته
مقدار `@` با ریشه منبع مطابقت دارد. به‌طور پیش‌فرض، این ریشه پروژه ویت‌پرس است، مگر اینکه `srcDir` پیکربندی شده باشد. به‌طور جایگزینی، می‌توانید از مسیرهای نسبی وارد کنید:

```md
<<< ../snippets/snippet.js
```

:::

همچنین می‌توانید [ناحیه VS Code](https://code.visualstudio.com/docs/editor/codebasics#_folding) را برای اضافه کردن قسمت مربوطه فایل کد استفاده کنید. می‌توانید نام ناحیه سفارشی را پس از `#` به دنبال مسیر فایل تعیین کنید:

**ورودی**

```md
<<< @/snippets/snippet-with-region.js#snippet{1}
```

**فایل کد**

<<< @/snippets/snippet-with-region.js

**خروجی**

<<< @/snippets/snippet-with-region.js#snippet{1}

همچنین می‌توانید زبان را داخل آکولادها (`{}`) مشخص کنید:

```md
<<< @/snippets/snippet.cs{c#}

<!-- با highlight خطوط: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#}

<!-- با شماره‌گذاری خطوط: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#:line-numbers}
```

این قابلیت مفید است اگر زبان منبع نمی‌تواند از پسوند فایل استنتاج شود.


### گروه‌های کد {#code-groups}

می‌توانید چندین بلوک کد را به این شکل گروه‌بندی کنید:

**ورودی**

````md
::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
  // ...
}

export default config
```

:::
````

**خروجی**

::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
  // ...
}

export default config
```

:::

همچنین می‌توانید [قطعات کد](#import-code-snippets) را در گروه‌های کد وارد کنید:

**ورودی**

```md
::: code-group

<!-- به طور پیش‌فرض نام فایل به عنوان عنوان استفاده می‌شود -->

<<< @/snippets/snippet.js

<!-- می‌توانید یک عنوان سفارشی نیز ارائه دهید -->

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [قطعه با منطقه]
:::
```

**خروجی**

::: code-group

<<< @/snippets/snippet.js

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [قطعه با منطقه]
:::

## ادغام فایل‌های Markdown {#markdown-file-inclusion}

می‌توانید یک فایل Markdown را در یک فایل Markdown دیگر، حتی در صورت وجود تو در تو، وارد کنید.

::: tip نکته
می‌توانید مسیر Markdown را با `@` پیش‌فرض کنید. این به عنوان ریشه منبع عمل می‌کند. به طور پیش‌فرض، ریشه پروژه ویت‌پرس است، مگر اینکه `srcDir` پیکربندی شده باشد.
:::

به عنوان مثال، می‌توانید یک فایل Markdown نسبی را با استفاده از این کد وارد کنید:

**ورودی**

```md
# مستندات

## مبانی

<!--@include: ./parts/basics.md-->
```

**قسمت فایل** (`parts/basics.md`)

```md
بعضی موارد مربوط به شروع کار.

### پیکربندی

می‌توان با استفاده از `.foorc.json` ایجاد شد.
```

**کد معادل**

```md
# مستندات

## مبانی

بعضی موارد مربوط به شروع کار.

### پیکربندی

می‌توان با استفاده از `.foorc.json` ایجاد شد.
```

همچنین از انتخاب یک محدوده خطی پشتیبانی می‌کند:

**ورودی**

```md
# مستندات

## مبانی

<!--@include: ./parts/basics.md{3,}-->
```

**قسمت فایل** (`parts/basics.md`)

```md
بعضی موارد مربوط به شروع کار.

### پیکربندی

می‌توان با استفاده از `.foorc.json` ایجاد شد.
```

**کد معادل**

```md
# مستندات

## مبانی

### پیکربندی

می‌توان با استفاده از `.foorc.json` ایجاد شد.
```

قالب محدوده خطی می‌تواند شامل `{3,}`, `{,10}`, `{1,10}` باشد.

همچنین می‌توانید از [ناحیه VS Code](https://code.visualstudio.com/docs/editor/codebasics#_folding) برای اضافه کردن بخش متناظر فایل کد استفاده کنید. می‌توانید پس از `#` نام ناحیه سفارشی را پس از مسیر فایل دنبال کنید:

**ورودی**

```md
# مستندات

## مبانی

<!--@include: ./parts/basics.md#basic-usage{,2}-->
<!--@include: ./parts/basics.md#basic-usage{5,}-->
```

**قسمت فایل** (`parts/basics.md`)

```md
<!-- #region basic-usage -->
## استفاده خط 1

## استفاده خط 2

## استفاده خط 3
<!-- #endregion basic-usage -->
```

**کد معادل**

```md
# مستندات

## مبانی

## استفاده خط 1

## استفاده خط 3
```

::: warning هشدار
توجه داشته باشید که این اقدام منجر به خطا نمی‌شود اگر فایل شما وجود نداشته باشد. بنابراین، در استفاده از این ویژگی، مطمئن شوید که محتوا به درستی نمایش داده می‌شود.
:::

## معادلات ریاضی {#math-equations}

در حال حاضر این گزینه اختیاری است. برای فعال‌سازی آن، باید `markdown-it-mathjax3` را نصب کرده و `markdown.math` را در فایل پیکربندی خود به `true` تنظیم کنید:

```sh
npm add -D markdown-it-mathjax3
```

```ts [.vitepress/config.ts]
export default {
  markdown: {
    math: true
  }
}
```

**ورودی**

```md
وقتی $a \ne 0$ است، دو حل برای $(ax^2 + bx + c = 0)$ وجود دارد و آن‌ها عبارتند از
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**معادلات مکسول**

| equation                                                                                                                                                                  | description                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | تنوع $\vec{\mathbf{B}}$ صفر است                                                      |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | curl $\vec{\mathbf{E}}$ نسبت به نرخ تغییر $\vec{\mathbf{B}}$ نسبی است              |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _چیست؟_                                                                               |
```

**خروجی**

وقتی $a \ne 0$ است، دو حل برای $(ax^2 + bx + c = 0)$

وجود دارد و آن‌ها عبارتند از
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**معادلات مکسول**

| equation                                                                                                                                                                  | description                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | تنوع $\vec{\mathbf{B}}$ صفر است                                                      |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | curl $\vec{\mathbf{E}}$ نسبت به نرخ تغییر $\vec{\mathbf{B}}$ نسبی است              |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _چیست؟_                                                                               |

## بارگذاری lazy تصویر {#image-lazy-loading}

می‌توانید بارگذاری تنبلی را برای هر تصویر اضافه شده از طریق Markdown با تنظیم `lazyLoading` به `true` در فایل پیکربندی فعال کنید:

```js
export default {
  markdown: {
    image: {
      // بارگذاری تنبلی تصویر به طور پیش‌فرض غیرفعال است
      lazyLoading: true
    }
  }
}
```

## پیکربندی پیشرفته {#advanced-configuration}

ویت‌پرس از [markdown-it](https://github.com/markdown-it/markdown-it) به عنوان نمایشگر Markdown استفاده می‌کند. اکثر افزونه‌های فوق را با استفاده از افزونه‌های سفارشی پیاده‌سازی کرده‌ایم. می‌توانید نمونه‌ای بیشتر از نمونه `markdown-it` را با استفاده از گزینه `markdown` در `.vitepress/config.js` سفارشی‌سازی کنید:

```js
import { defineConfig } from 'vitepress'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFoo from 'markdown-it-foo'

export default defineConfig({
  markdown: {
    // گزینه‌های markdown-it-anchor
    // https://github.com/valeriangalliat/markdown-it-anchor#usage
    anchor: {
      permalink: markdownItAnchor.permalink.headerLink()
    },

    // گزینه‌های @mdit-vue/plugin-toc
    // https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
    toc: { level: [1, 2] },

    config: (md) => {
      // استفاده از افزونه‌های markdown-it بیشتر!
      md.use(markdownItFoo)
    }
  }
})
```

برای دیدن لیست کامل خصوصیات قابل تنظیم، به [مرجع تنظیمات: پیکربندی برنامه](../reference/site-config#markdown) مراجعه کنید.
