// #region snippet
function foo() {
  console.log('foo')
}
// #endregion snippet

console.log('this line is not in #region snippet!')

// #region snippet
function bar() {
  console.log('bar')
}
// #endregion snippet

export { bar, foo }
