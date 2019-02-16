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
1 middleware static x 64,329,776 ops/sec ±3.41% (86 runs sampled)
1 middleware dynamic x 25,286,275 ops/sec ±1.13% (89 runs sampled)
2 middleware static x 40,616,143 ops/sec ±0.90% (95 runs sampled)
2 middleware dynamic x 15,723,259 ops/sec ±0.49% (93 runs sampled)
4 middleware static x 27,915,663 ops/sec ±0.91% (95 runs sampled)
4 middleware dynamic x 9,480,215 ops/sec ±0.35% (95 runs sampled)
8 middleware static x 16,861,170 ops/sec ±0.51% (94 runs sampled)
8 middleware dynamic x 3,699,562 ops/sec ±0.41% (97 runs sampled)
16 middleware static x 8,657,069 ops/sec ±0.67% (94 runs sampled)
16 middleware dynamic x 1,708,738 ops/sec ±0.41% (96 runs sampled)
```