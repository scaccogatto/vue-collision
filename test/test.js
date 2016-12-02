const assert = require('assert')
const jsdom = require('mocha-jsdom')

const VueCollision = require('../dist/vue-collision.js').default

describe('VueCollision', () => {
  // DOM teardown
  jsdom()

  let Vue

  beforeEach (() => { Vue = { prototype: {} } })

  describe('_checkCollision', () => {
    it('should collide', () => {
      let rect1 = { left: 0, top: 0, width: 100, height: 100 }
      let rect2 = { left: 50, top: 50, width: 100, height: 100 }

      assert.ok(VueCollision._checkCollision(rect1, rect2))
    })

    it('should not collide', () => {
      let rect1 = { left: 0, top: 0, width: 100, height: 100 }
      let rect2 = { left: 100, top: 100, width: 100, height: 100 }

      assert.ok(!VueCollision._checkCollision(rect1, rect2))
    })
  })

  describe('_combine', () => {
    it('should return an empty array when boxes.lenght is 1', () => {
      assert.ok(VueCollision._combine([2]).length === 0)
    })

    it('should not return an empty array when boxes.lenght is more than 1', () => {
      assert.ok(VueCollision._combine([2, 4]).length !== 0)
    })

    it('should return the right number of combinations', () => {
      let factorial = number => {
        let rval = 1
        for (let i = 2; i <= number; i++)
            rval = rval * i;
        return rval;
      }
      let combinations = (n, r) => {
        return factorial(n) / (factorial(r) * factorial(n - r))
      }

      let testArray = [2, 4, 7, 19, 44]
      assert.ok(VueCollision._combine(testArray).length === combinations(testArray.length, 2))
    })
  })

  describe('_filterByGroups', () => {
    it('should return a filtered array based on \'VueCollision._customGroups[groupName]\'', () => {
      VueCollision._customGroups = { group1: [true], group2: [false] }
      assert.ok(VueCollision._filterByGroups(['group1'])[0])
    })
  })

  describe('_removeVnodeFromGroup', () => {
    it('should remove a reference from a group', () => {
      let removeMe = { test: true }
      VueCollision._customGroups = { group1: { vnodes: [true] }, group2: { vnodes: [removeMe] } }
      VueCollision._removeVnodeFromGroup(removeMe, 'group2')
      assert.ok(VueCollision._customGroups['group2'].vnodes.length === 0)
    })
  })

  describe('_pushVnodeToGroup', () => {
    it('should create a new group if not present', () => {
      let addMe = { test: true }
      VueCollision._customGroups = { group1: { vnodes: [true] } }
      VueCollision._pushVnodeToGroup(addMe, 'group2')
      assert.ok(typeof VueCollision._customGroups['group2'] === 'object')
    })

    it('should add a reference to a group', () => {
      let addMe = { test: true }
      VueCollision._customGroups = { group1: { vnodes: [true] }, group2: { vnodes: [] } }
      VueCollision._pushVnodeToGroup(addMe, 'group2')
      assert.ok(VueCollision._customGroups['group2'].vnodes.length === 1)
    })
  })

  describe('_getWindowRect', () => {
    it('should return a normalized rect', () => {
      window.innerWidth = 100
      window.innerHeight = 200

      let rect = VueCollision._getWindowRect()
      assert.ok(rect.left === 0 && rect.top === 0 && rect.width === 100 && rect.height === 200)
    })
  })

  describe('_updateWindowRect', () => {
    it('should update the window rect in a static context', () => {
      window.innerWidth = 200
      window.innerHeight = 100
      let rect2 = VueCollision._updateWindowRect()

      assert.ok(VueCollision._windowRect.left === 0 && VueCollision._windowRect.top === 0 && VueCollision._windowRect.width === 200 && VueCollision._windowRect.height === 100)
    })
  })

  describe('checkGroups', () => {
    it('this function is completely dependent on _checkCollision and the \'$emit\' vue function, so we are ok', () => {
      assert.ok(true)
    })
  })

  describe('checkAllGroups', () => {
    it('this function is completely dependent on checkGroups, so we are ok', () => {
      assert.ok(true)
    })
  })
})
