import {assert, expect} from 'chai'
import * as sinon from 'sinon'
import {parametrize} from '../index'

describe('parametrize', () => {
  describe('single parametrization', () => {
    it(`should call test for each value, and pass value in as only arg`, () => {
      const stub = sinon.stub()
      parametrize([1, 2, 3], stub)
      expect(stub.getCalls()).to.have.length(3)
      expect(stub.getCall(0).args).to.deep.equal([1])
      expect(stub.getCall(1).args).to.deep.equal([2])
      expect(stub.getCall(2).args).to.deep.equal([3])
    })
    it(`should call test for each nested array, and pass each array value as args`, () => {
      const stub = sinon.stub()
      parametrize([[1, 2], [3, 4]], stub)
      expect(stub.getCalls()).to.have.length(2)
      expect(stub.getCall(0).args).to.deep.equal([1, 2])
      expect(stub.getCall(1).args).to.deep.equal([3, 4])
    })
    it(`should only parametrize 1 level deep`, () => {
      const stub = sinon.stub()
      parametrize([[[1], 2], [3, [4]]], stub)
      expect(stub.getCalls()).to.have.length(2)
      expect(stub.getCall(0).args).to.deep.equal([[1], 2])
      expect(stub.getCall(1).args).to.deep.equal([3, [4]])
    })
  })
  describe('multiple parametrization (nested in lambda)', () => {
    it(`should call test n number of times, where n is the product of outer and inner values`, () => {
      const innerStub = sinon.stub()
      parametrize([1, 2], (n) => {
        parametrize([3, 4], innerStub)
      })
      // inner parametrize should be called 4 times
      expect(innerStub.getCalls()).to.have.length(4)
      expect(innerStub.getCall(0).args).to.deep.equal([3])
      expect(innerStub.getCall(1).args).to.deep.equal([4])
      expect(innerStub.getCall(2).args).to.deep.equal([3])
      expect(innerStub.getCall(3).args).to.deep.equal([4])
    })
  })
  describe('multiple parametrization', () => {
    it(`should call test n number of times, where n is the product of all parametrizations`, () => {
      const stub = sinon.stub()
      parametrize([1, 2], [3, 4], [5, 6], stub)
      expect(stub.getCalls()).to.have.length(8)
      expect(stub.getCall(0).args).to.deep.equal([1, 3, 5])
      expect(stub.getCall(1).args).to.deep.equal([1, 3, 6])
      expect(stub.getCall(2).args).to.deep.equal([1, 4, 5])
      expect(stub.getCall(3).args).to.deep.equal([1, 4, 6])
      expect(stub.getCall(4).args).to.deep.equal([2, 3, 5])
      expect(stub.getCall(5).args).to.deep.equal([2, 3, 6])
      expect(stub.getCall(6).args).to.deep.equal([2, 4, 5])
      expect(stub.getCall(7).args).to.deep.equal([2, 4, 6])
    })
  })
  describe('example usage', () => {
    describe('single parametrization', () => {
      describe('list of literals', () => {
        parametrize([1, 2, 3], n => {
          it(`should all be greater than zero : ${n} > 0`, () => {
            expect(n).to.be.greaterThan(0)
          })
        })
      })
      describe('list of lists', () => {
        parametrize([
          [2, 2, 4],
          [2, 3, 6],
          [3, 4, 12],
        ], (a, b, expected) => {
          it(`should multiply a and b as expected : ${a} * ${b} should be ${expected}`, () => {
            expect(a * b).to.equal(expected)
          })
        })
      })
    })
    describe('multiple parametrization', () => {
      describe('eg. we can test 2 functions have the same behaviour', () => {

        const fn1 = (a, b) => a * b
        const fn2 = (a, b) => a * b

        describe('using multiple lists as args for parametrize', () => {
          parametrize(
            // these 2 functions
            [fn1, fn2],
            // should behave as expected for these 3 scenarios
            [
              [2, 2, 4],
              [2, 3, 6],
              [3, 4, 12],
            ],
            (fn, a, b, expected) => {
              it(`should multiply a and b as expected for each function : ${a} * ${b} should be ${expected}`, () => {
                expect(fn(a, b)).to.equal(expected)
              })
            }
          )
        })
        describe('or as nested parametrize calls', () => {
          // these 2 functions
          parametrize([fn1, fn2], fn => {
            // should behave as expected for these 3 scenarios
            parametrize([
              [2, 2, 4],
              [2, 3, 6],
              [3, 4, 12],
            ], (a, b, expected) => {
              it(`should multiply a and b as expected for each function : ${a} * ${b} should be ${expected}`, () => {
                expect(fn(a, b)).to.equal(expected)
              })
            })
          })
        })
      })
    })
  })
})
