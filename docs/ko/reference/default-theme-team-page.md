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

# 팀 페이지 {#team-page}

팀을 소개하고자 할 때, 팀 컴포넌트를 사용하여 팀 페이지를 구성할 수 있습니다. 이 컴포넌트를 사용하는 방법은 두 가지가 있습니다. 하나는 문서 페이지에 포함시키는 방법이고, 다른 하나는 전체 팀 페이지를 만드는 방법입니다.

## 페이지에서 팀 구성원 보여주기 {#show-team-members-in-a-page}

`vitepress/theme`에서 제공되는 `<VPTeamMembers>` 컴포넌트를 사용하여, 어떤 페이지에서도 팀 구성원 목록을 표시할 수 있습니다.

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

# Our Team

Say hello to our awesome team.

<VPTeamMembers size="small" :members="members" />
```

위 코드는 카드 형태의 엘리먼트로 팀 구성원을 표시합니다. 아래와 비슷한 형태로 표시됩니다.

<VPTeamMembers size="small" :members="members" />

`<VPTeamMembers>` 컴포넌트는 `small`과 `medium` 두 가지 크기로 제공됩니다. 개인의 선호도에 따라 선택할 수 있지만, 일반적으로 `small` 사이즈가 문서 페이지에 더 적합합니다. 또한, 각 구성원에 "설명"이나 "후원" 버튼과 같은 프로퍼티를 추가할 수도 있습니다. 자세한 내용은 [`<VPTeamMembers>`](#vpteammembers)에서 확인할 수 있습니다.

문서 페이지에 팀 구성원을 포함시키는 것은 전용 팀 페이지를 만드는 것이 과할 수 있는 소규모 팀이나, 문서의 맥락에 따라 일부 구성원을 소개할 때 좋습니다.

만약 많은 수의 구성원이 있거나, 팀 구성원을 보여줄 더 많은 공간이 필요하다면, [전체 팀 페이지 만들기](#create-a-full-team-page)를 고려해 보세요.

## 전체 팀 페이지 만들기 {#create-a-full-team-page}

팀 구성원을 문서 페이지에 추가하는 대신, 전체 팀 페이지를 만들어 [홈 페이지](./default-theme-home-page)를 커스텀하는 것처럼 팀 페이지를 만들 수도 있습니다.

팀 페이지를 만들려면, 먼저 새로운 마크다운 파일을 생성하세요. 파일 이름은 중요하지 않지만, 여기서는 `team.md`라고 부르겠습니다. 이 파일에서 전문 옵션에 `layout: page`를 설정한 후, `TeamPage` 컴포넌트를 사용하여 페이지 구조를 구성합니다.

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
      Our Team
    </template>
    <template #lead>
      The development of VitePress is guided by an international
      team, some of whom have chosen to be featured below.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>
```

전체 팀 페이지를 만들 때는 모든 컴포넌트를 `<VPTeamPage>` 컴포넌트로 감싸야 합니다. 이 컴포넌트는 중첩된 팀 관련 컴포넌트들이 적절한 레이아웃 구조와 간격을 갖도록 합니다.

`<VPPageTitle>` 컴포넌트는 페이지 제목 섹션을 추가합니다. 제목은 `<h1>` 헤딩으로 표시됩니다. `#title`과 `#lead` 슬롯을 사용하여 팀에 대한 설명을 작성할 수 있습니다.

`<VPMembers>` 컴포넌트는 문서 페이지에서 사용할 때와 동일하게 작동하며, 팀 구성원 목록을 표시합니다.

### 팀 구성원을 구분하기 위한 섹션 추가 {#add-sections-to-divide-team-members}

팀 페이지에 "섹션"을 추가할 수도 있습니다. 예를 들어, 핵심 팀 구성원과 커뮤니티 파트너와 같은 다양한 유형의 팀 구성원이 있을 수 있습니다. 이 구성원들을 섹션으로 나누어 각 그룹의 역할을 더 잘 설명할 수 있습니다.

이를 위해 이전에 만든 `team.md` 파일에 `<VPTeamPageSection>` 컴포넌트를 추가하세요.

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
    <template #title>Our Team</template>
    <template #lead>...</template>
  </VPTeamPageTitle>
  <VPTeamMembers size="medium" :members="coreMembers" />
  <VPTeamPageSection>
    <template #title>Partners</template>
    <template #lead>...</template>
    <template #members>
      <VPTeamMembers size="small" :members="partners" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```

`<VPTeamPageSection>` 컴포넌트는 `VPTeamPageTitle` 컴포넌트처럼 `#title`과 `#lead` 슬롯을 가질 수 있으며, 팀 구성원을 표시하기 위한 `#members` 슬롯도 있습니다.

`#members` 슬롯 내부에는 `<VPTeamMembers>` 컴포넌트를 추가해야 합니다.

## `<VPTeamMembers>`

`<VPTeamMembers>` 컴포넌트는 주어진 팀 구성원 목록을 표시합니다.

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
  // 각 구성원 사이즈. 기본값: `medium`
  size?: 'small' | 'medium'

  // 표시할 구성원 목록.
  members: TeamMember[]
}

interface TeamMember {
  // 구성원 아바타 이미지.
  avatar: string

  // 구성원 이름.
  name: string

  // 구성원 이름 아래에 표시될 직함.
  // 예: 개발자, 소프트웨어 엔지니어 등
  title?: string

  // 구성원이 속한 조직.
  org?: string

  // 조직의 URL.
  orgLink?: string

  // 구성원에 대한 설명.
  desc?: string

  // 소셜 링크. 예: GitHub, Twitter 등.
  // 소셜 링크 객체를 전달해야 함.
  // 참고: https://vitepress.dev/ko/reference/default-theme-config.html#sociallinks
  links?: SocialLink[]

  // 구성원의 후원 페이지 URL.
  sponsor?: string

  // 후원 링크 텍스트. 기본값: 'Sponsor'
  actionText?: string
}
```

## `<VPTeamPage>`

전체 팀 페이지를 만들 때 사용하는 루트 컴포넌트입니다. 단일 슬롯만 허용하며, 전달된 모든 팀 관련 컴포넌트에 스타일을 적용합니다.

## `<VPTeamPageTitle>`

페이지의 "제목" 섹션을 추가합니다. `<VPTeamPage>` 아래 맨 처음에 사용하는 것이 가장 좋습니다. `#title`과 `#lead` 슬롯이 있습니다.

```html
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Our Team
    </template>
    <template #lead>
      The development of VitePress is guided by an international
      team, some of whom have chosen to be featured below.
    </template>
  </VPTeamPageTitle>
</VPTeamPage>
```

## `<VPTeamPageSection>`

팀 페이지 내에서 "섹션"을 생성합니다. `#title`, `#lead`, `#members` 슬롯이 있습니다. `<VPTeamPage>` 안에 원하는 만큼 섹션을 추가할 수 있습니다.

```html
<VPTeamPage>
  ...
  <VPTeamPageSection>
    <template #title>Partners</template>
    <template #lead>Lorem ipsum...</template>
    <template #members>
      <VPTeamMembers :members="data" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```
