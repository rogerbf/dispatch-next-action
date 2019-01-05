export default dispatch => () => next => (...args) => next(...dispatch(...args))
