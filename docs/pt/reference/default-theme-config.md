# Configuração do Tema Padrão {#default-theme-config}

A configuração do tema permite que você personalize seu tema. Você pode definir a configuração do tema através da opção `themeConfig` no arquivo de configuração:

```ts
export default {
  lang: 'pt-BR',
  title: 'VitePress',
  description: 'Gerador de site estático Vite & Vue.',

  // Configurações relacionadas ao tema.
  themeConfig: {
    logo: '/logo.svg',
    nav: [...],
    sidebar: { ... }
  }
}
```

**As opções documentadas nesta página se aplicam apenas ao tema padrão.** Temas diferentes esperam configurações de tema diferentes. Ao usar um tema personalizado, o objeto de configuração do tema será passado para o tema para que se possam definir comportamentos condicionais.

## i18nRouting

- Tipo: `boolean`

Alterar o local para, por exemplo, `zh` alterará a URL de `/foo` (ou `/en/foo/`) para `/zh/foo`. Você pode desativar esse comportamento definindo `themeConfig.i18nRouting` como `false`.

## logo

- Tipo: `ThemeableImage`

Arquivo de logo a ser exibido na barra de navegação, logo antes do título do site. Aceita um caminho em string, ou um objeto para definir um logo diferente para os modos claro/escuro.

```ts
export default {
  themeConfig: {
    logo: '/logo.svg'
  }
}
```

```ts
type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }
```

## siteTitle

- Tipo: `string | false`

Você pode personalizar este item para substituir o título padrão do site (`title` na configuração da aplicação) na navegação. Quando definido como `false`, o título na navegação será desativado. Útil quando você tem um `logo` que já contém o título do site.

```ts
export default {
  themeConfig: {
    siteTitle: 'Olá Mundo'
  }
}
```

## nav

- Tipo: `NavItem`

A configuração para o item do menu de navegação. Mais detalhes em [Tema Padrão: Navegação](./default-theme-nav#navigation-links).

```ts
export default {
  themeConfig: {
    nav: [
      { text: 'Guia', link: '/guide' },
      {
        text: 'Menu Dropdown',
        items: [
          { text: 'Item A', link: '/item-1' },
          { text: 'Item B', link: '/item-2' },
          { text: 'Item C', link: '/item-3' }
        ]
      }
    ]
  }
}
```

```ts
type NavItem = NavItemWithLink | NavItemWithChildren

interface NavItemWithLink {
  text: string
  link: string
  activeMatch?: string
  target?: string
  rel?: string
  noIcon?: boolean
}

interface NavItemChildren {
  text?: string
  items: NavItemWithLink[]
}

interface NavItemWithChildren {
  text?: string
  items: (NavItemChildren | NavItemWithLink)[]
  activeMatch?: string
}
```

## sidebar

- Tipo: `Sidebar`

A configuração para o item do menu da barra lateral. Mais detalhes em [Tema Padrão: Barra Lateral](./default-theme-sidebar).

```ts
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guia',
        items: [
          { text: 'Introdução', link: '/introduction' },
          { text: 'Começando', link: '/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

```ts
export type Sidebar = SidebarItem[] | SidebarMulti

export interface SidebarMulti {
  [path: string]: SidebarItem[]
}

export type SidebarItem = {
  /**
   * O rótulo de texto do item.
   */
  text?: string

  /**
   * O link do item.
   */
  link?: string

  /**
   * Os filhos do item.
   */
  items?: SidebarItem[]

  /**
   * Se não especificado, o grupo não é retrátil.
   *
   * Se `true`, o grupo é retrátil e é colapsado por padrão.
   *
   * Se `false`, o grupo é retrátil, mas expandido por padrão.
   */
  collapsed?: boolean
}
```

## aside

- Tipo: `boolean | 'left'`
- Padrão: `true`
- Pode ser anulado por página via [frontmatter](./frontmatter-config#aside)

Definir este valor como `false` impede a apresentação do elemento aside.\
Definir este valor como `true` apresenta o aside à direita.\
Definir este valor como `left` apresenta o aside à esquerda.

Se você quiser desativá-lo para todas as visualizações, você deve usar `outline: false` em vez disso.

## outline

- Tipo: `Outline | Outline['level'] | false`
- O nível pode ser sobreposto por página via [frontmatter](./frontmatter-config#outline)

Definir este valor como `false` impede a apresentação do elemento _outline_. Consulte a interface para obter mais detalhes:

```ts
interface Outline {
  /**
   * Os níveis de títulos a serem exibidos na outline.
   * Um único número significa que apenas os títulos desse nível serão exibidos.
   * Se uma tupla for passada, o primeiro número é o nível mínimo e o segundo número é o nível máximo.
   * `'deep'` é o mesmo que `[2, 6]`, o que significa que todos os títulos de `<h2>` a `<h6>` serão exibidos.
   *
   * @default 2
   */
  level?: number | [number, number] | 'deep'

  /**
   * O título a ser exibido na outline.
   *
   * @default 'On this page'
   */
  label?: string
}
```

## socialLinks

- Tipo: `SocialLink[]`

Você pode definir esta opção para mostrar os links de redes sociais com ícones na navegação.

```ts
export default {
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'twitter', link: '...' },
      // Você também pode adicionar ícones personalizados passando SVG como string:
       {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12...6.38z"/></svg>'
        },
        link: '...',
        // Você também pode incluir um rótulo personalizado para acessibilidade (opcional mas recomendado):
        ariaLabel: 'cool link'
      }
    ]
  }
}
```

```ts
interface SocialLink {
  icon: string | { svg: string }
  link: string
  ariaLabel?: string
}
```

## footer

- Tipo: `Footer`
- Pode ser sobreposto por página via [frontmatter](./frontmatter-config#footer)

Configuração do rodapé. Você pode adicionar uma mensagem ou texto de direitos autorais no rodapé, no entanto, ela só será exibida quando a página não contiver uma barra lateral. Isso se deve a preocupações de design.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Lançado sob a Licença MIT.',
      copyright: 'Direitos autorais © 2019-presente Evan You'
    }
  }
}
```

```ts
export interface Footer {
  message?: string
  copyright?: string
}
```

## editLink

- Tipo: `EditLink`
- Pode ser sobreposto por página via [frontmatter](./frontmatter-config#editlink)

O _EditLink_ permite exibir um link para editar a página em serviços de gerenciamento Git, como GitHub ou GitLab. Consulte [Tema Padrão: Editar Link](./default-theme-edit-link) para mais detalhes.

```ts
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Editar esta página no GitHub'
    }
  }
}
```

```ts
export interface EditLink {
  pattern: string
  text?: string
}
```

## lastUpdated

- Tipo: `LastUpdatedOptions`

Permite personalização para o texto de última atualização e o formato de data.

```ts
export default {
  themeConfig: {
    lastUpdated: {
      text: 'Atualizado em',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  }
}
```

```ts
export interface LastUpdatedOptions {
  /**
   * @default 'Last updated'
   */
  text?: string

  /**
   * @default
   * { dateStyle: 'short',  timeStyle: 'short' }
   */
  formatOptions?: Intl.DateTimeFormatOptions & { forceLocale?: boolean }
}
```

## algolia

- Tipo: `AlgoliaSearch`

Uma opção para dar suporte à pesquisa em seu site de documentação usando [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Saiba mais em [Tema Padrão: Pesquisa](./default-theme-search).

```ts
export interface AlgoliaSearchOptions extends DocSearchProps {
  locales?: Record<string, Partial<DocSearchProps>>
}
```

Veja todas as opções [aqui](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts).

## carbonAds {#carbon-ads}

- Tipo: `CarbonAdsOptions`

Uma opção para mostrar [Carbon Ads](https://www.carbonads.net/).

```ts
export default {
  themeConfig: {
    carbonAds: {
      code: 'seu-código-carbon',
      placement: 'sua-veiculação-carbon'
    }
  }
}
```

```ts
export interface CarbonAdsOptions {
  code: string
  placement: string
}
```

Saiba mais em [Tema Padrão: Carbon Ads](./default-theme-carbon-ads).

## docFooter

- Tipo: `DocFooter`

Pode ser usado para personalizar o texto que aparece acima dos links anterior e próximo. Útil se não estiver escrevendo documentação em inglês. Também pode ser usado para desabilitar globalmente os links anterior/próximo. Se você quiser ativar/desativar seletivamente os links anterior/próximo, pode usar [frontmatter](./default-theme-prev-next-links).

```ts
export default {
  themeConfig: {
    docFooter: {
      prev: 'Página anterior',
      next: 'Próxima página'
    }
  }
}
```

```ts
export interface DocFooter {
  prev?: string | false
  next?: string | false
}
```

## darkModeSwitchLabel

- Tipo: `string`
- Padrão: `Appearance`

Pode ser usado para personalizar o rótulo do botão de modo escuro. Esse rótulo é exibido apenas na visualização móvel.

## lightModeSwitchTitle

- Tipo: `string`
- Padrão: `Switch to light theme`

Pode ser usado para personalizar o título do botão de modo claro que aparece ao passar o mouse.

## darkModeSwitchTitle

- Tipo: `string`
- Padrão: `Switch to dark theme`

Pode ser usado para personalizar o título do botão de modo escuro que aparece ao passar o mouse.

## sidebarMenuLabel

- Tipo: `string`
- Padrão: `Menu`

Pode ser usado para personalizar o rótulo do menu da barra lateral. Esse rótulo é exibido apenas na visualização móvel.

## returnToTopLabel

- Tipo: `string`
- Padrão: `Return to top`

Pode ser usado para personalizar o rótulo do botão de retorno ao topo. Esse rótulo é exibido apenas na visualização móvel.

## langMenuLabel

- Tipo: `string`
- Padrão: `Change language`

Pode ser usado para personalizar o aria-label do botão de idioma na barra de navegação. Isso é usado apenas se você estiver usando [i18n](../guide/i18n).

## externalLinkIcon

- Tipo: `boolean`
- Padrão: `false`

Se deve mostrar um ícone de link externo ao lado de links externos no markdown.
