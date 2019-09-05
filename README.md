# dispatch-next-action

## usage

### `staticMiddleware`

```javascript
import { staticMiddleware } from 'dispatch-next-action'

const middleware = (dispatch, context) => next => (action, ...args) => {
  if (action.type === 'GET_TIME') {
    return Date.now()
  } else {
    return next(action, ...args)
  }
}

const dispatch = staticMiddleware(middleware)
```

### `dynamicMiddleware`

```javascript
import { dynamicMiddleware } from 'dispatch-next-action'

const logger = () => next => (...args) => {
  console.log(args)
  return next(...args)
}

const dispatch = dynamicMiddleware()

dispatch.push(logger)
dispatch(1, 2, 3)
```

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

## benchmarks

higher is better

```text
staticMiddleware (1)
Raw:
 > 175715.2847152847
Average (mean) 175715.2847152847

dynamicMiddleware (1)
Raw:
 > 65905.0949050949
Average (mean) 65905.0949050949

staticMiddleware (2)
Raw:
 > 15380.61938061938
Average (mean) 15380.61938061938

dynamicMiddleware (2)
Raw:
 > 13969.03096903097
Average (mean) 13969.03096903097

staticMiddleware (4)
Raw:
 > 12641.358641358642
Average (mean) 12641.358641358642

staticMiddleware (8)
Raw:
 > 10307.692307692309
Average (mean) 10307.692307692309

dynamicMiddleware (4)
Raw:
 > 8000.999000999001
Average (mean) 8000.999000999001

staticMiddleware (16)
Raw:
 > 7501.498501498501
Average (mean) 7501.498501498501

dynamicMiddleware (8)
Raw:
 > 3695.304695304695
Average (mean) 3695.304695304695

dynamicMiddleware (16)
Raw:
 > 1336.6633366633366
Average (mean) 1336.6633366633366
```
