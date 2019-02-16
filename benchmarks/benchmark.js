const { invoke, Suite } = require(`benchmark`)
const {
  staticMiddleware,
  dynamicMiddleware,
} = require(`../build/dispatch-next-action`)

const createMiddleware = (count = 1) =>
  Array(count).fill(() => next => action => next(action))

const middlewareCounts = [ 1, 2, 4, 8, 16 ]

invoke(
  middlewareCounts.map(middlewareCount => {
    const suite = new Suite(`${ middlewareCount } middleware`)
    const staticDispatch = staticMiddleware(
      ...createMiddleware(middlewareCount)
    )
    const dynamicDispatch = dynamicMiddleware(
      ...createMiddleware(middlewareCount)
    )
    const action = {}

    suite
      .add(`static`, () => {
        staticDispatch(action)
      })
      .add(`dynamic`, () => {
        dynamicDispatch(action)
      })

    return suite
  }),
  {
    name: `run`,
    queued: true,
    onCycle: event => {
      const suiteName = event.target.name
      for (let i = 0; i < event.target.length; i++) {
        console.log(suiteName, String(event.target[i.toString()]))
      }
    },
  }
)
