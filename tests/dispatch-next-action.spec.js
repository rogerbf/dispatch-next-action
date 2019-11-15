import {
  bridge,
  dynamicMiddleware,
  staticMiddleware,
} from '../build/dispatch-next-action'

describe('staticMiddleware', () => {
  test('example: state middleware', () => {
    const state = {}

    const middleware = (dispatch, { state }) => next => (action, ...args) => {
      if (action.type === 'GET') {
        return state
      } else if (action.type === 'SET') {
        state = action.payload
        return state
      } else {
        return next(action, ...args)
      }
    }

    const dispatch = staticMiddleware({ state }, middleware)

    expect(dispatch({ type: 'GET' })).toEqual(state)
    expect(dispatch({ type: 'SET', payload: { testing: [1, 2] } })).toEqual({
      testing: [1, 2],
    })
    expect(dispatch({ type: 'GET' })).toEqual({
      testing: [1, 2],
    })
    expect(dispatch({ type: 'UNKNOWN' })).toEqual([{ type: 'UNKNOWN' }])
  })

  test('example: state middleware (state via options)', () => {
    const createState = () => {
      let state = {}

      return [
        () => state,
        updatedState => {
          state = updatedState
          return state
        },
      ]
    }

    const middleware = (dispatch, { state }) => next => (action, ...args) => {
      if (action.type === 'GET') {
        return state.get()
      } else if (action.type === 'SET') {
        return state.set(action.payload)
      } else {
        return next(action, ...args)
      }
    }

    const [get, set] = createState()
    const options = {
      state: {
        get,
        set,
      },
    }

    const dispatch = staticMiddleware(options, middleware)

    expect(dispatch({ type: 'GET' })).toEqual(get())
    expect(dispatch({ type: 'SET', payload: { testing: [1, 2] } })).toEqual(
      get(),
    )
    expect(dispatch({ type: 'GET' })).toEqual(get())
    expect(dispatch({ type: 'UNKNOWN' })).toEqual([{ type: 'UNKNOWN' }])
  })
})

describe('dynamicMiddleware', () => {
  test('terminates without middleware', () => {
    const dispatch = dynamicMiddleware()

    expect(dispatch(1, 2, 3)).toEqual([1, 2, 3])
  })

  test('example: state middleware', () => {
    let state = {}

    const middleware = () => next => (action, ...args) => {
      if (action.type === 'GET') {
        return state
      } else if (action.type === 'SET') {
        state = action.payload
        return state
      } else {
        return next(action, ...args)
      }
    }

    const dispatch = dynamicMiddleware(middleware)

    expect(dispatch({ type: 'GET' })).toEqual(state)
    expect(dispatch({ type: 'SET', payload: { testing: [1, 2] } })).toEqual({
      testing: [1, 2],
    })
    expect(dispatch({ type: 'GET' })).toEqual({
      testing: [1, 2],
    })
    expect(dispatch({ type: 'UNKNOWN' })).toEqual([{ type: 'UNKNOWN' }])
  })

  test('example: state middleware (state via options)', () => {
    const createState = () => {
      let state = {}

      return [
        () => state,
        updatedState => {
          state = updatedState
          return state
        },
      ]
    }

    const middleware = (_, { state }) => next => (action, ...args) => {
      if (action.type === 'GET') {
        return state.get()
      } else if (action.type === 'SET') {
        return state.set(action.payload)
      } else {
        return next(action, ...args)
      }
    }

    const [get, set] = createState()
    const options = {
      state: {
        get,
        set,
      },
    }

    const dispatch = dynamicMiddleware(options, middleware)

    expect(dispatch({ type: 'GET' })).toEqual(get())
    expect(dispatch({ type: 'SET', payload: { testing: [1, 2] } })).toEqual(
      get(),
    )
    expect(dispatch({ type: 'GET' })).toEqual(get())
    expect(dispatch({ type: 'UNKNOWN' })).toEqual([{ type: 'UNKNOWN' }])
  })

  test('adding/removing middleware', () => {
    const a = jest.fn(() => next => action => next(action))
    const b = jest.fn(() => next => action => next(action))

    const dispatch = dynamicMiddleware()

    expect(dispatch.current).toEqual([])

    dispatch.push(a)

    expect(dispatch.current).toEqual([a])

    dispatch.push(b)

    expect(dispatch.current).toEqual([a, b])

    dispatch.delete(a)

    expect(dispatch.current).toEqual([b])

    dispatch.clear()

    expect(dispatch.current).toEqual([])
  })
})

describe('bridge', () => {
  test('bridging dispatchers', () => {
    const dispatch = staticMiddleware(bridge(staticMiddleware()))

    expect(dispatch(1, 2, 3)).toEqual([[1, 2, 3]])
  })
})
