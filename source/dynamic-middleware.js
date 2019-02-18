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

  const initialize = (...args) =>
    args.map(dispatchConsumer => {
      const initialized = {
        dispatchConsumer,
      }

      initialized.nextConsumer = initialized.dispatchConsumer(dispatch, context)

      initialized.actionConsumer = initialized.nextConsumer((...args) => {
        const index = middleware.findIndex(
          ({ dispatchConsumer }) =>
            dispatchConsumer === initialized.dispatchConsumer
        )

        const { actionConsumer } = index > -1 ? middleware[index + 1] || {} : {}

        return actionConsumer ? actionConsumer(...args) : terminate(...args)
      })

      return initialized
    })

  const add = (...args) => {
    initialize(...args).forEach(initialized => middleware.push(initialized))

    return dispatch
  }

  const unshift = (...args) => {
    initialize(...args.reverse()).forEach(initialized =>
      middleware.unshift(initialized)
    )

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
    unshift,
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
