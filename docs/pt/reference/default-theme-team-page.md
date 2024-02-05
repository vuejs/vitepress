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

# Página da Equipe

Se você quiser apresentar sua equipe, você pode usar componentes de equipe para construir a página da equipe. Existem duas maneiras de usar esses componentes. Uma é incorporá-lo na página do documento e outra é criar uma página de equipe completa.

## Mostrar membros da equipe em uma página

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

Diga olá à nossa incrível equipe.

<VPTeamMembers size="small" :members="members" />
```

A imagem acima exibirá um membro da equipe no elemento de aparência de cartão. Deve exibir algo semelhante ao abaixo.

<VPTeamMembers size="small" :members="members" />

O componente `<VPTeamMembers>` vem em 2 tamanhos diferentes, `small` (pequeno) e `medium` (médio). Embora tudo se reduza à sua preferência, geralmente o tamanho `small` deve caber melhor quando usado na página do documento. Além disso, você pode adicionar mais propriedades a cada membro, como adicionar o botão "descrição" ou "patrocinador". Saiba mais sobre isso em [`<VPTeamMembers>`](#vpteammembers).

Incorporar membros da equipe na página do documento é bom para equipes de pequeno porte, onde ter uma página de equipe inteira dedicada pode ser demais, ou introduzir membros parciais como uma referência ao contexto da documentação.

Se você tiver um grande número de membros ou simplesmente quiser ter mais espaço para mostrar os membros da equipe, considere [criar uma página de equipe completa.](#create-a-full-team-page)


## Criando uma página de equipe completa

Em vez de adicionar membros da equipe à página do documento, você também pode criar uma página de equipe completa, da mesma forma que pode criar uma [página inicial personalizada](./default-theme-home-page).

Para criar uma página de equipe, primeiro crie um novo arquivo md. O nome do arquivo não importa, mas aqui vamos chamá-lo de `team.md`. Neste arquivo, defina a opção `layout: page` do frontmatter,  e então você poderá compor a estrutura da sua página usando os componentes do `TeamPage`.

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
     O desenvolvimento do VitePress é orientado por uma equipe internacional, alguns dos quais escolheram ser apresentados abaixo.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>
```

Ao criar uma página de equipe completa, lembre-se de agrupar todos os componentes com o componente `<VPTeamPage>`. Este componente garantirá que todos os componentes aninhados relacionados à equipe obtenham a estrutura de layout adequada, como espaçamentos.

O componente `<VPPageTitle>` adiciona a seção de título da página. O título é `<h1>`. Use como slot (espaço) `#title` e `#lead` para documentar sobre sua equipe.

`<VPMembers>` funciona da mesma forma que quando usado em uma página de documento. Ele exibirá a lista de membros.

### Adicione seções para dividir os membros da equipe

Você pode adicionar "seções" à página da equipe. Por exemplo, você pode ter diferentes tipos de membros da equipe, como membros da equipe principal e parceiros da comunidade. Você pode dividir esses membros em seções para explicar melhor as funções de cada grupo.

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
    <template #title>Nosso time </template>
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

O componente `<VPTeamPageSection>` pode ter os slots (espaços) `#title` e `#lead` semelhante ao componente `VPTeamPageTitle`, e também o slot (espaço) `#members` para exibir os membros da equipe.

Lembre-se de colocar o componente `<VPTeamMembers>` no slot (espaço) `#members`.

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
  // Imagem do avator do membro
  avatar: string

  // Nome do membro.
  name: string

  // Título a ser mostrado abaixo do nome do membro.
  // por exemplo, Desenvolvedor, Engenheiro de Software, etc.
  title?: string

  // Organização a qual o membro pertence.
  org?: string

  // URL da organização.
  orgLink?: string

  // Descrição do membro.
  desc?: string

  // Redes sociais, por exemplo, GitHub, Twitter, etc. Você pode passar
  // o objeto de Redes Social aqui.
  
  // Veja: https://vitepress.dev/reference/default-theme-config.html#sociallinks
  links?: SocialLink[]

  // URL da página do patrocinador do membro.
  sponsor?: string

  // Texto para o link do patrocinador. O padrão é 'Patrocinador'.
  actionText?: string
}
```

## `<VPTeamPage>`

O componente raiz ao criar uma página de equipe completa. Ele aceita apenas um único slot (espaço). Ele estilizará todos os componentes relacionados à equipe passados.

## `<VPTeamPageTitle>`

Adiciona a seção "título" da página. Melhor o uso logo no início em `<VPTeamPage>`. Aceita os slots (espaços) `#title` e `#lead`.

```html
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Nosso time
    </template>
    <template #lead>
      O desenvolvimento do VitePress é orientado por uma equipe internacional, alguns dos quais escolheram ser apresentados abaixo.
    </template>
  </VPTeamPageTitle>
</VPTeamPage>
```

## `<VPTeamPageSection>`

Crie uma "seção" na página da equipe. Ela aceita os slots (espaços) `#title`, `#lead` e `#members`. Você pode adicionar quantas seções quiser dentro de `<VPTeamPage>`.

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