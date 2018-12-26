const { combineMiddleware } = require(`../`)

const actionTypes = {
  INCREMENT_COUNT: `INCREMENT_COUNT`,
  UPDATE_NAME: `UPDATE_NAME`,
}

let state = undefined

let reducer = (state = { name: undefined, count: 0 }, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_NAME:
      return {
        ...state,
        name: action.payload,
      }
    case actionTypes.INCREMENT_COUNT:
      return {
        ...state,
        count: state.count + 1,
      }
    default:
      return state
  }
}

const options = {
  state,
  reducer,
}

const reducerMiddleware = (dispatch, { state, reducer }) => () => (
  action = {}
) => {
  state = reducer(state, action)
  return state
}

const loggerMiddleware = () => next => action => {
  console.log(action)
  return next(action)
}

const dispatch = combineMiddleware(options, loggerMiddleware, reducerMiddleware)

console.log(dispatch({ type: actionTypes.UPDATE_NAME, payload: `Jean Luc` }))
console.log(dispatch({ type: actionTypes.INCREMENT_COUNT }))
