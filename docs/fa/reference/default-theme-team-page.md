<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  {
    avatar: 'https://github.com/kiaking.png',
    name: 'Kia King Ishii',
    title: 'Developer',
    links: [
      { icon: 'github', link: 'https://github.com/kiaking' },
      { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
    ]
  }
]
</script>

# صفحه تیم {#team-page}

اگر می‌خواهید تیم خود را معرفی کنید، می‌توانید از کامپوننت‌های تیم برای ساخت صفحه تیم استفاده کنید. دو راه برای استفاده از این کامپوننت‌ها وجود دارد. یکی اینکه آنها را در صفحه مستندات قرار دهید و دیگری اینکه یک صفحه کامل تیم ایجاد کنید.

## نمایش اعضای تیم در یک صفحه {#show-team-members-in-a-page}

می‌توانید از کامپوننت `<VPTeamMembers>` که از `vitepress/theme` قابل دسترسی است، برای نمایش لیست اعضای تیم در هر صفحه‌ای استفاده کنید.

```html
<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  ...
]
</script>

# تیم ما

با سلام به تیم فوق‌العاده‌ی ما خوش آمدید.

<VPTeamMembers size="small" :members="members" />
```

بالا به صورت عنصری با شکل کارتی اعضای تیم را نمایش می‌دهد. باید به شکل زیر نمایش داده شود.

<VPTeamMembers size="small" :members="members" />

کامپوننت `<VPTeamMembers>` دارای دو اندازه مختلف، `small` و `medium` است. معمولاً اندازه `small` برای استفاده در صفحات مستندات مناسب‌تر است. همچنین می‌توانید ویژگی‌های بیشتری برای هر عضو اضافه کنید مانند "توضیحات" یا "دکمه حامی". جهت کسب اطلاعات بیشتر به [`<VPTeamMembers>`](#vpteammembers) مراجعه کنید.

قرار دادن اعضای تیم در صفحه مستندات برای تیم‌های کوچک مناسب است که ایجاد یک صفحه کامل تیم ممکن است بیش از حد باشد یا معرفی اعضا به عنوان مرجع در زمینه مستندات.

اگر تعداد اعضا بسیار زیاد است یا به سادگی می‌خواهید بیشتر فضا برای نمایش اعضای تیم داشته باشید، در نظر بگیرید [ایجاد یک صفحه کامل تیم](#create-a-full-team-page).

## ایجاد یک صفحه کامل تیم {#create-a-full-team-page}

بجای اضافه کردن اعضای تیم به صفحه مستندات، می‌توانید یک صفحه کامل تیم را ایجاد کنید، مشابه اینکه چگونه می‌توانید یک [صفحه خانگی سفارشی](./default-theme-home-page) ایجاد کنید.

برای ایجاد یک صفحه تیم، ابتدا یک فایل md جدید بسازید. نام فایل مهم نیست، اما در اینجا آن را `team.md` می‌نامیم. در این فایل، گزینه `layout: page` را در فرانت‌ماتر تنظیم کنید، سپس می‌توانید ساختار صفحه خود را با استفاده از کامپوننت‌های `TeamPage` ایجاد کنید.

```html
---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  ...
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      تیم ما
    </template>
    <template #lead>
      توسعه ویت‌پرس توسط تیمی بین‌المللی راهنمایی می‌شود، برخی از اعضا که انتخاب کرده‌اند تا در زیر نمایش داده شوند.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>
```

در ایجاد یک صفحه کامل تیم، به یاد داشته باشید که همهٔ کامپوننت‌ها را با کامپوننت `<VPTeamPage>` بپوشانید. این کامپوننت تضمین می‌کند که همهٔ کامپوننت‌های مرتبط با تیم در ساختار طراحی مناسبی مانند فضاهای خالی قرار می‌گیرند.

کامپوننت `<VPPageTitle>` بخش عنوان صفحه را اضافه می‌کند. عنوان به عنوان `<h1>` نمایش داده می‌شود. از اسلات‌های `#title` و `#lead` برای مستندسازی در مورد تیم خود استفاده کنید.

`<VPMembers>` به عنوان زمانی که در یک صفحه مستند استفاده می‌شود، کار می‌کند. این لیست اعضا را نمایش می‌دهد.

### اضافه کردن بخش‌ها برای تقسیم اعضای تیم {#add-sections-to-divide-team-members}

می‌توانید بخش‌ها را به صفحه تیم اضافه کنید. به عنوان مثال، ممکن است اعضای مختلف تیمی مانند اعضای تیم اصلی و شرکای اجتماعی داشته باشید. شما می‌توانید این اعضا را به بخش‌ها تقسیم کنید تا نقش هر گروه بهتر توضیح داده شود.

برای این کار، کامپوننت `<VPTeamPageSection>` را به فایل `team.md` اضافه کنید که قبلاً ایجاد کردیم.

```html
---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers,
  VPTeamPageSection
} from 'vitepress/theme'

const coreMembers = [...]
const partners = [...]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>تیم ما</template>
    <template #lead>...</template>
  </VPTeamPageTitle>
  <VPTeamMembers size="medium" :members="coreMembers" />
  <VPTeamPageSection>
    <template #title>شرکای تجاری</template>
    <template #lead>...</template>
    <template #members>
      <VPTeamMembers size="small" :members="partners" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```

کامپوننت `<VPTeamPageSection>` می‌تواند همچون کامپوننت `VPTeamPageTitle` دارای اسلات‌های `#title` و `#lead` باشد و همچنین اسلات `#members` را برای نمایش اعضای تیم پذیرفته است.

به یاد داشته باشید که کامپوننت `<VPTeamMembers>` را درون اسلات `#members` قرار دهید.

## `<VPTeamMembers>` {#vpteammembers}

کامپوننت `<VPTeamMembers>` لیست داده‌شده از اعضا را نمایش می‌دهد.

```html
<VPTeamMembers
  size="medium"
  :members="[
    { avatar: '...', name: '...' },
    { avatar: '...', name: '...' },
    ...
  ]"
/>
```

```ts
interface Props {
  // اندازه هر عضو. پیش‌فرض به `medium`.
  size?: 'small' | 'medium'

  // لیست اعضا برای نمایش.
  members: TeamMember[]
}

interface TeamMember {
  // تصویر آواتار برای عضو.
  avatar: string

  // نام عضو.
  name: string

  // عنوانی که زیر نام عضو نمایش داده خواهد شد.
  // برای مثال، توسعه‌دهنده، مهندس نرم‌افزار و غیره.
  title?: string

  // سازمانی که عضو به آن تعلق دارد.
  org?: string

  // پیوند URL برای سازمان.
  orgLink?: string

  // توضیحات برای عضو.
  desc?: string

  // پیوندهای اجتماعی. برای مثال، GitHub، Twitter و غیره. می‌توانید شیء پیوندهای اجتماعی را در اینجا ارسال کنید.
  // مشاهده: https://vitepress.dev/reference/default-theme-config.html#sociallinks
  links?: SocialLink[]

  // URL برای صفحه حامی برای عضو.
  sponsor?: string

  // متن برای لینک حامی. پیش‌فرض به 'حمایت‌کننده'.
  actionText?: string
}
```

## `<VPTeamPage>` {#vpteampage}

کامپوننت ریشه هنگام ایجاد یک صفحه کامل تیم. فقط یک اسلات را قبول می‌کند. این همه کامپوننت‌های مربوط به تیم را استایل می‌کند.

## `<VPTeamPageTitle>` {#vpteampagetitle}

بخش "عنوان" صفحه را اضافه می‌کند. بهترین استفاده را در ابتدایی‌ترین جای زیر `<VPTeamPage>` داشته باشد. این اسلات‌های `#title` و `#lead` را قبول می‌کند.

```html
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      تیم ما
    </template>
    <template #lead>
      توسعه ویت‌پرس توسط تیمی بین‌المللی راهنمایی می‌شود، برخی از اعضا که انتخاب کرده‌اند تا در زیر نمایش داده شوند.
    </template>
  </VPTeamPageTitle>
</VPTeamPage>
```

## `<VPTeamPageSection>` {#vpteampagesection}

یک "بخش" را درون صفحه تیم ایجاد می‌کند. اسلات‌های `#title`، `#lead` و `#members` را قبول می‌کند. می‌توانید هر تعداد بخش را درون `<VPTeamPage>` اضافه کنید.

```html
<VPTeamPage>
  ...
  <VPTeamPageSection>
    <template #title>شرکای تجاری</template>
    <template #lead>Lorem ipsum...</template>
    <template #members>
      <VPTeamMembers :members="data" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```
