# dispatch-next-action

## api

### `combineMiddleware`

```javascript
import { combineMiddleware } from "dispatch-next-action"

const middleware = (dispatch, options) => next => (action, ...args) => {
  if (action.type === `GET_TIME`) {
    return Date.now()
  } else {
    return next(action, ...args)
  }
}

const dispatch = combineMiddleware(middleware)
```
