export default dispatch => {
  if (typeof dispatch !== 'function') {
    throw new TypeError(
      `Expected [object Function], got ${Object.prototype.toString.call(
        dispatch,
      )}`,
    )
  }

  return () => next => (...args) => next(dispatch(...args))
}
