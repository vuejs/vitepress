# Página Inicial {#home-page}

O tema padrão VitePress fornece um layout de página inicial, que você também pode ver em uso [na página inicial deste site](../). Você pode usá-lo em qualquer uma de suas páginas especificando `layout: home` em [frontmatter](./frontmatter-config).

```yaml
---
layout: home
---
```

No entanto, essa opção sozinha não faz muito. Você pode adicionar várias "seções" diferentes pré-modeladas à página inicial definindo opções adicionais como `hero` e `features`.

## Seção Hero {#hero-section}

A seção _Hero_ fica no topo da página inicial. Aqui segue como você pode configurar a seção _Hero_.

```yaml
---
layout: home

hero:
  name: VitePress
  text: Gerador de site estático com Vite & Vue.
  tagline: Lorem ipsum...
  image:
    src: /logo.png
    alt: VitePress
  actions:
    - theme: brand
      text: Iniciar
      link: /guide/what-is-vitepress
    - theme: alt
      text: Ver no GitHub
      link: https://github.com/vuejs/vitepress
---
```

```ts
interface Hero {
  // A string mostrada acima de `text`. Vem com a cor da marca
  // e espera-se que seja curta, como o nome do produto.
  name?: string

  // O texto principal para a seção hero.
  // Isso será definido como uma tag `h1`.
  text: string

  // Slogan exibido abaixo de `text`.
  tagline?: string

  // A imagem é exibida ao lado da área de texto e slogan.
  image?: ThemeableImage

  // Botões acionáveis para exibir na seção hero da página inicial.
  actions?: HeroAction[]
}

type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }

interface HeroAction {
  // Tema de cor do botão. Padrão: `brand`.
  theme?: 'brand' | 'alt'

  // Rótulo do botão.
  text: string

  // Destino do link do botão.
  link: string

  // Atributo target do link.
  target?: string

  // Atributo rel do link.
  rel?: string
}
```

### Personalizando a cor do nome {#customizing-the-name-color}

VitePress usa a cor da marca (`--vp-c-brand-1`) para `name`. No entanto, você pode personalizar essa cor sobrescrevendo a variável `--vp-home-hero-name-color`.

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

Você também pode personalizá-la ainda mais combinando `--vp-home-hero-name-background` para dar ao `name` uma cor degradê.

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
}
```

## Seção de Funcionalidades {#features-section}

Na seção de funcionalidades, você pode listar qualquer número de funcionalidades que deseja mostrar imediatamente após a seção _Hero_. Para configurá-la, passe a opção `features` para o frontmatter.

Você pode fornecer um ícone para cada funcionalidade, que pode ser um emoji ou qualquer tipo de imagem. Quando o ícone configurado é uma imagem (svg, png, jpeg...), você deve fornecer o ícone com a largura e altura apropriadas; você também pode fornecer a descrição, seu tamanho intrínseco, bem como suas variantes para temas escuros e claros quando necessário.

```yaml
---
layout: home

features:
  - icon: 🛠️
    title: Simples e minimalista, sempre
    details: Lorem ipsum...
  - icon:
      src: /cool-feature-icon.svg
    title: Outro recurso legal
    details: Lorem ipsum...
  - icon:
      dark: /dark-feature-icon.svg
      light: /light-feature-icon.svg
    title: Outro recurso legal
    details: Lorem ipsum...
---
```

```ts
interface Feature {
  // Mostra ícone em cada bloco de funcionalide.
  icon?: FeatureIcon

  // Título da funcionalidade.
  title: string

  // Detalhes da funcionalidade.
  details: string

  // Link quando clicado no componente de funcionalidade.
  // O link pode ser interno ou externo.
  //
  // ex. `guide/reference/default-theme-home-page` ou `https://example.com`
  link?: string

  // Texto do link a ser exibido dentro do componente de funcionalidade.
  //  Melhor usado com a opção `link`.
  //
  // ex. `Saiba mais`, `Visitar página`, etc.
  linkText?: string

  // Atributo rel do link para a opção `link`.
  //
  // ex. `external`
  rel?: string

  // Atributo target do link para a opção `link`.
  target?: string
}

type FeatureIcon =
  | string
  | { src: string; alt?: string; width?: string; height: string }
  | {
      light: string
      dark: string
      alt?: string
      width?: string
      height: string
    }
```
