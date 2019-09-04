import staticMiddleware from '../../source/static-middleware'

describe(`staticMiddleware`, () => {
  it(`is a function`, () => {
    expect(typeof staticMiddleware).toBe(`function`)
  })

  it(`returns a function`, () => {
    const dispatch = staticMiddleware()

    expect(typeof dispatch).toBe(`function`)
  })

  test(`dispatch without middleware`, () => {
    expect(staticMiddleware()(`TEST`)).toEqual([`TEST`])
  })

  test(`middleware initialization`, () => {
    const actionConsumer = jest.fn()
    const nextConsumer = jest.fn(() => actionConsumer)
    const middleware = jest.fn(() => nextConsumer)

    const dispatch = staticMiddleware(middleware)

    expect(typeof dispatch).toBe(`function`)
    expect(middleware).toHaveBeenCalledTimes(1)
    expect(nextConsumer).toHaveBeenCalledTimes(1)
  })

  test(`middleware initialization with context`, () => {
    const context = {
      TEST: `TEST`,
    }

    const middleware = jest.fn(() => next => action => next(action))

    const dispatch = staticMiddleware(context, middleware)

    expect(typeof dispatch).toBe(`function`)
    expect(middleware).toHaveBeenCalledWith(expect.any(Function), context)
  })

  test(`multiple middleware`, () => {
    const firstMiddleware = () => next => (...args) => next(...args, 1)
    const secondMiddleware = () => next => (...args) => next(...args, 2)

    const dispatch = staticMiddleware(firstMiddleware, secondMiddleware)

    expect(dispatch(`test`)).toEqual([`test`, 1, 2])
  })

  test(`throws with unexpected middleware`, () => {
    expect(() => staticMiddleware({}, '')).toThrow(
      'Expected [object Function], got [object String]',
    )
    expect(() => staticMiddleware(() => '')).toThrow(
      'Expected [object Function], got [object String]',
    )
    expect(() => staticMiddleware(() => () => '')).toThrow(
      'Expected [object Function], got [object String]',
    )
  })
})
