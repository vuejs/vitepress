# استفاده از Vue در Markdown  {#using-vue-in-markdown}

در ویت‌پرس، هر فایل Markdown به HTML تبدیل شده و سپس به عنوان یک [کامپوننت فایل تکی Vue](https://vuejs.org/guide/scaling-up/sfc.html) پردازش می‌شود. این بدان معنی است که شما می‌توانید از هر ویژگی Vue در داخل Markdown استفاده کنید، شامل قالب‌بندی پویا، استفاده از کامپوننت‌های Vue، یا منطق کامپوننت Vue دلخواه در داخل صفحه با افزودن تگ `<script>`.

مهم است که ویت‌پرس از کامپایلر Vue برای به‌طور خودکار شناسایی و بهینه‌سازی اجزای ثابت محتوای Markdown استفاده می‌کند. محتویات استاتیک به صورت یکنواخت به عنوان placeholder nodes بهینه‌سازی شده و از بارگذاری اولیه در JavaScript صفحه مستثنی می‌شوند. همچنین، در فرآیند hydration سمت کلاینت نیز نادیده گرفته می‌شوند. به طور خلاصه، شما فقط برای اجزای پویا در هر صفحه هزینه می‌پردازید.

::: tip سازگاری با SSR
همه استفاده‌های Vue باید با سازگاری SSR همخوانی داشته باشند. برای جزئیات و راه‌حل‌های متداول، به [سازگاری با SSR](./ssr-compat) مراجعه کنید.
:::

## قالب‌بندی {#templating}

### درون‌یابی(Interpolation) {#interpolation}

هر فایل Markdown ابتدا به HTML تبدیل شده و سپس به عنوان یک کامپوننت Vue به خط لوله فرآیند Vite ارسال می‌شود. این بدان معنی است که می‌توانید از درون‌یابی به سبک Vue در متن استفاده کنید:

**ورودی**

```md
{{ 1 + 1 }}
```

**خروجی**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

#### دستورالعمل‌ها {#directives}

دستورالعمل‌ها نیز کار می‌کنند (توجه داشته باشید که طراحی، HTML خام همچنین معتبر است):

**ورودی**

```html
<span v-for="i in 3">{{ i }}</span>
```

**خروجی**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

## `<script>` و `<style>` {#script-and-style}

تگ‌های `<script>` و `<style>` در سطح ریشه در فایل‌های Markdown همانند کارکرد آنها در SFC Vue کار می‌کنند، شامل `<script setup>`، `<style module>`، و غیره. تفاوت اصلی در اینجا این است که هیچ تگ `<template>` وجود ندارد: تمام محتویات سطح ریشه دیگر Markdown است. همچنین توجه داشته باشید که همه تگ‌ها باید **پس از** frontmatter قرار گیرند:

```html
---
hello: world
---

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

## محتوای Markdown

تعداد: {{ count }}

<button :class="$style.button" @click="count++">افزایش</button>

<style module>
.button {
  color: red;
  font-weight: bold;
}
</style>
```

::: warning اجتناب از `<style scoped>` در Markdown
در استفاده از Markdown باید توجه داشت که `<style scoped>` نیازمند افزودن ویژگی‌های خاص به هر عنصر در صفحه فعلی است که باعث بزرگ شدن قابل‌ملاحظه اندازه صفحه می‌شود. هنگام نیاز به قالب‌بندی محلی محدود، استفاده از `<style module>` توصیه می‌شود.
:::

همچنین شما به دسترسی به API‌های runtime ویت‌پرس مانند [`useData` helper](../reference/runtime-api#usedata) دارید که امکان دسترسی به metadata صفحه فعلی را فراهم می‌کند:

**ورودی**

```html
<script setup>
import { useData } from 'vitepress'

const { page } = useData()
</script>

<pre>{{ page }}</pre>
```

**خروجی**

```json
{
  "path": "/using-vue.html",
  "title": "Using Vue in Markdown",
  "frontmatter": {},
  ...
}
```

## استفاده از کامپوننت‌ها {#using-components}

شما می‌توانید کامپوننت‌های Vue را مستقیماً در فایل‌های Markdown وارد و استفاده کنید.

### وارد کردن در Markdown  {#importing-in-markdown}

اگر یک کامپوننت تنها توسط چند صفحه استفاده می‌شود، توصیه می‌شود آنها را به صراحت در جایی که استفاده می‌شوند وارد کنید. این کار امکان تقسیم کد مناسب را فراهم می‌کند و فقط هنگام نمایش صفحات مربوطه بارگذاری می‌شوند:

```md
<script setup>
import CustomComponent from '../components/CustomComponent.vue'
</script>

# مستندات

این یک فایل .md با استفاده از یک کامپوننت اختصاصی است

<CustomComponent />

## مستندات بیشتر

...
```

### ثبت کامپوننت‌ها به صورت Global {#registering-components-globally}

اگر یک کامپوننت بر روی اکثر صفحات استفاده می‌شود، می‌توانید آنها را به صورت global با سفارشی‌سازی نمونه برنامه Vue ثبت کنید. برای مثال، بخش مربوطه را در [گسترش تم پیش‌فرض](./extending-default-theme#registering-global-components) بررسی کنید.

::: warning مهم
اطمینان حاصل کنید که نام یک کامپوننت سفارشی حاوی خط فاصله دارد یا به صورت PascalCase است. در غیر این صورت، به عنوان یک

عنصر داخلی تلقی می‌شود و درون یک تگ `<p>` قرار داده خواهد شد که باعث عدم هم‌سانی‌سازی hydration می‌شود چون `<p>` اجازه قرار دادن عناصر بلوک داخل آن را نمی‌دهد.
:::

### استفاده از کامپوننت‌ها در سربرگ‌ها <ComponentInHeader />  {#using-components-in-headers}

شما می‌توانید کامپوننت‌های Vue را در سربرگ‌ها استفاده کنید، اما تفاوت بین دو نحوه نگارش زیر را توجه کنید:

| Markdown                                                | HTML خروجی                               | سربرگ تجزیه شده |
| ------------------------------------------------------- | ----------------------------------------- | ------------- |
| <pre v-pre><code> # text &lt;Tag/&gt; </code></pre>     | `<h1>text <Tag/></h1>`                    | `text`        |
| <pre v-pre><code> # text \`&lt;Tag/&gt;\` </code></pre> | `<h1>text <code>&lt;Tag/&gt;</code></h1>` | `text <Tag/>` |

HTML که توسط `<code>` محصور شده باشد به عنوان آن نمایش داده خواهد شد؛ تنها HTML که **محصور نشده باشد** توسط Vue تجزیه خواهد شد.

::: tip نکته
خروجی HTML توسط [Markdown-it](https://github.com/Markdown-it/Markdown-it) انجام می‌شود، در حالی که سربرگ‌های تجزیه شده توسط ویت‌پرس انجام می‌شود (و برای هر دو نوار کناری و عنوان سند استفاده می‌شود).
:::

## Escaping {#escaping}

شما می‌توانید درون‌یابی‌های Vue را با محصور کردن آنها در یک `<span>` یا عناصر دیگر با دستورالعمل `v-pre` فرار کنید:

**ورودی**

```md
This <span v-pre>{{ will be displayed as-is }}</span>
```

**خروجی**

<div class="escape-demo">
  <p>This <span v-pre>{{ will be displayed as-is }}</span></p>
</div>

به طور جایگزین، می‌توانید کل پاراگراف را در یک ظرف سفارشی `v-pre` محصور کنید:

```md
::: v-pre
{{ This will be displayed as-is }}
:::
```

**خروجی**

<div class="escape-demo">

::: v-pre
{{ This will be displayed as-is }}
:::

</div>

## غیرفعال کردن در بلوک‌های کد {#unescape-in-code-blocks}

به طور پیش‌فرض، تمام بلوک‌های کد با حصار `v-pre` به صورت خودکار محصور می‌شوند، بنابراین هیچ نحوه درون‌یابی Vue در داخل آنها پردازش نمی‌شود. برای فعال کردن درون‌یابی به سبک Vue در داخل حصارها، می‌توانید زبان را با پسوند `-vue` اضافه کنید، به عنوان مثال `js-vue`:

**ورودی**

````md
```js-vue
Hello {{ 1 + 1 }}
```
````

**خروجی**

```js-vue
Hello {{ 1 + 1 }}
```

توجه داشته باشید که این ممکن است باعث جلوگیری از نمایش صحیح برخی نشانه‌ها در هایلایتینگ نحوه زبان شود.

## استفاده از پیش‌پردازنده‌های CSS {#using-css-pre-processors}

ویت‌پرس از [پشتیبانی داخلی](https://vitejs.dev/guide/features.html#css-pre-processors) برای پیش‌پردازنده‌های CSS مانند فایل‌های `.scss`، `.sass`، `.less`، `.styl` و `.stylus` پشتیبانی می‌کند. برای استفاده از آنها نیازی به نصب پلاگین‌های خاص Vite نیست، اما خود پیش‌پردازنده مربوطه باید نصب شده باشد:

```
# .scss و .sass
npm install -D sass

# .less
npm install -D less

# .styl و .stylus
npm install -D stylus
```

سپس می‌توانید در Markdown و کامپوننت‌های تم:

```vue
<style lang="sass">
.title
  font-size: 20px
</style>
```

## استفاده از Teleport {#using-teleports}

در حال حاضر ویت‌پرس پشتیبانی از SSG برای teleport به body را دارد. برای اهداف دیگر، می‌توانید آنها را درون کامپوننت `<ClientOnly>` یا نشانه تله‌پورت به مکان مناسب در HTML صفحه نهایی خود از طریق [هوک postRender](../reference/site-config#postrender) درج کنید.

<ModalDemo />

::: details جزئیات
<<< @/components/ModalDemo.vue
:::

```md
<ClientOnly>
  <Teleport to="#modal">
    <div>
      // ...
    </div>
  </Teleport>
</ClientOnly>
```

<script setup>
import ModalDemo from '../../components/ModalDemo.vue'
import ComponentInHeader from '../../components/ComponentInHeader.vue'
</script>

<style>
.escape-demo {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 0 20px;
}
</style>
