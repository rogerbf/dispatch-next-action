import dynamicMiddleware from "../../source/dynamic-middleware"

describe(`dynamicMiddleware`, () => {
  it(`is a function`, () => {
    expect(typeof dynamicMiddleware).toBe(`function`)
  })

  it(`returns the expected api`, () => {
    const dispatch = dynamicMiddleware()

    expect(typeof dispatch.add).toBe(`function`)
    expect(typeof dispatch.delete).toBe(`function`)
    expect(dispatch.entries).toEqual([])
    expect(typeof dispatch).toBe(`function`)
  })

  test(`initial middleware`, () => {
    const dispatch = dynamicMiddleware(() => next => action => next(action))

    expect(dispatch()).toEqual([ undefined ])
  })

  test(`initial middleware (multiple)`, () => {
    const dispatch = dynamicMiddleware(
      () => next => action => next(action),
      () => next => action => next(action),
      () => next => action => next(action)
    )

    expect(dispatch()).toEqual([ undefined ])
  })

  test(`dispatch('testing')`, () => {
    expect(dynamicMiddleware()(`testing`)).toEqual([ `testing` ])
  })

  test(`middleware with context`, () => {
    const context = {}
    const middleware = jest.fn((dispatch, context) => next => action => {})

    dynamicMiddleware(context, middleware)

    expect(middleware).toHaveBeenCalledWith(expect.any(Function), context)
  })

  test(`dispatch(1, 2, 3)`, () => {
    const middleware = jest.fn(dispatch => next => (...args) => next(...args))

    const dispatch = dynamicMiddleware(middleware)

    expect(dispatch(1, 2, 3)).toEqual([ 1, 2, 3 ])
  })

  test(`adding/removing middleware`, () => {
    const dispatch = dynamicMiddleware()

    expect(dispatch).toEqual(expect.any(Function))
    expect(dispatch.add).toEqual(expect.any(Function))
    expect(dispatch.delete).toEqual(expect.any(Function))

    const middleware = jest.fn((dispatch, context) => next => action =>
      next(`testing`)
    )

    dispatch.add(middleware)

    expect(dispatch()).toEqual([ `testing` ])

    dispatch.delete(middleware)

    expect(dispatch({})).toEqual([ {} ])
  })

  test(`adding/removing middleware (multiple)`, () => {
    const middleware = {
      a: jest.fn((dispatch, context) => next => (...args) =>
        next(...args, `a`)
      ),
      b: jest.fn((dispatch, context) => next => (...args) =>
        next(...args, `b`)
      ),
    }

    const dispatch = dynamicMiddleware(middleware.a, middleware.b)

    expect(dispatch).toEqual(expect.any(Function))
    expect(dispatch.add).toEqual(expect.any(Function))
    expect(dispatch.delete).toEqual(expect.any(Function))

    expect(dispatch()).toEqual([ `a`, `b` ])

    dispatch.delete(middleware.a)

    expect(dispatch()).toEqual([ `b` ])

    dispatch.delete(middleware.b)

    expect(dispatch()).toEqual([])

    dispatch.add(middleware.a)

    expect(dispatch()).toEqual([ `a` ])

    dispatch.delete(middleware.a)

    dispatch.add(middleware.b).add(middleware.a)

    expect(dispatch()).toEqual([ `b`, `a` ])
  })

  test(`entries`, () => {
    const middleware = jest.fn((dispatch, context) => next => (...args) =>
      next(...args, `a`)
    )

    const dispatch = dynamicMiddleware(middleware)

    expect(dispatch.entries).toEqual([ middleware ])
  })

  test(`clear()`, () => {
    const middleware = {
      a: jest.fn((dispatch, context) => next => (...args) =>
        next(...args, `a`)
      ),
      b: jest.fn((dispatch, context) => next => (...args) =>
        next(...args, `b`)
      ),
    }

    const dispatch = dynamicMiddleware(middleware.a, middleware.b)

    expect(dispatch.entries).toEqual([ middleware.a, middleware.b ])

    dispatch.clear()

    expect(dispatch.entries).toEqual([])
  })

  test(`delete`, () => {
    const middleware = jest.fn((dispatch, context) => next => (...args) =>
      next(...args, `a`)
    )

    const dispatch = dynamicMiddleware(middleware)

    expect(dispatch.delete(middleware)).toEqual(dispatch)
    expect(dispatch.entries).toEqual([])

    dispatch.add(middleware)

    dispatch.delete(() => {})

    expect(dispatch.entries).toEqual([ middleware ])
  })

  test(`unshift`, () => {
    const calls = []

    const middleware = [
      () => next => action => {
        calls.push(1)
        return next(action)
      },
    ]

    const dispatch = dynamicMiddleware()
    dispatch.unshift(...middleware)
    expect(dispatch.entries).toEqual([ ...middleware ])
    dispatch()
    expect(calls).toEqual([ 1 ])
  })

  test(`unshift (initial middleware)`, () => {
    const calls = []

    const initialMiddleware = [
      () => next => action => {
        calls.push(2)
        return next(action)
      },
    ]

    const middleware = [
      () => next => action => {
        calls.push(1)
        return next(action)
      },
    ]

    const dispatch = dynamicMiddleware(...initialMiddleware)
    dispatch.unshift(...middleware)
    expect(dispatch.entries).toEqual([ ...middleware, ...initialMiddleware ])
    dispatch()
    expect(calls).toEqual([ 1, 2 ])
  })

  test(`unshift (multiple)`, () => {
    const calls = []

    const middleware = [
      () => next => action => {
        calls.push(1)
        return next(action)
      },
      () => next => action => {
        calls.push(2)
        return next(action)
      },
    ]

    const dispatch = dynamicMiddleware()
    dispatch.unshift(...middleware)

    expect(dispatch.entries).toEqual([ ...middleware ])
    dispatch()
    expect(calls).toEqual([ 1, 2 ])
  })

  test(`unshift (multiple with initial)`, () => {
    const calls = []

    const initialMiddleware = [
      () => next => action => {
        calls.push(3)
        return next(action)
      },
    ]

    const middleware = [
      () => next => action => {
        calls.push(1)
        return next(action)
      },
      () => next => action => {
        calls.push(2)
        return next(action)
      },
    ]

    const dispatch = dynamicMiddleware(...initialMiddleware)
    dispatch.unshift(...middleware)

    expect(dispatch.entries).toEqual([ ...middleware, ...initialMiddleware ])
    dispatch()
    expect(calls).toEqual([ 1, 2, 3 ])
  })

  test(`unshift (multiple, delete one)`, () => {
    const calls = []

    const initialMiddleware = [
      () => next => action => {
        calls.push(3)
        return next(action)
      },
    ]

    const middleware = [
      () => next => action => {
        calls.push(1)
        return next(action)
      },
      () => next => action => {
        calls.push(2)
        return next(action)
      },
    ]

    const dispatch = dynamicMiddleware(...initialMiddleware)
    dispatch.unshift(...middleware)
    dispatch()
    expect(calls).toEqual([ 1, 2, 3 ])
    dispatch.delete(middleware[1])
    expect(dispatch.entries).toEqual([ middleware[0], ...initialMiddleware ])
    dispatch()
    expect(calls).toEqual([ 1, 2, 3, 1, 3 ])
  })
})
