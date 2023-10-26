# 上下页链接 {#prev-next-links}

你可以自定义上（下）一篇链接的文本。如果 你想在 上（下）一篇 链接上显示与侧边栏上不同的文本(默认显示侧边栏的文本)，这将很有帮助。你可以自定义上一页和下一页的文本和链接（显示在文档页脚处）。如果你想要的文本与边栏上的文本不同，这会很有帮助。此外，还可以禁用侧边栏中未包含页面的页脚或链接

## 上一页 {#prev}

- Key: `prev`

- Type: `string | false | { text?: string; link?: string }`

- Details:

  指定要在指向上一页的链接上显示的文本/链接。如果你没有在 frontmatter 中设置它，文本/链接将从侧边栏配置中推断出来。

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

## 下一页 {#next}

与 `prev` 相同，但用于下一页。
