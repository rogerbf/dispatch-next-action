import { combineMiddleware, dynamicMiddleware, bridge } from "../"

describe(`combineMiddleware`, () => {
  test(`example: state middleware`, () => {
    const state = {}

    const middleware = (dispatch, { state }) => next => (action, ...args) => {
      if (action.type === `GET`) {
        return state
      } else if (action.type === `SET`) {
        state = action.payload
        return state
      } else {
        return next(action, ...args)
      }
    }

    const dispatch = combineMiddleware({ state }, middleware)

    expect(dispatch({ type: `GET` })).toEqual(state)
    expect(dispatch({ type: `SET`, payload: { testing: [ 1, 2 ] } })).toEqual({
      testing: [ 1, 2 ],
    })
    expect(dispatch({ type: `GET` })).toEqual({
      testing: [ 1, 2 ],
    })
    expect(dispatch({ type: `UNKNOWN` })).toEqual([ { type: `UNKNOWN` } ])
  })

  test(`example: state middleware (state via options)`, () => {
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
      if (action.type === `GET`) {
        return state.get()
      } else if (action.type === `SET`) {
        return state.set(action.payload)
      } else {
        return next(action, ...args)
      }
    }

    const [ get, set ] = createState()
    const options = {
      state: {
        get,
        set,
      },
    }

    const dispatch = combineMiddleware(options, middleware)

    expect(dispatch({ type: `GET` })).toEqual(get())
    expect(dispatch({ type: `SET`, payload: { testing: [ 1, 2 ] } })).toEqual(
      get()
    )
    expect(dispatch({ type: `GET` })).toEqual(get())
    expect(dispatch({ type: `UNKNOWN` })).toEqual([ { type: `UNKNOWN` } ])
  })
})

describe(`dynamicMiddleware`, () => {
  test(`terminates without middleware`, () => {
    const { dispatch } = dynamicMiddleware()

    expect(dispatch(1, 2, 3)).toEqual([ 1, 2, 3 ])
  })

  test(`example: state middleware`, () => {
    let state = {}

    const middleware = dispatch => next => (action, ...args) => {
      if (action.type === `GET`) {
        return state
      } else if (action.type === `SET`) {
        state = action.payload
        return state
      } else {
        return next(action, ...args)
      }
    }

    const { dispatch } = dynamicMiddleware(middleware)

    expect(dispatch({ type: `GET` })).toEqual(state)
    expect(dispatch({ type: `SET`, payload: { testing: [ 1, 2 ] } })).toEqual({
      testing: [ 1, 2 ],
    })
    expect(dispatch({ type: `GET` })).toEqual({
      testing: [ 1, 2 ],
    })
    expect(dispatch({ type: `UNKNOWN` })).toEqual([ { type: `UNKNOWN` } ])
  })

  test(`example: state middleware (state via options)`, () => {
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
      if (action.type === `GET`) {
        return state.get()
      } else if (action.type === `SET`) {
        return state.set(action.payload)
      } else {
        return next(action, ...args)
      }
    }

    const [ get, set ] = createState()
    const options = {
      state: {
        get,
        set,
      },
    }

    const { dispatch } = dynamicMiddleware(options, middleware)

    expect(dispatch({ type: `GET` })).toEqual(get())
    expect(dispatch({ type: `SET`, payload: { testing: [ 1, 2 ] } })).toEqual(
      get()
    )
    expect(dispatch({ type: `GET` })).toEqual(get())
    expect(dispatch({ type: `UNKNOWN` })).toEqual([ { type: `UNKNOWN` } ])
  })

  test(`adding/removing middleware`, () => {
    const a = jest.fn(() => next => action => next(action))
    const b = jest.fn(() => next => action => next(action))

    const { get, set, delete: _delete, clear } = dynamicMiddleware()

    expect(get()).toEqual([])

    set(a)

    expect(get()).toEqual([ a ])

    set(b)

    expect(get()).toEqual([ a, b ])

    _delete(a)

    expect(get()).toEqual([ b ])

    clear()

    expect(get()).toEqual([])
  })
})

describe(`bridge`, () => {
  test(`bridging dispatchers`, () => {
    const dispatch = combineMiddleware(bridge(combineMiddleware()))

    expect(dispatch(1, 2, 3)).toEqual([ 1, 2, 3 ])
  })
})
