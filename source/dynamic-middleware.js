const terminate = (...args) => args

const dynamicMiddleware = (context = {}, ...middleware) => {
  if (typeof context === `function`) {
    middleware.unshift(context)
    context = undefined
  }

  const dispatch = (...args) =>
    ((middleware[0] || {}).actionConsumer || terminate)(...args)

  const clear = () => {
    middleware = []

    return dispatch
  }

  const add = (...args) => {
    args.forEach(dispatchConsumer => {
      const nextConsumer = dispatchConsumer(dispatch, context)

      const length = middleware.length

      const actionConsumer = nextConsumer((...args) =>
        ((middleware[length + 1] || {}).actionConsumer || terminate)(...args)
      )

      middleware.push({
        dispatchConsumer,
        nextConsumer,
        actionConsumer,
      })
    })

    return dispatch
  }

  const _delete = (...args) => {
    const filteredMiddleware = middleware
      .map(({ dispatchConsumer }) => dispatchConsumer)
      .filter(dispatchConsumer => args.indexOf(dispatchConsumer) === -1)

    return clear().add(...filteredMiddleware)
  }

  if (middleware.length) {
    const initialMiddleware = [ ...middleware ]
    middleware = []
    add(...initialMiddleware)
  }

  Object.assign(dispatch, {
    clear,
    add,
    delete: _delete,
  })

  Object.defineProperty(dispatch, `entries`, {
    get() {
      return middleware.map(({ dispatchConsumer }) => dispatchConsumer)
    },
  })

  return dispatch
}

export default dynamicMiddleware
