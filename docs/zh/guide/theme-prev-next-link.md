# 上下页链接 {#prev-next-link}

当你想定义上一个/下一个链接上显示与侧边栏不同的文本时，可以通过配置来自定义上下页链接。

## 上页 {#prev}

- 类型: `string`

- 详情:

  指定要在上一页的链接上显示的文本。

  如果你没有在 frontmatter 中设置这个，文本将从侧边栏配置中推断出来。

- 例子:

```yaml
---
prev: 'Get Started | Markdown'
---
```

## 下页 {#next}

- 类型: `string`

- 详情:

  与 `prev` 同理
