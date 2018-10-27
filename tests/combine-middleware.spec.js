const expect = require(`expect`)
const { default: combineMiddleware } = require(`../source/combine-middleware`)

const testAction = { type: `TEST` }

describe(`combineMiddleware`, () => {
  it(`is a function`, () => {
    expect(typeof combineMiddleware).toBe(`function`)
  })

  it(`returns a function`, () => {
    const dispatch = combineMiddleware()

    expect(typeof dispatch).toBe(`function`)
  })

  it(`dispatches an action and returns it wrapped in array`, () => {
    expect(combineMiddleware()(testAction)).toEqual([ testAction ])
  })

  it(`initializes middleware`, () => {
    const actionConsumer = jest.fn()
    const nextConsumer = jest.fn(next => actionConsumer)
    const middleware = jest.fn(dispatch => nextConsumer)

    const dispatch = combineMiddleware(middleware)

    expect(typeof dispatch).toBe(`function`)
    expect(middleware).toHaveBeenCalledTimes(1)
    expect(nextConsumer).toHaveBeenCalledTimes(1)
  })

  it(`initializes middleware with options`, () => {
    const options = {
      TEST: `TEST`,
    }

    const actionConsumer = jest.fn(action => action)
    const nextConsumer = jest.fn(next => actionConsumer)
    const middleware = jest.fn((dispatch, options) => nextConsumer)

    const dispatch = combineMiddleware(options, middleware)

    expect(typeof dispatch).toBe(`function`)
    expect(middleware).toHaveBeenCalledWith(expect.any(Function), options)
  })

  it(`calls middleware with action`, () => {
    const actionConsumer = jest.fn()
    const nextConsumer = jest.fn(next => actionConsumer)
    const middleware = jest.fn(dispatch => nextConsumer)

    const dispatch = combineMiddleware(middleware)

    expect(typeof dispatch).toBe(`function`)
    expect(middleware).toHaveBeenCalledWith(expect.any(Function), undefined)
    expect(nextConsumer).toHaveBeenCalledWith(expect.any(Function))

    expect(dispatch(testAction)).toBe(undefined)
    expect(actionConsumer).toHaveBeenCalledWith(testAction)
  })

  it(`calls middleware with multiple arguments`, () => {
    const actionConsumer = jest.fn()
    const nextConsumer = jest.fn(next => actionConsumer)
    const middleware = jest.fn(dispatch => nextConsumer)

    const dispatch = combineMiddleware(middleware)

    dispatch(1, 2, 3)

    expect(actionConsumer).toHaveBeenCalledWith(1, 2, 3)
  })

  it(`calls multiple middleware in series`, () => {
    const firstMiddleware = dispatch => next => (...args) => next(...args, 1)
    const secondMiddleware = dispatch => next => (...args) => next(...args, 2)

    const dispatch = combineMiddleware(firstMiddleware, secondMiddleware)

    expect(dispatch(`test`)).toEqual([ `test`, 1, 2 ])
  })
})
