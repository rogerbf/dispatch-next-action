# dispatch-next-action

## usage

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

### `dynamicMiddleware`

```javascript
import { dynamicMiddleware } from "dispatch-next-action"

const logger = () => next => (...args) => {
  console.log(args)
  next(...args)
}

const middleware = dynamicMiddleware()

middleware.set(logger)
middleware.dispatch(1, 2, 3)
```

### `bridge`

```javascript
import { combineMiddleware, dynamicMiddleware, bridge } from "dispatch-next-action"

const dynamic = dynamicMiddleware()
const dispatch = combineMiddleware(bridge(dynamic.dispatch))

dispatch(1, 2, 3) // [ 1, 2, 3 ]
```

## benchmarks

```
1 middleware combineMiddleware x 64,776,031 ops/sec ±2.32% (90 runs sampled)
1 middleware dynamicMiddleware x 24,610,207 ops/sec ±0.96% (91 runs sampled)
2 middleware combineMiddleware x 38,115,016 ops/sec ±0.91% (95 runs sampled)
2 middleware dynamicMiddleware x 13,646,395 ops/sec ±0.54% (94 runs sampled)
4 middleware combineMiddleware x 27,334,789 ops/sec ±0.75% (94 runs sampled)
4 middleware dynamicMiddleware x 8,575,023 ops/sec ±0.43% (94 runs sampled)
8 middleware combineMiddleware x 16,203,276 ops/sec ±0.64% (94 runs sampled)
8 middleware dynamicMiddleware x 3,447,083 ops/sec ±0.50% (96 runs sampled)
16 middleware combineMiddleware x 8,787,029 ops/sec ±0.68% (91 runs sampled)
16 middleware dynamicMiddleware x 1,630,401 ops/sec ±0.41% (95 runs sampled)
```