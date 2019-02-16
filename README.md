# dispatch-next-action

## usage

### `staticMiddleware`

```javascript
import { staticMiddleware } from "dispatch-next-action"

const middleware = (dispatch, options) => next => (action, ...args) => {
  if (action.type === `GET_TIME`) {
    return Date.now()
  } else {
    return next(action, ...args)
  }
}

const dispatch = staticMiddleware(middleware)
```

### `dynamicMiddleware`

```javascript
import { dynamicMiddleware } from "dispatch-next-action"

const logger = () => next => (...args) => {
  console.log(args)
  next(...args)
}

const dispatch = dynamicMiddleware()

dispatch.add(logger)
dispatch(1, 2, 3)
```

### `bridge`

```javascript
import { staticMiddleware, dynamicMiddleware, bridge } from "dispatch-next-action"

const dynamic = dynamicMiddleware()
const dispatch = staticMiddleware(bridge(dynamic))

dispatch(1, 2, 3) // [ 1, 2, 3 ]
```

## benchmarks

```text
1 middleware static x 64,776,031 ops/sec ±2.32% (90 runs sampled)
1 middleware dynamic x 24,610,207 ops/sec ±0.96% (91 runs sampled)
2 middleware static x 38,115,016 ops/sec ±0.91% (95 runs sampled)
2 middleware dynamic x 13,646,395 ops/sec ±0.54% (94 runs sampled)
4 middleware static x 27,334,789 ops/sec ±0.75% (94 runs sampled)
4 middleware dynamic x 8,575,023 ops/sec ±0.43% (94 runs sampled)
8 middleware static x 16,203,276 ops/sec ±0.64% (94 runs sampled)
8 middleware dynamic x 3,447,083 ops/sec ±0.50% (96 runs sampled)
16 middleware static x 8,787,029 ops/sec ±0.68% (91 runs sampled)
16 middleware dynamic x 1,630,401 ops/sec ±0.41% (95 runs sampled)
```