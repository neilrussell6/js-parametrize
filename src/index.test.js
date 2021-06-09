const sinon = require('sinon')
const { assert } = require('chai')

const { parametrizeSync, parametrizeAsync } = require('./index')

describe('parametrizeSync', () => {
  describe('single parametrization', () => {
    it('should call test for each parametrized value, and pass value in as only arg', () => {
      const testStub = sinon.stub()
      parametrizeSync([1, 2, 3], testStub)
      assert.equal(testStub.getCalls().length, 3)
      assert.deepEqual(testStub.args[0], [1])
      assert.deepEqual(testStub.args[1], [2])
      assert.deepEqual(testStub.args[2], [3])
    })

    it('should call test for each nested array of parameters, and pass each array value as args', () => {
      const testStub = sinon.stub()
      parametrizeSync([[1, 2], [3, 4]], testStub)
      assert.equal(testStub.getCalls().length, 2)
      assert.deepEqual(testStub.args[0], [1, 2])
      assert.deepEqual(testStub.args[1], [3, 4])
    })

    it('should only parametrizeSync 1 level deep', () => {
      const testStub = sinon.stub()
      parametrizeSync([[[1], 2], [3, [4]]], testStub)
      assert.equal(testStub.getCalls().length, 2)
      assert.deepEqual(testStub.args[0], [[1], 2])
      assert.deepEqual(testStub.args[1], [3, [4]])
    })

    it('should work with async test', () => {
      const testWrapper = {fn: async () => new Promise((resolve) => setTimeout(resolve('abc'), 50))}
      const testSpy = sinon.spy(testWrapper, 'fn')
      parametrizeSync([1, 2, 3], testWrapper.fn)
      assert.equal(testSpy.getCalls().length, 3)
      assert.deepEqual(testSpy.args[0], [1])
      assert.deepEqual(testSpy.args[1], [2])
      assert.deepEqual(testSpy.args[2], [3])
    })
  })

  describe('multiple parametrization (nested in lambda)', () => {
    it('should call test n number of times, where n is the product of outer and inner values', () => {
      const testStub = sinon.stub()
      parametrizeSync([1, 2, 3], [4, 5], testStub)
      // then ... test should be called 6 times (3 * 2)
      assert.equal(testStub.getCalls().length, 6)
      assert.deepEqual(testStub.args[0], [1, 4])
      assert.deepEqual(testStub.args[1], [1, 5])
      assert.deepEqual(testStub.args[2], [2, 4])
      assert.deepEqual(testStub.args[3], [2, 5])
      assert.deepEqual(testStub.args[4], [3, 4])
      assert.deepEqual(testStub.args[5], [3, 5])
    })
  })

  describe('multiple parametrization', () => {
    it('should call test n number of times, where n is the product of all parametrizations (2 levels)', () => {
      const testStub = sinon.stub()
      parametrizeSync([1, 2, 3], [4, 5], testStub)
      // then ... test should be called 6 times (3 * 2)
      assert.equal(testStub.getCalls().length, 6)
      assert.deepEqual(testStub.args[0], [1, 4])
      assert.deepEqual(testStub.args[1], [1, 5])
      assert.deepEqual(testStub.args[2], [2, 4])
      assert.deepEqual(testStub.args[3], [2, 5])
      assert.deepEqual(testStub.args[4], [3, 4])
      assert.deepEqual(testStub.args[5], [3, 5])
    })

    it('should call test n number of times, where n is the product of all parametrizations (3 levels)', () => {
      const testStub = sinon.stub()
      parametrizeSync([1, 2, 3], [4, 5], [6, 7, 8, 9], testStub)
      // then ... test should be called 24 times (3 * 2 * 4)
      assert.equal(testStub.getCalls().length, 24)
      assert.deepEqual(testStub.args[0], [1, 4, 6])
      assert.deepEqual(testStub.args[1], [1, 4, 7])
      assert.deepEqual(testStub.args[2], [1, 4, 8])
      assert.deepEqual(testStub.args[3], [1, 4, 9])
      assert.deepEqual(testStub.args[4], [1, 5, 6])
      assert.deepEqual(testStub.args[5], [1, 5, 7])
      assert.deepEqual(testStub.args[6], [1, 5, 8])
      assert.deepEqual(testStub.args[7], [1, 5, 9])
      assert.deepEqual(testStub.args[8], [2, 4, 6])
      assert.deepEqual(testStub.args[9], [2, 4, 7])
      assert.deepEqual(testStub.args[10], [2, 4, 8])
      assert.deepEqual(testStub.args[11], [2, 4, 9])
      assert.deepEqual(testStub.args[12], [2, 5, 6])
      assert.deepEqual(testStub.args[13], [2, 5, 7])
      assert.deepEqual(testStub.args[14], [2, 5, 8])
      assert.deepEqual(testStub.args[15], [2, 5, 9])
      assert.deepEqual(testStub.args[16], [3, 4, 6])
      assert.deepEqual(testStub.args[17], [3, 4, 7])
      assert.deepEqual(testStub.args[18], [3, 4, 8])
      assert.deepEqual(testStub.args[19], [3, 4, 9])
      assert.deepEqual(testStub.args[20], [3, 5, 6])
      assert.deepEqual(testStub.args[21], [3, 5, 7])
      assert.deepEqual(testStub.args[22], [3, 5, 8])
      assert.deepEqual(testStub.args[23], [3, 5, 9])
    })
  })

  describe('example usage', () => {
    describe('eg. test the single behaviour of this formatGreeting function', () => {
      const formatGreeting = (time, name) => {
        const prefix = {
          'morning': 'Good morning',
          'afternoon': 'Good afternoon',
          'night': 'Nighty night',
        }
        const _prefix = prefix.hasOwnProperty(time) ? prefix[time] : 'Hello'
        return `${_prefix} ${name}`
      }

      describe('single parametrization', () => {
        parametrizeSync([
          ['morning', 'John', 'Good morning John'],
          ['morning', 'Cheryl', 'Good morning Cheryl'],
          ['afternoon', 'Dr. House', 'Good afternoon Dr. House'],
          ['night', 'my dear :)', 'Nighty night my dear :)'],
          ['UNKNOWN', 'Jimmy', 'Hello Jimmy'],
        ],
        (time, name, expectedResult) => {
          it(`should return the expected result for provided time and name combination: ${time}, ${name}`, () => {
            assert.equal(formatGreeting(time, name), expectedResult)
          })
        })
      })

      describe('multiple parametrization', () => {
        parametrizeSync([
          'morning',
          'afternoon',
          'night',
          'UNKNOWN',
        ],
        [
          'John',
          'Cheryl',
          'Dr. House',
        ],
        (time, name) => {
          it(`should always include name in result: ${time}, ${name}`, () => {
            const result = formatGreeting(time, name)
            assert.match(result, new RegExp(name, 'g'))
          })
        })
      })
    })
  })

  describe('async', () => {
    const formatGreetingInABit = name => new Promise((resolve) => {
      setTimeout(() => {
        resolve(`hello ${name}`)
      }, 500)
    })

    parametrizeSync([
        ['John', 'hello John'],
        ['Cheryl', 'hello Cheryl'],
      ],
      (name, expectedResult) => {
        it(`should return the expected result for provided name: ${name}`, async () => {
          const result = await formatGreetingInABit(name)
          assert.equal(result, expectedResult)
        })
      })
  })
})

describe('parametrizeAsync', () => {
  describe('single parametrization', () => {
    it('should call test for each parametrized value, and pass value in as only arg', async () => {
      const testStub = sinon.stub()
      await parametrizeAsync([1, 2, 3], testStub)
      assert.equal(testStub.getCalls().length, 3)
      assert.deepEqual(testStub.args[0], [1])
      assert.deepEqual(testStub.args[1], [2])
      assert.deepEqual(testStub.args[2], [3])
    })

    it('should call test for each nested array of parameters, and pass each array value as args', async () => {
      const testStub = sinon.stub()
      await parametrizeAsync([[1, 2], [3, 4]], testStub)
      assert.equal(testStub.getCalls().length, 2)
      assert.deepEqual(testStub.args[0], [1, 2])
      assert.deepEqual(testStub.args[1], [3, 4])
    })

    it('should only parametrizeSync 1 level deep', async () => {
      const testStub = sinon.stub()
      await parametrizeAsync([[[1], 2], [3, [4]]], testStub)
      assert.equal(testStub.getCalls().length, 2)
      assert.deepEqual(testStub.args[0], [[1], 2])
      assert.deepEqual(testStub.args[1], [3, [4]])
    })

    it('should work with async test', async () => {
      const testWrapper = {fn: async () => new Promise((resolve) => setTimeout(resolve('abc'), 50))}
      const testSpy = sinon.spy(testWrapper, 'fn')
      await parametrizeAsync([1, 2, 3], testWrapper.fn)
      assert.equal(testSpy.getCalls().length, 3)
      assert.deepEqual(testSpy.args[0], [1])
      assert.deepEqual(testSpy.args[1], [2])
      assert.deepEqual(testSpy.args[2], [3])
    })
  })

  describe('multiple parametrization (nested in lambda)', () => {
    it('should call test n number of times, where n is the product of outer and inner values', async () => {
      const testStub = sinon.stub()
      await parametrizeAsync([1, 2, 3], [4, 5], testStub)
      // then ... test should be called 6 times (3 * 2)
      assert.equal(testStub.getCalls().length, 6)
      assert.deepEqual(testStub.args[0], [1, 4])
      assert.deepEqual(testStub.args[1], [1, 5])
      assert.deepEqual(testStub.args[2], [2, 4])
      assert.deepEqual(testStub.args[3], [2, 5])
      assert.deepEqual(testStub.args[4], [3, 4])
      assert.deepEqual(testStub.args[5], [3, 5])
    })
  })

  describe('multiple parametrization', () => {
    it('should call test n number of times, where n is the product of all parametrizations (2 levels)', async () => {
      const testStub = sinon.stub()
      await parametrizeAsync([1, 2, 3], [4, 5], testStub)
      // then ... test should be called 6 times (3 * 2)
      assert.equal(testStub.getCalls().length, 6)
      assert.deepEqual(testStub.args[0], [1, 4])
      assert.deepEqual(testStub.args[1], [1, 5])
      assert.deepEqual(testStub.args[2], [2, 4])
      assert.deepEqual(testStub.args[3], [2, 5])
      assert.deepEqual(testStub.args[4], [3, 4])
      assert.deepEqual(testStub.args[5], [3, 5])
    })

    it('should call test n number of times, where n is the product of all parametrizations (3 levels)', async () => {
      const testStub = sinon.stub()
      await parametrizeAsync([1, 2, 3], [4, 5], [6, 7, 8, 9], testStub)
      // then ... test should be called 24 times (3 * 2 * 4)
      assert.equal(testStub.getCalls().length, 24)
      assert.deepEqual(testStub.args[0], [1, 4, 6])
      assert.deepEqual(testStub.args[1], [1, 4, 7])
      assert.deepEqual(testStub.args[2], [1, 4, 8])
      assert.deepEqual(testStub.args[3], [1, 4, 9])
      assert.deepEqual(testStub.args[4], [1, 5, 6])
      assert.deepEqual(testStub.args[5], [1, 5, 7])
      assert.deepEqual(testStub.args[6], [1, 5, 8])
      assert.deepEqual(testStub.args[7], [1, 5, 9])
      assert.deepEqual(testStub.args[8], [2, 4, 6])
      assert.deepEqual(testStub.args[9], [2, 4, 7])
      assert.deepEqual(testStub.args[10], [2, 4, 8])
      assert.deepEqual(testStub.args[11], [2, 4, 9])
      assert.deepEqual(testStub.args[12], [2, 5, 6])
      assert.deepEqual(testStub.args[13], [2, 5, 7])
      assert.deepEqual(testStub.args[14], [2, 5, 8])
      assert.deepEqual(testStub.args[15], [2, 5, 9])
      assert.deepEqual(testStub.args[16], [3, 4, 6])
      assert.deepEqual(testStub.args[17], [3, 4, 7])
      assert.deepEqual(testStub.args[18], [3, 4, 8])
      assert.deepEqual(testStub.args[19], [3, 4, 9])
      assert.deepEqual(testStub.args[20], [3, 5, 6])
      assert.deepEqual(testStub.args[21], [3, 5, 7])
      assert.deepEqual(testStub.args[22], [3, 5, 8])
      assert.deepEqual(testStub.args[23], [3, 5, 9])
    })
  })

  describe('example usage', () => {
    describe('eg. test the single behaviour of this formatGreeting function', () => {
      const formatGreeting = (time, name) => {
        const prefix = {
          'morning': 'Good morning',
          'afternoon': 'Good afternoon',
          'night': 'Nighty night',
        }
        const _prefix = prefix.hasOwnProperty(time) ? prefix[time] : 'Hello'
        return `${_prefix} ${name}`
      }

      describe('single parametrization', async () => {
        await parametrizeAsync([
            ['morning', 'John', 'Good morning John'],
            ['morning', 'Cheryl', 'Good morning Cheryl'],
            ['afternoon', 'Dr. House', 'Good afternoon Dr. House'],
            ['night', 'my dear :)', 'Nighty night my dear :)'],
            ['UNKNOWN', 'Jimmy', 'Hello Jimmy'],
          ],
          (time, name, expectedResult) => {
            it(`should return the expected result for provided time and name combination: ${time}, ${name}`, () => {
              assert.equal(formatGreeting(time, name), expectedResult)
            })
          })
      })

      describe('multiple parametrization', async () => {
        await parametrizeAsync([
            'morning',
            'afternoon',
            'night',
            'UNKNOWN',
          ],
          [
            'John',
            'Cheryl',
            'Dr. House',
          ],
          (time, name) => {
            it(`should always include name in result: ${time}, ${name}`, () => {
              const result = formatGreeting(time, name)
              assert.match(result, new RegExp(name, 'g'))
            })
          })
      })
    })
  })

  describe('async', async () => {
    const formatGreetingInABit = name => new Promise((resolve) => {
      setTimeout(() => {
        resolve(`hello ${name}`)
      }, 500)
    })

    await parametrizeAsync([
        ['John', 'hello John'],
        ['Cheryl', 'hello Cheryl'],
      ],
      (name, expectedResult) => {
        it(`should return the expected result for provided name: ${name}`, async () => {
          const result = await formatGreetingInABit(name)
          assert.equal(result, expectedResult)
        })
      })
  })
})
