function product(xs, ys, ...args) {
  if (typeof ys === 'undefined') return xs
  const xys = [].concat(...xs.map(x => ys.map(y => [].concat(x, y))))
  return product(xys, ...args)
}

function parametrize(...args) {
  const args_product = product(...args.slice(0, -1))
  const fn = args.slice(-1)[0]
  args_product.map(args => {
    const _args = args instanceof Array ? args : [args]
    fn(..._args)
  })
}

module.exports.parametrize = parametrize
