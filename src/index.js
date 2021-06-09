const Bluebird = require('bluebird')

const product = (xs, ys, ...args) => {
  if (typeof ys === 'undefined') return xs
  const xys = [].concat(...xs.map(x => ys.map(y => [].concat(x, y))))
  return product(xys, ...args)
}

const parametrizeSync = async (...args) => {
  const argsProduct = product(...args.slice(0, -1))
  const f = args.slice(-1)[0]
  await argsProduct.map(x => {
    const xs = x instanceof Array ? x : [x]
    return f(...xs)
  })
}

module.exports.parametrizeSync = parametrizeSync

const parametrizeAsync = async (...args) => {
  const argsProduct = product(...args.slice(0, -1))
  const f = args.slice(-1)[0]
  await Bluebird.mapSeries(argsProduct, x => {
    const xs = x instanceof Array ? x : [x]
    return f(...xs)
  })
}

module.exports.parametrizeAsync = parametrizeAsync

const parametrizeSyncMiddleware = (...args) => ({
  before: (context, f) => {
    const argsProduct = product(...args)
    return argsProduct.map(x => {
      const xs = x instanceof Array ? x : [x]
      return f(context, ...xs)
    })
  }
})

module.exports.parametrizeSyncMiddleware = parametrizeSyncMiddleware

const parametrizeAsyncMiddleware = (...args) => ({
  before: (context, f) => {
    const argsProduct = product(...args)
    return Bluebird.mapSeries(argsProduct, x => {
      const xs = x instanceof Array ? x : [x]
      return f(context, ...xs)
    })
  }
})

module.exports.parametrizeAsyncMiddleware = parametrizeAsyncMiddleware
