import dynamicMiddleware from '../../source/dynamic-middleware'

describe('dynamicMiddleware', () => {
  it('is a function', () => {
    expect(typeof dynamicMiddleware).toBe('function')
  })

  it('returns the expected api', () => {
    const dispatch = dynamicMiddleware()

    expect(typeof dispatch).toBe('function')
    expect(dispatch.current).toEqual([])
    expect(typeof dispatch.push).toBe('function')
    expect(typeof dispatch.delete).toBe('function')
    expect(typeof dispatch.unshift).toBe('function')
    expect(typeof dispatch.includes).toBe('function')
    expect(typeof dispatch.splice).toBe('function')
  })

  test('initial middleware', () => {
    const dispatch = dynamicMiddleware(() => next => action => next(action))

    expect(dispatch()).toEqual([undefined])
  })

  test('initial middleware (multiple)', () => {
    const dispatch = dynamicMiddleware(
      () => next => action => next(action),
      () => next => action => next(action),
      () => next => action => next(action),
    )

    expect(dispatch()).toEqual([undefined])
  })

  test('dispatch("testing")', () => {
    expect(dynamicMiddleware()('testing')).toEqual(['testing'])
  })

  test('middleware with context', () => {
    const context = {}
    const middleware = jest.fn(() => () => () => {})

    dynamicMiddleware(context, middleware)

    expect(middleware).toHaveBeenCalledWith(
      expect.any(Function),
      context,
      expect.any(Function),
    )
  })

  test('dispatch(1, 2, 3)', () => {
    const middleware = jest.fn(() => next => (...args) => next(...args))

    const dispatch = dynamicMiddleware(middleware)

    expect(dispatch(1, 2, 3)).toEqual([1, 2, 3])
  })

  test('adding/removing middleware', () => {
    const dispatch = dynamicMiddleware()

    expect(dispatch).toEqual(expect.any(Function))
    expect(dispatch.push).toEqual(expect.any(Function))
    expect(dispatch.delete).toEqual(expect.any(Function))

    const middleware = jest.fn(() => next => () => next('testing'))

    dispatch.push(middleware)

    expect(dispatch()).toEqual(['testing'])

    dispatch.delete(middleware)

    expect(dispatch({})).toEqual([{}])
  })

  test('adding/removing middleware (multiple)', () => {
    const middleware = {
      a: jest.fn(() => next => (...args) => next(...args, 'a')),
      b: jest.fn(() => next => (...args) => next(...args, 'b')),
    }

    const dispatch = dynamicMiddleware(middleware.a, middleware.b)

    expect(dispatch).toEqual(expect.any(Function))
    expect(dispatch.push).toEqual(expect.any(Function))
    expect(dispatch.delete).toEqual(expect.any(Function))

    expect(dispatch()).toEqual(['a', 'b'])

    dispatch.delete(middleware.a)

    expect(dispatch()).toEqual(['b'])

    dispatch.delete(middleware.b)

    expect(dispatch()).toEqual([])

    dispatch.push(middleware.a)

    expect(dispatch()).toEqual(['a'])

    dispatch.delete(middleware.a)

    dispatch.push(middleware.b).push(middleware.a)

    expect(dispatch()).toEqual(['b', 'a'])
  })

  test('current', () => {
    const middleware = jest.fn(() => next => (...args) => next(...args, 'a'))

    const dispatch = dynamicMiddleware(middleware)

    expect(dispatch.current).toEqual([middleware])
  })

  test('clear()', () => {
    const middleware = {
      a: jest.fn(() => next => (...args) => next(...args, 'a')),
      b: jest.fn(() => next => (...args) => next(...args, 'b')),
    }

    const dispatch = dynamicMiddleware(middleware.a, middleware.b)

    expect(dispatch.current).toEqual([middleware.a, middleware.b])

    dispatch.clear()

    expect(dispatch.current).toEqual([])
  })

  test('delete', () => {
    const middleware = jest.fn(() => next => (...args) => next(...args, 'a'))

    const dispatch = dynamicMiddleware(middleware)

    expect(dispatch.delete(middleware)).toEqual(dispatch)
    expect(dispatch.current).toEqual([])

    dispatch.push(middleware)

    dispatch.delete(() => {})

    expect(dispatch.current).toEqual([middleware])
  })

  test('unshift', () => {
    const calls = []

    const middleware = [
      () => next => action => {
        calls.push(1)
        return next(action)
      },
    ]

    const dispatch = dynamicMiddleware()
    dispatch.unshift(...middleware)
    expect(dispatch.current).toEqual([...middleware])
    dispatch()
    expect(calls).toEqual([1])
  })

  test('unshift (initial middleware)', () => {
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
    expect(dispatch.current).toEqual([...middleware, ...initialMiddleware])
    dispatch()
    expect(calls).toEqual([1, 2])
  })

  test('unshift (multiple)', () => {
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

    expect(dispatch.current).toEqual([...middleware])
    dispatch()
    expect(calls).toEqual([1, 2])
  })

  test('unshift (multiple with initial)', () => {
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

    expect(dispatch.current).toEqual([...middleware, ...initialMiddleware])
    dispatch()
    expect(calls).toEqual([1, 2, 3])
  })

  test('unshift (multiple, delete one)', () => {
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
    expect(calls).toEqual([1, 2, 3])
    dispatch.delete(middleware[1])
    expect(dispatch.current).toEqual([middleware[0], ...initialMiddleware])
    dispatch()
    expect(calls).toEqual([1, 2, 3, 1, 3])
  })

  test('includes', () => {
    const middleware = () => () => () => {}

    expect(dynamicMiddleware(middleware).includes(middleware)).toEqual(true)
    expect(dynamicMiddleware().includes(middleware)).toEqual(false)
  })

  test('splice(0, middleware)', () => {
    const middleware = () => () => () => {}
    const dispatch = dynamicMiddleware(() => () => () => {})
    dispatch.splice(0, middleware)

    expect(dispatch.current).toEqual([middleware, expect.any(Function)])
  })

  test('splice(0, 1)', () => {
    const dispatch = dynamicMiddleware(() => () => () => {})
    dispatch.splice(0, 1)

    expect(dispatch.current).toEqual([])
  })

  test('splice(1, 0, middleware)', () => {
    const addition = () => () => () => {}
    const initial = [() => () => () => {}, () => () => () => {}]

    const dispatch = dynamicMiddleware(...initial)

    dispatch.splice(1, 0, addition)

    expect(dispatch.current).toEqual([initial[0], addition, initial[1]])
  })

  test('splice(1, 1, middleware)', () => {
    const addition = () => () => () => {}
    const initial = [() => () => () => {}, () => () => () => {}]

    const dispatch = dynamicMiddleware(...initial)

    dispatch.splice(1, 1, addition)

    expect(dispatch.current).toEqual([initial[0], addition])
  })

  test('splice(1, 1, middleware, middleware)', () => {
    const additions = [() => () => () => {}, () => () => () => {}]
    const initial = [() => () => () => {}, () => () => () => {}]

    const dispatch = dynamicMiddleware(...initial)

    dispatch.splice(1, 1, ...additions)

    expect(dispatch.current).toEqual([initial[0], ...additions])
  })

  test('duplicate middleware (anonymous)', () => {
    const middleware = [() => () => () => {}]
    const dispatch = dynamicMiddleware(...middleware)

    expect(() => dispatch.push(middleware[0])).toThrow(
      'Trying to add duplicate middleware',
    )
    expect(() => dispatch.unshift(middleware[0])).toThrow(
      'Trying to add duplicate middleware',
    )
    expect(() => dispatch.splice(0, 0, middleware[0])).toThrow(
      'Trying to add duplicate middleware',
    )
  })

  test('duplicate middleware (named)', () => {
    function middleware() {
      return () => () => {}
    }

    const dispatch = dynamicMiddleware(middleware)

    expect(() => dispatch.push(middleware)).toThrow(
      'Trying to add duplicate middleware ( middleware )',
    )
    expect(() => dispatch.unshift(middleware)).toThrow(
      'Trying to add duplicate middleware ( middleware )',
    )
    expect(() => dispatch.splice(0, 0, middleware)).toThrow(
      'Trying to add duplicate middleware ( middleware )',
    )
  })

  test('combination of duplicate and new middleware', () => {
    const middlewareA = () => () => () => {}
    const middlewareB = () => () => () => {}
    const middlewareC = () => () => () => {}

    const dispatch = dynamicMiddleware(middlewareA, middlewareB)

    let caughtError

    try {
      dispatch.splice(0, middlewareC, middlewareB)
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).toBeDefined()
    expect(caughtError.message).toEqual(
      'Trying to add duplicate middleware ( middlewareB )',
    )
    expect(dispatch.current).toEqual([middlewareA, middlewareB])
  })

  test('throws', () => {
    expect(() => dynamicMiddleware(() => {})).toThrow()
    expect(() => dynamicMiddleware(undefined, '')).toThrow(
      'Expected [object Function], got [object String]',
    )
    expect(() => dynamicMiddleware(undefined, () => '')).toThrow(
      'Expected [object Function], got [object String]',
    )
    expect(() => {
      const dispatch = dynamicMiddleware(undefined, () => () => '')
      dispatch()
    }).toThrow('Expected [object Function], got [object String]')

    const dispatch = dynamicMiddleware()

    expect(() => dispatch.push(() => {})).toThrow()
    expect(() => dispatch.unshift(() => {})).toThrow()
    expect(() => dispatch.splice()).toThrow()
    expect(() => dispatch.splice(0)).toThrow()
    expect(() => dispatch.splice(0, () => {})).toThrow()
  })

  test(`queues up dispatches during initialization`, () => {
    const actionConsumer = jest.fn()

    const dispatch = dynamicMiddleware(
      dispatch => {
        dispatch(1, 2, 3)
        return next => {
          dispatch(4, 5, 6)
          return (...action) => next(...action)
        }
      },
      () => () => actionConsumer,
    )

    dispatch(7)

    expect(actionConsumer).toHaveBeenNthCalledWith(1, 1, 2, 3)
    expect(actionConsumer).toHaveBeenNthCalledWith(2, 4, 5, 6)
    expect(actionConsumer).toHaveBeenNthCalledWith(3, 7)
  })

  test(`queues up dispatches during initialization (async)`, () => {
    return new Promise(resolve => {
      const actionConsumer = jest.fn()

      const dispatch = dynamicMiddleware(
        dispatch => {
          dispatch(1)

          setTimeout(() => {
            expect(actionConsumer).toHaveBeenNthCalledWith(1, 1)
            expect(actionConsumer).toHaveBeenNthCalledWith(2, 2)
            expect(actionConsumer).toHaveBeenNthCalledWith(3, 3)
            expect(actionConsumer).not.toHaveBeenNthCalledWith(4, 4)

            dispatch(4)

            expect(actionConsumer).toHaveBeenNthCalledWith(4, 4)
          }, 0)

          return next => {
            dispatch(2)

            setTimeout(() => {
              dispatch(5)

              expect(actionConsumer).toHaveBeenNthCalledWith(5, 5)

              resolve()
            }, 0)

            return (...action) => next(...action)
          }
        },
        () => () => actionConsumer,
      )

      dispatch(3)
    })
  })

  test('cleanup function is called when middleware is removed', () => {
    const cleanup = jest.fn()

    const middleware = (_, context, onRemove) => {
      onRemove(cleanup)
      return next => action => next(action)
    }

    expect(cleanup).not.toHaveBeenCalled()
    dynamicMiddleware(middleware).clear()
    expect(cleanup).toHaveBeenCalled()
  })

  test('cleanup function is called when middleware is removed via splice', () => {
    const cleanup = jest.fn()

    const middleware = (_, context, onRemove) => {
      onRemove(cleanup)
      return next => action => next(action)
    }

    expect(cleanup).not.toHaveBeenCalled()
    const m = dynamicMiddleware(middleware).splice(0, 1)
    expect(cleanup).toHaveBeenCalled()
    expect(m.current).toEqual([])
  })

  test('dispatch is available during cleanup', () => {
    const middleware = dynamicMiddleware()
    const cleanup = jest.fn()

    const additionalMiddleware = (dispatch, context, onRemove) => {
      onRemove(() => cleanup(dispatch))

      return next => action => next(action)
    }

    middleware.push(additionalMiddleware)
    middleware.delete(additionalMiddleware)

    expect(cleanup).toHaveBeenCalledWith(middleware)
  })

  test('throws when cleanup is not a function', () => {
    expect(() => {
      dynamicMiddleware().push((_, context, onRemove) => {
        onRemove('')
        return next => action => next(action)
      })
    }).toThrow()

    expect(() => {
      dynamicMiddleware().push((_, context, onRemove) => {
        onRemove(1)
        return next => action => next(action)
      })
    }).toThrow()

    expect(() => {
      dynamicMiddleware().push((_, context, onRemove) => {
        onRemove({})
        return next => action => next(action)
      })
    }).toThrow()

    expect(() => {
      dynamicMiddleware().push((_, context, onRemove) => {
        onRemove([])
        return next => action => next(action)
      })
    }).toThrow()
  })
})
