# markdown 基础语法 {#markdown-base}

## markdown-it 插件

通过[markdown-it 插件](https://www.npmjs.com/search?q=keywords:markdown-it-plugin)，可以实现更多 markdown 功能。

### 使用

在 `doc/.vitepress/config.ts` 中引入使用

```js
import mdFootnote from 'markdown-it-footnote'

markdown: {
  config: md => {
    md.use(mdFootnote)
    ...
  },
},
```

## 标题 {#title}

```md
# 一级标题

## 二级标题

### 三级标题

...
```

::: details 示例

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

:::

##### 标题编号

```md
<!-- 要添加自定义标题ID，请在与标题相同的行上用大括号括起该自定义ID。 -->

### My Great Heading {#custom-id}
```

## 字体

##### 加粗

```md
**加粗**
```

##### 斜体

```md
_斜体_
```

##### 斜体加粗

```md
**_斜体加粗_**
```

##### 删除线

```md
~~删除线~~
```

::: details 示例
**加粗**

_斜体_

**_斜体加粗_**

~~删除线~~

:::

## 引用

```md
> 这是引用的内容
>
> > 这是引用的内容
> >
> > > > > > 这是引用的内容

<!-- 引用可以嵌套 -->
```

::: details 示例

> 这是引用的内容
>
> > 这是引用的内容
> >
> > > > > > 这是引用的内容

:::

## 分割线

```md
---
---

可以在一行中使用三个或更多的 \* 、 - 或者 \_ 来添加分隔线
```

::: details 示例

---

:::

## 换行

```md
<p></p> 或者
<br>
```

## 链接

```md
<!-- 注：Markdown本身语法不支持链接在新页面中打开, VitePress 做了处理 -->

[链接文本](链接 'title')
[VitePressCN](https://vanchkong.github.io/VitePressCN 'Vite & Vue 驱动的静态站点生成器')

<!-- 要将URL或电子邮件地址快速转换为链接，请将其括在尖括号中。在 VitePress 中无需次步操作即可自动转换为链接,如果你想禁用自动URL链接，可以用 `` 包裹它 -->

<https://vanchkong.github.io/VitePressCN>
<fake@example.com>

<!-- 为了强调链接，请在方括号之前和圆括号之后添加星号。同上方字体用法 -->
```

::: details 示例
[VitePressCN](https://vanchkong.github.io/VitePressCN 'Vite & Vue 驱动的静态站点生成器')

<https://vanchkong.github.io/VitePressCN>

<fake@example.com>

**~~<https://vanchkong.github.io/VitePressCN>~~**

https://vanchkong.github.io/VitePressCN

`https://vanchkong.github.io/VitePressCN`
:::

## 图片

```md
![alt](图片地址 'title')
alt 就是显示在图片下面的文字，相当于对图片内容的解释。
title 是图片的标题，当鼠标移到图片上时显示的内容。

<!-- 图片可以被链接包裹 -->
```

::: details 示例
![vite](/logo.svg 'vite')
:::

## 列表 {#list}

##### 无序列表 {#unordered-list}

```md
<!-- 注意：序号跟内容之间要有空格 -->
<!-- 无序列表也可以用 * 替代 - -->

- 无序列表
- 无序列表
- 无序列表
- - 可以替换为 \* 或者 +
    ...
```

##### 有序列表 {#ordered-list}

```md
1. 有序列表
2. 有序列表
3. 有序列表
   ...
```

##### 任务列表

```md
<!-- 任务列表基于 mit 插件 markdown-it-task-lists 实现 -->

- [x] 任务列表
- [ ] 任务列表
- [ ] 任务列表
```

##### 嵌套列表

```md
1. 有序列表
   - 无序列表
   - 无序列表
2. 有序列表

- 无序列表
  1. 有序列表
  2. 有序列表
- 无序列表
```

::: details 示例

- 无序列表
- 无序列表
- 无序列表

---

1. 有序列表
2. 有序列表
3. 有序列表

---

1. 有序列表
   - 无序列表
   - 无序列表
2. 有序列表

---

- [x] 任务列表
- [ ] 任务列表
- [ ] 任务列表

---

- 无序列表
  1. 有序列表
  2. 有序列表
- 无序列表
  :::

## 表格

```md
| 居左 | 居中 | 居右 |
| :--- | :--: | ---: |
| 内容 | 内容 | 内容 |
| 内容 | 内容 | 内容 |
```

::: details 示例
| 表头 | 表头 | 表头 |
| :------- | :------: | -------: |
| 居左内容 | 居中内容 | 居右内容 |
| 内容 | 内容 | 内容 |
:::

## 代码块

##### 单行代码块

```md
`单行代码块`
```

##### 多行代码块

````md
<!-- ```之后可以指定语言类型, ~~~ 可以替换 ``` -->

```md
多行代码块
多行代码块
```
````

::: details 示例

`单行代码块` `单行代码块` `单行代码块`

```md
多行代码块
多行代码块
```

:::

## 转义字符

要显示原义字符，否则将用于设置 Markdown 文档中的文本格式 `\`，请在字符前面添加反斜杠。

```md
\* 如果没有反斜杠，这将是无序列表中的项目符号。

- 如果没有反斜杠，这将是无序列表中的项目符号。
```

::: details 示例 \* 如果没有反斜杠，这将是无序列表中的项目符号。

- 如果没有反斜杠，这将是无序列表中的项目符号。
  :::

## 脚注

```md
<!-- 脚注基于 mit 插件 markdown-it-footnote 实现 -->
<!-- 注解始终出现在页面最下方，即使注解下方仍有其他代码内容 -->

任意文字[^1]
[^1]:解释
```

任意文字[^1]
[^1]:解释
