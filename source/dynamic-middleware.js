const toString = (x) => Object.prototype.toString.call(x)
const FUNCTION = toString(Function)

const terminate = (...args) => args

const dynamicMiddleware = (context, ...middleware) => {
  if (typeof context === "function") {
    middleware.unshift(context)
    context = undefined
  }

  let initialized = false
  let dispatchQueue = []

  const dispatch = (...args) =>
    initialized
      ? ((middleware[0] || {}).actionConsumer || terminate)(...args)
      : dispatchQueue.push(args)

  const includes = (dispatchConsumer) =>
    middleware.findIndex(
      (initialized) => initialized.dispatchConsumer === dispatchConsumer
    ) > -1

  const initialize = (...args) =>
    args.map((dispatchConsumer) => {
      if (typeof dispatchConsumer !== "function") {
        throw new TypeError(
          `Expected ${FUNCTION}, got ${toString(dispatchConsumer)}`
        )
      }

      if (includes(dispatchConsumer)) {
        const { name } = dispatchConsumer

        throw new Error(
          name
            ? `Trying to add duplicate middleware ( ${name} )`
            : "Trying to add duplicate middleware"
        )
      }

      const initialized = {
        dispatchConsumer,
      }

      const registerDeleteListener = (onDelete) => {
        if (typeof onDelete !== "function") {
          throw new TypeError(`Expected ${FUNCTION}, got ${toString(onDelete)}`)
        }

        initialized.onDelete = onDelete
      }

      initialized.nextConsumer = initialized.dispatchConsumer(
        dispatch,
        context,
        registerDeleteListener
      )

      if (typeof initialized.nextConsumer !== "function") {
        throw new TypeError(
          `Expected ${FUNCTION}, got ${toString(initialized.nextConsumer)}`
        )
      }

      initialized.actionConsumer = initialized.nextConsumer((...args) => {
        const index = middleware.findIndex(
          ({ dispatchConsumer }) =>
            dispatchConsumer === initialized.dispatchConsumer
        )

        const { actionConsumer } = (index > -1 && middleware[index + 1]) || {}

        return actionConsumer ? actionConsumer(...args) : terminate(...args)
      })

      if (typeof initialized.actionConsumer !== "function") {
        throw new TypeError(
          `Expected ${FUNCTION}, got ${toString(initialized.actionConsumer)}`
        )
      }

      return initialized
    })

  const push = (...args) => {
    initialize(...args).forEach((initialized) => middleware.push(initialized))

    return dispatch
  }

  const unshift = (...args) => {
    initialize(...args.reverse()).forEach((initialized) =>
      middleware.unshift(initialized)
    )

    return dispatch
  }

  const splice = (start, deleteCount, ...args) => {
    if (typeof start !== "number") {
      throw new TypeError("Expected first argument to be a number")
    }

    if (deleteCount === undefined) {
      throw new TypeError(
        "Expected second argument to be either of type number or function"
      )
    }

    if (typeof deleteCount === "function") {
      args.unshift(deleteCount)
      deleteCount = 0
    }

    const initialized = initialize(...args)

    middleware
      .splice(start, deleteCount, ...initialized)
      .map(({ onDelete }) => onDelete && onDelete())

    return dispatch
  }

  const deleteImplementation = (...args) => {
    args.forEach((dispatchConsumer) => {
      const index = middleware.findIndex(
        (initialized) => initialized.dispatchConsumer === dispatchConsumer
      )

      index > -1 &&
        middleware
          .splice(index, 1)
          .map(({ onDelete }) => onDelete && onDelete())
    })

    return dispatch
  }

  const clear = () => {
    const nextMiddleware = middleware.reduce((next, { onDelete }) => {
      onDelete && onDelete()
      return next
    }, [])

    middleware = nextMiddleware

    return dispatch
  }

  if (middleware.length) {
    const initialMiddleware = [...middleware]
    middleware = []
    push(...initialMiddleware)
  }

  Object.assign(dispatch, {
    clear,
    push,
    unshift,
    splice,
    delete: deleteImplementation,
    includes,
  })

  Object.defineProperty(dispatch, "current", {
    get() {
      return middleware.map(({ dispatchConsumer }) => dispatchConsumer)
    },
  })

  initialized = true
  dispatchQueue.forEach((args) => dispatch(...args))
  dispatchQueue = null

  return dispatch
}

export default dynamicMiddleware
