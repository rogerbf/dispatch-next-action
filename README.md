# dispatch-next-action

## usage

### `staticMiddleware([context][...middleware])`

```javascript
import { staticMiddleware } from 'dispatch-next-action'

const middleware = (dispatch, context) => next => (action, ...args) =>
  next(action)

const dispatch = staticMiddleware(middleware)
```

### `dynamicMiddleware([context][...middleware])`

```javascript
import { dynamicMiddleware } from 'dispatch-next-action'

const logger = (dispatch, context, onDelete) => next => (...args) => {
  console.log(args)

  return next(...args)
}

const dispatch = dynamicMiddleware()

dispatch.push(logger)
dispatch(1, 2, 3)
```

#### middleware signature

`(dispatch, context, onDelete) => next => (...args) => {}`

Any function registered with onDelete will be called when middleware is removed.

#### Instance methods

##### `dispatch([...args])`

##### `dispatch.includes(middleware)`

##### `dispatch.push(middleware[, ...middleware])`

##### `dispatch.unshift(middleware[, ...middleware])`

##### `dispatch.splice(start, deleteCount[, ...middleware])`

##### `dispatch.splice(start[, ...middleware])`

##### `dispatch.clear()`

##### `dispatch.delete(middleware[, ...middleware])`

### `bridge`

```javascript
import {
  bridge,
  dynamicMiddleware,
  staticMiddleware,
} from 'dispatch-next-action'

const dynamic = dynamicMiddleware()
const dispatch = staticMiddleware(bridge(dynamic))

dispatch(1, 2, 3) // [ 1, 2, 3 ]
```
