export default dispatch => {
  if (typeof dispatch !== 'function') {
    throw new TypeError(
      `Expected ${Object.prototype.toString.call(
        () => {},
      )}, got ${Object.prototype.toString.call(dispatch)}`,
    )
  }

  return () => next => (...args) => next(...dispatch(...args))
}
