import bridge from '../../source/bridge'

describe('bridge', () => {
  it('is a function', () => {
    expect(typeof bridge).toEqual('function')
  })

  it('returns a middleware', () => {
    const dispatch = jest.fn((...args) => args)

    const middleware = bridge(dispatch)

    const next = jest.fn((...args) => args)

    const initialized = middleware(() => {})(next)

    expect(initialized(1, 2, 3)).toEqual([1, 2, 3])
    expect(dispatch).toHaveBeenCalledWith(1, 2, 3)
  })

  test('throws', () => {
    expect(() => bridge('')).toThrow()
    expect(() => bridge([])).toThrow()
    expect(() => bridge({})).toThrow()
    expect(() => bridge(1)).toThrow()
  })
})
