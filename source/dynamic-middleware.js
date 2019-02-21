const terminate = (...args) => args

const dynamicMiddleware = (context = {}, ...middleware) => {
  if (typeof context === `function`) {
    middleware.unshift(context)
    context = undefined
  }

  const dispatch = (...args) =>
    ((middleware[0] || {}).actionConsumer || terminate)(...args)

  const includes = dispatchConsumer =>
    middleware.findIndex(
      initialized => initialized.dispatchConsumer === dispatchConsumer
    ) > -1

  const initialize = (...args) =>
    args.map(dispatchConsumer => {
      if (includes(dispatchConsumer)) {
        const name = dispatchConsumer.name

        throw new Error(
          name
            ? `Trying to add duplicate middleware ( ${ name } )`
            : `Trying to add duplicate middleware`
        )
      }

      const initialized = {
        dispatchConsumer,
      }

      initialized.nextConsumer = initialized.dispatchConsumer(dispatch, context)

      initialized.actionConsumer = initialized.nextConsumer((...args) => {
        const index = middleware.findIndex(
          ({ dispatchConsumer }) =>
            dispatchConsumer === initialized.dispatchConsumer
        )

        const { actionConsumer } = (index > -1 && middleware[index + 1]) || {}

        return actionConsumer ? actionConsumer(...args) : terminate(...args)
      })

      return initialized
    })

  const push = (...args) => {
    initialize(...args).forEach(initialized => middleware.push(initialized))

    return dispatch
  }

  const unshift = (...args) => {
    initialize(...args.reverse()).forEach(initialized =>
      middleware.unshift(initialized)
    )

    return dispatch
  }

  const splice = (start, deleteCount, ...args) => {
    const initialized = initialize(...args)
    middleware.splice(start, deleteCount, ...initialized)

    return dispatch
  }

  const _delete = (...args) => {
    args.forEach(dispatchConsumer => {
      const index = middleware.findIndex(
        initialized => initialized.dispatchConsumer === dispatchConsumer
      )

      index > -1 && middleware.splice(index, 1)
    })

    return dispatch
  }

  const clear = () => {
    middleware = []

    return dispatch
  }

  if (middleware.length) {
    const initialMiddleware = [ ...middleware ]
    middleware = []
    push(...initialMiddleware)
  }

  Object.assign(dispatch, {
    clear,
    push,
    unshift,
    splice,
    delete: _delete,
    includes,
  })

  Object.defineProperty(dispatch, `current`, {
    get() {
      return middleware.map(({ dispatchConsumer }) => dispatchConsumer)
    },
  })

  return dispatch
}

export default dynamicMiddleware
