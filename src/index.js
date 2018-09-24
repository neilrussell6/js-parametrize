const _product = (xs, ys, ...args) => {
  if (typeof ys === 'undefined') return xs
  const xys = [].concat(...xs.map(x => ys.map(y => [].concat(x, y))))
  return _product(xys, ...args)
}

const parametrize = async (...args) => {
  const _args = _product(...args.slice(0, -1))
  const fn = args.slice(-1)[0]
  await _args.map(async x => {
    const _x = x instanceof Array ? x : [x]
    await fn(..._x)
  })
}

module.exports = parametrize
