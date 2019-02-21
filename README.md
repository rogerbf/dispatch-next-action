# dispatch-next-action

## usage

### `staticMiddleware`

```javascript
import { staticMiddleware } from "dispatch-next-action"

const middleware = (dispatch, context) => next => (action, ...args) => {
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

dispatch.push(logger)
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

higher is better

```text
staticMiddleware (1)
Raw:
 > 34676.32367632368
Average (mean) 34676.32367632368

staticMiddleware (2)
Raw:
 > 28737.262737262736
Average (mean) 28737.262737262736

staticMiddleware (4)
Raw:
 > 21694.305694305694
Average (mean) 21694.305694305694

dynamicMiddleware (1)
Raw:
 > 18541.45854145854
Average (mean) 18541.45854145854

staticMiddleware (8)
Raw:
 > 14318.681318681318
Average (mean) 14318.681318681318

dynamicMiddleware (2)
Raw:
 > 13047.952047952049
Average (mean) 13047.952047952049

dynamicMiddleware (4)
Raw:
 > 7731.268731268731
Average (mean) 7731.268731268731

staticMiddleware (16)
Raw:
 > 7580.419580419581
Average (mean) 7580.419580419581

dynamicMiddleware (8)
Raw:
 > 3159.8401598401597
Average (mean) 3159.8401598401597

dynamicMiddleware (16)
Raw:
 > 1298.7012987012988
Average (mean) 1298.7012987012988
```