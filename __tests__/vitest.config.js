import path from 'path'

export default {
  resolve: {
    alias: {
      node: path.resolve(__dirname, '../src/node'),
      client: path.resolve(__dirname, '../src/client')
    }
  }
}
