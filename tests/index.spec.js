const expect = require(`expect`)
const { combineMiddleware } = require(process.env.NODE_ENV === `development`
  ? `../source`
  : `../`)

describe(`combineMiddleware`, () => {
  it(`works with state middleware`, () => {
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

  it(`works with state middleware (state as a dependency)`, () => {
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
