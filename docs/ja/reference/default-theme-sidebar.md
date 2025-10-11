# サイドバー {#sidebar}

サイドバーはドキュメントの主要なナビゲーションブロックです。[`themeConfig.sidebar`](./default-theme-config#sidebar) でメニューを設定できます。

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Getting Started', link: '/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

## 基本 {#the-basics}

最もシンプルな構成は、リンクの配列を 1 つ渡す方法です。第 1 階層のアイテムがサイドバーの「セクション」を表します。各セクションは `text`（セクションのタイトル）と、実際のナビゲーションリンクである `items` を持ちます。

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        items: [
          { text: 'Item A', link: '/item-a' },
          { text: 'Item B', link: '/item-b' },
          ...
        ]
      },
      {
        text: 'Section Title B',
        items: [
          { text: 'Item C', link: '/item-c' },
          { text: 'Item D', link: '/item-d' },
          ...
        ]
      }
    ]
  }
}
```

各 `link` は `/` で始まる実ファイルへのパスを指定します。リンクの末尾を `/` で終わらせると、対応するディレクトリの `index.md` が表示されます。

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          // `/guide/index.md` を表示
          { text: 'Introduction', link: '/guide/' }
        ]
      }
    ]
  }
}
```

サイドバーのアイテムは、ルートから数えて最大 6 階層まで入れ子にできます。7 階層以上は無視され、表示されません。

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Level 1',
        items: [
          {
            text: 'Level 2',
            items: [
              {
                text: 'Level 3',
                items: [
                  ...
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## 複数のサイドバー {#multiple-sidebars}

ページのパスに応じて異なるサイドバーを表示できます。たとえば、このサイトのように「Guide」セクションと「Config」セクションでナビゲーションを分けたい場合に便利です。

まず、対象のセクションごとにディレクトリを分けてページを配置します。

```
.
├─ guide/
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ config/
   ├─ index.md
   ├─ three.md
   └─ four.md
```

次に、各セクション用のサイドバーを設定します。この場合、配列ではなくオブジェクトを渡します。

```js
export default {
  themeConfig: {
    sidebar: {
      // ユーザーが `guide` ディレクトリ配下にいるときに表示
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Index', link: '/guide/' },
            { text: 'One', link: '/guide/one' },
            { text: 'Two', link: '/guide/two' }
          ]
        }
      ],

      // ユーザーが `config` ディレクトリ配下にいるときに表示
      '/config/': [
        {
          text: 'Config',
          items: [
            { text: 'Index', link: '/config/' },
            { text: 'Three', link: '/config/three' },
            { text: 'Four', link: '/config/four' }
          ]
        }
      ]
    }
  }
}
```

## 折りたたみ可能なサイドバーグループ {#collapsible-sidebar-groups}

サイドバーグループに `collapsed` オプションを追加すると、各セクションの開閉トグルが表示されます。

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        collapsed: false,
        items: [...]
      }
    ]
  }
}
```

既定ではすべてのセクションが「開いた」状態です。初回表示時に「閉じた」状態にしたい場合は、`collapsed` を `true` に設定します。

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        collapsed: true,
        items: [...]
      }
    ]
  }
}
```
