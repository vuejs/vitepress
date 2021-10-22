# Configuration配置

不需要任何配置，页面只有一个标题，用户无法导航到站点。要自定义站点，首先创建一个`.vitepress`目录在你的文档目录中。这里是放所有VitePress-specific文件的位置。你的项目结构可能像这样：
```bash
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  └─ index.md
└─ package.json
```

配置VitePress站点的最重要的文件是`.vitepress/config.js`，它应该导出一个JavaScript对象：

```js
module.exports = {
  title: 'Hello VitePress',
  description: 'Just playing around.'
}
```

查看[配置参考](/config/basics)以获取完整的选项列表。
