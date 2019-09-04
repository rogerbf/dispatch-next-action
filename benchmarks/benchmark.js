const { dynamicMiddleware, staticMiddleware } = require('../')
const middleware = require('./middleware')

const staticOneMiddleware = staticMiddleware(...middleware[0])
const dynamicOneMiddleware = dynamicMiddleware(...middleware[0])
const staticTwoMiddleware = staticMiddleware(...middleware[1])
const dynamicTwoMiddleware = dynamicMiddleware(...middleware[1])
const staticFourMiddleware = staticMiddleware(...middleware[2])
const dynamicFourMiddleware = dynamicMiddleware(...middleware[2])
const staticEightMiddleware = staticMiddleware(...middleware[3])
const dynamicEightMiddleware = dynamicMiddleware(...middleware[3])
const staticSixteenMiddleware = staticMiddleware(...middleware[4])
const dynamicSixteenMiddleware = dynamicMiddleware(...middleware[4])

exports.compare = {
  'staticMiddleware (1)': () => {
    staticOneMiddleware()
  },
  'dynamicMiddleware (1)': () => {
    dynamicOneMiddleware()
  },
  'staticMiddleware (2)': () => {
    staticTwoMiddleware()
  },
  'dynamicMiddleware (2)': () => {
    dynamicTwoMiddleware()
  },
  'staticMiddleware (4)': () => {
    staticFourMiddleware()
  },
  'dynamicMiddleware (4)': () => {
    dynamicFourMiddleware()
  },
  'staticMiddleware (8)': () => {
    staticEightMiddleware()
  },
  'dynamicMiddleware (8)': () => {
    dynamicEightMiddleware()
  },
  'staticMiddleware (16)': () => {
    staticSixteenMiddleware()
  },
  'dynamicMiddleware (16)': () => {
    dynamicSixteenMiddleware()
  },
}

exports.compareCount = true

require('bench').runMain()
