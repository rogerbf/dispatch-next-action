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
})
