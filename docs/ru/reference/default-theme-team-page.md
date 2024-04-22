<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/yyx990803.png',
    name: 'Эван Ю',
    title: 'Создатель',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  {
    avatar: 'https://github.com/kiaking.png',
    name: 'Киа Кинг Исии',
    title: 'Разработчик',
    links: [
      { icon: 'github', link: 'https://github.com/kiaking' },
      { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
    ]
  }
]
</script>

# Страница команды {#team-page}

Если вы хотите представить свою команду, вы можете использовать компоненты Team для создания страницы команды. Есть два варианта использования этих компонентов. Один из вариантов — встроить их в страницу с макетом `doc`, а другой — создать полноценную страницу команды.

## Отображение членов команды на странице {#show-team-members-in-a-page}

Вы можете использовать компонент `<VPTeamMembers>`, доступный из `vitepress/theme`, для отображения списка членов команды на любой странице.

```html
<script setup>
  import { VPTeamMembers } from 'vitepress/theme'

  const members = [
    {
      avatar: 'https://www.github.com/yyx990803.png',
      name: 'Эван Ю',
      title: 'Создатель',
      links: [
        { icon: 'github', link: 'https://github.com/yyx990803' },
        { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
      ]
    },
    ...
  ]
</script>

# Поприветствуйте нашу замечательную команду

<VPTeamMembers size="small" :members="members" />
```

Вышеуказанное отобразит члена команды в виде карточки. Должно отобразиться что-то похожее на то, что показано ниже.

<VPTeamMembers size="small" :members="members" />

Компонент `<VPTeamMembers>` поставляется в двух различных размерах, `small` и `medium`. Хотя это зависит от ваших предпочтений, обычно размер `small` лучше подходит для использования на странице с макетом `doc`. Кроме того, вы можете добавить дополнительные свойства для карточки члена команды, например, добавить «описание» или кнопку «спонсировать». Подробнее об этом в секции [`<VPTeamMembers>`](#vpteammembers).

Встраивание членов команды в страницу документа хорошо подходит для небольших команд, где наличие полной страницы команды может быть слишком большим, или для представления частичных членов команды в качестве ссылки на контекст документации.

Если у вас большое количество участников или вы просто хотите иметь больше места для отображения членов команды, подумайте о [создании отдельной страницы команды](#create-a-full-team-page).

## Создание отдельной страницы команды {#create-a-full-team-page}

Вместо того чтобы добавлять членов команды на страницу с макетом `doc`, вы можете создать полноценную страницу команды, подобно созданию пользовательской [главной страницы](./default-theme-home-page).

Чтобы создать страницу команды, сначала создайте новый md-файл. Имя файла не имеет значения, но здесь мы назовем его `team.md`. В этом файле установите в блоке метаданных параметр `layout: page`, а затем вы можете организовать структуру страницы, используя компоненты `TeamPage`.

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
      name: 'Эван Ю',
      title: 'Создатель',
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
    <template #title> Наша команда </template>
    <template #lead>
      Разработкой VitePress руководит международная команда, некоторые члены
      которой представлены ниже.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="members" />
</VPTeamPage>
```

При создании полной страницы команды не забудьте обернуть все компоненты компонентом `<VPTeamPage>`. Этот компонент обеспечит всем вложенным компонентам, связанным с командой, правильную структуру макета, например, расстояние между ними.

Компонент `<VPPageTitle>` добавляет блок заголовка страницы. Заголовок — это тег `<h1>`. Используйте слоты `#title` и `#lead`, чтобы рассказать о своей команде.

`<VPMembers>` работает так же, как и при использовании в doc-странице. Отобразится список участников.

### Добавление секций для разделения членов команды {#add-sections-to-divide-team-members}

Вы можете добавить «секции» на страницу команды. Например, у вас могут быть разные типы членов команды, такие как члены основной команды и партнёры сообщества. Вы можете разделить этих членов на секции, чтобы лучше объяснить роли каждой группы.

Для этого добавьте компонент `<VPTeamPageSection>` в файл `team.md`, который мы создали ранее.

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
    <template #title>Наша команда</template>
    <template #lead>...</template>
  </VPTeamPageTitle>
  <VPTeamMembers size="medium" :members="coreMembers" />
  <VPTeamPageSection>
    <template #title>Партнёры</template>
    <template #lead>...</template>
    <template #members>
      <VPTeamMembers size="small" :members="partners" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```

Компонент `<VPTeamPageSection>` может иметь слоты `#title` и `#lead`, аналогичные компоненту `VPTeamPageTitle`, а также слот `#members` для отображения членов команды.

Не забудьте поместить компонент `<VPTeamMembers>` в слот `#members`.

## `<VPTeamMembers>` {#vpteammembers}

Компонент `<VPTeamMembers>` отображает заданный список членов команды.

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
  // Размер карточки каждого члена команды. По умолчанию `medium`.
  size?: 'small' | 'medium'

  // Список членов команды для отображения.
  members: TeamMember[]
}

interface TeamMember {
  // Изображение аватара.
  avatar: string

  // Имя члена команды.
  name: string

  // Заголовок, отображаемый под именем члена команды.
  // например: разработчик, инженер-программист и т. д.
  title?: string

  // Организация, в которой состоит текущий член команды.
  org?: string

  // URL-адрес сайта организации.
  orgLink?: string

  // Описание члена команды.
  desc?: string

  // Социальные ссылки: GitHub, Twitter и т. д.
  // Могут быть переданы в виде объекта.
  // См. https://vitepress.dev/reference/default-theme-config.html#sociallinks
  links?: SocialLink[]

  // URL-адрес спонсорской страницы члена команды.
  sponsor?: string

  // Текст спонсорской ссылки. По умолчанию 'Sponsor'.
  actionText?: string
}
```

## `<VPTeamPage>` {#vpteampage}

Корневой компонент при создании отдельной страницы команды. Принимает только один слот. Он будет стилизовать все передаваемые компоненты, связанные с командой.

## `<VPTeamPageTitle>` {#vpteampagetitle}

Добавляет блок «заголовка» страницы. Лучше всего использовать в самом начале внутри `<VPTeamPage>`. Принимает слоты `#title` и `#lead`.

```html
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title> Наша команда </template>
    <template #lead>
      Разработкой VitePress руководит международная команда, некоторые члены
      которой представлены ниже.
    </template>
  </VPTeamPageTitle>
</VPTeamPage>
```

## `<VPTeamPageSection>` {#vpteampagesection}

Создает «секцию» на странице команды. Принимает слоты `#title`, `#lead` и `#members`. Внутри `<VPTeamPage>` вы можете добавить столько секций, сколько захотите.

```html
<VPTeamPage>
  ...
  <VPTeamPageSection>
    <template #title>Партнёры</template>
    <template #lead>Lorem ipsum...</template>
    <template #members>
      <VPTeamMembers :members="data" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```
