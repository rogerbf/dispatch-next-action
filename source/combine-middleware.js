const combineMiddleware = (options = {}, ...middleware) => {
  if (typeof options === `function`) {
    middleware.unshift(options)
    options = undefined
  }

  const dispatch = (...args) => middleware(...args)

  middleware = middleware
    .map(middleware => middleware(dispatch, options))
    .reduceRight((next, middleware) => middleware(next), (...args) => args)

  return dispatch
}

export default combineMiddleware
