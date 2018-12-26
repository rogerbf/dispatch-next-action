const terminate = (...args) => args

const dynamicMiddleware = (options = {}, ...middleware) => {
  if (typeof options === `function`) {
    middleware.unshift(options)
    options = undefined
  }

  const api = {}

  const dispatch = (...args) =>
    ((middleware[0] || {}).actionConsumer || terminate)(...args)

  const clear = () => {
    middleware = []

    return api
  }

  const set = (...args) => {
    args.forEach(dispatchConsumer => {
      const nextConsumer = dispatchConsumer(dispatch, options)

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

    return api
  }

  const _delete = (...args) => {
    const filteredMiddleware = middleware
      .map(({ dispatchConsumer }) => dispatchConsumer)
      .filter(dispatchConsumer => args.indexOf(dispatchConsumer) === -1)

    return clear().set(...filteredMiddleware)
  }

  const get = () => middleware.map(({ dispatchConsumer }) => dispatchConsumer)

  if (middleware.length) {
    const initialMiddleware = [ ...middleware ]
    middleware = []
    set(...initialMiddleware)
  }

  Object.assign(api, {
    dispatch,
    clear,
    set,
    delete: _delete,
    get,
  })

  return api
}

export default dynamicMiddleware
