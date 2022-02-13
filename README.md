JS Parametrize
===

> Parametrizing of test functions in Javascript or Typescript

> Inspired by [PyTest Parametrize](https://docs.pytest.org/en/stable/parametrize.html).

### Installation

```bash
npm i -D js-parametrize
```

### Usage

CommonJS
```javascript
const { parametrizeSync, parametrizeAsync } = require('js-parametrize')
```
ESM or Typescript
```javascript
import { parametrizeSync, parametrizeAsync } from 'js-parametrize'
```

then parametrize your test, eg. given the following function:
```javascript
const formatGreeting = (time, name) => {
  const prefix = {
    'morning': 'Good morning',
    'afternoon': 'Good afternoon',
    'night': 'Nighty night',
  }
  const _prefix = prefix.hasOwnProperty(time) ? prefix[time] : 'Hello'
  return `${_prefix} ${name}`
}
```

we can test as follows:
```javascript
describe('...', () => {
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
  ...
```

This will test ``formatGreeting`` for each of the 5 provided scenarios.

We can also test for the product of some scenarios as follows:

```javascript
describe('...', () => {
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
  ...
}
```

Which will test ``formatGreeting`` for all 12 scenarios.

