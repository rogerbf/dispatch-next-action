const FUNCTION = Object.prototype.toString.call(() => {})

const staticMiddleware = (context = {}, ...middleware) => {
  if (typeof context === 'function') {
    middleware.unshift(context)
    context = undefined
  }

  let initialized = false
  let dispatchQueue = []
  let dispatch = (...args) =>
    initialized ? middleware(...args) : dispatchQueue.push(args)

  middleware = middleware
    .map(dispatchConsumer => {
      if (typeof dispatchConsumer !== 'function') {
        throw new TypeError(
          `Expected ${FUNCTION}, got ${Object.prototype.toString.call(
            dispatchConsumer,
          )}`,
        )
      }

      const nextConsumer = dispatchConsumer(dispatch, context)

      if (typeof nextConsumer !== 'function') {
        throw new TypeError(
          `Expected ${FUNCTION}, got ${Object.prototype.toString.call(
            nextConsumer,
          )}`,
        )
      }

      return nextConsumer
    })
    .reduceRight(
      (next, nextConsumer) => {
        const actionConsumer = nextConsumer(next)

        if (typeof actionConsumer !== 'function') {
          throw new TypeError(
            `Expected ${FUNCTION}, got ${Object.prototype.toString.call(
              actionConsumer,
            )}`,
          )
        }

        return actionConsumer
      },
      (...args) => args,
    )

  initialized = true
  dispatchQueue.forEach(args => dispatch(...args))
  dispatchQueue = null

  return dispatch
}

export default staticMiddleware
