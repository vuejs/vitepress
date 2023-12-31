# 上下页链接 {#prev-next-links}

可以自定义上一页和下一页的文本和链接 (显示在文档页脚处)。如果要使其与侧边栏上的文本不同，这会很有帮助。此外，你可能会发现，要禁用未包含在侧边栏中的页面的页脚或链接时，这很有用。

## prev

- 类型：`string | false | { text?: string; link?: string }`

- 说明：

  指定要在指向上一页的链接上显示的文本/链接。如果没有在 frontmatter 中设置它，文本/链接将从侧边栏配置中推断出来。

- 示例：

  - 仅自定义文本：

    ```yaml
    ---
    prev: 'Get Started | Markdown'
    ---
    ```

  - 自定义文本和链接：

    ```yaml
    ---
    prev:
      text: 'Markdown'
      link: '/guide/markdown'
    ---
    ```

  - 隐藏上一页：

    ```yaml
    ---
    prev: false
    ---
    ```

## next

与 `prev` 相同，但用于下一页。
