# Prev Next Links

You can customize the text and link for the previous and next pages (shown at doc footer). This is helpful if you want different text there than what's on the sidebar. Additionally, you may find it useful to disable the footer or link to a page that is not included in your sidebar.

## prev

- Type: `string | false | { text?: string; link?: string }`

- Details:

  Specifies the text/link to show on the link to the previous page. If you don't set this in frontmatter, the text/link will be inferred from the sidebar configuration.

- Examples:

  - To customize only the text:

    ```yaml
    ---
    prev: 'Get Started | Markdown'
    ---
    ```

  - To customize both text and link:

    ```yaml
    ---
    prev:
      text: 'Markdown'
      link: '/guide/markdown'
    ---
    ```

  - To hide the previous page link:

    ```yaml
    ---
    prev: false
    ---
    ```

## next

`next` has the same interface and caveats as `prev`, but for the next page.
