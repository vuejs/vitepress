<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Criador',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  {
    avatar: 'https://github.com/kiaking.png',
    name: 'Kia King Ishii',
    title: 'Desenvolvedor',
    links: [
      { icon: 'github', link: 'https://github.com/kiaking' },
      { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
    ]
  }
]
</script>

# Página da Equipe {#team-page}

Se você quiser apresentar sua equipe, você pode usar componentes de equipe para construir a Página da Equipe. Existem duas maneiras de usar esses componentes. Uma é incorporá-lo na página de documento, e outra é criar uma Página de Equipe completa.

## Mostrar membros da equipe em uma página {#show-team-members-in-a-page}

Você pode usar o componente `<VPTeamMembers>` exposto em `vitepress/theme` para exibir uma lista de membros da equipe em qualquer página.

```html
<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Criador',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  ...
]
</script>

# Nosso time

Diga olá à nossa equipe incrível.

<VPTeamMembers size="small" :members="members" />
```

O código acima exibirá um membro da equipe em um elemento tipo cartão. Ele deve exibir algo semelhante ao abaixo.

<VPTeamMembers size="small" :members="members" />

O componente `<VPTeamMembers>` vem em 2 tamanhos diferentes, pequeno `small` e médio `medium`. Enquanto é uma questão de preferência, geralmente o tamanho `small` deve encaixar melhor quando usado na página de documento. Além disso, você pode adicionar mais propriedades a cada membro, como adicionar o botão "descrição" ou "patrocinador". Saiba mais sobre em [`<VPTeamMembers>`](#vpteammembers).

Incorporar membros da equipe na página de documento é bom para equipes de pequeno porte, onde ter uma página de equipe inteira dedicada pode ser demais, ou introduzir membros parciais como uma referência ao contexto da documentação.

Se você tiver um grande número de membros, ou simplesmente quiser ter mais espaço para mostrar os membros da equipe, considere [criar uma página de equipe completa.](#create-a-full-team-page)

## Criando uma página de equipe completa {#create-a-full-team-page}

Em vez de adicionar membros da equipe à página de documento, você também pode criar uma Página de Equipe completa, da mesma forma que pode criar uma [Página Inicial](./default-theme-home-page) personalizada.

Para criar uma página de equipe, primeiro crie um novo arquivo md. O nome do arquivo não importa, mas aqui vamos chamá-lo de `team.md`. Neste arquivo, defina a opção `layout: page` do frontmatter,  e então você poderá compor a estrutura da sua página usando componentes `TeamPage`.

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
    title: 'Criador',
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
      Nosso time
    </template>
    <template #lead>
     O desenvolvimento do VitePress é orientado por uma equipe internacional,
     alguns dos membros escolheram ser apresentados abaixo.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>
```

Ao criar uma página de equipe completa, lembre-se de agrupar todos os componentes com o componente `<VPTeamPage>`. Este componente garantirá que todos os componentes aninhados relacionados à equipe obtenham a estrutura de layout adequada, como espaçamentos.

O componente `<VPPageTitle>` adiciona a seção de título da página. O título é `<h1>`. Use os _slots_ `#title` e `#lead`para documentar sobre sua equipe.

`<VPMembers>` funciona da mesma forma que quando usado em uma página de documento. Ele exibirá a lista de membros.

### Adicione seções para dividir os membros da equipe {#add-sections-to-divide-team-members}

Você pode adicionar "seções" à página da equipe. Por exemplo, você pode ter diferentes tipos de membros da equipe, como membros da Equipe Principal e Parceiros da Comunidade. Você pode dividir esses membros em seções para explicar melhor os papéis de cada grupo.

Para fazer isso, adicione o componente `<VPTeamPageSection>` ao arquivo `team.md` que criamos anteriormente.

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
    <template #title>Nosso time</template>
    <template #lead>...</template>
  </VPTeamPageTitle>
  <VPTeamMembers size="medium" :members="coreMembers" />
  <VPTeamPageSection>
    <template #title>Parceiros</template>
    <template #lead>...</template>
    <template #members>
      <VPTeamMembers size="small" :members="partners" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```

O componente `<VPTeamPageSection>` pode ter os _slots_ `#title` e `#lead` similar ao componente `VPTeamPageTitle`, e também o _slot_ `#members` para exibir os membros da equipe.

Lembre-se de colocar o componente `<VPTeamMembers>` dentro do _slot_ `#members`.

## `<VPTeamMembers>`

O componente `<VPTeamMembers>` exibe uma determinada lista de membros.

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
  // Tamanho de cada membro. O padrão é `medium`.
  size?: 'small' | 'medium'

  // Lista de membros a serem exibidos.
  members: TeamMember[]
}

interface TeamMember {
  // Imagem avatar do membro
  avatar: string

  // Nome do membro.
  name: string

  // Título a ser mostrado abaixo do nome do membro.
  // Ex.: Desenvolvedor, Engenheiro de Software, etc.
  title?: string

  // Organização a qual o membro pertence.
  org?: string

  // URL da organização.
  orgLink?: string

  // Descrição do membro.
  desc?: string

  // Links sociais, por exemplo, GitHub, Twitter, etc.
  // Você pode passar o objeto de Links Sociais aqui.
  // Veja: https://vitepress.dev/reference/default-theme-config.html#sociallinks
  links?: SocialLink[]

  // URL da página de patrocinador do membro.
  sponsor?: string

  // Texto para o link do patrocinador. O padrão é 'Sponsor'.
  actionText?: string
}
```

## `<VPTeamPage>`

O componente raiz ao criar uma página de equipe completa. Ele aceita apenas um único _slot_. Ele estilizará todos os componentes relacionados à equipe passados.

## `<VPTeamPageTitle>`

Adiciona a seção "título" da página. Melhor usar logo no início sob `<VPTeamPage>`. Aceita os _slots_ `#title` e `#lead`.

```html
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Nosso time
    </template>
    <template #lead>
      O desenvolvimento do VitePress é orientado por uma equipe internacional,
      alguns dos membros escolheram ser apresentados abaixo.
    </template>
  </VPTeamPageTitle>
</VPTeamPage>
```

## `<VPTeamPageSection>`

Cria uma "seção" na página da equipe. Aceita os _slots_ `#title`, `#lead` e `#members`. Você pode adicionar quantas seções quiser dentro de `<VPTeamPage>`.

```html
<VPTeamPage>
  ...
  <VPTeamPageSection>
    <template #title>Parceiros</template>
    <template #lead>Lorem ipsum...</template>
    <template #members>
      <VPTeamMembers :members="data" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```
