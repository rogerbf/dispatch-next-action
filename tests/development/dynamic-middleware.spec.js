import dynamicMiddleware from "../../source/dynamic-middleware"

describe(`dynamicMiddleware`, () => {
  it(`is a function`, () => {
    expect(typeof dynamicMiddleware).toBe(`function`)
  })

  it(`returns the expected api`, () => {
    const { dispatch, set, delete: _delete, get } = dynamicMiddleware()

    expect(typeof set).toBe(`function`)
    expect(typeof _delete).toBe(`function`)
    expect(typeof get).toBe(`function`)
    expect(typeof dispatch).toBe(`function`)
  })

  test(`dispatch('testing')`, () => {
    expect(dynamicMiddleware().dispatch(`testing`)).toEqual([ `testing` ])
  })

  test(`middleware with options`, () => {
    const options = {}
    const middleware = jest.fn((dispatch, options) => next => action => {})

    dynamicMiddleware(options, middleware)

    expect(middleware).toHaveBeenCalledWith(expect.any(Function), options)
  })

  test(`dispatch(1, 2, 3)`, () => {
    const middleware = jest.fn(dispatch => next => (...args) => next(...args))

    const { dispatch } = dynamicMiddleware(middleware)

    expect(dispatch(1, 2, 3)).toEqual([ 1, 2, 3 ])
  })

  test(`adding/removing middleware`, () => {
    const { dispatch, set, delete: _delete } = dynamicMiddleware()

    expect(dispatch).toEqual(expect.any(Function))
    expect(set).toEqual(expect.any(Function))
    expect(_delete).toEqual(expect.any(Function))

    const middleware = jest.fn((dispatch, options) => next => action =>
      next(`testing`)
    )

    set(middleware)

    expect(dispatch()).toEqual([ `testing` ])

    _delete(middleware)

    expect(dispatch({})).toEqual([ {} ])
  })

  test(`adding/removing middleware (multiple)`, () => {
    const middleware = {
      a: jest.fn((dispatch, options) => next => (...args) =>
        next(...args, `a`)
      ),
      b: jest.fn((dispatch, options) => next => (...args) =>
        next(...args, `b`)
      ),
    }

    const { dispatch, set, delete: _delete } = dynamicMiddleware(
      middleware.a,
      middleware.b
    )

    expect(dispatch).toEqual(expect.any(Function))
    expect(set).toEqual(expect.any(Function))
    expect(_delete).toEqual(expect.any(Function))

    expect(dispatch()).toEqual([ `a`, `b` ])

    _delete(middleware.a)

    expect(dispatch()).toEqual([ `b` ])

    _delete(middleware.b)

    expect(dispatch()).toEqual([])

    set(middleware.a)

    expect(dispatch()).toEqual([ `a` ])

    _delete(middleware.a)

    set(middleware.b).set(middleware.a)

    expect(dispatch()).toEqual([ `b`, `a` ])
  })

  test(`get()`, () => {
    const middleware = jest.fn((dispatch, options) => next => (...args) =>
      next(...args, `a`)
    )

    const { get } = dynamicMiddleware(middleware)

    expect(get()).toEqual([ middleware ])
  })

  test(`clear()`, () => {
    const middleware = {
      a: jest.fn((dispatch, options) => next => (...args) =>
        next(...args, `a`)
      ),
      b: jest.fn((dispatch, options) => next => (...args) =>
        next(...args, `b`)
      ),
    }

    const { clear, get } = dynamicMiddleware(middleware.a, middleware.b)

    expect(get()).toEqual([ middleware.a, middleware.b ])

    clear()

    expect(get()).toEqual([])
  })

  test(`delete`, () => {
    const middleware = jest.fn((dispatch, options) => next => (...args) =>
      next(...args, `a`)
    )

    const api = dynamicMiddleware(middleware)

    expect(api.delete(middleware)).toEqual(api)
    expect(api.get()).toEqual([])

    api.set(middleware)

    api.delete(() => {})

    expect(api.get()).toEqual([ middleware ])
  })
})
