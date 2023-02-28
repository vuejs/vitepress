export default {
  async paths() {
    return [
      { params: { id: 'foo' }, content: `# Foo` },
      { params: { id: 'bar' }, content: `# Bar` }
    ]
  }
}
