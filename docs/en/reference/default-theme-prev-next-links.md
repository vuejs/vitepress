---
description: Customize the previous and next page links displayed at the bottom of doc pages in VitePress.
---

# Prev Next Links

You can customize the text and link for the previous and next pages (shown at doc footer). This is helpful if you want a different text there than what you have on your sidebar. Additionally, you may find it useful to disable the footer or link to a page that is not included in your sidebar.

## prev

- Type: `string | false | { label?: string; text?: string; link?: string }`

- Details:

  Specifies the text/link to show on the link to the previous page. If you don't set this in frontmatter, the text/link will be inferred from the sidebar config.

  Use `label` to customize the label above the link text. A page-level label overrides the [theme label](./default-theme-config#docfooter) and works when a page re-enables the link with `themeConfig.docFooter.prev` set to `false`.

- Examples:

  - To customize only the text:

    ```yaml
    ---
    prev: 'Get Started | Markdown'
    ---
    ```

  - To customize the label, text, and link:

    ```yaml
    ---
    prev:
      label: 'Pagina prior'
      text: 'Markdown'
      link: '/guide/markdown'
    ---
    ```

  - To hide previous page:

    ```yaml
    ---
    prev: false
    ---
    ```

## next

Same as `prev` but for the next page.
