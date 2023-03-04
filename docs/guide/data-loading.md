# Build-Time Data Loading

## Basic Usage

```js
export default {
  load() {
    return {
      data: 'hello'
    }
  }
}
```

```js
export default {
  async load() {
    return (await fetch('...')).json()
  }
}
```

## Generating Data Based On Local Files

```js
import { readDirSync } from 'node:fs'

export default {
  watch: ['*.md'],
  async load() {
    //
  }
}
```

## Typed Data

```ts
export interface Data {
  // data type
}

declare const data: Data
export { data }

export default {
  async load(): Promise<Data> {
    // ...
  }
}
```
