const staticMiddleware = (context = {}, ...middleware) => {
  if (typeof context === `function`) {
    middleware.unshift(context)
    context = undefined
  }

  const dispatch = (...args) => middleware(...args)

  middleware = middleware
    .map(middleware => middleware(dispatch, context))
    .reduceRight((next, middleware) => middleware(next), (...args) => args)

  return dispatch
}

export default staticMiddleware
