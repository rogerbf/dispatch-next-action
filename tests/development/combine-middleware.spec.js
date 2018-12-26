import combineMiddleware from "../../source/combine-middleware"

describe(`combineMiddleware`, () => {
  it(`is a function`, () => {
    expect(typeof combineMiddleware).toBe(`function`)
  })

  it(`returns a function`, () => {
    const dispatch = combineMiddleware()

    expect(typeof dispatch).toBe(`function`)
  })

  test(`dispatch without middleware`, () => {
    expect(combineMiddleware()(`TEST`)).toEqual([ `TEST` ])
  })

  test(`middleware initialization`, () => {
    const actionConsumer = jest.fn()
    const nextConsumer = jest.fn(next => actionConsumer)
    const middleware = jest.fn(dispatch => nextConsumer)

    const dispatch = combineMiddleware(middleware)

    expect(typeof dispatch).toBe(`function`)
    expect(middleware).toHaveBeenCalledTimes(1)
    expect(nextConsumer).toHaveBeenCalledTimes(1)
  })

  test(`middleware initialization with options`, () => {
    const options = {
      TEST: `TEST`,
    }

    const middleware = jest.fn((dispatch, options) => next => action =>
      next(action)
    )

    const dispatch = combineMiddleware(options, middleware)

    expect(typeof dispatch).toBe(`function`)
    expect(middleware).toHaveBeenCalledWith(expect.any(Function), options)
  })

  test(`multiple middleware`, () => {
    const firstMiddleware = dispatch => next => (...args) => next(...args, 1)
    const secondMiddleware = dispatch => next => (...args) => next(...args, 2)

    const dispatch = combineMiddleware(firstMiddleware, secondMiddleware)

    expect(dispatch(`test`)).toEqual([ `test`, 1, 2 ])
  })
})
